/**
 * Input Component Tests
 * =====================
 * 
 * Unit tests for the Design System Input component.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/design-system';

describe('Input', () => {
  describe('rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('border');
    });

    it('applies filled variant', () => {
      render(<Input variant="filled" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-');
    });
  });

  describe('sizes', () => {
    it('applies small size', () => {
      render(<Input size="sm" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('h-8');
    });

    it('applies medium size by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('h-10');
    });

    it('applies large size', () => {
      render(<Input size="lg" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('h-12');
    });
  });

  describe('helper text', () => {
    it('renders helper text', () => {
      render(<Input helperText="This is a hint" />);
      expect(screen.getByText('This is a hint')).toBeInTheDocument();
    });

    it('associates helper text with input via aria-describedby', () => {
      render(<Input label="Test" helperText="Hint" />);
      const input = screen.getByLabelText('Test');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('error state', () => {
    it('shows error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('sets aria-invalid when error exists', () => {
      render(<Input label="Test" error="Error" />);
      const input = screen.getByLabelText('Test');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('icons', () => {
    it('renders left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">🔍</span>;
      render(<Input leftIcon={<LeftIcon />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">✓</span>;
      render(<Input rightIcon={<RightIcon />} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('events', () => {
    it('calls onChange when value changes', async () => {
      const onChange = vi.fn();
      render(<Input onChange={onChange} />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');
      expect(onChange).toHaveBeenCalled();
    });

    it('calls onFocus when focused', () => {
      const onFocus = vi.fn();
      render(<Input onFocus={onFocus} />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onBlur when blurred', () => {
      const onBlur = vi.fn();
      render(<Input onBlur={onBlur} />);
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('required', () => {
    it('sets required attribute on input', () => {
      render(<Input required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });
  });

  describe('fullWidth', () => {
    it('applies full width when specified', () => {
      const { container } = render(<Input fullWidth />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('w-full');
    });
  });

  describe('accessibility', () => {
    it('associates label with input', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('merges custom className on wrapper', () => {
      const { container } = render(<Input className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('forwardRef', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
