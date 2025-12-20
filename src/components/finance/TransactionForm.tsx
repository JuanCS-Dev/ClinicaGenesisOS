/**
 * TransactionForm Component
 *
 * Modal form for creating new transactions.
 */

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
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
}

export function TransactionForm({
  onClose,
  onSubmit,
  initialType = 'income',
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const categories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId) return;

    setSubmitting(true);
    try {
      await onSubmit({
        description,
        amount: Math.round(parseFloat(amount.replace(',', '.')) * 100),
        type,
        categoryId,
        paymentMethod,
        date: new Date(date).toISOString(),
        status: 'paid',
      });
      onClose();
    } catch (err) {
      console.error('Error creating transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-genesis-dark">Nova Transação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
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
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Despesa
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Consulta Nutricional - Maria Silva"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-genesis-dark text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
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
