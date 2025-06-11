import React, { useState, useEffect } from 'react'
import { cacheManager } from '../../lib/cache/CacheManager'
import { getCacheStats, getHitRate, clearAllApiCaches } from '../../lib/cache/ApiCacheService'
import { malRequestManager, jikanRequestManager, animeScheduleRequestManager } from '../../lib/cache/RequestDeduplication'

interface CacheStatsData {
  hitCount: number
  missCount: number
  totalRequests: number
  cacheSize: number
  lastClearTime: number | null
  hitRate: number
}

interface RequestStats {
  mal: any
  jikan: any
  animeSchedule: any
}

export const CacheStats: React.FC = () => {
  const [stats, setStats] = useState<CacheStatsData>({
    hitCount: 0,
    missCount: 0,
    totalRequests: 0,
    cacheSize: 0,
    lastClearTime: null,
    hitRate: 0
  })
  
  const [requestStats, setRequestStats] = useState<RequestStats>({
    mal: { deduplication: { pendingCount: 0, completedCacheSize: 0 }, rateLimit: { queueLength: 0 } },
    jikan: { deduplication: { pendingCount: 0, completedCacheSize: 0 }, rateLimit: { queueLength: 0 } },
    animeSchedule: { deduplication: { pendingCount: 0, completedCacheSize: 0 }, rateLimit: { queueLength: 0 } }
  })

  const [loading, setLoading] = useState(false)

  const updateStats = () => {
    const cacheStats = getCacheStats()
    const hitRate = getHitRate()
    
    setStats({
      ...cacheStats,
      hitRate
    })

    setRequestStats({
      mal: malRequestManager.getStats(),
      jikan: jikanRequestManager.getStats(),
      animeSchedule: animeScheduleRequestManager.getStats()
    })
  }

  useEffect(() => {
    updateStats()
    
    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleClearExpired = async () => {
    setLoading(true)
    try {
      const cleared = await cacheManager.clearExpired()
      console.log(`Cleared ${cleared} expired entries`)
      updateStats()
    } catch (error) {
      console.error('Error clearing expired cache:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    setLoading(true)
    try {
      await clearAllApiCaches()
      await cacheManager.clearAll()
      updateStats()
    } catch (error) {
      console.error('Error clearing all cache:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const getHitRateColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          📊 Cache Statistics
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={updateStats}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleClearExpired}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
            disabled={loading}
          >
            🧹 Clear Expired
          </button>
          <button
            onClick={handleClearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
            disabled={loading}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Main Cache Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Hit Rate</div>
          <div className={`text-2xl font-bold ${getHitRateColor(stats.hitRate)}`}>
            {stats.hitRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {stats.totalRequests.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Cache Size</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {formatBytes(stats.cacheSize)}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Last Clear</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {formatDate(stats.lastClearTime)}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Cache Performance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cache Hits:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {stats.hitCount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cache Misses:</span>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {stats.missCount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
              <span className={`font-medium ${getHitRateColor(stats.hitRate)}`}>
                {stats.totalRequests > 0 
                  ? `${((stats.hitCount / stats.totalRequests) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Request Management</h4>
          <div className="space-y-3 text-sm">
            {Object.entries(requestStats).map(([api, apiStats]) => (
              <div key={api} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0">
                <div className="font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
                  {api === 'animeSchedule' ? 'Anime Schedule' : api.toUpperCase()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pending:</span>
                    <span className="text-orange-600 dark:text-orange-400">
                      {apiStats.deduplication.pendingCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Queue:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {apiStats.rateLimit.queueLength}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cache Effectiveness Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200">Cache Effectiveness</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.hitRate >= 80 
                ? "🟢 Excellent - Cache is performing very well"
                : stats.hitRate >= 60 
                ? "🟡 Good - Cache is helping but could be optimized"
                : stats.hitRate >= 30
                ? "🟠 Fair - Cache is providing some benefit"
                : "🔴 Poor - Cache needs optimization or data patterns analysis"
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Network Requests Saved
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {stats.hitCount > 0 ? `${stats.hitCount}` : '0'}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Processing...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CacheStats