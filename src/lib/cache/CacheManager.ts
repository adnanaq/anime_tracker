// Universal Cache Manager for REST APIs
// Handles caching for MAL, Jikan, and AnimeSchedule APIs

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  staleTime?: number // Time before data is considered stale (optional)
  cacheKey: string
  version?: string // For cache versioning
  persistent?: boolean // Whether to persist in IndexedDB
}

export interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
  version: string
  staleTime?: number
  cacheKey: string
}

export interface CacheStats {
  hitCount: number
  missCount: number
  totalRequests: number
  cacheSize: number
  lastClearTime: number | null
}

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry>()
  private persistentKeys = new Set<string>()
  private stats: CacheStats = {
    hitCount: 0,
    missCount: 0,
    totalRequests: 0,
    cacheSize: 0,
    lastClearTime: null
  }
  
  // Default cache version for invalidation
  private readonly DEFAULT_VERSION = '1.0.0'
  
  // IndexedDB instance (will be initialized lazily)
  private db: IDBDatabase | null = null
  private dbInitialized = false

  constructor() {
    this.initializeIndexedDB()
    this.setupPeriodicCleanup()
  }

  // === PUBLIC API ===

  /**
   * Get data from cache (memory first, then IndexedDB)
   */
  async get<T>(key: string, _config?: Partial<CacheConfig>): Promise<T | null> {
    this.stats.totalRequests++
    
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      this.stats.hitCount++
      
      // Check if stale but still valid
      if (this.isStaleEntry(memoryEntry)) {
      }
      
      return memoryEntry.data as T
    }

    // Try persistent cache if key is marked as persistent
    if (this.persistentKeys.has(key) && this.db) {
      const persistentEntry = await this.getPersistentEntry<T>(key)
      if (persistentEntry && this.isValidEntry(persistentEntry)) {
        // Restore to memory cache
        this.memoryCache.set(key, persistentEntry)
        this.stats.hitCount++
        return persistentEntry.data
      }
    }

    this.stats.missCount++
    return null
  }

  /**
   * Set data in cache (memory and optionally IndexedDB)
   */
  async set<T>(key: string, data: T, config: CacheConfig): Promise<void> {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: config.ttl,
      version: config.version || this.DEFAULT_VERSION,
      staleTime: config.staleTime,
      cacheKey: key
    }

    // Always store in memory
    this.memoryCache.set(key, entry)
    
    // Store in IndexedDB if persistent
    if (config.persistent && this.db) {
      this.persistentKeys.add(key)
      await this.setPersistentEntry(key, entry)
    }

    this.updateCacheSize()
    
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidate(pattern: string): Promise<number> {
    let invalidatedCount = 0
    
    // Handle exact key match
    if (!pattern.includes('*')) {
      if (this.memoryCache.has(pattern)) {
        this.memoryCache.delete(pattern)
        invalidatedCount++
      }
      
      if (this.persistentKeys.has(pattern) && this.db) {
        await this.deletePersistentEntry(pattern)
        this.persistentKeys.delete(pattern)
      }
      
      return invalidatedCount
    }

    // Handle pattern matching (e.g., "user:*", "mal:anime:*")
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    
    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
        invalidatedCount++
      }
    }

    // Invalidate persistent cache
    if (this.db) {
      const keysToDelete: string[] = []
      for (const key of this.persistentKeys) {
        if (regex.test(key)) {
          keysToDelete.push(key)
        }
      }
      
      for (const key of keysToDelete) {
        await this.deletePersistentEntry(key)
        this.persistentKeys.delete(key)
        invalidatedCount++
      }
    }

    this.updateCacheSize()
    return invalidatedCount
  }

  /**
   * Clear expired entries from cache
   */
  async clearExpired(): Promise<number> {
    let clearedCount = 0
    const now = Date.now()

    // Clear expired memory entries
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValidEntry(entry, now)) {
        this.memoryCache.delete(key)
        clearedCount++
      }
    }

    // Clear expired persistent entries
    if (this.db) {
      const expiredKeys: string[] = []
      const transaction = this.db.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.getAll()

      request.onsuccess = () => {
        const entries = request.result as CacheEntry[]
        for (const entry of entries) {
          if (!this.isValidEntry(entry, now)) {
            expiredKeys.push(entry.cacheKey)
          }
        }
      }

      await new Promise((resolve) => {
        transaction.oncomplete = resolve
      })

      for (const key of expiredKeys) {
        await this.deletePersistentEntry(key)
        this.persistentKeys.delete(key)
        clearedCount++
      }
    }

    this.updateCacheSize()
    return clearedCount
  }

  /**
   * Clear all cache data
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear()
    this.persistentKeys.clear()
    
    if (this.db) {
      const transaction = this.db.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      store.clear()
      
      await new Promise((resolve) => {
        transaction.oncomplete = resolve
      })
    }

    this.stats.lastClearTime = Date.now()
    this.updateCacheSize()
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Check if a key exists in cache
   */
  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null
  }

  /**
   * Get cache hit rate percentage
   */
  getHitRate(): number {
    if (this.stats.totalRequests === 0) return 0
    return (this.stats.hitCount / this.stats.totalRequests) * 100
  }

  // === PRIVATE METHODS ===

  private isValidEntry(entry: CacheEntry, now: number = Date.now()): boolean {
    return (now - entry.timestamp) < entry.ttl
  }

  private isStaleEntry(entry: CacheEntry, now: number = Date.now()): boolean {
    if (!entry.staleTime) return false
    return (now - entry.timestamp) > entry.staleTime
  }

  private async initializeIndexedDB(): Promise<void> {
    if (typeof window === 'undefined' || this.dbInitialized) return

    try {
      const request = indexedDB.open('AnimeTrackerCache', 1)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'cacheKey' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('version', 'version', { unique: false })
        }
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        this.dbInitialized = true
      }

      request.onerror = (_event) => {
        this.dbInitialized = false
      }
    } catch (error) {
      this.dbInitialized = false
    }
  }

  private async getPersistentEntry<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.db) return null

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        resolve(null)
      }
    })
  }

  private async setPersistentEntry<T>(_key: string, entry: CacheEntry<T>): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async deletePersistentEntry(key: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private updateCacheSize(): void {
    let totalSize = 0
    
    // Estimate memory cache size
    for (const entry of this.memoryCache.values()) {
      totalSize += JSON.stringify(entry).length
    }
    
    this.stats.cacheSize = totalSize
  }

  private setupPeriodicCleanup(): void {
    // Clean up expired entries every 10 minutes
    setInterval(() => {
      this.clearExpired()
    }, 10 * 60 * 1000)
  }
}

// Singleton instance
export const cacheManager = new CacheManager()

// Types are already exported as interfaces above