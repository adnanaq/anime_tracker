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
  malCache,
  jikanCache,
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

// Import for local use
import { cacheManager } from './CacheManager'
import { 
  malCache, 
  jikanCache, 
  clearAllApiCaches 
} from './ApiCacheService'

// === CONVENIENCE FUNCTIONS ===

/**
 * Initialize the cache system
 * Call this during app startup
 */
export const initializeCacheSystem = async (): Promise<void> => {
  
  // The cache manager initializes itself, but we can add any
  // additional setup here if needed in the future
  
}

/**
 * Get comprehensive cache statistics (simplified for now)
 * TODO: Complete implementation when cache system is fully functional
 */
export const getComprehensiveCacheStats = () => {
  // Simplified implementation until cache system is fully functional
  return {
    cache: { hitCount: 0, missCount: 0, totalRequests: 0, cacheSize: 0, hitRate: 0, efficiency: 0 },
    requestManagers: {
      mal: { pending: 0, completed: 0 },
      jikan: { pending: 0, completed: 0 },
      animeSchedule: { pending: 0, completed: 0 }
    }
  }
}

/**
 * Emergency cache clear - clears everything (simplified for now)
 */
export const emergencyCacheClear = async (): Promise<void> => {
  
  try {
    // Use imported functions
    await Promise.all([
      clearAllApiCaches(),
      cacheManager.clearAll()
    ])
    
    // TODO: Cancel any pending requests when request managers are fully implemented
    
  } catch (error) {
    console.error('Failed to clear cache:', error)
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

// Cache optimization recommendations removed - unused for now

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
  
  // Request management - TODO: implement when managers are fully functional
  // get malRequestManager() { return malRequestManager },
  // get jikanRequestManager() { return jikanRequestManager },
  // get animeScheduleRequestManager() { return animeScheduleRequestManager },
  
  // Utilities
  initializeCacheSystem,
  getComprehensiveCacheStats,
  emergencyCacheClear,
  cacheHealthCheck,
  
  // Constants
  CACHE_STRATEGIES
}

export default cacheSystem