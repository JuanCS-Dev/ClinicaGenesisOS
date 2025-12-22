/**
 * Invoice Generator Component
 * ===========================
 *
 * Generates and displays invoices for payments.
 * Supports PDF download and print functionality.
 *
 * Fase 10: PIX Integration
 */

import React, { useState, useCallback } from 'react';
import {
  FileText,
  Download,
  Printer,
  Send,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { Invoice, InvoiceItem } from '@/types';
import { formatPaymentAmount } from '@/types';
import { useClinicContext } from '../../contexts/ClinicContext';

/**
 * Props for InvoiceGenerator component.
 */
interface InvoiceGeneratorProps {
  /** Pre-filled patient info */
  patient?: {
    name: string;
    cpf?: string;
    email?: string;
    phone?: string;
  };
  /** Pre-filled items */
  initialItems?: InvoiceItem[];
  /** Callback when invoice is generated */
  onGenerate?: (invoice: Invoice) => void;
  /** Callback when invoice is sent */
  onSend?: (invoice: Invoice, email: string) => Promise<void>;
  /** Close handler */
  onClose?: () => void;
}

/**
 * Invoice generator component with form and preview.
 */
export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  patient,
  initialItems = [],
  onGenerate,
  onSend,
  onClose,
}) => {
  const { clinic } = useClinicContext();
  const [items, setItems] = useState<InvoiceItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
  );
  const [customerName, setCustomerName] = useState(patient?.name || '');
  const [customerCpf, setCustomerCpf] = useState(patient?.cpf || '');
  const [customerEmail, setCustomerEmail] = useState(patient?.email || '');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [sending, setSending] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount);

  // Add new item
  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);
  }, []);

  // Remove item
  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Update item
  const updateItem = useCallback(
    (index: number, field: keyof InvoiceItem, value: string | number) => {
      setItems((prev) => {
        const updated = [...prev];
        const item = { ...updated[index] };

        if (field === 'description') {
          item.description = value as string;
        } else if (field === 'quantity') {
          item.quantity = Math.max(1, Number(value));
          item.total = item.quantity * item.unitPrice;
        } else if (field === 'unitPrice') {
          item.unitPrice = Math.max(0, Number(value));
          item.total = item.quantity * item.unitPrice;
        }

        updated[index] = item;
        return updated;
      });
    },
    []
  );

  // Generate invoice number
  const generateInvoiceNumber = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${year}${month}-${random}`;
  }, []);

  // Create invoice object
  const createInvoice = useCallback((): Invoice => {
    return {
      number: generateInvoiceNumber(),
      clinic: {
        name: clinic?.name || 'Clínica Genesis',
        cnpj: '', // Would come from clinic settings
        address: clinic?.address || '',
        phone: clinic?.phone || '',
        email: clinic?.email || '',
      },
      customer: {
        name: customerName,
        cpf: customerCpf || undefined,
        email: customerEmail || undefined,
      },
      items: items.filter((item) => item.description && item.total > 0),
      subtotal,
      discount: discount > 0 ? discount : undefined,
      total,
      issuedAt: new Date().toISOString(),
      paymentMethod: 'pix',
      status: 'draft',
      notes: notes || undefined,
    };
  }, [
    clinic,
    customerName,
    customerCpf,
    customerEmail,
    items,
    subtotal,
    discount,
    total,
    notes,
    generateInvoiceNumber,
  ]);

  // Handle generate
  const handleGenerate = useCallback(() => {
    const invoice = createInvoice();
    setGenerated(true);
    onGenerate?.(invoice);
  }, [createInvoice, onGenerate]);

  // Handle send
  const handleSend = useCallback(async () => {
    if (!customerEmail || !onSend) return;

    setSending(true);
    try {
      const invoice = createInvoice();
      await onSend(invoice, customerEmail);
      setGenerated(true);
    } finally {
      setSending(false);
    }
  }, [createInvoice, customerEmail, onSend]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Validate form
  const isValid =
    customerName.trim() !== '' &&
    items.some((item) => item.description && item.total > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-genesis-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-genesis-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#32D583]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#32D583]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-genesis-dark">
                Gerar Fatura
              </h2>
              <p className="text-sm text-genesis-muted">
                Crie uma fatura para o paciente
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-genesis-subtle hover:text-genesis-medium"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-genesis-dark">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-genesis-text mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-genesis-text mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none"
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-genesis-text mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-genesis-dark">Itens</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-[#32D583] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Adicionar item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-genesis-soft rounded-lg"
                >
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, 'description', e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none"
                    placeholder="Descrição"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, 'quantity', e.target.value)
                    }
                    className="w-20 px-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none text-center"
                    min="1"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-genesis-muted">
                      R$
                    </span>
                    <input
                      type="number"
                      value={item.unitPrice / 100}
                      onChange={(e) =>
                        updateItem(
                          index,
                          'unitPrice',
                          Math.round(Number(e.target.value) * 100)
                        )
                      }
                      className="w-28 pl-10 pr-3 py-2 border border-genesis-border rounded-lg bg-genesis-surface focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <span className="w-24 text-right font-medium text-genesis-dark">
                    {formatPaymentAmount(item.total)}
                  </span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-genesis-subtle hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Desconto
            </label>
            <div className="relative w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-genesis-muted">
                R$
              </span>
              <input
                type="number"
                value={discount / 100}
                onChange={(e) =>
                  setDiscount(Math.round(Number(e.target.value) * 100))
                }
                className="w-full pl-10 pr-3 py-2 border border-genesis-border rounded-lg focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] outline-none resize-none"
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-genesis-border-subtle space-y-2">
            <div className="flex justify-between text-sm text-genesis-medium">
              <span>Subtotal</span>
              <span>{formatPaymentAmount(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto</span>
                <span>-{formatPaymentAmount(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold text-genesis-dark">
              <span>Total</span>
              <span>{formatPaymentAmount(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-genesis-border-subtle bg-genesis-soft">
          {generated && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Fatura gerada!</span>
            </div>
          )}
          {!generated && <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={!isValid}
              className="flex items-center gap-2 px-4 py-2 text-genesis-text bg-genesis-surface border border-genesis-border rounded-lg hover:bg-genesis-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>

            <button
              onClick={handleGenerate}
              disabled={!isValid}
              className="flex items-center gap-2 px-4 py-2 text-genesis-text bg-genesis-surface border border-genesis-border rounded-lg hover:bg-genesis-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>

            {onSend && customerEmail && (
              <button
                onClick={handleSend}
                disabled={!isValid || sending}
                className="flex items-center gap-2 px-4 py-2 text-white bg-[#32D583] rounded-lg hover:bg-[#2BBF76] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar por Email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;

