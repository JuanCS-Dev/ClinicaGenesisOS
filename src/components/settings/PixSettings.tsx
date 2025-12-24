/**
 * PIX Settings Component
 * ======================
 *
 * Allows clinic to configure their PIX key for direct payments.
 * Fase 10: Payment Integration
 */

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useClinicContext } from '../../contexts/ClinicContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  validatePixKey,
  detectPixKeyType,
  generateDirectPixQRCode,
  type PixKeyType,
} from '../../services/pix.service';
import type { ClinicPixConfig } from '@/types/payment';

/**
 * PIX key type labels in Portuguese.
 */
const PIX_KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave Aleatória',
};

/**
 * PIX Settings component for configuring clinic's PIX key.
 */
export const PixSettings: React.FC = () => {
  const { clinicId, clinic } = useClinicContext();
  
  // Form state
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('cpf');
  const [receiverName, setReceiverName] = useState('');
  const [receiverCity, setReceiverCity] = useState('');
  const [enabled, setEnabled] = useState(false);
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [previewQR, setPreviewQR] = useState<string | null>(null);

  // Load existing config
  useEffect(() => {
    if (clinic?.pixConfig) {
      setPixKey(clinic.pixConfig.pixKey || '');
      setPixKeyType(clinic.pixConfig.pixKeyType || 'cpf');
      setReceiverName(clinic.pixConfig.receiverName || '');
      setReceiverCity(clinic.pixConfig.receiverCity || '');
      setEnabled(clinic.pixConfig.enabled || false);
    } else if (clinic) {
      // Default values from clinic info
      setReceiverName(clinic.name?.toUpperCase().slice(0, 25) || '');
    }
  }, [clinic]);

  // Auto-detect key type
  useEffect(() => {
    if (pixKey) {
      const detected = detectPixKeyType(pixKey);
      if (detected) {
        setPixKeyType(detected);
      }
    }
  }, [pixKey]);

  // Generate preview QR code
  const handlePreview = async () => {
    if (!pixKey || !receiverName || !receiverCity) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    const validation = validatePixKey(pixKey, pixKeyType);
    if (!validation.valid) {
      setError(validation.error || 'Chave PIX inválida');
      return;
    }

    try {
      const result = await generateDirectPixQRCode({
        pixKey,
        pixKeyType,
        receiverName: receiverName.toUpperCase(),
        receiverCity: receiverCity.toUpperCase(),
        amount: 1, // R$ 1,00 for preview
        description: 'TESTE QR CODE',
      });
      setPreviewQR(result.qrCodeDataUrl);
      setError(null);
    } catch {
      setError('Erro ao gerar QR code de preview');
    }
  };

  // Save configuration
  const handleSave = async () => {
    if (!clinicId) return;

    // Validate
    if (enabled && (!pixKey || !receiverName || !receiverCity)) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (enabled) {
      const validation = validatePixKey(pixKey, pixKeyType);
      if (!validation.valid) {
        setError(validation.error || 'Chave PIX inválida');
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const config: ClinicPixConfig = {
        pixKey,
        pixKeyType,
        receiverName: receiverName.toUpperCase(),
        receiverCity: receiverCity.toUpperCase(),
        enabled,
      };

      await updateDoc(doc(db, 'clinics', clinicId), {
        pixConfig: config,
        updatedAt: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save PIX config:', err);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#32D583]/10 flex items-center justify-center">
          <QrCode className="w-5 h-5 text-[#32D583]" />
        </div>
        <div>
          <h3 className="font-semibold text-genesis-dark">Configuração PIX</h3>
          <p className="text-sm text-genesis-muted">
            Configure sua chave PIX para receber pagamentos sem taxas
          </p>
        </div>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 bg-genesis-soft rounded-xl mb-6">
        <div>
          <p className="font-medium text-genesis-dark">Habilitar PIX Direto</p>
          <p className="text-sm text-genesis-muted">
            Receba pagamentos diretamente na sua conta (0% de taxas)
          </p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? 'bg-[#32D583]' : 'bg-genesis-border'
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-genesis-surface rounded-full transition-transform ${
              enabled ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Form fields */}
      <div className={`space-y-4 ${!enabled && 'opacity-50 pointer-events-none'}`}>
        {/* PIX Key */}
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Chave PIX *
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
              className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-genesis-subtle hover:text-genesis-medium"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-genesis-subtle">
            Detectado: {PIX_KEY_TYPE_LABELS[pixKeyType]}
          </p>
        </div>

        {/* Key Type (manual override) */}
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Tipo de Chave
          </label>
          <select
            value={pixKeyType}
            onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583]"
          >
            {Object.entries(PIX_KEY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Receiver Name */}
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Nome do Recebedor * <span className="text-genesis-subtle">(max 25 caracteres)</span>
          </label>
          <input
            type="text"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value.slice(0, 25))}
            placeholder="Nome que aparecerá no app do pagador"
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] uppercase"
          />
          <p className="mt-1 text-xs text-genesis-subtle">
            {receiverName.length}/25 caracteres
          </p>
        </div>

        {/* Receiver City */}
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Cidade * <span className="text-genesis-subtle">(max 15 caracteres)</span>
          </label>
          <input
            type="text"
            value={receiverCity}
            onChange={(e) => setReceiverCity(e.target.value.slice(0, 15))}
            placeholder="Ex: SAO PAULO"
            className="w-full px-4 py-2.5 border border-genesis-border rounded-xl focus:ring-2 focus:ring-[#32D583]/20 focus:border-[#32D583] uppercase"
          />
          <p className="mt-1 text-xs text-genesis-subtle">
            {receiverCity.length}/15 caracteres
          </p>
        </div>

        {/* Preview */}
        {previewQR && (
          <div className="flex flex-col items-center p-4 bg-genesis-soft rounded-xl">
            <p className="text-sm font-medium text-genesis-text mb-3">Preview do QR Code</p>
            <img src={previewQR} alt="Preview QR Code" loading="lazy" className="w-32 h-32" />
            <p className="mt-2 text-xs text-genesis-subtle">Valor de teste: R$ 1,00</p>
          </div>
        )}

        {/* Error/Success messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Configurações salvas com sucesso!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handlePreview}
            className="flex-1 px-4 py-2.5 border border-genesis-border rounded-xl text-genesis-text hover:bg-genesis-soft transition-colors"
          >
            Testar QR Code
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#32D583] text-white rounded-xl hover:bg-[#2BBF76] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-medium text-blue-900 mb-2">💡 Como funciona?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• O QR Code é gerado localmente usando sua chave PIX</li>
          <li>• O pagamento vai direto para sua conta, sem intermediários</li>
          <li>• Você não paga nenhuma taxa de transação</li>
          <li>• O paciente confirma o pagamento manualmente no sistema</li>
        </ul>
      </div>
    </div>
  );
};

export default PixSettings;

