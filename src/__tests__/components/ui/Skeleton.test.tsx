/**
 * Skeleton Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, SkeletonGroup, SkeletonSimple } from '../../../components/ui/Skeleton';

describe('Skeleton', () => {
  describe('default variant (text)', () => {
    it('renders with default props', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('h-4', 'rounded');
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('custom-class');
    });

    it('applies custom width as number', () => {
      const { container } = render(<Skeleton width={100} />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ width: '100px' });
    });

    it('applies custom width as string', () => {
      const { container } = render(<Skeleton width="50%" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ width: '50%' });
    });

    it('applies custom height as number', () => {
      const { container } = render(<Skeleton height={50} />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ height: '50px' });
    });

    it('applies custom height as string', () => {
      const { container } = render(<Skeleton height="2rem" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ height: '2rem' });
    });

    it('has aria-hidden for accessibility', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('[aria-hidden="true"]');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('circle variant', () => {
    it('renders circle skeleton', () => {
      const { container } = render(<Skeleton variant="circle" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('applies className to circle', () => {
      const { container } = render(<Skeleton variant="circle" className="w-10 h-10" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('w-10', 'h-10');
    });
  });

  describe('rect variant', () => {
    it('renders rect skeleton', () => {
      const { container } = render(<Skeleton variant="rect" />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveClass('rounded-lg');
    });

    it('applies custom dimensions to rect', () => {
      const { container } = render(<Skeleton variant="rect" width={200} height={100} />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
    });
  });

  describe('card variant', () => {
    it('renders card skeleton with multiple elements', () => {
      const { container } = render(<Skeleton variant="card" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-genesis-surface', 'rounded-xl');
      // Card should have inner skeleton elements
      const innerSkeletons = container.querySelectorAll('.skeleton');
      expect(innerSkeletons.length).toBeGreaterThan(0);
    });

    it('applies className to card container', () => {
      const { container } = render(<Skeleton variant="card" className="w-full" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('w-full');
    });
  });

  describe('multiple lines', () => {
    it('renders multiple skeleton lines', () => {
      const { container } = render(<Skeleton lines={3} />);
      const skeletons = container.querySelectorAll('.skeleton');
      expect(skeletons.length).toBe(3);
    });

    it('last line is shorter (75%)', () => {
      const { container } = render(<Skeleton lines={2} />);
      const skeletons = container.querySelectorAll('.skeleton');
      const lastLine = skeletons[1] as HTMLElement;
      expect(lastLine).toHaveStyle({ width: '75%' });
    });

    it('first lines are full width', () => {
      const { container } = render(<Skeleton lines={3} />);
      const skeletons = container.querySelectorAll('.skeleton');
      const firstLine = skeletons[0] as HTMLElement;
      expect(firstLine).toHaveStyle({ width: '100%' });
    });

    it('wraps lines in container with spacing', () => {
      const { container } = render(<Skeleton lines={2} className="custom-wrapper" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('space-y-2', 'custom-wrapper');
    });
  });
});

describe('SkeletonGroup', () => {
  describe('Avatar', () => {
    it('renders avatar skeleton group', () => {
      const { container } = render(<SkeletonGroup.Avatar />);
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
      const skeletons = container.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(1);
    });
  });

  describe('TableRow', () => {
    it('renders table row skeleton', () => {
      const { container } = render(<SkeletonGroup.TableRow />);
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
      const skeletons = container.querySelectorAll('.skeleton');
      expect(skeletons.length).toBe(4);
    });
  });

  describe('StatCard', () => {
    it('renders stat card skeleton', () => {
      const { container } = render(<SkeletonGroup.StatCard />);
      expect(container.querySelector('.bg-genesis-surface')).toBeInTheDocument();
      const skeletons = container.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(2);
    });
  });
});

describe('SkeletonSimple', () => {
  it('renders simple skeleton', () => {
    const { container } = render(<SkeletonSimple />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<SkeletonSimple className="h-8 w-full" />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toHaveClass('h-8', 'w-full');
  });
});
