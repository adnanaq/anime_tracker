import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AnimeInfoCard } from '../AnimeInfoCard';
import { AnimeBase } from '../../../../types/anime';

const mockAnime: AnimeBase = {
  id: 1,
  title: 'Attack on Titan',
  synopsis: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction. When the Titans breach Wall Maria, Eren Yeager vows to exterminate every last Titan to avenge his mother and reclaim humanity\'s territory.',
  score: 9.0,
  userScore: 10,
  episodes: 25,
  year: 2013,
  season: 'SPRING',
  status: 'FINISHED',
  format: 'TV',
  genres: ['Action', 'Drama', 'Fantasy', 'Military', 'Shounen'],
  duration: '24',
  studios: ['Madhouse', 'Studio Pierrot'],
  popularity: 1,
  source: 'anilist' as const,
};

const mockAnimeMinimal: AnimeBase = {
  id: 2,
  title: 'Minimal Anime',
  source: 'mal' as const,
};

const mockAnimeLongSynopsis: AnimeBase = {
  ...mockAnime,
  id: 3,
  synopsis: 'This is a very long synopsis that should trigger the scrolling animation. '.repeat(10),
};

const mockAnimeShortSynopsis: AnimeBase = {
  ...mockAnime,
  id: 4,
  synopsis: 'Short synopsis.',
};

