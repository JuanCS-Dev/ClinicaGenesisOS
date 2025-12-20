/**
 * Finance Types Tests
 *
 * Tests for financial utility functions and type validations.
 * Fase 4: Financeiro & Relatórios
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrencyToCents,
  DEFAULT_CATEGORIES,
  PAYMENT_METHOD_LABELS,
  TRANSACTION_STATUS_LABELS,
} from '../../types/finance';

describe('formatCurrency', () => {
  it('should format cents to Brazilian Real', () => {
    // Note: Intl.NumberFormat uses non-breaking space (U+00A0)
    expect(formatCurrency(35000)).toMatch(/R\$\s*350,00/);
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
  });

  it('should format large amounts correctly', () => {
    expect(formatCurrency(1234567)).toMatch(/R\$\s*12\.345,67/);
  });

  it('should format negative amounts', () => {
    expect(formatCurrency(-5000)).toMatch(/-R\$\s*50,00/);
  });

  it('should format single digit cents', () => {
    expect(formatCurrency(1)).toMatch(/R\$\s*0,01/);
  });

  it('should format amounts with many digits', () => {
    expect(formatCurrency(123456789)).toMatch(/R\$\s*1\.234\.567,89/);
  });
});

describe('parseCurrencyToCents', () => {
  it('should parse formatted currency to cents', () => {
    expect(parseCurrencyToCents('R$ 350,00')).toBe(35000);
  });

  it('should parse currency with thousand separators', () => {
    expect(parseCurrencyToCents('R$ 1.234,56')).toBe(123456);
  });

  it('should parse plain number string', () => {
    expect(parseCurrencyToCents('100')).toBe(10000);
  });

  it('should parse decimal string with comma', () => {
    expect(parseCurrencyToCents('100,50')).toBe(10050);
  });
});

describe('DEFAULT_CATEGORIES', () => {
  it('should have income categories', () => {
    const incomeCategories = DEFAULT_CATEGORIES.filter(
      (c) => c.type === 'income'
    );
    expect(incomeCategories.length).toBeGreaterThan(0);
  });

  it('should have expense categories', () => {
    const expenseCategories = DEFAULT_CATEGORIES.filter(
      (c) => c.type === 'expense'
    );
    expect(expenseCategories.length).toBeGreaterThan(0);
  });

  it('should have required fields for each category', () => {
    DEFAULT_CATEGORIES.forEach((category) => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('type');
      expect(category).toHaveProperty('color');
      expect(category.type).toMatch(/^(income|expense)$/);
    });
  });

  it('should have unique ids', () => {
    const ids = DEFAULT_CATEGORIES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have consultation category', () => {
    const consultation = DEFAULT_CATEGORIES.find(
      (c) => c.id === 'consultation'
    );
    expect(consultation).toBeDefined();
    expect(consultation?.type).toBe('income');
  });
});

describe('PAYMENT_METHOD_LABELS', () => {
  it('should have label for pix', () => {
    expect(PAYMENT_METHOD_LABELS.pix).toBe('PIX');
  });

  it('should have label for credit_card', () => {
    expect(PAYMENT_METHOD_LABELS.credit_card).toBe('Cartão de Crédito');
  });

  it('should have label for debit_card', () => {
    expect(PAYMENT_METHOD_LABELS.debit_card).toBe('Cartão de Débito');
  });

  it('should have label for cash', () => {
    expect(PAYMENT_METHOD_LABELS.cash).toBe('Dinheiro');
  });

  it('should have label for bank_transfer', () => {
    expect(PAYMENT_METHOD_LABELS.bank_transfer).toBe('Transferência');
  });

  it('should have label for boleto', () => {
    expect(PAYMENT_METHOD_LABELS.boleto).toBe('Boleto');
  });
});

describe('TRANSACTION_STATUS_LABELS', () => {
  it('should have label for pending', () => {
    expect(TRANSACTION_STATUS_LABELS.pending).toBe('Pendente');
  });

  it('should have label for paid', () => {
    expect(TRANSACTION_STATUS_LABELS.paid).toBe('Pago');
  });

  it('should have label for cancelled', () => {
    expect(TRANSACTION_STATUS_LABELS.cancelled).toBe('Cancelado');
  });

  it('should have label for refunded', () => {
    expect(TRANSACTION_STATUS_LABELS.refunded).toBe('Estornado');
  });
});
