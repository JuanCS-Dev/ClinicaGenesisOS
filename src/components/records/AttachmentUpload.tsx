/**
 * AttachmentUpload Component
 * ==========================
 *
 * Reusable component for uploading and displaying record attachments.
 * Supports drag-and-drop, file selection, and preview.
 *
 * Features:
 * - Drag and drop file upload
 * - Click to select files
 * - Preview images inline
 * - PDF icon display
 * - Delete attachments
 * - File size formatting
 *
 * @module components/records/AttachmentUpload
 */

import type { DragEvent } from 'react';
import { useState, useCallback, useRef, memo } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import type { RecordAttachment } from '@/types';
import {
  uploadRecordAttachment,
  deleteRecordAttachment,
  formatFileSize,
  validateAttachmentFile,
} from '@/services/storage.service';
import { useClinicContext } from '@/contexts/ClinicContext';

interface AttachmentUploadProps {
  /** Record ID to attach files to */
  recordId: string;
  /** Current attachments */
  attachments: RecordAttachment[];
  /** Callback when attachments change */
  onAttachmentsChange: (attachments: RecordAttachment[]) => void;
  /** Optional max number of attachments */
  maxAttachments?: number;
  /** Optional disabled state */
  disabled?: boolean;
}

export function AttachmentUpload({
  recordId,
  attachments,
  onAttachmentsChange,
  maxAttachments = 10,
  disabled = false,
}: AttachmentUploadProps) {
  const { clinicId, userProfile } = useClinicContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = attachments.length < maxAttachments;

  /**
   * Handle file upload.
   */
  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (!clinicId || !recordId) {
        setError('Contexto de clínica ou registro não encontrado.');
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const uploadedBy = userProfile?.displayName || 'Profissional';
        const newAttachments: RecordAttachment[] = [];

        // Upload files one by one
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Check if we can add more
          if (attachments.length + newAttachments.length >= maxAttachments) {
            setError(`Máximo de ${maxAttachments} anexos permitidos.`);
            break;
          }

          try {
            validateAttachmentFile(file);
            const attachment = await uploadRecordAttachment(
              clinicId,
              recordId,
              file,
              uploadedBy
            );
            newAttachments.push(attachment);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer upload.');
          }
        }

        if (newAttachments.length > 0) {
          onAttachmentsChange([...attachments, ...newAttachments]);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [clinicId, recordId, userProfile, attachments, maxAttachments, onAttachmentsChange]
  );

  /**
   * Handle file deletion.
   */
  const handleDelete = useCallback(
    async (attachmentId: string) => {
      const attachment = attachments.find((a) => a.id === attachmentId);
      if (!attachment) return;

      try {
        await deleteRecordAttachment(attachment.url);
        onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId));
      } catch (err) {
        console.error('Failed to delete attachment:', err);
        setError('Erro ao remover anexo.');
      }
    },
    [attachments, onAttachmentsChange]
  );

  /**
   * Handle drag events.
   */
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && canAddMore) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [disabled, canAddMore, handleUpload]
  );

  /**
   * Trigger file input click.
   */
  const handleClick = useCallback(() => {
    if (!disabled && canAddMore) {
      fileInputRef.current?.click();
    }
  }, [disabled, canAddMore]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-genesis-border hover:border-genesis-border hover:bg-genesis-soft'}
          ${disabled || !canAddMore ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          disabled={disabled || !canAddMore}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-genesis-muted">Enviando arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-genesis-subtle'}`} />
            <p className="text-sm text-genesis-medium">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-xs text-genesis-subtle">
              PDF, JPG, PNG, GIF ou WebP (máx. 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-genesis-muted uppercase tracking-wider">
            Anexos ({attachments.length}/{maxAttachments})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((attachment) => (
              <AttachmentItem
                key={attachment.id}
                attachment={attachment}
                onDelete={() => handleDelete(attachment.id)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual attachment item component.
 */
interface AttachmentItemProps {
  attachment: RecordAttachment;
  onDelete: () => void;
  disabled?: boolean;
}

const AttachmentItem = memo(function AttachmentItem({ attachment, onDelete, disabled }: AttachmentItemProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-genesis-soft border border-genesis-border-subtle rounded-lg group">
        {/* Icon/Thumbnail */}
        <div className="flex-shrink-0">
          {attachment.type === 'pdf' ? (
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-200 transition-all"
            >
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full h-full object-cover"
              />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-genesis-text hover:text-blue-600 truncate block"
          >
            {attachment.name}
          </a>
          <p className="text-xs text-genesis-subtle">{formatFileSize(attachment.size)}</p>
        </div>

        {/* Delete button */}
        {!disabled && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-genesis-subtle hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Image preview modal */}
      {showPreview && attachment.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute -top-3 -right-3 p-2 bg-genesis-surface rounded-full shadow-lg hover:bg-genesis-hover"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
});

/**
 * Compact attachment display (read-only).
 */
interface AttachmentListProps {
  attachments: RecordAttachment[];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 py-1 bg-genesis-hover hover:bg-genesis-border-subtle rounded-lg text-xs text-genesis-medium transition-colors"
        >
          {attachment.type === 'pdf' ? (
            <FileText className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
          )}
          <span className="truncate max-w-[120px]">{attachment.name}</span>
        </a>
      ))}
    </div>
  );
}
