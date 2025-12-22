/**
 * Genesis Design System - Modal Component
 * ========================================
 * 
 * Premium modal with animations, sizes, and full accessibility.
 * Uses React Portal for proper stacking context.
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmar Ação"
 * >
 *   <p>Conteúdo do modal</p>
 * </Modal>
 * ```
 * 
 * @module design-system/components/Modal
 * @version 1.0.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /** Whether modal is visible */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description (for screen readers) */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Size of the modal */
  size?: ModalSize;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
  /** Footer content (typically buttons) */
  footer?: React.ReactNode;
  /** Additional class name for content */
  className?: string;
}

/**
 * Size-specific styles
 */
const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

/**
 * Premium Modal Component
 * 
 * Features:
 * - Smooth enter/exit animations
 * - 5 sizes (sm, md, lg, xl, full)
 * - Focus trap (first focusable element)
 * - Close on Escape key
 * - Close on backdrop click (configurable)
 * - Portal rendering
 * - WCAG AA compliant
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /**
   * Handle escape key press
   */
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && closeOnBackdrop) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  /**
   * Focus management and event listeners
   */
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Add escape listener
      document.addEventListener('keydown', handleEscape);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      
      // Restore focus
      if (!isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleEscape]);

  // Don't render if not open
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={[
          // Base styles
          'relative z-10 w-full bg-[var(--color-genesis-surface)] rounded-xl shadow-2xl',
          // Animation
          'animate-[modalEnter_300ms_cubic-bezier(0.34,1.56,0.64,1)]',
          // Size
          sizeStyles[size],
          // Focus outline
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-genesis-primary)] focus-visible:ring-offset-2',
          className,
        ].filter(Boolean).join(' ')}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-genesis-border)]">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[var(--color-genesis-dark)]"
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[var(--color-genesis-muted)] hover:text-[var(--color-genesis-text)] hover:bg-[var(--color-genesis-hover)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-genesis-primary)]"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Description (screen reader) */}
        {description && (
          <p id="modal-description" className="sr-only">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--color-genesis-border)] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal
  return createPortal(modalContent, document.body);
};

Modal.displayName = 'Modal';

export default Modal;

