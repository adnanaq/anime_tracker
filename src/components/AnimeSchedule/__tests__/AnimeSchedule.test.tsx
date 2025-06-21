import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Badge } from '../../ui';
import { AnimeSchedule } from '../AnimeSchedule';
import { AiringCountdown } from '../AiringCountdown';
import type { AnimeBase } from '../../../types/anime';

// Mock dependencies for basic rendering tests
vi.mock('../../../utils/dateUtils', () => ({
  getCurrentWeek: () => ({
    week: 25,
    year: 2025
  }),
  getWeeksInYear: () => 52,
  getCurrentDay: () => 'friday',
  getTimezoneOffset: () => '+00:00',
  getUserTimezone: () => 'UTC',
  DAYS_OF_WEEK: [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]
}));

vi.mock('../../../services/animeSchedule', () => ({
  animeScheduleService: {
    getTimetables: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../../../store/animeStore', () => ({
  useAnimeStore: () => ({
    updateAnimeStatus: vi.fn(),
    applyUserData: (data: AnimeBase[]) => data,
  })
}));

vi.mock('../../../services/jikan', () => ({
  jikanService: {
    findAnimeByTitle: vi.fn()
  }
}));

// ==========================================
// SECTION 1: COMPONENT RENDERING & UI TESTS
// ==========================================

describe('AnimeSchedule Component', () => {
  describe('Component Rendering', () => {

    const renderAnimeSchedule = () => {
      return render(
        <BrowserRouter>
          <AnimeSchedule />
        </BrowserRouter>
      );
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render weekly anime schedule header', () => {
      renderAnimeSchedule();
      
      expect(screen.getByText('📅 Weekly Anime Schedule')).toBeInTheDocument();
    });

    it('should render week navigation controls', () => {
      renderAnimeSchedule();
      
      // Should have previous/next week buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.some(button => button.textContent?.includes('←'))).toBe(true);
      expect(buttons.some(button => button.textContent?.includes('→'))).toBe(true);
      
      // Should show current week
      expect(screen.getByText(/Week 25, 2025/)).toBeInTheDocument();
    });

    it('should render day selector buttons', () => {
      renderAnimeSchedule();
      
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      days.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('should render timezone selector', () => {
      renderAnimeSchedule();
      
      const timezoneSelector = screen.getByRole('combobox');
      expect(timezoneSelector).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderAnimeSchedule();
      
      const searchInput = screen.getByPlaceholderText('Search anime...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should show "No Anime Scheduled" when no data', async () => {
      renderAnimeSchedule();
      
      // Wait for loading to complete and empty state to appear
      await waitFor(() => {
        expect(screen.getByText('No Anime Scheduled')).toBeInTheDocument();
      });
      expect(screen.getByText(/No anime episodes are scheduled to air on Friday/)).toBeInTheDocument();
    });
  });

  // ==========================================
  // SECTION 2: STATUS BADGE RENDERING TESTS
  // ==========================================

  describe('Status Badge Rendering', () => {
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

    describe('Individual Status Badges', () => {
      it('should render green "Aired" badge with correct classes', () => {
        renderStatusBadge('aired');
        
        const badge = screen.getByText('Aired');
        expect(badge).toBeInTheDocument();
        expect(badge.parentElement).toHaveClass('at-badge-success');
        expect(badge.parentElement).toHaveClass('at-badge-xs');
        expect(badge.parentElement).toHaveClass('at-badge-rounded');
        expect(badge.parentElement).not.toHaveClass('at-badge-animated');
      });

      it('should render red "Live" badge with animation and icon', () => {
        renderStatusBadge('airing');
        
        const badge = screen.getByText('Live');
        expect(badge).toBeInTheDocument();
        expect(badge.parentElement).toHaveClass('at-badge-danger');
        expect(badge.parentElement).toHaveClass('at-badge-animated');
        
        // Should have live icon
        const iconContainer = badge.parentElement?.querySelector('.at-badge-icon');
        expect(iconContainer).toBeInTheDocument();
        const icon = iconContainer?.querySelector('.w-2.h-2.bg-current.rounded-full');
        expect(icon).toBeInTheDocument();
      });

      it('should render yellow "Delayed" badge without animation', () => {
        renderStatusBadge('delayed');
        
        const badge = screen.getByText('Delayed');
        expect(badge).toBeInTheDocument();
        expect(badge.parentElement).toHaveClass('at-badge-warning');
        expect(badge.parentElement).not.toHaveClass('at-badge-animated');
      });

      it('should render neutral "Skipped" badge', () => {
        renderStatusBadge('skipped');
        
        const badge = screen.getByText('Skipped');
        expect(badge).toBeInTheDocument();
        expect(badge.parentElement).toHaveClass('at-badge-neutral');
      });

      it('should render primary "TBA" badge', () => {
        renderStatusBadge('tba');
        
        const badge = screen.getByText('TBA');
        expect(badge).toBeInTheDocument();
        expect(badge.parentElement).toHaveClass('at-badge-primary');
      });
    });

    describe('Episode Number Badge', () => {
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

    describe('Badge Variants and Classes', () => {
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

    describe('Badge Component Structure', () => {
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

  // ==========================================
  // SECTION 3: AIRING COUNTDOWN COMPONENT TESTS
  // ==========================================

  describe('AiringCountdown Component', () => {
    const mockEpisodeDate = '2024-01-15T15:30:00Z';
    const mockTimezone = 'UTC';

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
                total: vi.fn(() => 0),
              })),
            })),
          })),
        },
        ZonedDateTime: {
          compare: vi.fn(() => -1), // Default: future episode
        },
      },
    }));

    describe('Status-based rendering', () => {
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

      it('should return null for aired status (to avoid duplication)', () => {
        const { container } = render(
          <AiringCountdown 
            episodeDate={mockEpisodeDate}
            airingStatus="aired"
            timezone={mockTimezone}
          />
        );
        
        expect(container.firstChild).toBeNull();
      });

      it('should return null for airing status (to avoid duplication)', () => {
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
  });

  // ==========================================
  // SECTION 4: ACCESSIBILITY TESTS
  // ==========================================

  describe('Accessibility', () => {
    const renderAnimeSchedule = () => {
      return render(
        <BrowserRouter>
          <AnimeSchedule />
        </BrowserRouter>
      );
    };

    it('should have proper heading structure', () => {
      renderAnimeSchedule();
      
      // Main heading should be h2
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('📅 Weekly Anime Schedule');
    });

    it('should have accessible navigation buttons', () => {
      renderAnimeSchedule();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should be accessible
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should have accessible form controls', () => {
      renderAnimeSchedule();
      
      // Search input should be accessible
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('placeholder', 'Search anime...');
      
      // Timezone selector should be accessible
      const timezoneSelector = screen.getByRole('combobox');
      expect(timezoneSelector).toBeInTheDocument();
    });

    it('should have proper badge roles and attributes', () => {
      render(
        <Badge variant="success" size="xs" shape="rounded">
          Aired
        </Badge>
      );
      
      const badge = screen.getByText('Aired');
      expect(badge).toBeInTheDocument();
      // Badge should be accessible to screen readers
      expect(badge.parentElement).toHaveClass('at-badge-base');
    });
  });
});