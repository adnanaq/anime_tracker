import { useState, useEffect } from 'react'
import { malService } from '../../services/mal'
import { AnimeBase } from '../../types/anime'
import { AnimeCard } from '../AnimeCard/AnimeCard'
import { AnimatedButton } from '../AnimatedButton/AnimatedButton'
import { Typography } from '../ui'

const ANIME_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'tv', label: 'TV Series' },
  { value: 'movie', label: 'Movie' },
  { value: 'ova', label: 'OVA' },
  { value: 'special', label: 'Special' },
  { value: 'ona', label: 'ONA' },
  { value: 'music', label: 'Music' },
]

const ANIME_STATUS = [
  { value: '', label: 'All Status' },
  { value: 'airing', label: 'Currently Airing' },
  { value: 'complete', label: 'Completed' },
  { value: 'upcoming', label: 'Upcoming' },
]

const ANIME_RATINGS = [
  { value: '', label: 'All Ratings' },
  { value: 'g', label: 'G - All Ages' },
  { value: 'pg', label: 'PG - Children' },
  { value: 'pg13', label: 'PG-13 - Teens 13+' },
  { value: 'r17', label: 'R - 17+ (violence/profanity)' },
  { value: 'r', label: 'R+ - Mild Nudity' },
]

interface SearchParams {
  query: string
  type: string
  status: string
  rating: string
  genre: string
  minScore: number
  maxScore: number
}

export const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    type: '',
    status: '',
    rating: '',
    genre: '',
    minScore: 0,
    maxScore: 10,
  })
  const [results, setResults] = useState<AnimeBase[]>([])
  const [genres, setGenres] = useState<Array<{ mal_id: number; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await malService.getGenres()
        setGenres(genreList.slice(0, 20)) // Limit to first 20 genres for UI
      } catch (err) {
        console.error('Failed to fetch genres:', err)
      }
    }
    
    fetchGenres()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const params: any = {}
      
      if (searchParams.query.trim()) params.query = searchParams.query.trim()
      if (searchParams.type) params.type = searchParams.type
      if (searchParams.status) params.status = searchParams.status
      if (searchParams.rating) params.rating = searchParams.rating
      if (searchParams.genre) params.genre = searchParams.genre
      if (searchParams.minScore > 0) params.min_score = searchParams.minScore
      if (searchParams.maxScore < 10) params.max_score = searchParams.maxScore
      params.limit = 24

      const searchResults = await malService.advancedSearchAnime(params)
      setResults(searchResults)
    } catch (err) {
      setError('Failed to search anime. Please try again.')
      console.error('Advanced search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSearchParams({
      query: '',
      type: '',
      status: '',
      rating: '',
      genre: '',
      minScore: 0,
      maxScore: 10,
    })
    setResults([])
    setHasSearched(false)
    setError(null)
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-300 dark:bg-gray-600 rounded-xl h-64 mb-2"></div>
          <div className="space-y-2">
            <div className="bg-gray-300 dark:bg-gray-600 rounded h-4 w-3/4"></div>
            <div className="bg-gray-300 dark:bg-gray-600 rounded h-3 w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-theme">
      {/* Header */}
      <div className="p-6 at-border-secondary border-b">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3" className="font-bold">
            🔍 Advanced Search
          </Typography>
          <Typography variant="bodySmall" color="secondary" className="flex items-center space-x-2">
            <span>🌐</span>
            <span>Powered by MyAnimeList</span>
          </Typography>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Query
            </label>
            <input
              type="text"
              value={searchParams.query}
              onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
              placeholder="Enter anime title, character, or keyword..."
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={searchParams.type}
                onChange={(e) => setSearchParams(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {ANIME_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={searchParams.status}
                onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {ANIME_STATUS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <select
                value={searchParams.rating}
                onChange={(e) => setSearchParams(prev => ({ ...prev, rating: e.target.value }))}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {ANIME_RATINGS.map(rating => (
                  <option key={rating.value} value={rating.value}>{rating.label}</option>
                ))}
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={searchParams.genre}
                onChange={(e) => setSearchParams(prev => ({ ...prev, genre: e.target.value }))}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre.mal_id} value={genre.mal_id}>{genre.name}</option>
                ))}
              </select>
            </div>

            {/* Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Score: {searchParams.minScore}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={searchParams.minScore}
                onChange={(e) => setSearchParams(prev => ({ ...prev, minScore: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Score: {searchParams.maxScore}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={searchParams.maxScore}
                onChange={(e) => setSearchParams(prev => ({ ...prev, maxScore: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <AnimatedButton
              onClick={handleSearch}
              disabled={loading}
              variant="primary"
              size="md"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  Search Anime
                </>
              )}
            </AnimatedButton>

            <AnimatedButton
              onClick={handleReset}
              variant="ghost"
              size="md"
            >
              <span className="mr-2">🔄</span>
              Reset Filters
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : hasSearched ? (
          results.length > 0 ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Search Results ({results.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {results.map((anime) => (
                  <AnimeCard key={`search-${anime.id}`} anime={anime} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤷‍♂️</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria or removing some filters.
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Advanced Anime Search
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Use the filters above to find exactly what you're looking for.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <span>📺</span>
                <span>Type & Status filters</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>🏷️</span>
                <span>Genre selection</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>⭐</span>
                <span>Score range filtering</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}