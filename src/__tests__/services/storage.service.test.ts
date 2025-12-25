/**
 * Storage Service Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateImageFile,
  validateAttachmentFile,
  formatFileSize,
  uploadPatientAvatar,
  deleteFile,
  uploadRecordAttachment,
  deleteRecordAttachment,
} from '../../services/storage.service';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => ({ fullPath: 'mock-path' })),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve('https://storage.example.com/file.jpg')),
  deleteObject: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../services/firebase', () => ({
  storage: {},
}));

// Helper to create mock File
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('storage.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateImageFile', () => {
    it('accepts valid JPEG file', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      expect(validateImageFile(file)).toBe(true);
    });

    it('accepts valid PNG file', () => {
      const file = createMockFile('test.png', 1000, 'image/png');
      expect(validateImageFile(file)).toBe(true);
    });

    it('accepts valid GIF file', () => {
      const file = createMockFile('test.gif', 1000, 'image/gif');
      expect(validateImageFile(file)).toBe(true);
    });

    it('accepts valid WebP file', () => {
      const file = createMockFile('test.webp', 1000, 'image/webp');
      expect(validateImageFile(file)).toBe(true);
    });

    it('rejects invalid file type', () => {
      const file = createMockFile('test.pdf', 1000, 'application/pdf');
      expect(() => validateImageFile(file)).toThrow(
        'Tipo de arquivo inválido. Use JPG, PNG, GIF ou WebP.'
      );
    });

    it('rejects file larger than 5MB', () => {
      const file = createMockFile('test.jpg', 6 * 1024 * 1024, 'image/jpeg');
      expect(() => validateImageFile(file)).toThrow(
        'Arquivo muito grande. Máximo 5MB.'
      );
    });

    it('accepts file at exactly 5MB', () => {
      const file = createMockFile('test.jpg', 5 * 1024 * 1024, 'image/jpeg');
      expect(validateImageFile(file)).toBe(true);
    });
  });

  describe('validateAttachmentFile', () => {
    it('accepts valid image files', () => {
      const file = createMockFile('test.jpg', 1000, 'image/jpeg');
      expect(validateAttachmentFile(file)).toBe(true);
    });

    it('accepts valid PDF file', () => {
      const file = createMockFile('test.pdf', 1000, 'application/pdf');
      expect(validateAttachmentFile(file)).toBe(true);
    });

    it('rejects invalid file type', () => {
      const file = createMockFile('test.doc', 1000, 'application/msword');
      expect(() => validateAttachmentFile(file)).toThrow(
        'Tipo de arquivo inválido. Use JPG, PNG, GIF, WebP ou PDF.'
      );
    });

    it('rejects file larger than 10MB', () => {
      const file = createMockFile('test.pdf', 11 * 1024 * 1024, 'application/pdf');
      expect(() => validateAttachmentFile(file)).toThrow(
        'Arquivo muito grande. Máximo 10MB.'
      );
    });

    it('accepts file at exactly 10MB', () => {
      const file = createMockFile('test.pdf', 10 * 1024 * 1024, 'application/pdf');
      expect(validateAttachmentFile(file)).toBe(true);
    });

    it('accepts PNG file', () => {
      const file = createMockFile('test.png', 1000, 'image/png');
      expect(validateAttachmentFile(file)).toBe(true);
    });

    it('accepts GIF file', () => {
      const file = createMockFile('test.gif', 1000, 'image/gif');
      expect(validateAttachmentFile(file)).toBe(true);
    });

    it('accepts WebP file', () => {
      const file = createMockFile('test.webp', 1000, 'image/webp');
      expect(validateAttachmentFile(file)).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1500)).toBe('1.5 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1500000)).toBe('1.4 MB');
    });

    it('formats exactly 1KB', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
    });

    it('formats exactly 1MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    });

    it('formats 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('formats large file sizes', () => {
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
    });
  });

  describe('uploadPatientAvatar', () => {
    it('uploads file and returns download URL', async () => {
      const file = createMockFile('photo.jpg', 1000, 'image/jpeg');

      const url = await uploadPatientAvatar('clinic-1', 'patient-1', file);

      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
      expect(url).toBe('https://storage.example.com/file.jpg');
    });

    it('uses default extension when file has no extension', async () => {
      const file = createMockFile('photo', 1000, 'image/jpeg');

      await uploadPatientAvatar('clinic-1', 'patient-1', file);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('deletes file from storage', async () => {
      await deleteFile('https://storage.example.com/file.jpg');

      expect(ref).toHaveBeenCalled();
      expect(deleteObject).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      vi.mocked(deleteObject).mockRejectedValueOnce(new Error('File not found'));

      // Should not throw
      await expect(deleteFile('https://storage.example.com/missing.jpg')).resolves.not.toThrow();
    });
  });

  describe('uploadRecordAttachment', () => {
    it('uploads attachment and returns metadata', async () => {
      const file = createMockFile('document.pdf', 1000, 'application/pdf');

      const attachment = await uploadRecordAttachment('clinic-1', 'record-1', file, 'Dr. Test');

      expect(attachment.id).toContain('att_');
      expect(attachment.name).toBe('document.pdf');
      expect(attachment.url).toBe('https://storage.example.com/file.jpg');
      expect(attachment.type).toBe('pdf');
      expect(attachment.size).toBe(1000);
      expect(attachment.uploadedBy).toBe('Dr. Test');
    });

    it('identifies image type correctly', async () => {
      const file = createMockFile('photo.jpg', 1000, 'image/jpeg');

      const attachment = await uploadRecordAttachment('clinic-1', 'record-1', file, 'Dr. Test');

      expect(attachment.type).toBe('image');
    });

    it('validates file before upload', async () => {
      const file = createMockFile('document.doc', 1000, 'application/msword');

      await expect(
        uploadRecordAttachment('clinic-1', 'record-1', file, 'Dr. Test')
      ).rejects.toThrow('Tipo de arquivo inválido');
    });
  });

  describe('deleteRecordAttachment', () => {
    it('deletes attachment from storage', async () => {
      await deleteRecordAttachment('https://storage.example.com/attachment.pdf');

      expect(ref).toHaveBeenCalled();
      expect(deleteObject).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      vi.mocked(deleteObject).mockRejectedValueOnce(new Error('Not found'));

      await expect(
        deleteRecordAttachment('https://storage.example.com/missing.pdf')
      ).resolves.not.toThrow();
    });
  });
});
