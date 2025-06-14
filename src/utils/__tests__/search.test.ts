import { describe, it, expect } from 'vitest'
import {
  isValidSearchQuery,
  sanitizeSearchQuery,
  isValidScoreRange,
  normalizeScoreRange,
  buildSearchParams,
  createDefaultSearchParams,
  validateSearchParams,
  filterByQuery,
  filterByMultipleTerms,
  deduplicateById,
  sortByRelevance,
  paginateResults,
  createSearchSummary,
  type AdvancedSearchParams
} from '../search'

describe('search utilities', () => {
  describe('isValidSearchQuery', () => {
    it('should return true for valid queries', () => {
      expect(isValidSearchQuery('naruto')).toBe(true)
      expect(isValidSearchQuery('one piece')).toBe(true)
      expect(isValidSearchQuery('  attack on titan  ')).toBe(true)
    })

    it('should return false for invalid queries', () => {
      expect(isValidSearchQuery('')).toBe(false)
      expect(isValidSearchQuery('   ')).toBe(false)
      expect(isValidSearchQuery('a' as any)).toBe(true) // Single char is valid
    })

    it('should return false for non-string inputs', () => {
      expect(isValidSearchQuery(null as any)).toBe(false)
      expect(isValidSearchQuery(undefined as any)).toBe(false)
      expect(isValidSearchQuery(123 as any)).toBe(false)
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should trim whitespace', () => {
      expect(sanitizeSearchQuery('  naruto  ')).toBe('naruto')
      expect(sanitizeSearchQuery('\n\t one piece \r\n')).toBe('one piece')
    })

    it('should normalize multiple spaces', () => {
      expect(sanitizeSearchQuery('attack   on    titan')).toBe('attack on titan')
      expect(sanitizeSearchQuery('one\t\tpiece')).toBe('one piece')
    })

    it('should handle non-string inputs', () => {
      expect(sanitizeSearchQuery(null as any)).toBe('')
      expect(sanitizeSearchQuery(undefined as any)).toBe('')
      expect(sanitizeSearchQuery(123 as any)).toBe('')
    })
  })

  describe('isValidScoreRange', () => {
    it('should return true for valid ranges', () => {
      expect(isValidScoreRange(0, 10)).toBe(true)
      expect(isValidScoreRange(5, 8)).toBe(true)
      expect(isValidScoreRange(7, 7)).toBe(true) // Equal values are valid
    })

    it('should return false for invalid ranges', () => {
      expect(isValidScoreRange(8, 5)).toBe(false) // min > max
      expect(isValidScoreRange(-1, 5)).toBe(false) // min < 0
      expect(isValidScoreRange(5, 11)).toBe(false) // max > 10
      expect(isValidScoreRange(NaN, 5)).toBe(false)
      expect(isValidScoreRange(5, Infinity)).toBe(false)
    })
  })

  describe('normalizeScoreRange', () => {
    it('should normalize valid ranges', () => {
      expect(normalizeScoreRange(3, 8)).toEqual({ min: 3, max: 8 })
      expect(normalizeScoreRange(0, 10)).toEqual({ min: 0, max: 10 })
    })

    it('should fix inverted ranges', () => {
      expect(normalizeScoreRange(8, 3)).toEqual({ min: 3, max: 8 })
    })

    it('should clamp to valid bounds', () => {
      expect(normalizeScoreRange(-5, 15)).toEqual({ min: 0, max: 10 })
      expect(normalizeScoreRange(-2, 5)).toEqual({ min: 0, max: 5 })
      expect(normalizeScoreRange(7, 15)).toEqual({ min: 7, max: 10 })
    })

    it('should handle edge cases', () => {
      expect(normalizeScoreRange(NaN, 5)).toEqual({ min: 0, max: 5 })
      expect(normalizeScoreRange(3, NaN)).toEqual({ min: 3, max: 10 }) // NaN becomes 10 (default max)
      expect(normalizeScoreRange(Infinity, -Infinity)).toEqual({ min: 0, max: 10 })
    })
  })

  describe('buildSearchParams', () => {
    it('should build basic search params', () => {
      const input: AdvancedSearchParams = {
        query: 'naruto',
        type: 'tv',
        status: 'airing',
        rating: 'pg13',
        genre: 'action',
        minScore: 7,
        maxScore: 9
      }

      expect(buildSearchParams(input)).toEqual({
        query: 'naruto',
        type: 'tv',
        status: 'airing',
        rating: 'pg13',
        genre: 'action',
        minScore: 7,
        maxScore: 9
      })
    })

    it('should exclude empty/default values', () => {
      const input: AdvancedSearchParams = {
        query: '',
        type: '',
        status: '',
        rating: '',
        genre: '',
        minScore: 0,
        maxScore: 10
      }

      expect(buildSearchParams(input)).toEqual({})
    })

    it('should sanitize query', () => {
      const input: AdvancedSearchParams = {
        query: '  attack   on   titan  ',
        type: '',
        status: '',
        rating: '',
        genre: '',
        minScore: 0,
        maxScore: 10
      }

      expect(buildSearchParams(input)).toEqual({
        query: 'attack on titan'
      })
    })

    it('should normalize score range', () => {
      const input: AdvancedSearchParams = {
        query: '',
        type: '',
        status: '',
        rating: '',
        genre: '',
        minScore: 15, // Invalid, should be clamped to 10
        maxScore: -5  // Invalid, should be clamped to 0
      }

      const result = buildSearchParams(input)
      // After normalization: min=10, max=0 -> corrected to min=0, max=10 
      // Since min=0 and max=10 are defaults, both should be excluded
      expect(result.minScore).toBeUndefined() // 0 is default, so excluded
      expect(result.maxScore).toBeUndefined() // 10 is default, so excluded
    })
  })

  describe('createDefaultSearchParams', () => {
    it('should return default parameters', () => {
      expect(createDefaultSearchParams()).toEqual({
        query: '',
        type: '',
        status: '',
        rating: '',
        genre: '',
        minScore: 0,
        maxScore: 10
      })
    })
  })

  describe('validateSearchParams', () => {
    it('should validate correct parameters', () => {
      const params: AdvancedSearchParams = {
        query: 'naruto',
        type: 'tv',
        status: '',
        rating: '',
        genre: '',
        minScore: 0,
        maxScore: 10
      }

      const result = validateSearchParams(params)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject invalid score range', () => {
      const params: AdvancedSearchParams = {
        query: '',
        type: '',
        status: '',
        rating: '',
        genre: '',
        minScore: 8,
        maxScore: 5 // Invalid: min > max
      }

      const result = validateSearchParams(params)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid score range. Min score must be less than or equal to max score (0-10).')
    })

    it('should require at least one search criteria', () => {
      const params: AdvancedSearchParams = {
        query: '',
        type: '',
        status: '',
        rating: '',
        genre: '',
        minScore: 0,
        maxScore: 10
      }

      const result = validateSearchParams(params)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one search criteria must be provided.')
    })
  })

  describe('filterByQuery', () => {
    const items = [
      { id: 1, title: 'Naruto' },
      { id: 2, title: 'Attack on Titan' },
      { id: 3, title: 'One Piece' },
      { id: 4, title: 'Naruto Shippuden' }
    ]

    it('should filter by query', () => {
      const result = filterByQuery(items, 'naruto', item => item.title)
      expect(result).toHaveLength(2)
      expect(result.map(item => item.id)).toEqual([1, 4])
    })

    it('should be case insensitive', () => {
      const result = filterByQuery(items, 'ATTACK', item => item.title)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(2)
    })

    it('should return all items for empty query', () => {
      const result = filterByQuery(items, '', item => item.title)
      expect(result).toEqual(items)
    })
  })

  describe('filterByMultipleTerms', () => {
    const items = [
      { id: 1, title: 'Naruto Uzumaki Ninja' },
      { id: 2, title: 'Attack on Titan Anime' },
      { id: 3, title: 'One Piece Adventure' },
      { id: 4, title: 'Naruto Shippuden Ninja' }
    ]

    it('should filter by multiple terms (AND logic)', () => {
      const result = filterByMultipleTerms(items, ['naruto', 'ninja'], item => item.title)
      expect(result).toHaveLength(2)
      expect(result.map(item => item.id)).toEqual([1, 4])
    })

    it('should require all terms to match', () => {
      const result = filterByMultipleTerms(items, ['naruto', 'attack'], item => item.title)
      expect(result).toHaveLength(0) // No item contains both terms
    })

    it('should handle empty terms array', () => {
      const result = filterByMultipleTerms(items, [], item => item.title)
      expect(result).toEqual(items)
    })
  })

  describe('deduplicateById', () => {
    it('should remove duplicates by id', () => {
      const items = [
        { id: 1, title: 'Naruto' },
        { id: 2, title: 'One Piece' },
        { id: 1, title: 'Naruto Duplicate' },
        { id: 3, title: 'Attack on Titan' }
      ]

      const result = deduplicateById(items)
      expect(result).toHaveLength(3)
      expect(result.map(item => item.id)).toEqual([1, 2, 3])
      expect(result[0].title).toBe('Naruto') // First occurrence kept
    })

    it('should handle empty array', () => {
      expect(deduplicateById([])).toEqual([])
    })
  })

  describe('sortByRelevance', () => {
    const items = [
      { id: 1, title: 'Naruto' },
      { id: 2, title: 'Naruto Shippuden' },
      { id: 3, title: 'Boruto: Naruto Next Generations' },
      { id: 4, title: 'One Piece' }
    ]

    it('should sort by relevance (exact match first)', () => {
      const result = sortByRelevance(items, 'naruto', item => item.title)
      expect(result[0].id).toBe(1) // Exact match 'Naruto'
    })

    it('should prioritize starts-with matches', () => {
      const result = sortByRelevance(items, 'naruto', item => item.title)
      expect(result[1].id).toBe(2) // 'Naruto Shippuden' starts with 'naruto'
    })

    it('should handle case insensitive matching', () => {
      const result = sortByRelevance(items, 'NARUTO', item => item.title)
      expect(result[0].id).toBe(1) // Should still find exact match
    })

    it('should return original order for empty query', () => {
      const result = sortByRelevance(items, '', item => item.title)
      expect(result).toEqual(items)
    })
  })

  describe('paginateResults', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }))

    it('should paginate results correctly', () => {
      const result = paginateResults(items, 1, 10)
      expect(result.items).toHaveLength(10)
      expect(result.totalPages).toBe(5)
      expect(result.currentPage).toBe(1)
      expect(result.items[0].id).toBe(1)
    })

    it('should handle second page', () => {
      const result = paginateResults(items, 2, 10)
      expect(result.items).toHaveLength(10)
      expect(result.items[0].id).toBe(11)
    })

    it('should handle last page with remaining items', () => {
      const result = paginateResults(items, 5, 12)
      expect(result.items).toHaveLength(2) // 50 - 48 = 2 remaining
      expect(result.totalPages).toBe(5)
    })

    it('should handle invalid page numbers', () => {
      const result = paginateResults(items, 0, 10)
      expect(result.currentPage).toBe(1) // Should normalize to 1
    })
  })

  describe('createSearchSummary', () => {
    it('should create summary for no results', () => {
      expect(createSearchSummary(0)).toBe('No results found')
    })

    it('should create summary for single result', () => {
      expect(createSearchSummary(1, 'naruto')).toBe('1 result for "naruto"')
    })

    it('should create summary for multiple results', () => {
      expect(createSearchSummary(10, 'anime')).toBe('10 results for "anime"')
    })

    it('should include filters in summary', () => {
      const filters = { type: 'tv', status: 'airing', minScore: 8 }
      const result = createSearchSummary(5, 'action', filters)
      expect(result).toBe('5 results for "action" (filtered by type: tv, status: airing, min score: 8)')
    })

    it('should handle summary without query', () => {
      const filters = { genre: 'action' }
      const result = createSearchSummary(15, undefined, filters)
      expect(result).toBe('15 results (filtered by genre: action)')
    })
  })
})