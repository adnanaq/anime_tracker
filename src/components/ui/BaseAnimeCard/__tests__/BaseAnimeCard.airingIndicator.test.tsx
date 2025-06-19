import { render, screen } from '@testing-library/react';
import { BaseAnimeCard } from '../BaseAnimeCard';
import { AnimeBase } from '../../../../types/anime';

const createMockAnime = (overrides: Partial<AnimeBase> = {}): AnimeBase => ({
  id: 1,
  title: 'Test Anime',
  coverImage: 'https://example.com/test.jpg',
  score: 8.5,
  format: 'TV',
  year: 2023,
  episodes: 12,
  genres: ['Action', 'Drama'],
  source: 'mal',
  ...overrides,
});

describe('BaseAnimeCard - AiringIndicator Integration', () => {
  describe('airing indicator visibility', () => {
    it('should show airing indicator when anime status is RELEASING', () => {
      const anime = createMockAnime({ status: 'RELEASING' });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should show airing indicator when anime status is currently_airing', () => {
      const anime = createMockAnime({ status: 'currently_airing' });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should show airing indicator when airingStatus is airing', () => {
      const anime = createMockAnime({ 
        status: 'FINISHED', 
        airingStatus: 'airing' 
      });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should not show airing indicator when anime is finished', () => {
      const anime = createMockAnime({ status: 'FINISHED' });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.queryByTestId('airing-indicator');
      expect(indicator).not.toBeInTheDocument();
    });

    it('should not show airing indicator when no airing status is provided', () => {
      const anime = createMockAnime({ status: undefined, airingStatus: undefined });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.queryByTestId('airing-indicator');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('airing indicator positioning', () => {
    it('should position airing indicator at top-right when no status dropdown', () => {
      const anime = createMockAnime({ status: 'RELEASING' });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveClass('top-3', 'right-3');
    });

    it('should position airing indicator at bottom-right when status dropdown is enabled', () => {
      const anime = createMockAnime({ 
        status: 'RELEASING',
        userStatus: 'watching' 
      });
      const statusDropdown = {
        enabled: true,
        onStatusChange: () => {},
        isAuthenticated: true,
      };
      
      render(
        <BaseAnimeCard 
          anime={anime} 
          statusDropdown={statusDropdown}
        />
      );
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveClass('bottom-3', 'right-3');
    });
  });

  describe('airing indicator styling', () => {
    it('should have small size and backdrop blur styling', () => {
      const anime = createMockAnime({ status: 'RELEASING' });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveClass('w-4', 'h-4', 'backdrop-blur-sm');
    });

    it('should contain card ripple overlay when airing', () => {
      const anime = createMockAnime({ status: 'RELEASING' });
      render(<BaseAnimeCard anime={anime} />);
      
      const cardRipple = screen.getByTestId('card-ripple-overlay');
      expect(cardRipple).toBeInTheDocument();
      expect(cardRipple).toHaveClass('card-ripple-overlay');
    });

    it('should have proper accessibility attributes', () => {
      const anime = createMockAnime({ status: 'RELEASING' });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveAttribute('aria-label', 'Currently airing');
      expect(indicator).toHaveAttribute('title', 'This anime is currently airing new episodes');
    });
  });

  describe('interaction with existing card elements', () => {
    it('should not interfere with score badge display', () => {
      const anime = createMockAnime({ 
        status: 'RELEASING',
        score: 8.5 
      });
      render(<BaseAnimeCard anime={anime} />);
      
      const scoreBadge = screen.getByText('8.5');
      const airingIndicator = screen.getByTestId('airing-indicator');
      
      expect(scoreBadge).toBeInTheDocument();
      expect(airingIndicator).toBeInTheDocument();
    });

    it('should not interfere with status dropdown when enabled', () => {
      const anime = createMockAnime({ 
        status: 'RELEASING',
        userStatus: 'watching'
      });
      const statusDropdown = {
        enabled: true,
        onStatusChange: () => {},
        isAuthenticated: true,
      };
      
      render(
        <BaseAnimeCard 
          anime={anime} 
          statusDropdown={statusDropdown}
        />
      );
      
      const dropdown = screen.getByRole('button', { name: /current status: watching/i });
      const airingIndicator = screen.getByTestId('airing-indicator');
      
      expect(dropdown).toBeInTheDocument();
      expect(airingIndicator).toBeInTheDocument();
      // Indicator should be repositioned to avoid conflict
      expect(airingIndicator).toHaveClass('bottom-3', 'right-3');
    });

    it('should not interfere with anime title and metadata display', () => {
      const anime = createMockAnime({ 
        status: 'RELEASING',
        title: 'Test Airing Anime',
        year: 2023,
        episodes: 12
      });
      render(<BaseAnimeCard anime={anime} />);
      
      const title = screen.getByText('Test Airing Anime');
      const year = screen.getByText('📅 2023');
      const episodes = screen.getByText('📺 12 eps');
      const airingIndicator = screen.getByTestId('airing-indicator');
      
      expect(title).toBeInTheDocument();
      expect(year).toBeInTheDocument();
      expect(episodes).toBeInTheDocument();
      expect(airingIndicator).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle mixed case status values correctly', () => {
      const anime = createMockAnime({ status: 'releasing' });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should prioritize airingStatus over general status', () => {
      const anime = createMockAnime({ 
        status: 'FINISHED',
        airingStatus: 'airing'
      });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should handle anime without cover image', () => {
      const anime = createMockAnime({ 
        status: 'RELEASING',
        coverImage: undefined 
      });
      render(<BaseAnimeCard anime={anime} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      const fallback = screen.getByText('No Image');
      
      expect(indicator).toBeInTheDocument();
      expect(fallback).toBeInTheDocument();
    });
  });
});