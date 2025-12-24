/**
 * Avatar Upload Component
 *
 * Allows users to upload and preview patient profile photos.
 */

import React, { useRef, useState } from 'react';
import { Camera, Loader2, User, X } from 'lucide-react';
import { uploadPatientAvatar, validateImageFile } from '../../services/storage.service';
import { useClinicContext } from '../../contexts/ClinicContext';

interface AvatarUploadProps {
  /** Current avatar URL */
  currentAvatar?: string;
  /** Patient ID (required for upload path) */
  patientId?: string;
  /** Patient name (for placeholder) */
  patientName?: string;
  /** Callback when avatar changes */
  onAvatarChange: (url: string) => void;
  /** Whether upload is disabled */
  disabled?: boolean;
}

export function AvatarUpload({
  currentAvatar,
  patientId,
  patientName = '',
  onAvatarChange,
  disabled = false,
}: AvatarUploadProps) {
  const { clinicId } = useClinicContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayAvatar =
    preview ||
    currentAvatar ||
    (patientName
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=random`
      : null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      // Validate file
      validateImageFile(file);

      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // If we have patientId and clinicId, upload immediately
      if (patientId && clinicId) {
        setUploading(true);
        const downloadUrl = await uploadPatientAvatar(clinicId, patientId, file);
        onAvatarChange(downloadUrl);
        setPreview(null); // Clear preview, use actual URL
      } else {
        // For new patients, just keep the preview and pass the file
        // The parent component will handle upload after patient creation
        onAvatarChange(previewUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar imagem');
      setPreview(null);
    } finally {
      setUploading(false);
      // Clear input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={handleClick}
        className={`relative group ${disabled || uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="w-32 h-32 rounded-full bg-genesis-hover flex items-center justify-center border-4 border-white shadow-md overflow-hidden group-hover:ring-4 group-hover:ring-genesis-primary/10 transition-all">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
          ) : displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <User className="w-12 h-12 text-genesis-subtle" />
          )}
        </div>

        {!disabled && !uploading && (
          <div className="absolute bottom-0 right-0 p-2 bg-genesis-primary rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
        )}

        {preview && !uploading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearPreview();
            }}
            className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <p className="text-sm font-semibold text-genesis-primary mt-4">
        {uploading ? 'Enviando...' : 'Alterar Foto'}
      </p>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
