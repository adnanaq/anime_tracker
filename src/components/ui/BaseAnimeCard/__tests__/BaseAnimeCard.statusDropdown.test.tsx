import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseAnimeCard } from '../BaseAnimeCard';
import { AnimeBase } from '../../../../types/anime';

// Mock the StatusBadgeDropdown component
vi.mock('../../StatusBadgeDropdown', () => ({
  StatusBadgeDropdown: ({ currentStatus, source, onStatusChange, isAuthenticated, className }: any) => (
    <div 
      data-testid="status-badge-dropdown"
      data-current-status={currentStatus || ''}
      data-source={source}
      data-authenticated={isAuthenticated}
      className={className}
    >
      <button onClick={() => onStatusChange('completed')}>
        Status: {currentStatus || 'No Status'}
      </button>
    </div>
  )
}));

// Mock other dependencies
vi.mock('../../../hooks/useDimensions', () => ({
  useDimensions: () => ({
    cardStyles: { width: '13rem', height: '21rem' }
  })
}));

vi.mock('../../../hooks/useAutoCycling', () => ({
  useAutoCycling: () => ({
    handleInteraction: vi.fn()
  })
}));

vi.mock('../../Card', () => ({
  Card: ({ children, onClick, className, style }: any) => (
    <div 
      data-testid="card"
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </div>
  )
}));

describe('BaseAnimeCard - StatusDropdown Integration', () => {
  const mockAnime: AnimeBase = {
    id: 123,
    title: 'Test Anime',
    source: 'mal',
    userStatus: 'watching',
    score: 8.5,
    coverImage: 'https://example.com/image.jpg',
    year: 2023,
    episodes: 12
  };

  const mockOnStatusChange = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('statusDropdown prop handling', () => {
    it('should not render StatusBadgeDropdown when statusDropdown is not provided', () => {
      render(<BaseAnimeCard anime={mockAnime} />);

      expect(screen.queryByTestId('status-badge-dropdown')).not.toBeInTheDocument();
    });

    it('should not render StatusBadgeDropdown when statusDropdown.enabled is false', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: false,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      expect(screen.queryByTestId('status-badge-dropdown')).not.toBeInTheDocument();
    });

    it('should render StatusBadgeDropdown when statusDropdown.enabled is true', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      expect(screen.getByTestId('status-badge-dropdown')).toBeInTheDocument();
    });
  });

  describe('StatusBadgeDropdown props', () => {
    it('should pass correct props to StatusBadgeDropdown', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange,
            isAuthenticated: true
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      expect(dropdown).toHaveAttribute('data-current-status', 'watching');
      expect(dropdown).toHaveAttribute('data-source', 'mal');
      expect(dropdown).toHaveAttribute('data-authenticated', 'true');
    });

    it('should pass isAuthenticated from statusDropdown prop', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange,
            isAuthenticated: false
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      expect(dropdown).toHaveAttribute('data-authenticated', 'false');
    });

    it('should default isAuthenticated to true when not provided', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      expect(dropdown).toHaveAttribute('data-authenticated', 'true');
    });
  });

  describe('positioning', () => {
    it('should apply default overlay positioning classes', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      const wrapper = dropdown.parentElement;
      expect(wrapper).toHaveClass('absolute', 'top-3', 'right-3', 'card-status-badge');
      expect(dropdown).toHaveClass('backdrop-blur-sm');
    });

    it('should always position status badge in top-right (mirroring score badge)', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange,
            position: 'bottom' // This should be ignored - always top-right
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      const wrapper = dropdown.parentElement;
      expect(wrapper).toHaveClass('absolute', 'top-3', 'right-3', 'card-status-badge');
      expect(dropdown).toHaveClass('backdrop-blur-sm');
    });

    it('should position consistently regardless of position prop', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange,
            position: 'overlay'
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      const wrapper = dropdown.parentElement;
      expect(wrapper).toHaveClass('absolute', 'top-3', 'right-3', 'card-status-badge');
      expect(dropdown).toHaveClass('backdrop-blur-sm');
    });
  });

  describe('status change handling', () => {
    it('should call onStatusChange when status is changed', async () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      const statusButton = screen.getByRole('button', { name: /Status:/ });
      await user.click(statusButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith('completed');
    });

    it('should handle async onStatusChange', async () => {
      const asyncStatusChange = vi.fn().mockResolvedValue(undefined);

      render(
        <BaseAnimeCard 
          anime={mockAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: asyncStatusChange
          }}
        />
      );

      const statusButton = screen.getByRole('button', { name: /Status:/ });
      await user.click(statusButton);

      expect(asyncStatusChange).toHaveBeenCalledWith('completed');
    });
  });

  describe('integration with different anime sources', () => {
    it('should work with AniList anime', () => {
      const anilistAnime: AnimeBase = {
        ...mockAnime,
        source: 'anilist',
        userStatus: 'CURRENT'
      };

      render(
        <BaseAnimeCard 
          anime={anilistAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      expect(dropdown).toHaveAttribute('data-current-status', 'CURRENT');
      expect(dropdown).toHaveAttribute('data-source', 'anilist');
    });

    it('should work with Jikan anime', () => {
      const jikanAnime: AnimeBase = {
        ...mockAnime,
        source: 'jikan',
        userStatus: 'completed'
      };

      render(
        <BaseAnimeCard 
          anime={jikanAnime}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      expect(dropdown).toHaveAttribute('data-current-status', 'completed');
      expect(dropdown).toHaveAttribute('data-source', 'jikan');
    });
  });

  describe('null/undefined status handling', () => {
    it('should handle anime without userStatus', () => {
      const animeWithoutStatus: AnimeBase = {
        ...mockAnime,
        userStatus: undefined
      };

      render(
        <BaseAnimeCard 
          anime={animeWithoutStatus}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      const dropdown = screen.getByTestId('status-badge-dropdown');
      expect(dropdown).toHaveAttribute('data-current-status', '');
    });
  });

  describe('combined with existing props', () => {
    it('should work with expanded state', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          expanded={true}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      // With expanded state and statusDropdown enabled, there should be 2 dropdowns:
      // 1. In the card header (top-right)
      // 2. In the built-in AnimeInfoCard
      const dropdowns = screen.getAllByTestId('status-badge-dropdown');
      expect(dropdowns).toHaveLength(2);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should work with custom className', () => {
      render(
        <BaseAnimeCard 
          anime={mockAnime}
          className="custom-class"
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      expect(screen.getByTestId('status-badge-dropdown')).toBeInTheDocument();
    });

    it('should work with onClick handler', () => {
      const mockOnClick = vi.fn();

      render(
        <BaseAnimeCard 
          anime={mockAnime}
          onClick={mockOnClick}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockOnStatusChange
          }}
        />
      );

      const card = screen.getByTestId('card');
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalled();
      expect(screen.getByTestId('status-badge-dropdown')).toBeInTheDocument();
    });
  });
});