// API-specific cache services
// Provides caching wrappers for MAL, Jikan, and AnimeSchedule APIs

import { cacheManager, CacheConfig } from './CacheManager'

// === BASE CACHE SERVICE ===

export abstract class BaseCacheService {
  protected cache = cacheManager
  protected abstract serviceName: string

  protected createCacheKey(endpoint: string, params?: any, auth?: boolean): string {
    const paramsStr = params ? `:${JSON.stringify(params)}` : ''
    const authStr = auth ? ':auth' : ':public'
    return `${this.serviceName}:${endpoint}${paramsStr}${authStr}`
  }

  protected async cachedRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<T>,
    config: Partial<CacheConfig>
  ): Promise<T> {
    // Try cache first
    const cached = await this.cache.get<T>(cacheKey, config)
    if (cached !== null) {
      return cached
    }

    // Execute request
    const data = await requestFn()

    // Cache the result
    await this.cache.set(cacheKey, data, {
      ttl: config.ttl || 30 * 60 * 1000, // Default 30 minutes
      cacheKey,
      persistent: config.persistent || false,
      ...config
    })

    return data
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return await this.cache.invalidate(`${this.serviceName}:${pattern}`)
  }

  async clearServiceCache(): Promise<number> {
    return await this.cache.invalidate(`${this.serviceName}:*`)
  }
}

// === MAL CACHE SERVICE ===

export class MALCacheService extends BaseCacheService {
  protected serviceName = 'mal'

  // Anime details caching
  async getAnimeDetails<T>(
    id: number,
    requestFn: () => Promise<T>,
    hasAuth: boolean = false
  ): Promise<T> {
    const cacheKey = this.createCacheKey(`anime:${id}`, null, hasAuth)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 2 * 60 * 60 * 1000, // 2 hours - anime details don't change often
      persistent: true, // Keep across sessions
      version: '1.0.0'
    })
  }

  // User anime list caching
  async getUserAnimeList<T>(
    status: string,
    requestFn: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const cacheKey = this.createCacheKey(`user:list:${status}`, { userId }, true)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 5 * 60 * 1000, // 5 minutes - user data changes frequently
      persistent: false, // Don't persist user data
      version: '1.0.0'
    })
  }

  // User anime status caching
  async getUserAnimeStatus<T>(
    animeId: number,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey(`user:status:${animeId}`, null, true)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 10 * 60 * 1000, // 10 minutes
      persistent: false,
      version: '1.0.0'
    })
  }

  // Search results caching
  async searchAnime<T>(
    query: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey('search', { q: query.toLowerCase() })
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 30 * 60 * 1000, // 30 minutes
      persistent: false,
      version: '1.0.0'
    })
  }

  // Ranking/trending anime caching
  async getRankingAnime<T>(
    rankingType: string,
    requestFn: () => Promise<T>,
    hasAuth: boolean = false
  ): Promise<T> {
    const cacheKey = this.createCacheKey(`ranking:${rankingType}`, null, hasAuth)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 15 * 60 * 1000, // 15 minutes - ranking changes relatively often
      persistent: false,
      version: '1.0.0'
    })
  }

  // Seasonal anime caching
  async getSeasonalAnime<T>(
    season: string,
    year: number,
    requestFn: () => Promise<T>,
    hasAuth: boolean = false
  ): Promise<T> {
    const cacheKey = this.createCacheKey(`seasonal:${year}:${season}`, null, hasAuth)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 60 * 60 * 1000, // 1 hour - seasonal data doesn't change much
      persistent: true,
      version: '1.0.0'
    })
  }

  // Invalidate user-specific data when status changes
  async invalidateUserData(animeId?: number): Promise<void> {
    if (animeId) {
      await this.invalidatePattern(`user:status:${animeId}`)
    }
    await this.invalidatePattern('user:list:*')
  }
}

// === JIKAN CACHE SERVICE ===

export class JikanCacheService extends BaseCacheService {
  protected serviceName = 'jikan'

  // Anime details caching
  async getAnimeDetails<T>(
    id: number,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey(`anime:${id}`)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 2 * 60 * 60 * 1000, // 2 hours
      persistent: true,
      version: '1.0.0'
    })
  }

  // Trending/Popular anime caching
  async getTrendingAnime<T>(
    type: 'trending' | 'popular' | 'top',
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey(type)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 15 * 60 * 1000, // 15 minutes - trending data changes relatively quickly
      persistent: false,
      version: '1.0.0'
    })
  }

  // Current season anime caching
  async getCurrentSeasonAnime<T>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey('current-season')
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 60 * 60 * 1000, // 1 hour
      persistent: true,
      version: '1.0.0'
    })
  }

  // Search results caching
  async searchAnime<T>(
    query: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey('search', { q: query.toLowerCase() })
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 30 * 60 * 1000, // 30 minutes
      persistent: false,
      version: '1.0.0'
    })
  }

  // Recommendations caching
  async getRecommendations<T>(
    animeId: number,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey(`recommendations:${animeId}`)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 4 * 60 * 60 * 1000, // 4 hours - recommendations don't change often
      persistent: true,
      version: '1.0.0'
    })
  }

  // Random anime excluded from caching - uses direct API calls for true randomness

  // Generic caching helper for Jikan-specific data
  async cacheJikanData<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    config: {
      ttl: number
      persistent: boolean
    }
  ): Promise<T> {
    const cacheKey = this.createCacheKey(endpoint)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: config.ttl,
      persistent: config.persistent,
      version: '1.0.0'
    })
  }
}

// === ANIME SCHEDULE CACHE SERVICE ===
// Removed: AnimeScheduleCacheService - not used anywhere in the codebase

// === SINGLETON INSTANCES ===

export const malCache = new MALCacheService()
export const jikanCache = new JikanCacheService()

// === UTILITY FUNCTIONS ===

export const clearAllApiCaches = async (): Promise<void> => {
  await Promise.all([
    malCache.clearServiceCache(),
    jikanCache.clearServiceCache()
  ])
}

export const getCacheStats = () => {
  return cacheManager.getStats()
}

export const getHitRate = () => {
  return cacheManager.getHitRate()
}