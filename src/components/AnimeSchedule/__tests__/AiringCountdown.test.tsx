import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AiringCountdown } from '../AiringCountdown';

// Mock the Temporal API to avoid complexity
vi.mock('@js-temporal/polyfill', () => ({
  Temporal: {
    Now: {
      zonedDateTimeISO: vi.fn(() => ({
        since: vi.fn(),
      })),
    },
    Instant: {
      from: vi.fn(() => ({
        toZonedDateTimeISO: vi.fn(() => ({
          since: vi.fn(() => ({
            total: vi.fn(() => 0), // Default implementation
          })),
        })),
      })),
    },
    ZonedDateTime: {
      compare: vi.fn(() => -1), // Default: future episode
    },
  },
}));

describe('AiringCountdown', () => {
  const mockEpisodeDate = '2024-01-15T15:30:00Z';
  const mockTimezone = 'UTC';

  describe('Status-based rendering - should return null to avoid duplication', () => {
    it('should return null for skipped status', () => {
      const { container } = render(
        <AiringCountdown 
          episodeDate={mockEpisodeDate}
          airingStatus="skipped"
          timezone={mockTimezone}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should return null for tba status', () => {
      const { container } = render(
        <AiringCountdown 
          episodeDate={mockEpisodeDate}
          airingStatus="tba"
          timezone={mockTimezone}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should return null for aired status (to avoid duplication with main badge)', () => {
      const { container } = render(
        <AiringCountdown 
          episodeDate={mockEpisodeDate}
          airingStatus="aired"
          timezone={mockTimezone}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should return null for airing status (to avoid duplication with main badge)', () => {
      const { container } = render(
        <AiringCountdown 
          episodeDate={mockEpisodeDate}
          airingStatus="airing"
          timezone={mockTimezone}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Delayed status display', () => {
    it('should show "Delayed" badge for delayed episodes', () => {
      render(
        <AiringCountdown 
          episodeDate={mockEpisodeDate}
          airingStatus="delayed"
          timezone={mockTimezone}
        />
      );
      
      const badge = screen.getByText(/Delayed/);
      expect(badge).toBeInTheDocument();
      // Check it's wrapped in a Badge component with warning variant
      expect(badge.parentElement).toHaveClass('at-badge-warning');
    });

    it('should render as Badge component with correct structure', () => {
      render(
        <AiringCountdown 
          episodeDate={mockEpisodeDate}
          airingStatus="delayed"
          timezone={mockTimezone}
        />
      );
      
      const badge = screen.getByText(/Delayed/);
      
      // Verify Badge component structure
      expect(badge.parentElement).toHaveClass('at-badge-base');
      expect(badge.parentElement).toHaveClass('at-badge-xs');
      expect(badge.parentElement).toHaveClass('at-badge-rounded');
      expect(badge.parentElement).toHaveClass('at-badge-warning');
      
      // Verify inner content structure
      expect(badge).toHaveClass('at-badge-content');
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully and not crash', () => {
      // This tests that component doesn't crash with invalid inputs
      const { container } = render(
        <AiringCountdown 
          episodeDate="invalid-date"
          airingStatus="delayed"
          timezone="Invalid/Timezone"
        />
      );
      
      // Should either render content or return null, but not crash
      expect(container).toBeInTheDocument();
    });
  });

  describe('Component integration', () => {
    it('should render Badge component for delayed episodes', () => {
      render(
        <AiringCountdown 
          episodeDate={mockEpisodeDate}
          airingStatus="delayed"
          timezone={mockTimezone}
        />
      );
      
      // Should find a Badge component (identified by at-badge-base class)
      const badgeContainer = document.querySelector('.at-badge-base');
      expect(badgeContainer).toBeInTheDocument();
      expect(badgeContainer).toHaveClass('at-badge-warning');
    });

    it('should not render anything for status types that are handled by main component', () => {
      const statusesToSkip = ['aired', 'airing', 'skipped', 'tba'];
      
      statusesToSkip.forEach(status => {
        const { container, unmount } = render(
          <AiringCountdown 
            episodeDate={mockEpisodeDate}
            airingStatus={status as any}
            timezone={mockTimezone}
          />
        );
        
        expect(container.firstChild).toBeNull();
        unmount();
      });
    });
  });

  describe('Badge variants', () => {
    it('should use warning variant for delayed status', () => {
      render(
        <AiringCountdown 
          episodeDate={mockEpisodeDate}
          airingStatus="delayed"
          timezone={mockTimezone}
        />
      );
      
      const badgeContainer = document.querySelector('.at-badge-warning');
      expect(badgeContainer).toBeInTheDocument();
      expect(badgeContainer).toHaveTextContent(/Delayed/);
    });
  });
});