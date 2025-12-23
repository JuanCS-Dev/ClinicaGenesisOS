/**
 * CertificadoUpload Component
 *
 * UI for clinics to upload their e-CNPJ digital certificate for TISS billing.
 * The certificate is used to sign XML documents sent to health insurance operators.
 *
 * IMPORTANT: This is an interface for THE CLINIC to upload THEIR certificate.
 * We (Genesis OS) provide the infrastructure - the clinic provides their own certificate.
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
  FileKey,
  Calendar,
  Building2,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Certificate status type
 */
type CertificateStatus = 'not_configured' | 'valid' | 'expiring_soon' | 'expired';

/**
 * Certificate info stored for the clinic
 */
export interface CertificadoInfo {
  configurado: boolean;
  tipo: 'A1' | 'A3';
  nomeArquivo?: string;
  razaoSocial?: string;
  cnpj?: string;
  emissor?: string;
  validoAte?: string;
  status: CertificateStatus;
}

interface CertificadoUploadProps {
  /** Current certificate info (if configured) */
  certificado?: CertificadoInfo;
  /** Callback when certificate is configured */
  onCertificateConfigured: (info: CertificadoInfo) => void;
  /** Callback when certificate is removed */
  onCertificateRemoved?: () => void;
}

/**
 * Calculate certificate status based on expiry date.
 */
function getCertificateStatus(validoAte?: string): CertificateStatus {
  if (!validoAte) return 'not_configured';

  const expiryDate = new Date(validoAte);
  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry < 30) return 'expiring_soon';
  return 'valid';
}

/**
 * Get status color and label.
 */
function getStatusDisplay(status: CertificateStatus): { color: string; label: string; bgColor: string } {
  switch (status) {
    case 'valid':
      return {
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        label: 'Válido',
      };
    case 'expiring_soon':
      return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        label: 'Expirando em breve',
      };
    case 'expired':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        label: 'Expirado',
      };
    default:
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 border-gray-200',
        label: 'Não configurado',
      };
  }
}

/**
 * Mock certificate validation - simulates reading certificate info.
 * In production, this would use a Cloud Function to securely parse the .pfx
 */
async function mockValidateCertificate(
  _file: File,
  _password: string
): Promise<CertificadoInfo> {
  // Simulate server validation delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate 10% chance of wrong password
  if (Math.random() < 0.1) {
    throw new Error('Senha incorreta ou certificado inválido');
  }

  // Return mock certificate info
  const validoAte = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  return {
    configurado: true,
    tipo: 'A1',
    nomeArquivo: _file.name,
    razaoSocial: 'Clínica Exemplo LTDA',
    cnpj: '12.345.678/0001-90',
    emissor: 'AC SERASA RFB V5',
    validoAte,
    status: getCertificateStatus(validoAte),
  };
}

/**
 * CertificadoUpload - UI for clinic to upload their e-CNPJ.
 */
