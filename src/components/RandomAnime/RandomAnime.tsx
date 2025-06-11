import { useState } from 'react'
import { AnimeBase } from '../../types/anime'
import { malService } from '../../services/mal'
import { AnimeCard } from '../AnimeCard/AnimeCard'
import { AnimatedButton } from '../AnimatedButton/AnimatedButton'

export const RandomAnime = () => {
  const [randomAnime, setRandomAnime] = useState<AnimeBase | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRandomAnime = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const anime = await malService.getRandomAnime()
      setRandomAnime(anime)
    } catch (err) {
      setError('Failed to fetch random anime. Please try again.')
      console.error('Random anime fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-theme">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          🎲 Surprise Me!
        </h2>
        <AnimatedButton
          onClick={fetchRandomAnime}
          disabled={loading}
          variant="primary"
          size="md"
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Finding...
            </>
          ) : (
            <>
              <span className="mr-2">🔄</span>
              Get Random Anime
            </>
          )}
        </AnimatedButton>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {!randomAnime && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Discover Something New
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Click the button above to discover a random anime recommendation from Jikan's vast database.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <span>🎪</span>
              <span>All genres included</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>📚</span>
              <span>Classic & modern anime</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>⭐</span>
              <span>Quality recommendations</span>
            </div>
          </div>
        </div>
      )}

      {randomAnime && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <span className="mr-1">🎲</span>
              Random Discovery
            </span>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <AnimeCard anime={randomAnime} />
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Not your style? Try another random pick!
            </p>
            <AnimatedButton
              onClick={fetchRandomAnime}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              <span className="mr-2">🔄</span>
              Try Another
            </AnimatedButton>
          </div>
        </div>
      )}
    </div>
  )
}