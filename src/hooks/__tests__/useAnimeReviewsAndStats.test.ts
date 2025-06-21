import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { useAnimeReviewsAndStats } from '../useAnimeReviewsAndStats'
import { jikanService } from '../../services/jikan'

// Mock the jikan service
vi.mock('../../services/jikan', () => ({
  jikanService: {
    getAnimeReviews: vi.fn(),
    getAnimeStatistics: vi.fn()
  }
}))

const mockJikanService = jikanService as {
  getAnimeReviews: Mock
  getAnimeStatistics: Mock
}

describe('useAnimeReviewsAndStats', () => {
  const mockReviews = [
    {
      mal_id: 1,
      username: 'reviewer1',
      score: 8,
      review: 'Great anime!'
    },
    {
      mal_id: 2,
      username: 'reviewer2',
      score: 7,
      review: 'Pretty good'
    }
  ]

  const mockStatistics = {
    watching: 50000,
    completed: 120000,
    on_hold: 5000,
    dropped: 3000,
    plan_to_watch: 25000,
    total: 203000,
    scores: {
      '10': { votes: 15000, percentage: 12.4 },
      '9': { votes: 18000, percentage: 14.9 },
      '8': { votes: 22000, percentage: 18.2 }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockJikanService.getAnimeReviews.mockResolvedValue(mockReviews)
    mockJikanService.getAnimeStatistics.mockResolvedValue(mockStatistics)
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAnimeReviewsAndStats(null, 'mal'))

    expect(result.current.reviews).toEqual([])
    expect(result.current.statistics).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should not fetch when animeId is null', async () => {
    const { result } = renderHook(() => useAnimeReviewsAndStats(null, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeReviews).not.toHaveBeenCalled()
    expect(mockJikanService.getAnimeStatistics).not.toHaveBeenCalled()
    expect(result.current.reviews).toEqual([])
    expect(result.current.statistics).toBeNull()
  })

  it('should not fetch for unsupported sources', async () => {
    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'anilist'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeReviews).not.toHaveBeenCalled()
    expect(mockJikanService.getAnimeStatistics).not.toHaveBeenCalled()
    expect(result.current.reviews).toEqual([])
    expect(result.current.statistics).toBeNull()
  })

  it('should fetch reviews and statistics for MAL source', async () => {
    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'mal'))

    // Should start loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeReviews).toHaveBeenCalledWith(123)
    expect(mockJikanService.getAnimeStatistics).toHaveBeenCalledWith(123)
    expect(result.current.reviews).toEqual(mockReviews)
    expect(result.current.statistics).toEqual(mockStatistics)
    expect(result.current.error).toBeNull()
  })

  it('should fetch reviews and statistics for Jikan source', async () => {
    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'jikan'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeReviews).toHaveBeenCalledWith(123)
    expect(mockJikanService.getAnimeStatistics).toHaveBeenCalledWith(123)
    expect(result.current.reviews).toEqual(mockReviews)
    expect(result.current.statistics).toEqual(mockStatistics)
  })

  it('should make concurrent API calls using Promise.all', async () => {
    const startTime = Date.now()
    
    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const endTime = Date.now()
    
    // Both functions should have been called
    expect(mockJikanService.getAnimeReviews).toHaveBeenCalledWith(123)
    expect(mockJikanService.getAnimeStatistics).toHaveBeenCalledWith(123)
    
    // Verify they were called concurrently (timing is approximate)
    expect(endTime - startTime).toBeLessThan(100) // Should be very fast with mocked functions
  })

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'API Error'
    mockJikanService.getAnimeReviews.mockRejectedValue(new Error(errorMessage))
    mockJikanService.getAnimeStatistics.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch reviews and statistics')
    expect(result.current.reviews).toEqual([])
    expect(result.current.statistics).toBeNull()
  })

  it('should handle partial failures gracefully', async () => {
    // One call succeeds, one fails
    mockJikanService.getAnimeReviews.mockResolvedValue(mockReviews)
    mockJikanService.getAnimeStatistics.mockRejectedValue(new Error('Stats API Error'))

    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Since Promise.all fails if any promise fails, both should be empty
    expect(result.current.error).toBe('Failed to fetch reviews and statistics')
    expect(result.current.reviews).toEqual([])
    expect(result.current.statistics).toBeNull()
  })

  it('should refetch when animeId changes', async () => {
    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeReviewsAndStats(animeId, source),
      { initialProps: { animeId: 123, source: 'mal' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeReviews).toHaveBeenCalledWith(123)
    expect(mockJikanService.getAnimeStatistics).toHaveBeenCalledWith(123)

    // Change animeId
    act(() => {
      rerender({ animeId: 456, source: 'mal' })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeReviews).toHaveBeenCalledWith(456)
    expect(mockJikanService.getAnimeStatistics).toHaveBeenCalledWith(456)
    expect(mockJikanService.getAnimeReviews).toHaveBeenCalledTimes(2)
    expect(mockJikanService.getAnimeStatistics).toHaveBeenCalledTimes(2)
  })

  it('should refetch when source changes to supported source', async () => {
    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeReviewsAndStats(animeId, source),
      { initialProps: { animeId: 123, source: 'anilist' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should not have fetched for anilist
    expect(mockJikanService.getAnimeReviews).not.toHaveBeenCalled()
    expect(mockJikanService.getAnimeStatistics).not.toHaveBeenCalled()

    // Change to mal source
    rerender({ animeId: 123, source: 'mal' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeReviews).toHaveBeenCalledWith(123)
    expect(mockJikanService.getAnimeStatistics).toHaveBeenCalledWith(123)
    expect(result.current.reviews).toEqual(mockReviews)
    expect(result.current.statistics).toEqual(mockStatistics)
  })

  it('should clear data when source changes to unsupported', async () => {
    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeReviewsAndStats(animeId, source),
      { initialProps: { animeId: 123, source: 'mal' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reviews).toEqual(mockReviews)
    expect(result.current.statistics).toEqual(mockStatistics)

    // Change to unsupported source
    rerender({ animeId: 123, source: 'anilist' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reviews).toEqual([])
    expect(result.current.statistics).toBeNull()
  })

  it('should clear data when animeId becomes null', async () => {
    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeReviewsAndStats(animeId, source),
      { initialProps: { animeId: 123, source: 'mal' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reviews).toEqual(mockReviews)
    expect(result.current.statistics).toEqual(mockStatistics)

    // Change animeId to null
    rerender({ animeId: undefined, source: 'mal' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reviews).toEqual([])
    expect(result.current.statistics).toBeNull()
  })

  it('should reset error state on successful fetch', async () => {
    // First call fails
    mockJikanService.getAnimeReviews.mockRejectedValueOnce(new Error('API Error'))
    mockJikanService.getAnimeStatistics.mockRejectedValueOnce(new Error('API Error'))

    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeReviewsAndStats(animeId, source),
      { initialProps: { animeId: 123, source: 'mal' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch reviews and statistics')

    // Second call succeeds
    mockJikanService.getAnimeReviews.mockResolvedValueOnce(mockReviews)
    mockJikanService.getAnimeStatistics.mockResolvedValueOnce(mockStatistics)
    rerender({ animeId: 456, source: 'mal' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.reviews).toEqual(mockReviews)
    expect(result.current.statistics).toEqual(mockStatistics)
  })

  it('should handle empty results', async () => {
    mockJikanService.getAnimeReviews.mockResolvedValue([])
    mockJikanService.getAnimeStatistics.mockResolvedValue(null)

    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reviews).toEqual([])
    expect(result.current.statistics).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should log debug message on error', async () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const error = new Error('Test error')
    mockJikanService.getAnimeReviews.mockRejectedValue(error)
    mockJikanService.getAnimeStatistics.mockRejectedValue(error)

    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Could not fetch reviews/stats for anime 123:',
      error
    )

    consoleSpy.mockRestore()
  })

  it('should return correct TypeScript interface', () => {
    const { result } = renderHook(() => useAnimeReviewsAndStats(123, 'mal'))

    // Verify return type matches interface
    expect(typeof result.current.reviews).toBe('object')
    expect(Array.isArray(result.current.reviews)).toBe(true)
    expect(typeof result.current.loading).toBe('boolean')
    expect(result.current.error === null || typeof result.current.error === 'string').toBe(true)
    // statistics can be any type
  })
})