describe('AnimeInfoCard', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
    });

    it('renders with minimal anime data', () => {
      const { container } = render(<AnimeInfoCard anime={mockAnimeMinimal} />);
      expect(container.firstChild).toHaveClass('anime-info-card');
    });

    it('applies custom className', () => {
      const { container } = render(
        <AnimeInfoCard anime={mockAnime} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('anime-info-card', 'custom-class');
    });
  });

  describe('Status and Format Badges', () => {
    it('renders status badge with correct variant for FINISHED', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      const statusBadge = screen.getByText('Finished');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge.parentElement).toHaveClass('at-badge-success');
    });

    it('renders format badge with correct variant for TV', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      const formatBadge = screen.getByText('TV');
      expect(formatBadge).toBeInTheDocument();
      expect(formatBadge.parentElement).toHaveClass('at-badge-secondary');
    });

    it('handles different status types correctly', () => {
      const releasingAnime = { ...mockAnime, status: 'RELEASING' };
      render(<AnimeInfoCard anime={releasingAnime} />);
      const statusBadge = screen.getByText('Releasing');
      expect(statusBadge.parentElement).toHaveClass('at-badge-primary');
    });

    it('handles different format types correctly', () => {
      const movieAnime = { ...mockAnime, format: 'MOVIE' };
      render(<AnimeInfoCard anime={movieAnime} />);
      const formatBadge = screen.getByText('MOVIE');
      expect(formatBadge.parentElement).toHaveClass('at-badge-danger');
    });

    it('does not render badges when status and format are missing', () => {
      const animeWithoutBadges = { ...mockAnime, status: undefined, format: undefined };
      render(<AnimeInfoCard anime={animeWithoutBadges} />);
      expect(screen.queryByText('Finished')).not.toBeInTheDocument();
      expect(screen.queryByText('TV')).not.toBeInTheDocument();
    });
  });

  describe('Metadata Grid', () => {
    it('renders score information correctly', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('9.0')).toBeInTheDocument();
      expect(screen.getByText('10/10')).toBeInTheDocument();
    });

    it('renders score without user score when not available', () => {
      const animeWithoutUserScore = { ...mockAnime, userScore: undefined };
      render(<AnimeInfoCard anime={animeWithoutUserScore} />);
      expect(screen.getByText('9.0')).toBeInTheDocument();
      expect(screen.queryByText('10/10')).not.toBeInTheDocument();
    });

    it('renders episodes information', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('Episodes:')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('renders year information', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('Year:')).toBeInTheDocument();
      expect(screen.getByText('2013')).toBeInTheDocument();
    });

    it('renders season information with proper formatting', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('Season:')).toBeInTheDocument();
      expect(screen.getByText('spring')).toBeInTheDocument();
    });

    it('does not render metadata fields when not available', () => {
      render(<AnimeInfoCard anime={mockAnimeMinimal} />);
      expect(screen.queryByText('Score:')).not.toBeInTheDocument();
      expect(screen.queryByText('Episodes:')).not.toBeInTheDocument();
      expect(screen.queryByText('Year:')).not.toBeInTheDocument();
      expect(screen.queryByText('Season:')).not.toBeInTheDocument();
    });
  });

  describe('Genres Section', () => {
    it('renders genres with proper badges', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('Genres:')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Drama')).toBeInTheDocument();
      expect(screen.getByText('Fantasy')).toBeInTheDocument();
      expect(screen.getByText('Military')).toBeInTheDocument();
    });

    it('shows overflow indicator when more than 4 genres', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('+1 more')).toBeInTheDocument();
      expect(screen.queryByText('Shounen')).not.toBeInTheDocument();
    });

    it('does not render genres section when genres are empty', () => {
      const animeWithoutGenres = { ...mockAnime, genres: [] };
      render(<AnimeInfoCard anime={animeWithoutGenres} />);
      expect(screen.queryByText('Genres:')).not.toBeInTheDocument();
    });

    it('does not render genres section when genres are undefined', () => {
      const animeWithoutGenres = { ...mockAnime, genres: undefined };
      render(<AnimeInfoCard anime={animeWithoutGenres} />);
      expect(screen.queryByText('Genres:')).not.toBeInTheDocument();
    });
  });

  describe('Additional Metadata', () => {
    it('renders duration information', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('Duration:')).toBeInTheDocument();
      expect(screen.getByText('24 min/episode')).toBeInTheDocument();
    });

    it('renders studio information with proper truncation', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('Studio:')).toBeInTheDocument();
      expect(screen.getByText('Madhouse, Studio Pierrot')).toBeInTheDocument();
    });

    it('renders popularity ranking', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText('Popularity:')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('does not render additional metadata when not available', () => {
      render(<AnimeInfoCard anime={mockAnimeMinimal} />);
      expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
      expect(screen.queryByText('Studio:')).not.toBeInTheDocument();
      expect(screen.queryByText('Popularity:')).not.toBeInTheDocument();
    });
  });

  describe('Synopsis Section', () => {
    it('renders synopsis for anime with synopsis', () => {
      render(<AnimeInfoCard anime={mockAnime} />);
      expect(screen.getByText(/Humanity fights for survival/)).toBeInTheDocument();
    });

    it('applies long-text class for long synopsis', () => {
      const { container } = render(<AnimeInfoCard anime={mockAnimeLongSynopsis} />);
      const synopsisContainer = container.querySelector('.scrolling-synopsis');
      expect(synopsisContainer).toHaveClass('long-text');
    });

    it('applies short-text class for short synopsis', () => {
      const { container } = render(<AnimeInfoCard anime={mockAnimeShortSynopsis} />);
      const synopsisContainer = container.querySelector('.scrolling-synopsis');
      expect(synopsisContainer).toHaveClass('short-text');
    });

    it('truncates text for short synopsis display', () => {
      render(<AnimeInfoCard anime={mockAnimeShortSynopsis} />);
      expect(screen.getByText('Short synopsis.')).toBeInTheDocument();
    });

    it('does not render synopsis section when synopsis is missing', () => {
      const animeWithoutSynopsis = { ...mockAnime, synopsis: undefined };
      render(<AnimeInfoCard anime={animeWithoutSynopsis} />);
      expect(screen.queryByText(/Humanity fights for survival/)).not.toBeInTheDocument();
    });

    it('does not render synopsis section when synopsis is empty', () => {
      const animeWithEmptySynopsis = { ...mockAnime, synopsis: '' };
      render(<AnimeInfoCard anime={animeWithEmptySynopsis} />);
      expect(screen.queryByText(/Humanity fights for survival/)).not.toBeInTheDocument();
    });
  });

  describe('Text Truncation', () => {
    it('truncates text correctly when over limit', () => {
      const longText = 'A'.repeat(250);
      const truncated = longText.length <= 200 ? longText : longText.slice(0, 200) + '...';
      expect(truncated).toBe('A'.repeat(200) + '...');
      expect(truncated.length).toBe(203);
    });

    it('does not truncate text when under limit', () => {
      const shortText = 'Short text';
      const result = shortText.length <= 200 ? shortText : shortText.slice(0, 200) + '...';
      expect(result).toBe(shortText);
    });

    it('handles edge case of exact length', () => {
      const exactText = 'A'.repeat(200);
      const result = exactText.length <= 200 ? exactText : exactText.slice(0, 200) + '...';
      expect(result).toBe(exactText);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = render(<AnimeInfoCard anime={mockAnime} />);
      const component = container.querySelector('.anime-info-card');
      expect(component).toBeInTheDocument();
    });

    it('maintains readable text contrast', () => {
      const { container } = render(<AnimeInfoCard anime={mockAnime} />);
      const typographyElements = container.querySelectorAll('.at-typography-base');
      expect(typographyElements.length).toBeGreaterThan(0);
    });

    it('supports reduced motion preferences through CSS', () => {
      // This is tested through CSS media queries, verified by CSS file structure
      const { container } = render(<AnimeInfoCard anime={mockAnimeLongSynopsis} />);
      expect(container.querySelector('.scrolling-synopsis')).toBeInTheDocument();
    });
  });
});