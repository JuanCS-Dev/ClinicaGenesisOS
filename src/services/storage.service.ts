/**
 * Storage Service
 *
 * Handles file uploads to Firebase Storage.
 * Supports patient avatars and medical record attachments.
 *
 * Storage structure:
 * - /clinics/{clinicId}/patients/{patientId}/avatar_{timestamp}.{ext}
 * - /clinics/{clinicId}/records/{recordId}/attachments/{attachmentId}.{ext}
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import type { RecordAttachment } from '@/types';

/**
 * Upload a patient avatar image.
 *
 * @param clinicId - The clinic ID
 * @param patientId - The patient ID
 * @param file - The image file to upload
 * @returns The download URL of the uploaded image
 */
export async function uploadPatientAvatar(
  clinicId: string,
  patientId: string,
  file: File
): Promise<string> {
  // Create a unique filename
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `avatar_${Date.now()}.${extension}`;
  const path = `clinics/${clinicId}/patients/${patientId}/${filename}`;

  const storageRef = ref(storage, path);

  // Upload the file
  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

/**
 * Delete a file from storage by URL.
 *
 * @param url - The storage URL to delete
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    // Ignore errors if file doesn't exist
    console.warn('Error deleting file:', error);
  }
}

/**
 * Validate image file before upload.
 *
 * @param file - The file to validate
 * @returns True if valid, throws error if invalid
 */
export function validateImageFile(file: File): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use JPG, PNG, GIF ou WebP.');
  }

  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }

  return true;
}

// --- RECORD ATTACHMENT FUNCTIONS ---

/** Maximum file size for attachments (10MB). */
const ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types for attachments. */
const ATTACHMENT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

/**
 * Validate an attachment file before upload.
 *
 * @param file - The file to validate
 * @returns True if valid, throws error if invalid
 */
export function validateAttachmentFile(file: File): boolean {
  if (!ATTACHMENT_ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use JPG, PNG, GIF, WebP ou PDF.');
  }

  if (file.size > ATTACHMENT_MAX_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 10MB.');
  }

  return true;
}

/**
 * Get attachment type from MIME type.
 */
function getAttachmentType(mimeType: string): 'pdf' | 'image' {
  return mimeType === 'application/pdf' ? 'pdf' : 'image';
}

/**
 * Generate a unique attachment ID.
 */
function generateAttachmentId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Upload a record attachment.
 *
 * @param clinicId - The clinic ID
 * @param recordId - The record ID
 * @param file - The file to upload
 * @param uploadedBy - Name of the professional uploading
 * @returns The attachment metadata
 */
export async function uploadRecordAttachment(
  clinicId: string,
  recordId: string,
  file: File,
  uploadedBy: string
): Promise<RecordAttachment> {
  // Validate file
  validateAttachmentFile(file);

  // Generate unique ID and path
  const attachmentId = generateAttachmentId();
  const extension = file.name.split('.').pop() || 'bin';
  const filename = `${attachmentId}.${extension}`;
  const path = `clinics/${clinicId}/records/${recordId}/attachments/${filename}`;

  const storageRef = ref(storage, path);

  // Upload the file
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedBy,
    },
  });

  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);

  // Return attachment metadata
  return {
    id: attachmentId,
    name: file.name,
    url: downloadURL,
    type: getAttachmentType(file.type),
    size: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
  };
}

/**
 * Delete a record attachment.
 *
 * @param url - The storage URL to delete
 */
export async function deleteRecordAttachment(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Error deleting attachment:', error);
  }
}

/**
 * Format file size for display.
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
