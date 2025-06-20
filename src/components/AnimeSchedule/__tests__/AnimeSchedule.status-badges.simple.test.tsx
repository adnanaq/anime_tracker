import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from '../../ui';

// Test the badge rendering logic directly based on the AnimeSchedule component pattern
const renderStatusBadge = (airingStatus: string) => {
  let variant: 'success' | 'danger' | 'warning' | 'neutral' | 'primary';
  let text: string;
  let animated = false;
  let icon: React.ReactNode = undefined;

  // This logic mirrors the AnimeSchedule component
  switch (airingStatus) {
    case 'aired':
      variant = 'success';
      text = 'Aired';
      break;
    case 'airing':
      variant = 'danger';
      text = 'Live';
      animated = true;
      icon = <div className="w-2 h-2 bg-current rounded-full"></div>;
      break;
    case 'delayed':
      variant = 'warning';
      text = 'Delayed';
      break;
    case 'skipped':
      variant = 'neutral';
      text = 'Skipped';
      break;
    case 'tba':
      variant = 'primary';
      text = 'TBA';
      break;
    default:
      variant = 'primary';
      text = 'Unknown';
  }

  return render(
    <Badge
      variant={variant}
      size="xs"
      shape="rounded"
      animated={animated}
      icon={icon}
    >
      {text}
    </Badge>
  );
};

