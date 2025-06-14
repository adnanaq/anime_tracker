import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { useAnimeRecommendations } from '../useAnimeRecommendations'
import { jikanService } from '../../services/jikan'
import type { AnimeBase } from '../../types/anime'

// Mock the jikan service
vi.mock('../../services/jikan', () => ({
  jikanService: {
    getAnimeRecommendations: vi.fn()
  }
}))

const mockJikanService = jikanService as { getAnimeRecommendations: Mock }

describe('useAnimeRecommendations', () => {
  const mockRecommendations: AnimeBase[] = [
    {
      id: 456,
      title: 'Recommended Anime 1',
      source: 'jikan',
      score: 8.5,
      episodes: 12,
      genres: ['Action']
    },
    {
      id: 789,
      title: 'Recommended Anime 2', 
      source: 'jikan',
      score: 7.8,
      episodes: 24,
      genres: ['Drama']
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockJikanService.getAnimeRecommendations.mockResolvedValue(mockRecommendations)
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAnimeRecommendations(null, 'mal'))

    expect(result.current.recommendations).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should not fetch when animeId is null', async () => {
    const { result } = renderHook(() => useAnimeRecommendations(null, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeRecommendations).not.toHaveBeenCalled()
    expect(result.current.recommendations).toEqual([])
  })

  it('should not fetch for unsupported sources', async () => {
    const { result } = renderHook(() => useAnimeRecommendations(123, 'anilist'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeRecommendations).not.toHaveBeenCalled()
    expect(result.current.recommendations).toEqual([])
  })

  it('should fetch recommendations for MAL source', async () => {
    const { result } = renderHook(() => useAnimeRecommendations(123, 'mal'))

    // Should start loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeRecommendations).toHaveBeenCalledWith(123)
    expect(result.current.recommendations).toEqual(mockRecommendations)
    expect(result.current.error).toBeNull()
  })

  it('should fetch recommendations for Jikan source', async () => {
    const { result } = renderHook(() => useAnimeRecommendations(123, 'jikan'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeRecommendations).toHaveBeenCalledWith(123)
    expect(result.current.recommendations).toEqual(mockRecommendations)
  })

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'API Error'
    mockJikanService.getAnimeRecommendations.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useAnimeRecommendations(123, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch recommendations')
    expect(result.current.recommendations).toEqual([])
  })

  it('should refetch when animeId changes', async () => {
    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeRecommendations(animeId, source),
      { initialProps: { animeId: 123, source: 'mal' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeRecommendations).toHaveBeenCalledWith(123)

    // Change animeId
    rerender({ animeId: 456, source: 'mal' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeRecommendations).toHaveBeenCalledWith(456)
    expect(mockJikanService.getAnimeRecommendations).toHaveBeenCalledTimes(2)
  })

  it('should refetch when source changes to supported source', async () => {
    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeRecommendations(animeId, source),
      { initialProps: { animeId: 123, source: 'anilist' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should not have fetched for anilist
    expect(mockJikanService.getAnimeRecommendations).not.toHaveBeenCalled()

    // Change to mal source
    rerender({ animeId: 123, source: 'mal' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockJikanService.getAnimeRecommendations).toHaveBeenCalledWith(123)
    expect(result.current.recommendations).toEqual(mockRecommendations)
  })

  it('should clear recommendations when source changes to unsupported', async () => {
    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeRecommendations(animeId, source),
      { initialProps: { animeId: 123, source: 'mal' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recommendations).toEqual(mockRecommendations)

    // Change to unsupported source
    rerender({ animeId: 123, source: 'anilist' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recommendations).toEqual([])
  })

  it('should clear recommendations when animeId becomes null', async () => {
    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeRecommendations(animeId, source),
      { initialProps: { animeId: 123, source: 'mal' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recommendations).toEqual(mockRecommendations)

    // Change animeId to null
    rerender({ animeId: null, source: 'mal' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recommendations).toEqual([])
  })

  it('should reset error state on successful fetch', async () => {
    // First call fails
    mockJikanService.getAnimeRecommendations.mockRejectedValueOnce(new Error('API Error'))

    const { result, rerender } = renderHook(
      ({ animeId, source }) => useAnimeRecommendations(animeId, source),
      { initialProps: { animeId: 123, source: 'mal' } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch recommendations')

    // Second call succeeds
    mockJikanService.getAnimeRecommendations.mockResolvedValueOnce(mockRecommendations)
    rerender({ animeId: 456, source: 'mal' })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.recommendations).toEqual(mockRecommendations)
  })

  it('should handle empty recommendations array', async () => {
    mockJikanService.getAnimeRecommendations.mockResolvedValue([])

    const { result } = renderHook(() => useAnimeRecommendations(123, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recommendations).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should log debug message on error', async () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const error = new Error('Test error')
    mockJikanService.getAnimeRecommendations.mockRejectedValue(error)

    const { result } = renderHook(() => useAnimeRecommendations(123, 'mal'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Could not fetch recommendations for anime 123:',
      error
    )

    consoleSpy.mockRestore()
  })
})