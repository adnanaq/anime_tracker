// Cache System Exports
// Centralized exports for the caching system

// Core cache manager
export { CacheManager, cacheManager } from './CacheManager'
export type { CacheConfig, CacheEntry, CacheStats } from './CacheManager'

// API-specific cache services
export { 
  BaseCacheService,
  MALCacheService,
  JikanCacheService,
  AnimeScheduleCacheService,
  malCache,
  jikanCache,
  animeScheduleCache,
  clearAllApiCaches,
  getCacheStats,
  getHitRate
} from './ApiCacheService'

// Request deduplication and rate limiting
export {
  RequestDeduplicator,
  RateLimitedRequestor,
  EnhancedRequestManager,
  malRequestManager,
  jikanRequestManager,
  animeScheduleRequestManager,
  requestDeduplicator
} from './RequestDeduplication'

// === CONVENIENCE FUNCTIONS ===

/**
 * Initialize the cache system
 * Call this during app startup
 */
export const initializeCacheSystem = async (): Promise<void> => {
  console.log('🚀 Initializing AnimeTracker cache system...')
  
  // The cache manager initializes itself, but we can add any
  // additional setup here if needed in the future
  
  console.log('✅ Cache system initialized')
}

/**
 * Get comprehensive cache statistics (simplified for now)
 */
export const getComprehensiveCacheStats = () => {
  try {
    const cacheStats = getCacheStats()
    const hitRate = getHitRate()
    
    return {
      cache: {
        ...cacheStats,
        hitRate,
        efficiency: cacheStats.totalRequests > 0 
          ? (cacheStats.hitCount / cacheStats.totalRequests) * 100 
          : 0
      },
      requestManagers: {
        mal: malRequestManager.getStats(),
        jikan: jikanRequestManager.getStats(),
        animeSchedule: animeScheduleRequestManager.getStats()
      }
    }
  } catch (error) {
    console.warn('Cache stats temporarily unavailable:', error)
    return {
      cache: { hitCount: 0, missCount: 0, totalRequests: 0, cacheSize: 0, hitRate: 0, efficiency: 0 },
      requestManagers: { mal: {}, jikan: {}, animeSchedule: {} }
    }
  }
}

/**
 * Emergency cache clear - clears everything (simplified for now)
 */
export const emergencyCacheClear = async (): Promise<void> => {
  console.log('🆘 Emergency cache clear initiated...')
  
  try {
    await Promise.all([
      clearAllApiCaches(),
      cacheManager.clearAll()
    ])
    
    // Cancel any pending requests
    malRequestManager.cancelAll()
    jikanRequestManager.cancelAll()
    animeScheduleRequestManager.cancelAll()
    
    console.log('🧹 Emergency cache clear completed')
  } catch (error) {
    console.warn('Cache clear temporarily unavailable:', error)
  }
}

/**
 * Health check for cache system (simplified for now)
 */
export const cacheHealthCheck = () => {
  try {
    const stats = getComprehensiveCacheStats()
    
    return {
      isHealthy: true,
      hitRate: stats.cache.hitRate,
      totalRequests: stats.cache.totalRequests,
      cacheSize: stats.cache.cacheSize,
      pendingRequests: 0, // Simplified for now
      recommendations: []
    }
  } catch (error) {
    console.warn('Cache health check temporarily unavailable:', error)
    return {
      isHealthy: false,
      hitRate: 0,
      totalRequests: 0,
      cacheSize: 0,
      pendingRequests: 0,
      recommendations: ['Cache system needs initialization']
    }
  }
}

/**
 * Generate cache optimization recommendations (simplified for now)
 */
const generateCacheRecommendations = (stats: any) => {
  const recommendations: string[] = []
  
  try {
    const { hitRate, totalRequests } = stats.cache
    
    if (hitRate < 30 && totalRequests > 50) {
      recommendations.push('Cache hit rate is low. Consider reviewing cache TTL settings.')
    }
    
    if (hitRate > 95 && totalRequests > 100) {
      recommendations.push('Excellent cache performance! Consider extending TTL for some data types.')
    }
  } catch (error) {
    recommendations.push('Cache analysis temporarily unavailable')
  }
  
  return recommendations
}

// === CACHE STRATEGIES ===

export const CACHE_STRATEGIES = {
  // Static data that rarely changes
  STATIC: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    persistent: true,
    staleTime: 12 * 60 * 60 * 1000 // 12 hours
  },
  
  // Semi-static data (anime details, genres)
  SEMI_STATIC: {
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    persistent: true,
    staleTime: 1 * 60 * 60 * 1000 // 1 hour
  },
  
  // Dynamic data (trending, popular)
  DYNAMIC: {
    ttl: 15 * 60 * 1000, // 15 minutes
    persistent: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  },
  
  // User data (personal lists, status)
  USER_DATA: {
    ttl: 5 * 60 * 1000, // 5 minutes
    persistent: false,
    staleTime: 2 * 60 * 1000 // 2 minutes
  },
  
  // Search results
  SEARCH: {
    ttl: 30 * 60 * 1000, // 30 minutes
    persistent: false,
    staleTime: 15 * 60 * 1000 // 15 minutes
  },
  
  // Real-time data (schedule, currently airing)
  REAL_TIME: {
    ttl: 2 * 60 * 1000, // 2 minutes
    persistent: false,
    staleTime: 1 * 60 * 1000 // 1 minute
  }
} as const

// Default export for convenience (simplified for now)
const cacheSystem = {
  // Core
  get cacheManager() { return cacheManager },
  
  // Services
  get malCache() { return malCache },
  get jikanCache() { return jikanCache },
  get animeScheduleCache() { return animeScheduleCache },
  
  // Request management
  get malRequestManager() { return malRequestManager },
  get jikanRequestManager() { return jikanRequestManager },
  get animeScheduleRequestManager() { return animeScheduleRequestManager },
  
  // Utilities
  initializeCacheSystem,
  getComprehensiveCacheStats,
  emergencyCacheClear,
  cacheHealthCheck,
  
  // Constants
  CACHE_STRATEGIES
}

export default cacheSystem