import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testMALConnection, testAniListConnection } from '../testApi'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock environment variables using vi.stubEnv
vi.stubEnv('VITE_MAL_CLIENT_ID', 'test-client-id')

describe('testApi utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset console.error mock
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('testMALConnection', () => {
    it('should return true when API connection succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await testMALConnection()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=1&fields=id,title',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-MAL-CLIENT-ID': expect.any(String)
          })
        })
      )
    })

    it('should return false when API connection fails with error status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      })

      const result = await testMALConnection()

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('MAL API connection failed:', 403)
    })

    it('should return false when fetch throws an error', async () => {
      const error = new Error('Network error')
      mockFetch.mockRejectedValueOnce(error)

      const result = await testMALConnection()

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('MAL API connection error:', error)
    })
  })

  describe('testAniListConnection', () => {
    it('should return true when AniList API connection succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            Page: {
              media: [{ id: 1, title: { romaji: 'Test Anime' } }]
            }
          }
        })
      })

      const result = await testAniListConnection()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('query')
      })
    })

    it('should return false when AniList API response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const result = await testAniListConnection()

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('AniList API connection failed:', 500)
    })

    it('should return false when AniList API throws an error', async () => {
      const error = new Error('GraphQL error')
      mockFetch.mockRejectedValueOnce(error)

      const result = await testAniListConnection()

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('AniList API connection error:', error)
    })

    it('should handle network errors during request', async () => {
      const networkError = new Error('Network timeout')
      mockFetch.mockRejectedValueOnce(networkError)

      const result = await testAniListConnection()

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('AniList API connection error:', networkError)
    })
  })
})