describe('AnimeSchedule Status Badges - Rendering Logic', () => {
  describe('Aired status badge', () => {
    it('should render green "Aired" badge with correct classes', () => {
      renderStatusBadge('aired');
      
      const badge = screen.getByText('Aired');
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass('at-badge-success');
      expect(badge.parentElement).toHaveClass('at-badge-xs');
      expect(badge.parentElement).toHaveClass('at-badge-rounded');
      expect(badge.parentElement).not.toHaveClass('at-badge-animated');
    });

    it('should have correct Badge component structure for aired status', () => {
      renderStatusBadge('aired');
      
      const badge = screen.getByText('Aired');
      expect(badge.parentElement).toHaveClass('at-badge-base');
      expect(badge).toHaveClass('at-badge-content');
    });
  });

  describe('Airing/Live status badge', () => {
    it('should render red "Live" badge with animation', () => {
      renderStatusBadge('airing');
      
      const badge = screen.getByText('Live');
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass('at-badge-danger');
      expect(badge.parentElement).toHaveClass('at-badge-xs');
      expect(badge.parentElement).toHaveClass('at-badge-rounded');
      expect(badge.parentElement).toHaveClass('at-badge-animated');
    });

    it('should display live icon for airing status', () => {
      renderStatusBadge('airing');
      
      const badge = screen.getByText('Live');
      const iconContainer = badge.parentElement?.querySelector('.at-badge-icon');
      expect(iconContainer).toBeInTheDocument();
      
      const icon = iconContainer?.querySelector('.w-2.h-2.bg-current.rounded-full');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Delayed status badge', () => {
    it('should render yellow "Delayed" badge without animation', () => {
      renderStatusBadge('delayed');
      
      const badge = screen.getByText('Delayed');
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass('at-badge-warning');
      expect(badge.parentElement).toHaveClass('at-badge-xs');
      expect(badge.parentElement).toHaveClass('at-badge-rounded');
      expect(badge.parentElement).not.toHaveClass('at-badge-animated');
    });
  });

  describe('Skipped status badge', () => {
    it('should render neutral "Skipped" badge', () => {
      renderStatusBadge('skipped');
      
      const badge = screen.getByText('Skipped');
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass('at-badge-neutral');
      expect(badge.parentElement).toHaveClass('at-badge-xs');
      expect(badge.parentElement).toHaveClass('at-badge-rounded');
      expect(badge.parentElement).not.toHaveClass('at-badge-animated');
    });
  });

  describe('TBA status badge', () => {
    it('should render primary "TBA" badge', () => {
      renderStatusBadge('tba');
      
      const badge = screen.getByText('TBA');
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass('at-badge-primary');
      expect(badge.parentElement).toHaveClass('at-badge-xs');
      expect(badge.parentElement).toHaveClass('at-badge-rounded');
      expect(badge.parentElement).not.toHaveClass('at-badge-animated');
    });
  });

  describe('Episode number badge', () => {
    it('should render info badge for episode numbers', () => {
      render(
        <Badge variant="info" size="xs" shape="rounded">
          Episode 5
        </Badge>
      );
      
      const badge = screen.getByText('Episode 5');
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass('at-badge-info');
      expect(badge.parentElement).toHaveClass('at-badge-xs');
      expect(badge.parentElement).toHaveClass('at-badge-rounded');
    });
  });

  describe('Badge variants and classes', () => {
    it('should apply correct variant classes for all status types', () => {
      const statuses = [
        { status: 'aired', variant: 'at-badge-success', text: 'Aired' },
        { status: 'airing', variant: 'at-badge-danger', text: 'Live' },
        { status: 'delayed', variant: 'at-badge-warning', text: 'Delayed' },
        { status: 'skipped', variant: 'at-badge-neutral', text: 'Skipped' },
        { status: 'tba', variant: 'at-badge-primary', text: 'TBA' },
      ];

      statuses.forEach(({ status, variant, text }) => {
        const { unmount } = renderStatusBadge(status);
        
        const badge = screen.getByText(text);
        expect(badge.parentElement).toHaveClass(variant);
        expect(badge.parentElement).toHaveClass('at-badge-base');
        expect(badge).toHaveClass('at-badge-content');
        
        unmount();
      });
    });

    it('should only animate airing status', () => {
      const statuses = ['aired', 'airing', 'delayed', 'skipped', 'tba'];
      const texts = ['Aired', 'Live', 'Delayed', 'Skipped', 'TBA'];

      statuses.forEach((status, index) => {
        const { unmount } = renderStatusBadge(status);
        
        const badge = screen.getByText(texts[index]);
        if (status === 'airing') {
          expect(badge.parentElement).toHaveClass('at-badge-animated');
        } else {
          expect(badge.parentElement).not.toHaveClass('at-badge-animated');
        }
        
        unmount();
      });
    });

    it('should only show icon for airing status', () => {
      const statuses = ['aired', 'airing', 'delayed', 'skipped', 'tba'];
      const texts = ['Aired', 'Live', 'Delayed', 'Skipped', 'TBA'];

      statuses.forEach((status, index) => {
        const { unmount } = renderStatusBadge(status);
        
        const badge = screen.getByText(texts[index]);
        const iconContainer = badge.parentElement?.querySelector('.at-badge-icon');
        
        if (status === 'airing') {
          expect(iconContainer).toBeInTheDocument();
          const icon = iconContainer?.querySelector('.w-2.h-2.bg-current.rounded-full');
          expect(icon).toBeInTheDocument();
        } else {
          expect(iconContainer).not.toBeInTheDocument();
        }
        
        unmount();
      });
    });
  });

  describe('Badge component structure', () => {
    it('should maintain consistent structure across all badge types', () => {
      const statuses = ['aired', 'airing', 'delayed', 'skipped', 'tba'];
      const texts = ['Aired', 'Live', 'Delayed', 'Skipped', 'TBA'];

      statuses.forEach((status, index) => {
        const { unmount } = renderStatusBadge(status);
        
        const badge = screen.getByText(texts[index]);
        
        // All badges should have base classes
        expect(badge.parentElement).toHaveClass('at-badge-base');
        expect(badge.parentElement).toHaveClass('at-badge-xs');
        expect(badge.parentElement).toHaveClass('at-badge-rounded');
        
        // Content should have correct class
        expect(badge).toHaveClass('at-badge-content');
        
        unmount();
      });
    });
  });
});