export function CertificadoUpload({
  certificado,
  onCertificateConfigured,
  onCertificateRemoved,
}: CertificadoUploadProps): React.ReactElement {
  const [showUploadForm, setShowUploadForm] = useState(!certificado?.configurado);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const statusDisplay = certificado
    ? getStatusDisplay(certificado.status)
    : getStatusDisplay('not_configured');

  /**
   * Handle file selection.
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase();
      if (!ext.endsWith('.pfx') && !ext.endsWith('.p12')) {
        setError('Selecione um arquivo .pfx ou .p12');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  /**
   * Handle drag and drop.
   */
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const ext = droppedFile.name.toLowerCase();
      if (!ext.endsWith('.pfx') && !ext.endsWith('.p12')) {
        setError('Selecione um arquivo .pfx ou .p12');
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  }, []);

  /**
   * Validate and upload certificate.
   */
  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError('Selecione o arquivo do certificado');
      return;
    }

    if (!password) {
      setError('Digite a senha do certificado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const certInfo = await mockValidateCertificate(file, password);
      onCertificateConfigured(certInfo);
      setShowUploadForm(false);
      setFile(null);
      setPassword('');
      toast.success('Certificado configurado com sucesso');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao validar certificado';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [file, password, onCertificateConfigured]);

  /**
   * Handle certificate removal.
   */
  const handleRemove = useCallback(() => {
    onCertificateRemoved?.();
    setConfirmRemove(false);
    setShowUploadForm(true);
    toast.success('Certificado removido');
  }, [onCertificateRemoved]);

  return (
    <div className="bg-genesis-surface rounded-2xl border border-genesis-border-subtle overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-genesis-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-genesis-dark">
              Certificado Digital e-CNPJ
            </h3>
            <p className="text-sm text-genesis-muted">
              Para assinatura de guias TISS
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 hover:bg-genesis-hover rounded-lg transition-colors"
          title="Ajuda"
        >
          <HelpCircle className="w-5 h-5 text-genesis-muted" />
        </button>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            O que é o e-CNPJ?
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            O e-CNPJ é o certificado digital da sua clínica. Ele é usado para
            assinar digitalmente as guias TISS enviadas aos convênios, garantindo
            autenticidade e validade jurídica.
          </p>
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Como obter?
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Compre em uma certificadora: Serasa, Certisign, Valid, etc.</li>
            <li>Recomendamos o tipo A1 (arquivo .pfx) para facilitar a integração</li>
            <li>O certificado tem validade de 1-3 anos</li>
          </ul>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Current Certificate Display */}
        {certificado?.configurado && !showUploadForm && (
          <div className={`p-4 rounded-xl border ${statusDisplay.bgColor}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className={`w-5 h-5 ${statusDisplay.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-genesis-dark">
                      Certificado configurado
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                      {statusDisplay.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    {certificado.razaoSocial && (
                      <div className="flex items-center gap-2 text-genesis-muted">
                        <Building2 className="w-4 h-4" />
                        {certificado.razaoSocial}
                      </div>
                    )}
                    {certificado.cnpj && (
                      <div className="flex items-center gap-2 text-genesis-muted">
                        <FileKey className="w-4 h-4" />
                        CNPJ: {certificado.cnpj}
                      </div>
                    )}
                    {certificado.validoAte && (
                      <div className="flex items-center gap-2 text-genesis-muted">
                        <Calendar className="w-4 h-4" />
                        Válido até: {new Date(certificado.validoAte).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {certificado.emissor && (
                      <div className="text-xs text-genesis-subtle mt-2">
                        Emissor: {certificado.emissor}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="p-2 rounded-lg hover:bg-white/50 text-genesis-muted hover:text-genesis-dark transition-colors"
                  title="Atualizar certificado"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {confirmRemove ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleRemove}
                      className="p-2 rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
                      title="Confirmar remoção"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmRemove(false)}
                      className="p-2 rounded-lg hover:bg-white/50 text-genesis-muted transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(true)}
                    className="p-2 rounded-lg hover:bg-red-100 text-genesis-muted hover:text-danger transition-colors"
                    title="Remover certificado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Warning for expiring/expired */}
            {certificado.status === 'expiring_soon' && (
              <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Seu certificado expira em breve. Renove-o para evitar interrupções no faturamento.
                </p>
              </div>
            )}

            {certificado.status === 'expired' && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  Seu certificado expirou! Faça upload de um novo certificado para continuar enviando guias.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-genesis-text mb-2">
                Arquivo do certificado (.pfx ou .p12)
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  file
                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700'
                    : 'border-genesis-border hover:border-genesis-primary/50 hover:bg-genesis-soft'
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
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {file.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-genesis-subtle mx-auto mb-3" />
                    <p className="text-genesis-text font-medium">
                      Arraste o arquivo ou clique para selecionar
                    </p>
                    <p className="text-sm text-genesis-muted mt-1">
                      Formatos aceitos: .pfx, .p12
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-genesis-text mb-2">
                Senha do certificado
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-subtle" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha do certificado"
                  className="w-full pl-10 pr-12 py-3 border border-genesis-border rounded-xl bg-genesis-soft text-genesis-text placeholder:text-genesis-subtle focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-genesis-hover rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-genesis-muted" />
                  ) : (
                    <Eye className="w-4 h-4 text-genesis-muted" />
                  )}
                </button>
              </div>
              <p className="text-xs text-genesis-muted mt-1.5">
                A senha é usada apenas para validar o certificado. Ela será armazenada de forma segura e criptografada.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {certificado?.configurado && (
                <button
                  onClick={() => {
                    setShowUploadForm(false);
                    setFile(null);
                    setPassword('');
                    setError(null);
                  }}
                  className="px-4 py-2.5 text-genesis-muted hover:text-genesis-dark transition-colors"
                >
                  Cancelar
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !file || !password}
                className="flex items-center gap-2 px-6 py-2.5 bg-genesis-primary hover:bg-genesis-primary/90 text-white rounded-xl font-medium transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Configurar Certificado
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
