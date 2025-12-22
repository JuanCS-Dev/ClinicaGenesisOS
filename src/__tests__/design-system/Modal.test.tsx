/**
 * Modal Component Tests
 * =====================
 * 
 * Unit tests for the Design System Modal component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/design-system';

describe('Modal', () => {
  describe('visibility', () => {
    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Test">
          Content
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('renders title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          Content
        </Modal>
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Modal content</p>
        </Modal>
      );
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={() => {}} 
          title="Test"
          description="This is a description"
        >
          Content
        </Modal>
      );
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={() => {}} 
          title="Test"
          footer={<button>Submit</button>}
        >
          Content
        </Modal>
      );
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies small size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test" size="sm">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-sm');
    });

    it('applies medium size by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-md');
    });

    it('applies large size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test" size="lg">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-lg');
    });
  });

  describe('close behavior', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          Content
        </Modal>
      );
      const closeButton = screen.getByLabelText('Fechar modal');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          Content
        </Modal>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test" showCloseButton={false}>
          Content
        </Modal>
      );
      expect(screen.queryByLabelText('Fechar modal')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has dialog role', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby referencing title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('has tabIndex for focus management', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('tabIndex', '-1');
    });

    it('close button has aria-label', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      );
      expect(screen.getByLabelText('Fechar modal')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('merges custom className', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test" className="custom-modal">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('custom-modal');
    });
  });
});
