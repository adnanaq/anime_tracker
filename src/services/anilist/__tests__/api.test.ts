import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { anilistService, normalizeAniListAnime } from '../api';
import { AniListAnime } from '../../../types/anime';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock GraphQL fragments
vi.mock('../../graphql/fragments', () => ({
  buildPageQuery: vi.fn(() => 'mock page query'),
  buildSearchQuery: vi.fn(() => 'mock search query'),
  buildSeasonQuery: vi.fn(() => 'mock season query'),
  buildAnimeDetailsQuery: vi.fn(() => 'mock details query'),
}));

describe('AniList API Service', () => {
  const mockAniListAnime: AniListAnime = {
    id: 1,
    title: {
      romaji: 'Test Anime',
      english: 'Test Anime English',
      native: 'テストアニメ'
    },
    description: 'Test anime description',
    coverImage: {
      large: 'https://example.com/large.jpg',
      medium: 'https://example.com/medium.jpg'
    },
    averageScore: 85,
    episodes: 12,
    status: 'FINISHED',
    genres: ['Action', 'Adventure'],
    startDate: { year: 2023 },
    format: 'TV',
    duration: 24,
    studios: {
      edges: [
        { node: { id: 1, name: 'Test Studio' } }
      ]
    },
    popularity: 5000
  };

  const mockGraphQLResponse = {
    data: {
      Page: {
        media: [mockAniListAnime]
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.DEV = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('anilistService.getPopularAnime', () => {
    it('should fetch popular anime successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse
      });

      const result = await anilistService.getPopularAnime();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Anime English');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3002/anilist/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: expect.stringContaining('mock page query')
        })
      );
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(anilistService.getPopularAnime()).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      await expect(anilistService.getPopularAnime()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle GraphQL errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ message: 'GraphQL error' }]
        })
      });

      await expect(anilistService.getPopularAnime()).rejects.toThrow('GraphQL error: GraphQL error');
    });
  });

  describe('anilistService.getTrendingAnime', () => {
    it('should fetch trending anime successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse
      });

      const result = await anilistService.getTrendingAnime();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Anime English');
    });

  });

  describe('anilistService.getSeasonalAnime', () => {
    it('should not have getSeasonalAnime method', async () => {
      expect(typeof anilistService.getSeasonalAnime).toBe('undefined');
    });
    
    it.skip('should fetch seasonal anime with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse
      });

      const result = await anilistService.getSeasonalAnime();

      expect(result).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3002/anilist/graphql',
        expect.objectContaining({
          body: expect.stringContaining('mock season query')
        })
      );
    });
  });

  describe('anilistService.searchAnime', () => {
    it('should search anime with query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse
      });

      const result = await anilistService.searchAnime('attack on titan');

      expect(result).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3002/anilist/graphql',
        expect.objectContaining({
          body: expect.stringContaining('mock search query')
        })
      );
    });

    it('should handle empty search query', async () => {
      const result = await anilistService.searchAnime('');

      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('anilistService.getAnimeDetails', () => {
    it('should fetch anime details by ID', async () => {
      const detailsResponse = {
        data: {
          Media: mockAniListAnime
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => detailsResponse
      });

      const result = await anilistService.getAnimeDetails(1);

      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Anime English');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3002/anilist/graphql',
        expect.objectContaining({
          body: expect.stringContaining('mock details query')
        })
      );
    });

    it('should return null for non-existent anime', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { Media: null }
        })
      });

      const result = await anilistService.getAnimeDetails(999999);

      expect(result).toBeNull();
    });
  });

  describe('normalizeAniListAnime', () => {
    it('should normalize AniList anime data correctly', () => {
      const result = normalizeAniListAnime(mockAniListAnime);

      expect(result).toEqual({
        id: 1,
        title: 'Test Anime English',
        image: 'https://example.com/large.jpg',
        coverImage: 'https://example.com/large.jpg',
        score: 8.5,
        year: 2023,
        episodes: 12,
        status: 'FINISHED',
        format: 'TV',
        genres: ['Action', 'Adventure'],
        synopsis: 'Test anime description',
        source: 'anilist',
        duration: "24",
        studios: ['Test Studio'],
        popularity: 5000,
        userScore: undefined,
        userStatus: undefined,
        userProgress: undefined
      });
    });

    it('should handle anime with user data', () => {
      const animeWithUserData = {
        ...mockAniListAnime,
        mediaListEntry: {
          score: 9,
          status: 'COMPLETED',
          progress: 12
        }
      };

      const result = normalizeAniListAnime(animeWithUserData as any);

      expect(result.userScore).toBe(9);
      expect(result.userStatus).toBe('COMPLETED');
    });

    it('should handle missing optional fields', () => {
      const minimalAnime: Partial<AniListAnime> = {
        id: 1,
        title: { romaji: 'Test' }
      };

      const result = normalizeAniListAnime(minimalAnime as AniListAnime);

      expect(result.id).toBe(1);
      expect(result.title).toBe('Test');
      expect(result.image).toBe('');
      expect(result.score).toBeUndefined();
    });

    it('should prefer English title over romaji', () => {
      const anime = {
        ...mockAniListAnime,
        title: {
          romaji: 'Romaji Title',
          english: 'English Title',
          native: 'Native Title'
        }
      };

      const result = normalizeAniListAnime(anime);

      expect(result.title).toBe('English Title');
    });

    it('should fall back to romaji when English is unavailable', () => {
      const anime = {
        ...mockAniListAnime,
        title: {
          romaji: 'Romaji Title',
          native: 'Native Title'
        }
      };

      const result = normalizeAniListAnime(anime);

      expect(result.title).toBe('Romaji Title');
    });

    it('should handle empty studios array', () => {
      const anime = {
        ...mockAniListAnime,
        studios: { edges: [] }
      };

      const result = normalizeAniListAnime(anime);

      expect(result.studios).toEqual([]);
    });

    it('should convert AniList score to 1-10 scale', () => {
      const anime = {
        ...mockAniListAnime,
        averageScore: 85
      };

      const result = normalizeAniListAnime(anime);

      expect(result.score).toBe(8.5);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(anilistService.getPopularAnime()).rejects.toThrow('Invalid JSON');
    });

    it('should handle network timeouts', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(anilistService.getPopularAnime()).rejects.toThrow('Timeout');
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded'
      });

      await expect(anilistService.getPopularAnime()).rejects.toThrow('AniList rate limit exceeded. Please try again later.');
    });

    it('should log errors appropriately', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      await expect(anilistService.getTrendingAnime()).rejects.toThrow('Test error');

      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});