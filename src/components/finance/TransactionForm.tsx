/**
 * TransactionForm Component
 *
 * Modal form for creating new transactions.
 * Supports optional PIX payment generation.
 *
 * Fase 10: PIX Integration
 */

import React, { useState } from 'react';
import { X, Loader2, QrCode } from 'lucide-react';
import {
  DEFAULT_CATEGORIES,
  PAYMENT_METHOD_LABELS,
  type CreateTransactionInput,
  type TransactionType,
  type PaymentMethod,
} from '../../types';

export interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (data: CreateTransactionInput) => Promise<string | void>;
  initialType?: TransactionType;
  /** Optional: Open PIX modal after creating pending transaction */
  onGeneratePix?: (transactionId: string, amount: number, description: string) => void;
}

export function TransactionForm({
  onClose,
  onSubmit,
  initialType = 'income',
  onGeneratePix,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatePix, setGeneratePix] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = DEFAULT_CATEGORIES.filter((c) => c.type === type);
  const amountInCents = Math.round(parseFloat(amount.replace(',', '.') || '0') * 100);
  const canGeneratePix = type === 'income' && paymentMethod === 'pix' && onGeneratePix;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId) return;

    setSubmitting(true);
    try {
      // If generating PIX, create as pending
      const status = generatePix && canGeneratePix ? 'pending' : 'paid';

      const transactionId = await onSubmit({
        description,
        amount: amountInCents,
        type,
        categoryId,
        paymentMethod,
        date: new Date(date).toISOString(),
        status,
      });

      // If generating PIX, open the PIX modal
      if (generatePix && canGeneratePix && transactionId) {
        onGeneratePix(transactionId, amountInCents, description);
      }

      onClose();
    } catch (err) {
      console.error('Error creating transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-genesis-surface rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-genesis-border-subtle">
          <h2 className="text-lg font-bold text-genesis-dark">Nova Transação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-genesis-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                type === 'income'
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-genesis-hover text-genesis-medium hover:bg-genesis-border-subtle'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-genesis-hover text-genesis-medium hover:bg-genesis-border-subtle'
              }`}
            >
              Despesa
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Consulta Nutricional - Maria Silva"
              className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
              required
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-genesis-text mb-1">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
            />
          </div>

          {/* Generate PIX option */}
          {canGeneratePix && (
            <div className="flex items-center gap-3 p-3 bg-[#32D583]/5 border border-[#32D583]/20 rounded-xl">
              <input
                type="checkbox"
                id="generatePix"
                checked={generatePix}
                onChange={(e) => setGeneratePix(e.target.checked)}
                className="w-4 h-4 text-[#32D583] border-genesis-border rounded focus:ring-[#32D583]"
              />
              <label htmlFor="generatePix" className="flex items-center gap-2 text-sm text-genesis-text cursor-pointer">
                <QrCode className="w-4 h-4 text-[#32D583]" />
                Gerar cobrança PIX para o cliente
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-genesis-primary text-white rounded-xl font-medium hover:bg-genesis-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : generatePix && canGeneratePix ? (
              <>
                <QrCode className="w-4 h-4" />
                Salvar e Gerar PIX
              </>
            ) : (
              'Salvar Transação'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
