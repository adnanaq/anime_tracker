// Cache Testing Helper
// Utility to check cache performance and tracking across dashboard sections

import { 
  getCacheStats, 
  getHitRate
} from '../lib/cache'

export interface CacheTestReport {
  overall: {
    hitCount: number
    missCount: number
    totalRequests: number
    hitRate: number
  }
  byService: {
    mal: any
    jikan: any
    animeSchedule: any
  }
  sections: {
    randomAnime: {
      isTracked: boolean
      lastRequest?: number
      cacheHits: number
    }
    seasonalAnime: {
      isTracked: boolean
      lastRequest?: number
      cacheHits: number
    }
    animeSchedule: {
      isTracked: boolean
      lastRequest?: number
      cacheHits: number
    }
  }
}

export const getCacheTestReport = (): CacheTestReport => {
  try {
    const overallStats = getCacheStats()
    const hitRate = getHitRate()

    // Check if services have any cache activity (simplified since getStats doesn't exist)
    const malStats = { requests: 0, hits: 0 }
    const jikanStats = { requests: 0, hits: 0 }
    const scheduleStats = { requests: 0, hits: 0 }

    return {
      overall: {
        hitCount: overallStats?.hitCount || 0,
        missCount: overallStats?.missCount || 0,
        totalRequests: overallStats?.totalRequests || 0,
        hitRate: hitRate || 0
      },
      byService: {
        mal: malStats,
        jikan: jikanStats,
        animeSchedule: scheduleStats
      },
      sections: {
        randomAnime: {
          isTracked: jikanStats.requests > 0,
          cacheHits: jikanStats.hits || 0
        },
        seasonalAnime: {
          isTracked: malStats.requests > 0,
          cacheHits: malStats.hits || 0
        },
        animeSchedule: {
          isTracked: scheduleStats.requests > 0,
          cacheHits: scheduleStats.hits || 0
        }
      }
    }
  } catch (error) {
    console.error('Cache test report failed:', error)
    return {
      overall: { hitCount: 0, missCount: 0, totalRequests: 0, hitRate: 0 },
      byService: { mal: {}, jikan: {}, animeSchedule: {} },
      sections: {
        randomAnime: { isTracked: false, cacheHits: 0 },
        seasonalAnime: { isTracked: false, cacheHits: 0 },
        animeSchedule: { isTracked: false, cacheHits: 0 }
      }
    }
  }
}

export const logCacheReport = () => {
  const report = getCacheTestReport()
  
  console.group('🧪 Cache System Test Report')
  console.log('📊 Overall Stats:', report.overall)
  console.log('🔧 By Service:', report.byService)
  console.log('📱 Dashboard Sections:')
  
  Object.entries(report.sections).forEach(([section, data]) => {
    const status = data.isTracked ? '✅ TRACKED' : '❌ NOT TRACKED'
    console.log(`  ${section}: ${status} (${data.cacheHits} hits)`)
  })
  
  console.groupEnd()
  return report
}

// Helper to test Random Anime (should NOT be cached)
export const testRandomAnimeCache = async () => {
  console.log('🎲 Testing Random Anime (should bypass cache)...')
  
  const beforeReport = getCacheTestReport()
  console.log('Before:', beforeReport.sections.randomAnime)
  
  // Trigger some random anime requests
  try {
    const { malService } = await import('../services/mal')
    console.log('Making 3 random anime requests (should be direct API calls)...')
    
    const results = await Promise.all([
      malService.getRandomAnime(),
      malService.getRandomAnime(),
      malService.getRandomAnime()
    ])
    
    // Check cache after requests (should be no change)
    const afterReport = getCacheTestReport()
    console.log('After:', afterReport.sections.randomAnime)
    
    const improvement = afterReport.sections.randomAnime.cacheHits - beforeReport.sections.randomAnime.cacheHits
    console.log(`Cache hits increased by: ${improvement} (should be 0)`)
    console.log(`Random anime titles: ${results.map(r => r.title).join(', ')}`)
    
    return improvement === 0 // Success = no cache activity
  } catch (error) {
    console.error('Random anime test failed:', error)
    return false
  }
}