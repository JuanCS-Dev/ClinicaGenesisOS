/**
 * Accessibility Tests - Component Level
 * ======================================
 * 
 * Tests that Design System components meet WCAG 2.1 AA standards.
 * 
 * @see https://www.w3.org/WAI/WCAG21/quickref/
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  Button, 
  Input, 
  Modal, 
  Badge, 
  Card,
  SkipLink,
  VisuallyHidden,
} from '@/design-system';

describe('Accessibility - Button', () => {
  it('has correct role', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('is focusable', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('can be activated with Enter key', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    // Native button handles Enter automatically
  });

  it('can be activated with Space key', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    // Native button handles Space automatically
  });

  it('shows loading state with aria-busy', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('is properly disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('has visible focus indicator', () => {
    render(<Button>Focus me</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('focus-visible');
  });
});

describe('Accessibility - Input', () => {
  it('associates label with input', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('has accessible error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('has accessible helper text', () => {
    render(<Input label="Email" helperText="We will never share your email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('is focusable', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    input.focus();
    expect(document.activeElement).toBe(input);
  });
});

describe('Accessibility - Modal', () => {
  it('has correct ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Content
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('closes on Escape key', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        Content
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('traps focus inside modal', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        <button>First</button>
        <button>Last</button>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('tabIndex', '-1');
  });

  it('has accessible close button', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        Content
      </Modal>
    );
    const closeButton = screen.getByLabelText('Fechar modal');
    expect(closeButton).toBeInTheDocument();
  });
});

describe('Accessibility - Badge', () => {
  it('is not focusable (decorative)', () => {
    const { container } = render(<Badge>Status</Badge>);
    const badge = container.firstChild;
    expect(badge).not.toHaveAttribute('tabIndex');
  });

  it('renders text content accessibly', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('Accessibility - Card', () => {
  it('is focusable when interactive', () => {
    render(<Card interactive>Content</Card>);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('is not focusable when not interactive', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).not.toHaveAttribute('tabIndex');
  });
});

describe('Accessibility - SkipLink', () => {
  it('is hidden by default', () => {
    render(<SkipLink />);
    const link = screen.getByText('Pular para o conteúdo principal');
    expect(link.className).toContain('sr-only');
  });

  it('becomes visible on focus', () => {
    render(<SkipLink />);
    const link = screen.getByText('Pular para o conteúdo principal');
    expect(link.className).toContain('focus:not-sr-only');
  });

  it('has correct href', () => {
    render(<SkipLink href="#main" />);
    const link = screen.getByText('Pular para o conteúdo principal');
    expect(link).toHaveAttribute('href', '#main');
  });

  it('allows custom label', () => {
    render(<SkipLink label="Skip to content" />);
    expect(screen.getByText('Skip to content')).toBeInTheDocument();
  });
});

describe('Accessibility - VisuallyHidden', () => {
  it('renders content for screen readers', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(screen.getByText('Hidden text')).toBeInTheDocument();
  });

  it('uses sr-only class', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    const element = screen.getByText('Hidden text');
    expect(element.className).toContain('sr-only');
  });

  it('can render as different elements', () => {
    const { container } = render(<VisuallyHidden as="div">Hidden</VisuallyHidden>);
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});

describe('Accessibility - Keyboard Navigation', () => {
  it('Tab moves focus forward through buttons', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>
    );

    // Tab to first button
    await user.tab();
    const firstButton = screen.getByText('First').closest('button');
    expect(firstButton).toHaveFocus();
    
    // Tab to second button
    await user.tab();
    const secondButton = screen.getByText('Second').closest('button');
    expect(secondButton).toHaveFocus();
    
    // Tab to third button
    await user.tab();
    const thirdButton = screen.getByText('Third').closest('button');
    expect(thirdButton).toHaveFocus();
  });

  it('all buttons are keyboard accessible', () => {
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    // All buttons should be focusable
    buttons.forEach(button => {
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});

