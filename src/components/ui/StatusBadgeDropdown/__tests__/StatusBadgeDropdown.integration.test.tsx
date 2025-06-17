import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatusBadgeDropdown } from '../StatusBadgeDropdown';
import { AnimeSource } from '../../../../types/anime';

// Mock the Badge component
vi.mock('../../Badge', () => ({
  Badge: ({ children, variant, size, shape, interactive, className, ...props }: any) => (
    <span 
      data-testid="badge"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-interactive={interactive}
      className={className}
      {...props}
    >
      {children}
    </span>
  )
}));

// Mock the anime status utilities
vi.mock('../../../../utils/animeStatus', () => ({
  getStatusOptions: vi.fn(),
  getStatusLabel: vi.fn(),
  getStatusColor: vi.fn(),
}));

import { getStatusOptions, getStatusLabel, getStatusColor } from '../../../../utils/animeStatus';

const mockGetStatusOptions = vi.mocked(getStatusOptions);
const mockGetStatusLabel = vi.mocked(getStatusLabel);
const mockGetStatusColor = vi.mocked(getStatusColor);

describe('StatusBadgeDropdown - Source Integration', () => {
  const mockOnStatusChange = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnStatusChange.mockClear();
  });

  describe('Event Propagation', () => {
    it('should prevent click events from bubbling up to parent elements', async () => {
      const mockParentClick = vi.fn();
      mockGetStatusOptions.mockReturnValue([
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' }
      ]);
      mockGetStatusLabel.mockImplementation((status) => {
        const labels: { [key: string]: string } = {
          'watching': 'Watching',
          'completed': 'Completed'
        };
        return labels[status as string] || 'Unknown';
      });

      // Wrap StatusBadgeDropdown in a clickable parent container
      const { getByRole, getByText } = render(
        <div onClick={mockParentClick} data-testid="parent-container">
          <StatusBadgeDropdown
            currentStatus="watching"
            source="mal"
            onStatusChange={mockOnStatusChange}
            isAuthenticated={true}
          />
        </div>
      );

      const triggerButton = getByRole('button', { name: /current status: watching/i });
      
      // Click the status badge trigger
      await user.click(triggerButton);
      
      // Parent click handler should NOT have been called
      expect(mockParentClick).not.toHaveBeenCalled();
      
      // Dropdown should be open
      expect(getByText('Completed')).toBeInTheDocument();
    });

    it('should prevent dropdown option clicks from bubbling up', async () => {
      const mockParentClick = vi.fn();
      mockGetStatusOptions.mockReturnValue([
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' }
      ]);
      mockGetStatusLabel.mockImplementation((status) => {
        const labels: { [key: string]: string } = {
          'watching': 'Watching',
          'completed': 'Completed'
        };
        return labels[status as string] || 'Unknown';
      });
      mockOnStatusChange.mockResolvedValue(undefined);

      const { getByRole, getByText } = render(
        <div onClick={mockParentClick} data-testid="parent-container">
          <StatusBadgeDropdown
            currentStatus="watching"
            source="mal"
            onStatusChange={mockOnStatusChange}
            isAuthenticated={true}
          />
        </div>
      );

      // Open dropdown
      const triggerButton = getByRole('button', { name: /current status: watching/i });
      await user.click(triggerButton);
      
      // Click on a status option
      const completedOption = getByText('Completed');
      await user.click(completedOption);
      
      // Parent click handler should NOT have been called at any point
      expect(mockParentClick).not.toHaveBeenCalled();
      
      // Status change should have been called
      expect(mockOnStatusChange).toHaveBeenCalledWith('completed');
    });

    it('should work correctly when nested inside expandable card components', async () => {
      const mockCardToggle = vi.fn();
      mockGetStatusOptions.mockReturnValue([
        { value: 'plan_to_watch', label: 'Plan to Watch' },
        { value: 'watching', label: 'Watching' }
      ]);
      mockGetStatusLabel.mockImplementation((status) => {
        const labels: { [key: string]: string } = {
          'plan_to_watch': 'Plan to Watch',
          'watching': 'Watching'
        };
        return labels[status as string] || 'Unknown';
      });
      mockOnStatusChange.mockResolvedValue(undefined);

      const MockExpandableCard = ({ children }: { children: React.ReactNode }) => (
        <div 
          onClick={mockCardToggle} 
          className="expandable-card"
          data-testid="expandable-card"
        >
          <h3>Card Title</h3>
          {children}
        </div>
      );

      const { getByRole, getByText, getByTestId } = render(
        <MockExpandableCard>
          <StatusBadgeDropdown
            currentStatus="plan_to_watch"
            source="mal"
            onStatusChange={mockOnStatusChange}
            isAuthenticated={true}
          />
        </MockExpandableCard>
      );

      // Verify card is clickable
      const card = getByTestId('expandable-card');
      await user.click(card);
      expect(mockCardToggle).toHaveBeenCalledTimes(1);
      
      // Reset mock
      mockCardToggle.mockClear();

      // Click status badge - should not trigger card toggle
      const triggerButton = getByRole('button', { name: /current status: plan to watch/i });
      await user.click(triggerButton);
      
      expect(mockCardToggle).not.toHaveBeenCalled();
      expect(getByText('Watching')).toBeInTheDocument();
      
      // Click status option - should not trigger card toggle
      const watchingOption = getByText('Watching');
      await user.click(watchingOption);
      
      expect(mockCardToggle).not.toHaveBeenCalled();
      expect(mockOnStatusChange).toHaveBeenCalledWith('watching');
    });
  });

  describe('Dropdown Positioning', () => {
    it('should maintain consistent dropdown positioning classes', async () => {
      mockGetStatusOptions.mockReturnValue([
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' }
      ]);
      mockGetStatusLabel.mockImplementation((status) => {
        const labels: { [key: string]: string } = {
          'watching': 'Watching',
          'completed': 'Completed'
        };
        return labels[status as string] || 'Unknown';
      });

      const { getByRole, container } = render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isAuthenticated={true}
        />
      );

      // Open dropdown
      const triggerButton = getByRole('button', { name: /current status: watching/i });
      await user.click(triggerButton);
      
      // Check dropdown positioning classes
      const dropdown = container.querySelector('[role="listbox"]');
      expect(dropdown).toHaveClass('absolute', 'z-50', 'top-full', 'mt-1', 'min-w-[140px]', '-left-2');
    });
  });

  describe('MAL source integration', () => {
    beforeEach(() => {
      mockGetStatusOptions.mockReturnValue([
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'dropped', label: 'Dropped' },
        { value: 'plan_to_watch', label: 'Plan to Watch' }
      ]);

      mockGetStatusLabel.mockImplementation((status) => {
        switch (status) {
          case 'watching': return 'Watching';
          case 'completed': return 'Completed';
          case 'on_hold': return 'On Hold';
          case 'dropped': return 'Dropped';
          case 'plan_to_watch': return 'Plan to Watch';
          default: return 'Unknown Status';
        }
      });
      mockGetStatusColor.mockReturnValue('bg-blue-500 hover:bg-blue-600');
    });

    it('should use MAL status options from utility', () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(mockGetStatusOptions).toHaveBeenCalledWith('mal');
      expect(mockGetStatusLabel).toHaveBeenCalledWith('watching');
    });

    it('should display MAL status label from utility', () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByRole('button')).toHaveTextContent('Watching');
    });

    it('should show MAL status options when opened', async () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button'));

      // Should show all options except current status
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('On Hold')).toBeInTheDocument();
      expect(screen.getByText('Dropped')).toBeInTheDocument();
      expect(screen.getByText('Plan to Watch')).toBeInTheDocument();
      
      // Should not show current status in dropdown
      expect(screen.getAllByText('Watching')).toHaveLength(1); // Only the trigger button
    });

    it('should call onStatusChange with MAL status value', async () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Completed'));

      expect(mockOnStatusChange).toHaveBeenCalledWith('completed');
    });
  });

  describe('AniList source integration', () => {
    beforeEach(() => {
      mockGetStatusOptions.mockReturnValue([
        { value: 'CURRENT', label: 'Watching' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'PAUSED', label: 'On Hold' },
        { value: 'DROPPED', label: 'Dropped' },
        { value: 'PLANNING', label: 'Plan to Watch' },
        { value: 'REPEATING', label: 'Rewatching' }
      ]);

      mockGetStatusLabel.mockImplementation((status) => {
        switch (status) {
          case 'CURRENT': return 'Watching';
          case 'COMPLETED': return 'Completed';
          case 'PAUSED': return 'On Hold';
          case 'DROPPED': return 'Dropped';
          case 'PLANNING': return 'Plan to Watch';
          case 'REPEATING': return 'Rewatching';
          default: return 'Unknown Status';
        }
      });
      mockGetStatusColor.mockReturnValue('bg-blue-500 hover:bg-blue-600');
    });

    it('should use AniList status options from utility', () => {
      render(
        <StatusBadgeDropdown
          currentStatus="CURRENT"
          source="anilist"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(mockGetStatusOptions).toHaveBeenCalledWith('anilist');
      expect(mockGetStatusLabel).toHaveBeenCalledWith('CURRENT');
    });

    it('should show AniList status options including REPEATING', async () => {
      render(
        <StatusBadgeDropdown
          currentStatus="CURRENT"
          source="anilist"
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button'));

      // Should show all options except current status
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('On Hold')).toBeInTheDocument();
      expect(screen.getByText('Dropped')).toBeInTheDocument();
      expect(screen.getByText('Plan to Watch')).toBeInTheDocument();
      expect(screen.getByText('Rewatching')).toBeInTheDocument(); // AniList specific
    });

    it('should call onStatusChange with AniList status value', async () => {
      render(
        <StatusBadgeDropdown
          currentStatus="CURRENT"
          source="anilist"
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Completed'));

      expect(mockOnStatusChange).toHaveBeenCalledWith('COMPLETED');
    });
  });

  describe('Jikan source integration', () => {
    beforeEach(() => {
      mockGetStatusOptions.mockReturnValue([
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'dropped', label: 'Dropped' },
        { value: 'plan_to_watch', label: 'Plan to Watch' }
      ]);

      mockGetStatusLabel.mockImplementation((status) => {
        switch (status) {
          case 'watching': return 'Watching';
          case 'completed': return 'Completed';
          case 'on_hold': return 'On Hold';
          case 'dropped': return 'Dropped';
          case 'plan_to_watch': return 'Plan to Watch';
          default: return 'Unknown Status';
        }
      });
      mockGetStatusColor.mockReturnValue('bg-blue-500 hover:bg-blue-600');
    });

    it('should use MAL-compatible status options for Jikan source', () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="jikan"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(mockGetStatusOptions).toHaveBeenCalledWith('jikan');
    });
  });

  describe('Null status handling', () => {
    beforeEach(() => {
      mockGetStatusOptions.mockReturnValue([
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' },
        { value: 'plan_to_watch', label: 'Plan to Watch' }
      ]);

      mockGetStatusLabel.mockImplementation((status) => {
        if (!status) return 'Add to List';
        switch (status) {
          case 'watching': return 'Watching';
          case 'completed': return 'Completed';
          case 'plan_to_watch': return 'Plan to Watch';
          default: return 'Unknown Status';
        }
      });
    });

    it('should handle null status correctly', () => {
      render(
        <StatusBadgeDropdown
          currentStatus={null}
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(mockGetStatusLabel).toHaveBeenCalledWith(null);
      expect(screen.getByRole('button')).toHaveTextContent('Add to List');
    });

    it('should show all status options when current status is null', async () => {
      render(
        <StatusBadgeDropdown
          currentStatus={null}
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button'));

      // Should show all options since no current status
      expect(screen.getByText('Watching')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Plan to Watch')).toBeInTheDocument();
    });
  });

  describe('Custom available statuses', () => {
    beforeEach(() => {
      mockGetStatusLabel.mockImplementation((status) => {
        switch (status) {
          case 'watching': return 'Watching';
          case 'completed': return 'Completed';
          default: return 'Unknown Status';
        }
      });
    });

    it('should use custom availableStatuses instead of source defaults', async () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          availableStatuses={['watching', 'completed']}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button'));

      // Should only show custom statuses, not full MAL set
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.queryByText('On Hold')).not.toBeInTheDocument();
      expect(screen.queryByText('Dropped')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      mockGetStatusOptions.mockReturnValue([
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' }
      ]);

      mockGetStatusLabel.mockImplementation((status) => {
        switch (status) {
          case 'watching': return 'Watching';
          case 'completed': return 'Completed';
          default: return 'Unknown Status';
        }
      });
    });

    it('should handle onStatusChange errors gracefully', async () => {
      mockOnStatusChange.mockRejectedValue(new Error('Update failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Completed'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to update status:', expect.any(Error));
      });

      // Dropdown should remain open for retry
      expect(screen.getByText('Completed')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Authentication handling', () => {
    beforeEach(() => {
      mockGetStatusLabel.mockImplementation((status) => {
        switch (status) {
          case 'watching': return 'Watching';
          default: return 'Unknown Status';
        }
      });
    });

    it('should render static badge when not authenticated', () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isAuthenticated={false}
        />
      );

      expect(mockGetStatusLabel).toHaveBeenCalledWith('watching');
      
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('Watching');
      
      // Should not be clickable
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render interactive dropdown when authenticated', () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isAuthenticated={true}
        />
      );

      // Should be clickable
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Loading and disabled states', () => {
    beforeEach(() => {
      mockGetStatusOptions.mockReturnValue([
        { value: 'watching', label: 'Watching' },
        { value: 'completed', label: 'Completed' }
      ]);

      mockGetStatusLabel.mockImplementation((status) => {
        switch (status) {
          case 'watching': return 'Watching';
          case 'completed': return 'Completed';
          default: return 'Unknown Status';
        }
      });
    });

    it('should disable button when loading', () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isLoading={true}
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should disable button when disabled prop is true', () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
          disabled={true}
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});