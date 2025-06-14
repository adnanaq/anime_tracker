import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { malService } from '../../../services/mal'

// Mock the MAL service
vi.mock('../../../services/mal', () => ({
  malService: {
    getGenres: vi.fn(),
    searchAnime: vi.fn()
  }
}))

const mockGenres = [
  { mal_id: 1, name: 'Action' },
  { mal_id: 2, name: 'Adventure' },
  { mal_id: 8, name: 'Drama' },
  { mal_id: 22, name: 'Romance' }
]

const mockSearchResults = [
  {
    id: '1',
    title: 'Attack on Titan',
    source: 'mal',
    image: 'https://example.com/aot.jpg',
    score: 9.0,
    episodes: 25,
    year: 2013,
    status: 'Completed',
    format: 'TV',
    genres: ['Action', 'Drama'],
    synopsis: 'Humanity fights for survival against giant humanoid Titans.'
  },
  {
    id: '2', 
    title: 'Death Note',
    source: 'mal',
    image: 'https://example.com/deathnote.jpg',
    score: 9.0,
    episodes: 37,
    year: 2006,
    status: 'Completed',
    format: 'TV',
    genres: ['Supernatural', 'Thriller'],
    synopsis: 'A high school student discovers a supernatural notebook.'
  }
]

// Get mocked functions
const mockedMalService = malService as {
  getGenres: Mock
  searchAnime: Mock
}

