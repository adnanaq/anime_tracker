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
      console.log(`💾 Cache hit for: ${cacheKey}`)
      return cached
    }

    // Execute request
    console.log(`🌐 Cache miss, fetching: ${cacheKey}`)
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

  // Random anime caching (small cache to avoid immediate repeats)
  async getRandomAnime<T>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    const timestamp = Math.floor(Date.now() / (15 * 60 * 1000)) // 15 minute buckets
    const cacheKey = this.createCacheKey(`random:${timestamp}`)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 15 * 60 * 1000, // 15 minutes
      persistent: false,
      version: '1.0.0'
    })
  }
}

// === ANIME SCHEDULE CACHE SERVICE ===

export class AnimeScheduleCacheService extends BaseCacheService {
  protected serviceName = 'schedule'

  // Adaptive TTL based on episode air time
  private getAdaptiveTTL(episodeDate?: string): number {
    if (!episodeDate) return 6 * 60 * 60 * 1000 // 6 hours default

    const now = new Date()
    const airDate = new Date(episodeDate)
    const timeDiff = airDate.getTime() - now.getTime()

    if (timeDiff > 24 * 60 * 60 * 1000) {
      // Episode is >24h away: cache for 6 hours
      return 6 * 60 * 60 * 1000
    } else if (timeDiff > 60 * 60 * 1000) {
      // Episode is 1-24h away: cache for 30 minutes
      return 30 * 60 * 1000
    } else if (timeDiff > 0) {
      // Episode is <1h away: cache for 5 minutes
      return 5 * 60 * 1000
    } else {
      // Episode is airing or recently aired: cache for 2 minutes
      return 2 * 60 * 1000
    }
  }

  // Weekly schedule caching with adaptive TTL
  async getWeeklySchedule<T>(
    timezone: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey('weekly', { timezone })
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 30 * 60 * 1000, // 30 minutes default
      persistent: false,
      version: '1.0.0'
    })
  }

  // Daily schedule caching
  async getDaySchedule<T>(
    date: string,
    timezone: string,
    requestFn: () => Promise<T>,
    episodeDates?: string[]
  ): Promise<T> {
    const cacheKey = this.createCacheKey('day', { date, timezone })
    
    // Use adaptive TTL based on earliest episode
    const earliestEpisode = episodeDates?.sort()[0]
    const ttl = this.getAdaptiveTTL(earliestEpisode)
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl,
      persistent: false,
      version: '1.0.0'
    })
  }

  // Upcoming episodes caching (most time-sensitive)
  async getUpcomingEpisodes<T>(
    days: number,
    timezone: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.createCacheKey('upcoming', { days, timezone })
    
    return this.cachedRequest(cacheKey, requestFn, {
      ttl: 5 * 60 * 1000, // 5 minutes - this needs to be fresh
      persistent: false,
      version: '1.0.0'
    })
  }

  // Invalidate schedule data when time-sensitive
  async invalidateTimeData(): Promise<void> {
    const now = new Date()
    const hour = now.getHours()
    
    // During prime anime hours (evening JST), invalidate more aggressively
    if (hour >= 18 && hour <= 23) { // 6 PM - 11 PM
      await this.invalidatePattern('*')
    } else {
      await this.invalidatePattern('upcoming:*')
    }
  }
}

// === SINGLETON INSTANCES ===

export const malCache = new MALCacheService()
export const jikanCache = new JikanCacheService()
export const animeScheduleCache = new AnimeScheduleCacheService()

// === UTILITY FUNCTIONS ===

export const clearAllApiCaches = async (): Promise<void> => {
  await Promise.all([
    malCache.clearServiceCache(),
    jikanCache.clearServiceCache(),
    animeScheduleCache.clearServiceCache()
  ])
  console.log('🧹 Cleared all API caches')
}

export const getCacheStats = () => {
  return cacheManager.getStats()
}

export const getHitRate = () => {
  return cacheManager.getHitRate()
}