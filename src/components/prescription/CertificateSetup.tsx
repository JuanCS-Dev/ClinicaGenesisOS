/**
 * CertificateSetup Component
 *
 * Configures digital certificate (e-CPF) for prescription signing.
 * Supports A1 (file-based) and A3 (token/smartcard) certificates.
 */

import React, { useState, useCallback } from 'react';
import {
  Shield,
  Upload,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  X,
  CreditCard,
  FileKey,
} from 'lucide-react';
import type { CertificateSetupProps, CertificateType, DigitalCertificate } from '@/types';
import { toast } from 'sonner';

/**
 * Mock certificate validation.
 * In production, this would validate against real PKI infrastructure.
 */
async function validateCertificate(
  type: CertificateType,
  filePath?: string,
  _password?: string
): Promise<DigitalCertificate> {
  // Simulate validation delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock certificate data
  return {
    id: `cert-${Date.now()}`,
    type,
    subjectName: 'Dr. João da Silva',
    issuer: 'AC SERASA RFB V5',
    serialNumber: '1234567890ABCDEF',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isValid: true,
    cpf: '123.456.789-00',
    professionalRegistration: 'CRM 12345/SP',
    filePath,
  };
}

/**
 * CertificateSetup - Configure e-CPF for digital signing.
 */
export function CertificateSetup({
  certificate,
  onCertificateConfigured,
  onClose,
}: CertificateSetupProps) {
  const [type, setType] = useState<CertificateType>(certificate?.type || 'A1');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  /**
   * Handle file selection.
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.pfx') && !selectedFile.name.endsWith('.p12')) {
        setError('Selecione um arquivo .pfx ou .p12');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  /**
   * Validate and configure certificate.
   */
  const handleSubmit = useCallback(async () => {
    if (type === 'A1' && !file) {
      setError('Selecione o arquivo do certificado');
      return;
    }

    if (type === 'A1' && !password) {
      setError('Digite a senha do certificado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validatedCertificate = await validateCertificate(
        type,
        file?.name,
        password
      );

      onCertificateConfigured(validatedCertificate);
      toast.success('Certificado configurado com sucesso');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao validar certificado';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [type, file, password, onCertificateConfigured]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                Certificado Digital
              </h2>
              <p className="text-sm text-gray-500">
                Configure seu e-CPF para assinatura
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ajuda"
            >
              <HelpCircle className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2">O que é o e-CPF?</h4>
            <p className="text-sm text-blue-800 mb-3">
              O e-CPF é um certificado digital que funciona como sua identidade
              eletrônica. Com ele, você pode assinar documentos digitalmente com
              validade jurídica.
            </p>
            <h4 className="font-medium text-blue-900 mb-2">Tipos de certificado:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>A1:</strong> Arquivo digital (.pfx) armazenado no computador.
                Validade de 1 ano.
              </li>
              <li>
                <strong>A3:</strong> Token USB ou smartcard físico. Maior segurança.
                Validade de 3 anos.
              </li>
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Certificate */}
          {certificate && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-emerald-900">
                    Certificado configurado
                  </div>
                  <div className="text-sm text-emerald-700 mt-1">
                    <p>{certificate.subjectName}</p>
                    <p className="text-emerald-600">{certificate.professionalRegistration}</p>
                    <p className="text-xs mt-1">
                      Válido até: {new Date(certificate.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Certificate Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de certificado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType('A1')}
                className={`p-4 border-2 rounded-xl text-left transition-colors ${
                  type === 'A1'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileKey className={`w-6 h-6 mb-2 ${type === 'A1' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className={`font-medium ${type === 'A1' ? 'text-blue-900' : 'text-gray-900'}`}>
                  Certificado A1
                </div>
                <div className="text-sm text-gray-500">
                  Arquivo digital (.pfx)
                </div>
              </button>

              <button
                onClick={() => setType('A3')}
                className={`p-4 border-2 rounded-xl text-left transition-colors ${
                  type === 'A3'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className={`w-6 h-6 mb-2 ${type === 'A3' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className={`font-medium ${type === 'A3' ? 'text-blue-900' : 'text-gray-900'}`}>
                  Certificado A3
                </div>
                <div className="text-sm text-gray-500">
                  Token USB / Smartcard
                </div>
              </button>
            </div>
          </div>

          {/* A1 Certificate Upload */}
          {type === 'A1' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo do certificado
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    file ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pfx,.p12"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        Arraste o arquivo ou clique para selecionar
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Formatos aceitos: .pfx, .p12
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha do certificado
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* A3 Certificate Info */}
          {type === 'A3' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">
                    Certificado A3 requer software adicional
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Conecte seu token USB ou smartcard e certifique-se de que o
                    driver está instalado. O sistema detectará automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-900"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || (type === 'A1' && (!file || !password))}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
            {loading ? 'Validando...' : 'Configurar Certificado'}
          </button>
        </div>
      </div>
    </div>
  );
}