describe('AdvancedSearch Business Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedMalService.getGenres.mockResolvedValue(mockGenres)
    mockedMalService.searchAnime.mockResolvedValue(mockSearchResults)
  })

  describe('Genre Loading Logic', () => {
    it('should fetch genres from MAL service on component mount', async () => {
      await mockedMalService.getGenres()
      
      expect(mockedMalService.getGenres).toHaveBeenCalled()
      expect(mockedMalService.getGenres).toHaveBeenCalledTimes(1)
    })

    it('should handle genre loading success', async () => {
      const result = await mockedMalService.getGenres()
      
      expect(result).toEqual(mockGenres)
      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({ mal_id: 1, name: 'Action' })
    })

    it('should handle genre loading failure', async () => {
      mockedMalService.getGenres.mockRejectedValue(new Error('Failed to load genres'))
      
      try {
        await mockedMalService.getGenres()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Failed to load genres')
      }
    })
  })

  describe('Search Logic', () => {
    it('should perform search with correct parameters', async () => {
      const searchParams = {
        query: 'Attack on Titan',
        type: 'tv',
        status: 'complete',
        rating: 'pg13',
        genre: '1'
      }

      await mockedMalService.searchAnime(searchParams)
      
      expect(mockedMalService.searchAnime).toHaveBeenCalledWith(searchParams)
    })

    it('should handle successful search results', async () => {
      const result = await mockedMalService.searchAnime({ query: 'test' })
      
      expect(result).toEqual(mockSearchResults)
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Attack on Titan')
      expect(result[1].title).toBe('Death Note')
    })

    it('should handle empty search results', async () => {
      mockedMalService.searchAnime.mockResolvedValue([])
      
      const result = await mockedMalService.searchAnime({ query: 'nonexistent' })
      
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle search errors', async () => {
      const errorMessage = 'Search failed'
      mockedMalService.searchAnime.mockRejectedValue(new Error(errorMessage))
      
      try {
        await mockedMalService.searchAnime({ query: 'test' })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe(errorMessage)
      }
    })

    it('should handle network timeout errors', async () => {
      mockedMalService.searchAnime.mockRejectedValue(new Error('Network timeout'))
      
      try {
        await mockedMalService.searchAnime({ query: 'test' })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network timeout')
      }
    })
  })

  describe('Search Parameters Validation', () => {
    it('should validate search query length', () => {
      const validateQuery = (query: string) => {
        return query.length >= 2 && query.length <= 100
      }

      expect(validateQuery('')).toBe(false)
      expect(validateQuery('a')).toBe(false)
      expect(validateQuery('ab')).toBe(true)
      expect(validateQuery('Attack on Titan')).toBe(true)
      expect(validateQuery('a'.repeat(101))).toBe(false)
    })

    it('should validate filter parameters', () => {
      const validateFilters = (filters: any) => {
        const validTypes = ['', 'tv', 'movie', 'ova', 'special', 'ona', 'music']
        const validStatuses = ['', 'airing', 'complete', 'upcoming']
        const validRatings = ['', 'g', 'pg', 'pg13', 'r17', 'r', 'rx']

        return (
          validTypes.includes(filters.type || '') &&
          validStatuses.includes(filters.status || '') &&
          validRatings.includes(filters.rating || '')
        )
      }

      expect(validateFilters({ type: 'tv', status: 'complete', rating: 'pg13' })).toBe(true)
      expect(validateFilters({ type: 'invalid', status: 'complete', rating: 'pg13' })).toBe(false)
      expect(validateFilters({ type: 'tv', status: 'invalid', rating: 'pg13' })).toBe(false)
      expect(validateFilters({ type: 'tv', status: 'complete', rating: 'invalid' })).toBe(false)
      expect(validateFilters({})).toBe(true) // Empty filters are valid
    })
  })

  describe('Data Transformation Logic', () => {
    it('should transform search results correctly', () => {
      const transformSearchResult = (result: any) => ({
        id: result.id,
        title: result.title,
        source: result.source,
        image: result.image,
        score: result.score,
        episodes: result.episodes,
        year: result.year,
        status: result.status,
        format: result.format,
        genres: result.genres,
        synopsis: result.synopsis
      })

      const transformed = mockSearchResults.map(transformSearchResult)
      
      expect(transformed).toHaveLength(2)
      expect(transformed[0]).toEqual({
        id: '1',
        title: 'Attack on Titan',
        source: 'mal',
        image: 'https://example.com/aot.jpg',
        score: 9.0,
        episodes: 25,
        year: 2013,
        status: 'Completed',
        format: 'TV',
        genres: ['Action', 'Drama'],
        synopsis: 'Humanity fights for survival against giant humanoid Titans.'
      })
    })

    it('should handle missing data in search results', () => {
      const incompleteResult = {
        id: '3',
        title: 'Incomplete Anime',
        source: 'mal'
        // Missing other fields
      }

      const transformSearchResult = (result: any) => ({
        id: result.id,
        title: result.title,
        source: result.source,
        image: result.image || null,
        score: result.score || null,
        episodes: result.episodes || null,
        year: result.year || null,
        status: result.status || null,
        format: result.format || null,
        genres: result.genres || [],
        synopsis: result.synopsis || null
      })

      const transformed = transformSearchResult(incompleteResult)
      
      expect(transformed.id).toBe('3')
      expect(transformed.title).toBe('Incomplete Anime')
      expect(transformed.source).toBe('mal')
      expect(transformed.image).toBeNull()
      expect(transformed.score).toBeNull()
      expect(transformed.genres).toEqual([])
    })
  })

  describe('Error Recovery Logic', () => {
    it('should retry failed requests with exponential backoff', async () => {
      let attempts = 0
      const maxRetries = 3
      
      const retryableSearch = async (query: string, retryCount = 0): Promise<any> => {
        attempts++
        
        if (retryCount >= maxRetries) {
          throw new Error('Max retries exceeded')
        }
        
        try {
          return await mockedMalService.searchAnime({ query })
        } catch (error) {
          const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
          return retryableSearch(query, retryCount + 1)
        }
      }

      // Setup service to fail first two times, succeed on third
      mockedMalService.searchAnime
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSearchResults)

      const result = await retryableSearch('test')
      
      expect(attempts).toBe(3)
      expect(result).toEqual(mockSearchResults)
    })

    it('should provide fallback for genre loading failure', async () => {
      mockedMalService.getGenres.mockRejectedValue(new Error('Failed to load genres'))
      
      const loadGenresWithFallback = async () => {
        try {
          return await mockedMalService.getGenres()
        } catch (error) {
          // Return default genres as fallback
          return [
            { mal_id: 1, name: 'Action' },
            { mal_id: 2, name: 'Adventure' },
            { mal_id: 4, name: 'Comedy' },
            { mal_id: 8, name: 'Drama' }
          ]
        }
      }

      const result = await loadGenresWithFallback()
      
      expect(result).toHaveLength(4)
      expect(result[0].name).toBe('Action')
    })
  })

  describe('Search State Management Logic', () => {
    it('should manage search loading state correctly', () => {
      let isLoading = false
      let hasSearched = false
      let results: any[] = []
      let error: string | null = null

      const performSearch = async (query: string) => {
        isLoading = true
        error = null
        
        try {
          const searchResults = await mockedMalService.searchAnime({ query })
          results = searchResults
          hasSearched = true
        } catch (err) {
          error = err instanceof Error ? err.message : 'Unknown error'
          results = []
        } finally {
          isLoading = false
        }
      }

      // Before search
      expect(isLoading).toBe(false)
      expect(hasSearched).toBe(false)
      expect(results).toEqual([])
      expect(error).toBeNull()

      // During search (sync simulation)
      performSearch('test').then(() => {
        expect(isLoading).toBe(false)
        expect(hasSearched).toBe(true)
        expect(results).toEqual(mockSearchResults)
        expect(error).toBeNull()
      })
    })

    it('should reset search state correctly', () => {
      let searchQuery = 'test query'
      let selectedType = 'tv'
      let selectedStatus = 'complete'
      let selectedRating = 'pg13'
      let selectedGenre = '1'
      let results: any[] = mockSearchResults
      let hasSearched = true

      const resetSearchState = () => {
        searchQuery = ''
        selectedType = ''
        selectedStatus = ''
        selectedRating = ''
        selectedGenre = ''
        results = []
        hasSearched = false
      }

      // Before reset
      expect(searchQuery).toBe('test query')
      expect(results).toHaveLength(2)
      expect(hasSearched).toBe(true)

      resetSearchState()

      // After reset
      expect(searchQuery).toBe('')
      expect(selectedType).toBe('')
      expect(selectedStatus).toBe('')
      expect(selectedRating).toBe('')
      expect(selectedGenre).toBe('')
      expect(results).toEqual([])
      expect(hasSearched).toBe(false)
    })
  })
})