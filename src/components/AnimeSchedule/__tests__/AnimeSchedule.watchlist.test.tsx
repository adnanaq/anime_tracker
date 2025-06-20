import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Button } from '../../ui';

// Mock the watchlist integration logic from AnimeSchedule component
interface MockAnime {
  id: string;
  title: string;
  hasValidId: boolean;
  malId?: number;
  userStatus?: string;
  episodeNumber: number;
  episodeDate: string;
}

// Mock store
const mockUpdateAnimeStatus = vi.fn();
vi.mock('../../../store/animeStore', () => ({
  useAnimeStore: () => ({
    updateAnimeStatus: mockUpdateAnimeStatus,
    currentSource: 'mal',
  }),
}));

// Component to test watchlist button logic
const WatchlistButton = ({ anime }: { anime: MockAnime }) => {
  const handleWatchlistToggle = (anime: MockAnime, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!anime.hasValidId || !anime.malId) {
      console.warn("Cannot add to watchlist: anime has no valid MAL ID");
      return;
    }

    const currentStatus = anime.userStatus;
    const isInWatchlist = currentStatus && currentStatus !== "";
    
    if (isInWatchlist) {
      // Remove from watchlist
      mockUpdateAnimeStatus(anime.malId, "mal", "");
    } else {
      // Add to Plan to Watch
      mockUpdateAnimeStatus(anime.malId, "mal", "plan_to_watch");
    }
  };

  // Only render button if anime has valid ID
  if (!anime.hasValidId || !anime.malId) {
    return null;
  }

  return (
    <Button
      onClick={(e) => handleWatchlistToggle(anime, e)}
      variant={anime.userStatus ? "warning" : "ghost"}
      size="sm"
      className="h-8 w-8 p-0 rounded-full"
      title={
        anime.userStatus 
          ? `Remove from list (${anime.userStatus})` 
          : "Add to Plan to Watch"
      }
    >
      {anime.userStatus ? "✓" : "+"}
    </Button>
  );
};

describe('AnimeSchedule - Watchlist Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAnimeWithId = (userStatus = ""): MockAnime => ({
    id: 'test-anime-1',
    title: 'Test Anime',
    hasValidId: true,
    malId: 12345,
    userStatus,
    episodeNumber: 1,
    episodeDate: '2024-01-15T15:30:00Z',
  });

  const mockAnimeWithoutId = (): MockAnime => ({
    id: 'test-anime-2',
    title: 'Test Anime No ID',
    hasValidId: false,
    episodeNumber: 1,
    episodeDate: '2024-01-15T15:30:00Z',
  });

  describe('Watchlist button rendering', () => {
    it('should render watchlist button for anime with valid MAL ID', () => {
      const anime = mockAnimeWithId();
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('+');
      expect(button).toHaveClass('at-button-ghost');
    });

    it('should not render watchlist button for anime without valid MAL ID', () => {
      const anime = mockAnimeWithoutId();
      const { container } = render(<WatchlistButton anime={anime} />);
      
      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should show checkmark for anime already in watchlist', () => {
      const anime = mockAnimeWithId('watching');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('✓');
      expect(button).toHaveClass('at-button-warning');
    });

    it('should show plus sign for anime not in watchlist', () => {
      const anime = mockAnimeWithId('');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('+');
      expect(button).toHaveClass('at-button-ghost');
    });
  });

  describe('Watchlist button variants', () => {
    it('should use warning variant for anime in watchlist', () => {
      const statuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];
      
      statuses.forEach(status => {
        const { unmount } = render(<WatchlistButton anime={mockAnimeWithId(status)} />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('at-button-warning');
        expect(button).toHaveTextContent('✓');
        
        unmount();
      });
    });

    it('should use ghost variant for anime not in watchlist', () => {
      const anime = mockAnimeWithId('');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('at-button-ghost');
      expect(button).toHaveTextContent('+');
    });
  });

  describe('Watchlist button tooltips', () => {
    it('should show "Add to Plan to Watch" tooltip for anime not in watchlist', () => {
      const anime = mockAnimeWithId('');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Add to Plan to Watch');
    });

    it('should show removal tooltip with status for anime in watchlist', () => {
      const anime = mockAnimeWithId('watching');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Remove from list (watching)');
    });

    it('should show correct tooltip for different statuses', () => {
      const statuses = [
        { status: 'completed', expected: 'Remove from list (completed)' },
        { status: 'plan_to_watch', expected: 'Remove from list (plan_to_watch)' },
        { status: 'on_hold', expected: 'Remove from list (on_hold)' },
        { status: 'dropped', expected: 'Remove from list (dropped)' },
      ];

      statuses.forEach(({ status, expected }) => {
        const { unmount } = render(<WatchlistButton anime={mockAnimeWithId(status)} />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('title', expected);
        
        unmount();
      });
    });
  });

  describe('Watchlist functionality', () => {
    it('should add anime to plan_to_watch when not in watchlist', () => {
      const anime = mockAnimeWithId('');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(12345, 'mal', 'plan_to_watch');
      expect(mockUpdateAnimeStatus).toHaveBeenCalledTimes(1);
    });

    it('should remove anime from watchlist when already in watchlist', () => {
      const anime = mockAnimeWithId('watching');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(12345, 'mal', '');
      expect(mockUpdateAnimeStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle different existing statuses correctly when removing', () => {
      const statuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];
      
      statuses.forEach(status => {
        mockUpdateAnimeStatus.mockClear();
        
        const { unmount } = render(<WatchlistButton anime={mockAnimeWithId(status)} />);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);
        
        expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(12345, 'mal', '');
        expect(mockUpdateAnimeStatus).toHaveBeenCalledTimes(1);
        
        unmount();
      });
    });

    it('should not call updateAnimeStatus for anime without valid ID', () => {
      const anime = mockAnimeWithoutId();
      const { container } = render(<WatchlistButton anime={anime} />);
      
      // Button should not exist
      expect(container.firstChild).toBeNull();
      expect(mockUpdateAnimeStatus).not.toHaveBeenCalled();
    });
  });

  describe('Event handling', () => {
    it('should stop propagation when clicking watchlist button', () => {
      const anime = mockAnimeWithId('');
      const mockOnClick = vi.fn();
      
      render(
        <div onClick={mockOnClick}>
          <WatchlistButton anime={anime} />
        </div>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Parent click should not be called due to stopPropagation
      expect(mockOnClick).not.toHaveBeenCalled();
      expect(mockUpdateAnimeStatus).toHaveBeenCalled();
    });
  });

  describe('Button styling and structure', () => {
    it('should have correct size and styling classes', () => {
      const anime = mockAnimeWithId('');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'w-8', 'p-0', 'rounded-full');
      expect(button).toHaveClass('at-button-sm');
    });

    it('should be a circular button', () => {
      const anime = mockAnimeWithId('');
      render(<WatchlistButton anime={anime} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });
  });

  describe('Status determination logic', () => {
    it('should correctly identify anime as in watchlist for non-empty status', () => {
      const statuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];
      
      statuses.forEach(status => {
        const { unmount } = render(<WatchlistButton anime={mockAnimeWithId(status)} />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('✓');
        expect(button).toHaveClass('at-button-warning');
        
        unmount();
      });
    });

    it('should correctly identify anime as not in watchlist for empty status', () => {
      const emptyStatuses = ['', undefined];
      
      emptyStatuses.forEach(status => {
        const { unmount } = render(<WatchlistButton anime={mockAnimeWithId(status)} />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('+');
        expect(button).toHaveClass('at-button-ghost');
        
        unmount();
      });
    });
  });
});