/**
 * Search and filter utilities
 * Pure functions for search parameter building, validation, and filtering
 */

export interface SearchParams {
  query?: string
  type?: string
  status?: string
  rating?: string
  genre?: string
  minScore?: number
  maxScore?: number
  limit?: number
}

export interface AdvancedSearchParams {
  query: string
  type: string
  status: string
  rating: string
  genre: string
  minScore: number
  maxScore: number
}

/**
 * Validates search query string
 */
export const isValidSearchQuery = (query: string): boolean => {
  return typeof query === 'string' && query.trim().length > 0
}

/**
 * Sanitizes search query by trimming and normalizing
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return ''
  return query.trim().replace(/\s+/g, ' ')
}

/**
 * Validates score range
 */
export const isValidScoreRange = (minScore: number, maxScore: number): boolean => {
  return (
    Number.isFinite(minScore) &&
    Number.isFinite(maxScore) &&
    minScore >= 0 &&
    maxScore <= 10 &&
    minScore <= maxScore
  )
}

/**
 * Normalizes score range to valid bounds
 */
export const normalizeScoreRange = (minScore: number, maxScore: number): { min: number; max: number } => {
  const min = Math.max(0, Math.min(10, Number.isFinite(minScore) ? minScore : 0))
  const max = Math.max(0, Math.min(10, Number.isFinite(maxScore) ? maxScore : 10))
  
  return {
    min: Math.min(min, max),
    max: Math.max(min, max)
  }
}

/**
 * Builds search parameters for API calls, filtering out empty/default values
 */
export const buildSearchParams = (params: AdvancedSearchParams): SearchParams => {
  const result: SearchParams = {}
  
  // Add query if not empty
  const sanitizedQuery = sanitizeSearchQuery(params.query)
  if (sanitizedQuery) {
    result.query = sanitizedQuery
  }
  
  // Add type if not empty/default
  if (params.type && params.type !== '') {
    result.type = params.type
  }
  
  // Add status if not empty/default
  if (params.status && params.status !== '') {
    result.status = params.status
  }
  
  // Add rating if not empty/default
  if (params.rating && params.rating !== '') {
    result.rating = params.rating
  }
  
  // Add genre if not empty/default
  if (params.genre && params.genre !== '') {
    result.genre = params.genre
  }
  
  // Add score range if not default (0-10)
  const { min, max } = normalizeScoreRange(params.minScore, params.maxScore)
  if (min > 0) {
    result.minScore = min
  }
  if (max < 10) {
    result.maxScore = max
  }
  
  return result
}

/**
 * Creates default advanced search parameters
 */
export const createDefaultSearchParams = (): AdvancedSearchParams => ({
  query: '',
  type: '',
  status: '',
  rating: '',
  genre: '',
  minScore: 0,
  maxScore: 10
})

/**
 * Validates advanced search parameters
 */
export const validateSearchParams = (params: AdvancedSearchParams): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Validate score range
  if (!isValidScoreRange(params.minScore, params.maxScore)) {
    errors.push('Invalid score range. Min score must be less than or equal to max score (0-10).')
  }
  
  // Check if at least one search parameter is provided
  const hasSearchCriteria = 
    sanitizeSearchQuery(params.query) ||
    params.type ||
    params.status ||
    params.rating ||
    params.genre ||
    params.minScore > 0 ||
    params.maxScore < 10
  
  if (!hasSearchCriteria) {
    errors.push('At least one search criteria must be provided.')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Filters array of items by search query (case-insensitive)
 */
export const filterByQuery = <T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] => {
  const sanitizedQuery = sanitizeSearchQuery(query).toLowerCase()
  
  if (!sanitizedQuery) return items
  
  return items.filter(item => {
    const searchableText = getSearchableText(item).toLowerCase()
    return searchableText.includes(sanitizedQuery)
  })
}

/**
 * Filters array by multiple search terms (AND logic)
 */
export const filterByMultipleTerms = <T>(
  items: T[],
  terms: string[],
  getSearchableText: (item: T) => string
): T[] => {
  const sanitizedTerms = terms
    .map(term => sanitizeSearchQuery(term).toLowerCase())
    .filter(term => term.length > 0)
  
  if (sanitizedTerms.length === 0) return items
  
  return items.filter(item => {
    const searchableText = getSearchableText(item).toLowerCase()
    return sanitizedTerms.every(term => searchableText.includes(term))
  })
}

/**
 * Deduplicates array of anime by ID
 */
export const deduplicateById = <T extends { id: number }>(items: T[]): T[] => {
  const seen = new Set<number>()
  return items.filter(item => {
    if (seen.has(item.id)) {
      return false
    }
    seen.add(item.id)
    return true
  })
}

/**
 * Sorts search results by relevance (exact matches first, then partial matches)
 */
export const sortByRelevance = <T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] => {
  const sanitizedQuery = sanitizeSearchQuery(query).toLowerCase()
  
  if (!sanitizedQuery) return items
  
  return [...items].sort((a, b) => {
    const textA = getSearchableText(a).toLowerCase()
    const textB = getSearchableText(b).toLowerCase()
    
    // Exact matches first
    const exactA = textA === sanitizedQuery
    const exactB = textB === sanitizedQuery
    if (exactA && !exactB) return -1
    if (!exactA && exactB) return 1
    
    // Starts with query second
    const startsA = textA.startsWith(sanitizedQuery)
    const startsB = textB.startsWith(sanitizedQuery)
    if (startsA && !startsB) return -1
    if (!startsA && startsB) return 1
    
    // Then by position of match (earlier is better)
    const indexA = textA.indexOf(sanitizedQuery)
    const indexB = textB.indexOf(sanitizedQuery)
    if (indexA !== indexB) return indexA - indexB
    
    // Finally by alphabetical order
    return textA.localeCompare(textB)
  })
}

/**
 * Limits search results with pagination support
 */
export const paginateResults = <T>(
  items: T[],
  page: number = 1,
  limit: number = 24
): { items: T[]; totalPages: number; currentPage: number } => {
  const normalizedPage = Math.max(1, Math.floor(page))
  const normalizedLimit = Math.max(1, Math.floor(limit))
  
  const totalPages = Math.ceil(items.length / normalizedLimit)
  const startIndex = (normalizedPage - 1) * normalizedLimit
  const endIndex = startIndex + normalizedLimit
  
  return {
    items: items.slice(startIndex, endIndex),
    totalPages,
    currentPage: normalizedPage
  }
}

/**
 * Creates a search result summary
 */
export const createSearchSummary = (
  totalResults: number,
  query?: string,
  filters?: Partial<AdvancedSearchParams>
): string => {
  if (totalResults === 0) {
    return 'No results found'
  }
  
  const resultText = totalResults === 1 ? 'result' : 'results'
  let summary = `${totalResults} ${resultText}`
  
  if (query && sanitizeSearchQuery(query)) {
    summary += ` for "${sanitizeSearchQuery(query)}"`
  }
  
  const activeFilters = []
  if (filters?.type) activeFilters.push(`type: ${filters.type}`)
  if (filters?.status) activeFilters.push(`status: ${filters.status}`)
  if (filters?.genre) activeFilters.push(`genre: ${filters.genre}`)
  if (filters?.minScore && filters.minScore > 0) activeFilters.push(`min score: ${filters.minScore}`)
  if (filters?.maxScore && filters.maxScore < 10) activeFilters.push(`max score: ${filters.maxScore}`)
  
  if (activeFilters.length > 0) {
    summary += ` (filtered by ${activeFilters.join(', ')})`
  }
  
  return summary
}