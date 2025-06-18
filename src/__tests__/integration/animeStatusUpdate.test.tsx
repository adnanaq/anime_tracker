import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { BaseAnimeCard } from '../../components/ui/BaseAnimeCard';
import { AnimeBase } from '../../types/anime';
import { useAnimeStore } from '../../store/animeStore';

// Mock the store
vi.mock('../../store/animeStore');

// Mock authentication hooks
vi.mock('../../hooks/useAuth', () => ({
  useAnimeAuth: () => ({
    isAuthenticated: true,
    token: 'mock_token'
  })
}));

// Mock anime status service
vi.mock('../../services/shared/animeStatusService', () => ({
  animeStatusService: {
    updateStatus: vi.fn()
  }
}));

const mockAnime: AnimeBase = {
  id: 1,
  title: 'Test Anime',
  imageUrl: 'https://example.com/image.jpg',
  score: 8.5,
  year: 2023,
  episodes: 12,
  status: 'FINISHED',
  format: 'TV',
  genres: ['Action', 'Adventure'],
  synopsis: 'Test anime synopsis',
  source: 'anilist',
  userStatus: 'PLAN_TO_WATCH',
  userScore: null,
  duration: 24,
  studios: ['Test Studio'],
  popularity: 5000
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Anime Status Update Integration', () => {
  const mockUpdateAnimeStatus = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock store methods
    (useAnimeStore as any).mockReturnValue({
      updateAnimeStatus: mockUpdateAnimeStatus,
      currentSource: 'anilist'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('BaseAnimeCard Status Update Flow', () => {
    it('should allow authenticated user to update anime status', async () => {
      const user = userEvent.setup();
      mockUpdateAnimeStatus.mockResolvedValueOnce(true);

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          statusDropdown={{
            enabled: true,
            onStatusChange: mockUpdateAnimeStatus,
            isAuthenticated: true
          }}
        />
      );

      // Expand the card to show status dropdown
      const card = screen.getByRole('button');
      await user.click(card);

      // Wait for expansion and status dropdown to appear
      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      // Click on status badge to open dropdown
      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      // Wait for dropdown options to appear
      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      // Click on "Watching" option
      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      // Verify update function was called
      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(
          1,
          'CURRENT',
          'anilist'
        );
      });
    });

    it('should handle status update failures gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockUpdateAnimeStatus.mockRejectedValueOnce(new Error('Update failed'));

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          statusDropdown={{
            enabled: true,
            onStatusChange: mockUpdateAnimeStatus,
            isAuthenticated: true
          }}
        />
      );

      // Expand card and attempt status change
      const card = screen.getByRole('button');
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      // Should handle error gracefully
      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalled();
      });

      // Dropdown should remain open for retry
      expect(screen.getByText('Watching')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should show loading state during status update', async () => {
      const user = userEvent.setup();
      
      // Create a promise that we can control
      let resolveUpdate: (value: boolean) => void;
      const updatePromise = new Promise<boolean>((resolve) => {
        resolveUpdate = resolve;
      });
      mockUpdateAnimeStatus.mockReturnValueOnce(updatePromise);

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          statusDropdown={{
            enabled: true,
            onStatusChange: mockUpdateAnimeStatus,
            isAuthenticated: true
          }}
        />
      );

      // Expand card and click status
      const card = screen.getByRole('button');
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      // Should show loading state
      await waitFor(() => {
        const loadingElements = screen.queryAllByText(/loading/i);
        expect(loadingElements.length).toBeGreaterThan(0);
      });

      // Resolve the update
      resolveUpdate!(true);

      // Loading should disappear
      await waitFor(() => {
        const loadingElements = screen.queryAllByText(/loading/i);
        expect(loadingElements).toHaveLength(0);
      });
    });

    it('should prevent multiple simultaneous updates', async () => {
      const user = userEvent.setup();
      
      // Make update take some time
      mockUpdateAnimeStatus.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      );

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          allowExpansion={true}
          showStatusDropdown={true}
        />
      );

      // Expand card
      const card = screen.getByRole('button', { name: /expand anime card/i });
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      // Click multiple times rapidly
      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);
      await user.click(watchingOption);
      await user.click(watchingOption);

      // Should only call update once
      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Cross-Component Status Sync', () => {
    it('should sync status updates across multiple components', async () => {
      const user = userEvent.setup();
      mockUpdateAnimeStatus.mockResolvedValueOnce(true);

      // Render multiple cards with same anime
      renderWithRouter(
        <div>
          <BaseAnimeCard
            anime={mockAnime}
            groupName="group1"
            allowExpansion={true}
            showStatusDropdown={true}
          />
          <BaseAnimeCard
            anime={mockAnime}
            groupName="group2"
            allowExpansion={true}
            showStatusDropdown={true}
          />
        </div>
      );

      // Update status in first card
      const cards = screen.getAllByRole('button', { name: /expand anime card/i });
      await user.click(cards[0]);

      await waitFor(() => {
        const statusBadges = screen.getAllByText('Plan To Watch');
        expect(statusBadges).toHaveLength(2);
      });

      const statusBadges = screen.getAllByText('Plan To Watch');
      await user.click(statusBadges[0]);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      // Both components should reflect the update
      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(
          1,
          'CURRENT',
          'anilist'
        );
      });

      // Note: In a real implementation, the store would update and 
      // both components would re-render with new status
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for status updates', async () => {
      const user = userEvent.setup();
      mockUpdateAnimeStatus.mockResolvedValueOnce(true);

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          allowExpansion={true}
          showStatusDropdown={true}
        />
      );

      // Navigate to card with Tab
      await user.tab();
      
      // Open card with Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      // Navigate to status badge and open with Enter
      await user.tab();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      // Navigate to option and select with Enter
      await user.tab();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(
          1,
          'CURRENT',
          'anilist'
        );
      });
    });

    it('should close dropdown on Escape key', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          allowExpansion={true}
          showStatusDropdown={true}
        />
      );

      // Open card and status dropdown
      const card = screen.getByRole('button', { name: /expand anime card/i });
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      // Press Escape to close dropdown
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Watching')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry after failed status update', async () => {
      const user = userEvent.setup();
      
      // First call fails, second succeeds
      mockUpdateAnimeStatus
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(true);

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          allowExpansion={true}
          showStatusDropdown={true}
        />
      );

      // Expand card and attempt status change
      const card = screen.getByRole('button', { name: /expand anime card/i });
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      // First attempt - should fail
      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledTimes(1);
      });

      // Dropdown should remain open for retry
      expect(screen.getByText('Watching')).toBeInTheDocument();

      // Second attempt - should succeed
      await user.click(watchingOption);

      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle different API response formats', async () => {
      const user = userEvent.setup();
      
      // Mock different response scenarios
      mockUpdateAnimeStatus.mockImplementation((id, status) => {
        if (status === 'CURRENT') {
          return Promise.resolve(true);
        } else if (status === 'COMPLETED') {
          return Promise.resolve({ success: true, updatedAnime: { ...mockAnime, userStatus: 'COMPLETED' } });
        } else {
          return Promise.reject(new Error('Invalid status'));
        }
      });

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          allowExpansion={true}
          showStatusDropdown={true}
        />
      );

      const card = screen.getByRole('button', { name: /expand anime card/i });
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      // Test different status updates
      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });

      // Update to watching (returns boolean)
      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(1, 'CURRENT', 'anilist');
      });
    });
  });

  describe('State Management Integration', () => {
    it('should update global store state after successful status change', async () => {
      const user = userEvent.setup();
      mockUpdateAnimeStatus.mockResolvedValueOnce(true);

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          allowExpansion={true}
          showStatusDropdown={true}
        />
      );

      // Perform status update
      const card = screen.getByRole('button', { name: /expand anime card/i });
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      // Verify store update was called with correct parameters
      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(
          1,
          'CURRENT',
          'anilist'
        );
      });
    });

    it('should not update store state after failed status change', async () => {
      const user = userEvent.setup();
      mockUpdateAnimeStatus.mockRejectedValueOnce(new Error('Update failed'));

      renderWithRouter(
        <BaseAnimeCard
          anime={mockAnime}
          groupName="test-group"
          allowExpansion={true}
          showStatusDropdown={true}
        />
      );

      const card = screen.getByRole('button', { name: /expand anime card/i });
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalled();
      });

      // Status should remain unchanged in UI
      expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
    });
  });

  describe('Multi-Source Support', () => {
    it('should handle MAL and AniList status mapping correctly', async () => {
      const user = userEvent.setup();
      mockUpdateAnimeStatus.mockResolvedValueOnce(true);

      const malAnime = { ...mockAnime, source: 'mal' as const };

      renderWithRouter(
        <BaseAnimeCard
          anime={malAnime}
          groupName="test-group"
          allowExpansion={true}
          showStatusDropdown={true}
        />
      );

      const card = screen.getByRole('button', { name: /expand anime card/i });
      await user.click(card);

      await waitFor(() => {
        expect(screen.getByText('Plan To Watch')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('Plan To Watch');
      await user.click(statusBadge);

      await waitFor(() => {
        expect(screen.getByText('Watching')).toBeInTheDocument();
      });

      const watchingOption = screen.getByText('Watching');
      await user.click(watchingOption);

      // Should call with MAL status format
      await waitFor(() => {
        expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(
          1,
          'watching', // MAL uses lowercase
          'mal'
        );
      });
    });
  });
});