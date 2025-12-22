/**
 * Avatar Component Tests
 * ======================
 * 
 * Unit tests for the Design System Avatar component.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '@/design-system';

describe('Avatar', () => {
  describe('rendering', () => {
    it('renders with image when src is provided', () => {
      render(<Avatar src="https://example.com/avatar.jpg" alt="User" />);
      const images = screen.getAllByRole('img');
      const img = images.find(el => el.tagName === 'IMG');
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders default icon when no name or src', () => {
      const { container } = render(<Avatar />);
      // Should render an SVG icon
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies md size by default', () => {
      const { container } = render(<Avatar />);
      // Should have size class on inner element
      const avatarInner = container.querySelector('.w-10');
      expect(avatarInner).toBeInTheDocument();
    });

    it('applies sm size', () => {
      const { container } = render(<Avatar size="sm" />);
      const avatarInner = container.querySelector('.w-8');
      expect(avatarInner).toBeInTheDocument();
    });

    it('applies lg size', () => {
      const { container } = render(<Avatar size="lg" />);
      const avatarInner = container.querySelector('.w-12');
      expect(avatarInner).toBeInTheDocument();
    });
  });

  describe('status indicator', () => {
    it('renders status when provided', () => {
      const { container } = render(<Avatar status="online" />);
      // Should have status indicator
      const indicator = container.querySelector('.absolute');
      expect(indicator).toBeInTheDocument();
    });

    it('does not render status when not provided', () => {
      const { container } = render(<Avatar />);
      const indicator = container.querySelector('.absolute.bottom-0');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('merges custom className', () => {
      const { container } = render(<Avatar className="custom-avatar" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-avatar');
    });
  });
});
