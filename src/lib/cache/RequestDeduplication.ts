// Request Deduplication Service
// Prevents multiple identical API requests from running simultaneously

export class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>()
  private completedRequests = new Map<string, { timestamp: number; result: any }>()
  
  // Keep completed request results for a short time to serve immediate duplicates
  private readonly COMPLETED_CACHE_TTL = 5000 // 5 seconds

  /**
   * Deduplicate requests by key
   * If the same request is already pending, return the existing promise
   * If recently completed, return cached result
   */
  async dedupedRequest<T>(
    key: string, 
    requestFn: () => Promise<T>,
    options: {
      useCompletedCache?: boolean
      completedCacheTTL?: number
    } = {}
  ): Promise<T> {
    const { 
      useCompletedCache = true, 
      completedCacheTTL = this.COMPLETED_CACHE_TTL 
    } = options

    // Check if we have a recently completed result
    if (useCompletedCache) {
      const completed = this.completedRequests.get(key)
      if (completed && (Date.now() - completed.timestamp) < completedCacheTTL) {
        return completed.result
      }
    }

    // Check if request is already pending
    if (this.pending.has(key)) {
      return this.pending.get(key)!
    }

    // Create new request
    const promise = requestFn()
    this.pending.set(key, promise)

    try {
      const result = await promise
      
      // Cache completed result briefly
      if (useCompletedCache) {
        this.completedRequests.set(key, {
          timestamp: Date.now(),
          result
        })
        
        // Clean up old completed results
        this.cleanupCompletedCache()
      }
      
      return result
    } finally {
      // Always remove from pending
      this.pending.delete(key)
    }
  }

  /**
   * Cancel a pending request
   */
  cancel(key: string): boolean {
    return this.pending.delete(key)
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    this.pending.clear()
  }

  /**
   * Get current pending request count
   */
  getPendingCount(): number {
    return this.pending.size
  }

  /**
   * Get pending request keys
   */
  getPendingKeys(): string[] {
    return Array.from(this.pending.keys())
  }

  /**
   * Check if a request is currently pending
   */
  isPending(key: string): boolean {
    return this.pending.has(key)
  }

  /**
   * Clear completed cache
   */
  clearCompletedCache(): void {
    this.completedRequests.clear()
  }

  /**
   * Get stats about the deduplicator
   */
  getStats() {
    return {
      pendingCount: this.pending.size,
      completedCacheSize: this.completedRequests.size,
      pendingKeys: this.getPendingKeys()
    }
  }

  private cleanupCompletedCache(): void {
    const now = Date.now()
    for (const [key, { timestamp }] of this.completedRequests.entries()) {
      if (now - timestamp > this.COMPLETED_CACHE_TTL) {
        this.completedRequests.delete(key)
      }
    }
  }
}

// === RATE LIMITING WRAPPER ===

export class RateLimitedRequestor {
  private lastRequestTime = 0
  private requestQueue: Array<() => void> = []
  private isProcessingQueue = false

  constructor(
    private minDelay: number = 500, // Minimum delay between requests
    private maxConcurrent: number = 3 // Maximum concurrent requests
  ) {}

  /**
   * Execute request with rate limiting
   */
  async rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          // Ensure minimum delay since last request
          const now = Date.now()
          const timeSinceLastRequest = now - this.lastRequestTime
          
          if (timeSinceLastRequest < this.minDelay) {
            const delayNeeded = this.minDelay - timeSinceLastRequest
            await new Promise(resolve => setTimeout(resolve, delayNeeded))
          }

          this.lastRequestTime = Date.now()
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      const concurrentRequests = this.requestQueue.splice(0, this.maxConcurrent)
      
      // Execute requests concurrently (up to maxConcurrent)
      await Promise.all(concurrentRequests.map(request => request()))
      
      // Small delay between batches
      if (this.requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    this.isProcessingQueue = false
  }

  getQueueLength(): number {
    return this.requestQueue.length
  }
}

// === COMBINED SERVICE ===

export class EnhancedRequestManager {
  private deduplicator = new RequestDeduplicator()
  private rateLimiter: RateLimitedRequestor

  constructor(
    minDelay: number = 500,
    maxConcurrent: number = 3
  ) {
    this.rateLimiter = new RateLimitedRequestor(minDelay, maxConcurrent)
  }

  /**
   * Execute request with both deduplication and rate limiting
   */
  async enhancedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      useDeduplication?: boolean
      useRateLimit?: boolean
      dedupOptions?: Parameters<RequestDeduplicator['dedupedRequest']>[2]
    } = {}
  ): Promise<T> {
    const {
      useDeduplication = true,
      useRateLimit = true,
      dedupOptions = {}
    } = options

    const wrappedRequest = useRateLimit 
      ? () => this.rateLimiter.rateLimitedRequest(requestFn)
      : requestFn

    if (useDeduplication) {
      return this.deduplicator.dedupedRequest(key, wrappedRequest, dedupOptions)
    } else {
      return wrappedRequest()
    }
  }

  /**
   * Get combined stats
   */
  getStats() {
    return {
      deduplication: this.deduplicator.getStats(),
      rateLimit: {
        queueLength: this.rateLimiter.getQueueLength()
      }
    }
  }

  /**
   * Cancel all pending operations
   */
  cancelAll(): void {
    this.deduplicator.cancelAll()
  }
}

// === SINGLETON INSTANCES ===

// Different rate limiters for different APIs
export const malRequestManager = new EnhancedRequestManager(1000, 2) // 1s delay, max 2 concurrent
export const jikanRequestManager = new EnhancedRequestManager(500, 3) // 500ms delay, max 3 concurrent  
export const animeScheduleRequestManager = new EnhancedRequestManager(500, 3) // 500ms delay, max 3 concurrent

// General purpose deduplicator
export const requestDeduplicator = new RequestDeduplicator()

export default {
  malRequestManager,
  jikanRequestManager,
  animeScheduleRequestManager,
  requestDeduplicator
}