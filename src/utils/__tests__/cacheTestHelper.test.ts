import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCacheTestReport } from '../cacheTestHelper'

// Mock the cache utilities
vi.mock('../../lib/cache', () => ({
  getCacheStats: vi.fn(),
  getHitRate: vi.fn()
}))

import { getCacheStats, getHitRate } from '../../lib/cache'

describe('cacheTestHelper utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCacheTestReport', () => {
    it('should return cache test report with default values', () => {
      // Mock cache stats
      vi.mocked(getCacheStats).mockReturnValue({
        hitCount: 50,
        missCount: 10,
        totalRequests: 60,
        cacheSize: 15,
        lastClearTime: Date.now()
      })
      vi.mocked(getHitRate).mockReturnValue(83.33)

      const report = getCacheTestReport()

      expect(report).toEqual({
        overall: {
          hitCount: 50,
          missCount: 10,
          totalRequests: 60,
          hitRate: 83.33
        },
        byService: {
          mal: { requests: 0, hits: 0 },
          jikan: { requests: 0, hits: 0 },
          animeSchedule: { requests: 0, hits: 0 }
        },
        sections: {
          randomAnime: {
            isTracked: false,
            cacheHits: 0
          },
          seasonalAnime: {
            isTracked: false,
            cacheHits: 0
          },
          animeSchedule: {
            isTracked: false,
            cacheHits: 0
          }
        }
      })
    })

    it('should handle cache stats errors gracefully', () => {
      // Mock console.error to suppress error logs in test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock cache stats to throw error
      vi.mocked(getCacheStats).mockImplementation(() => {
        throw new Error('Cache error')
      })
      vi.mocked(getHitRate).mockReturnValue(0)

      const report = getCacheTestReport()

      expect(report).toEqual({
        overall: {
          hitCount: 0,
          missCount: 0,
          totalRequests: 0,
          hitRate: 0
        },
        byService: {
          mal: {},
          jikan: {},
          animeSchedule: {}
        },
        sections: {
          randomAnime: {
            isTracked: false,
            cacheHits: 0
          },
          seasonalAnime: {
            isTracked: false,
            cacheHits: 0
          },
          animeSchedule: {
            isTracked: false,
            cacheHits: 0
          }
        }
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('Cache test report failed:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should handle hit rate calculation errors gracefully', () => {
      // Mock console.error to suppress error logs in test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      vi.mocked(getCacheStats).mockReturnValue({
        hitCount: 30,
        missCount: 5,
        totalRequests: 35,
        cacheSize: 12,
        lastClearTime: Date.now()
      })
      vi.mocked(getHitRate).mockImplementation(() => {
        throw new Error('Hit rate calculation error')
      })

      const report = getCacheTestReport()

      expect(report.overall.hitRate).toBe(0)
      expect(report.overall.hitCount).toBe(0) // Will be 0 due to error handling
      expect(report.overall.missCount).toBe(0)
      expect(report.overall.totalRequests).toBe(0)
      
      expect(consoleSpy).toHaveBeenCalledWith('Cache test report failed:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should return consistent structure even with undefined cache stats', () => {
      vi.mocked(getCacheStats).mockReturnValue(undefined as any)
      vi.mocked(getHitRate).mockReturnValue(undefined as any)

      const report = getCacheTestReport()

      expect(report).toBeDefined()
      expect(report.overall).toBeDefined()
      expect(report.byService).toBeDefined()
      expect(report.sections).toBeDefined()
      expect(typeof report.overall.hitCount).toBe('number')
      expect(typeof report.overall.missCount).toBe('number')
      expect(typeof report.overall.totalRequests).toBe('number')
      expect(typeof report.overall.hitRate).toBe('number')
    })

    it('should include all required sections in the report', () => {
      vi.mocked(getCacheStats).mockReturnValue({
        hitCount: 100,
        missCount: 20,
        totalRequests: 120,
        cacheSize: 25,
        lastClearTime: Date.now()
      })
      vi.mocked(getHitRate).mockReturnValue(83.33)

      const report = getCacheTestReport()

      // Check all sections are present
      expect(report.sections.randomAnime).toBeDefined()
      expect(report.sections.seasonalAnime).toBeDefined()
      expect(report.sections.animeSchedule).toBeDefined()

      // Check all services are present
      expect(report.byService.mal).toBeDefined()
      expect(report.byService.jikan).toBeDefined()
      expect(report.byService.animeSchedule).toBeDefined()

      // Check section structure
      Object.values(report.sections).forEach(section => {
        expect(section).toHaveProperty('isTracked')
        expect(section).toHaveProperty('cacheHits')
        expect(typeof section.isTracked).toBe('boolean')
        expect(typeof section.cacheHits).toBe('number')
      })
    })
  })
})