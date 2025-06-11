import { useState, useEffect } from 'react'
import { malService } from '../../services/mal'
import { AnimeBase } from '../../types/anime'
import { AnimeCard } from '../AnimeCard/AnimeCard'

const SEASONS = [
  { key: 'winter', label: 'Winter', emoji: '❄️' },
  { key: 'spring', label: 'Spring', emoji: '🌸' },
  { key: 'summer', label: 'Summer', emoji: '☀️' },
  { key: 'fall', label: 'Fall', emoji: '🍂' },
]

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1
  if (month >= 1 && month <= 3) return 'winter'
  if (month >= 4 && month <= 6) return 'spring'
  if (month >= 7 && month <= 9) return 'summer'
  return 'fall'
}

const getCurrentYear = () => new Date().getFullYear()

export const SeasonalAnime = () => {
  const [seasonalAnime, setSeasonalAnime] = useState<AnimeBase[]>([])
  const [upcomingAnime, setUpcomingAnime] = useState<AnimeBase[]>([])
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason())
  const [activeTab, setActiveTab] = useState<'current' | 'seasonal' | 'upcoming'>('current')
  const [loading, setLoading] = useState<{
    current: boolean
    seasonal: boolean
    upcoming: boolean
  }>({
    current: false,
    seasonal: false,
    upcoming: false
  })
  const [error, setError] = useState<string | null>(null)

  const currentSeason = getCurrentSeason()
  const currentYear = getCurrentYear()

  // Available years (current year and a few years back/forward)
  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => currentYear - 2 + i
  )

  const fetchCurrentSeason = async () => {
    setLoading(prev => ({ ...prev, current: true }))
    setError(null)
    try {
      const anime = await malService.getSeasonalAnime(currentSeason, currentYear)
      setSeasonalAnime(anime)
    } catch (err) {
      setError('Failed to fetch current season anime')
      console.error('Current season fetch error:', err)
    } finally {
      setLoading(prev => ({ ...prev, current: false }))
    }
  }

  const fetchSeasonalAnime = async (year: number, season: string) => {
    setLoading(prev => ({ ...prev, seasonal: true }))
    setError(null)
    try {
      const anime = await malService.getSeasonalAnime(season, year)
      setSeasonalAnime(anime)
    } catch (err) {
      setError(`Failed to fetch ${season} ${year} anime`)
      console.error('Seasonal fetch error:', err)
    } finally {
      setLoading(prev => ({ ...prev, seasonal: false }))
    }
  }

  const fetchUpcomingAnime = async () => {
    setLoading(prev => ({ ...prev, upcoming: true }))
    setError(null)
    try {
      const anime = await malService.getUpcomingAnime()
      setUpcomingAnime(anime)
    } catch (err) {
      setError('Failed to fetch upcoming anime')
      console.error('Upcoming fetch error:', err)
    } finally {
      setLoading(prev => ({ ...prev, upcoming: false }))
    }
  }

  useEffect(() => {
    if (activeTab === 'current') {
      fetchCurrentSeason()
    } else if (activeTab === 'seasonal') {
      fetchSeasonalAnime(selectedYear, selectedSeason)
    } else if (activeTab === 'upcoming') {
      fetchUpcomingAnime()
    }
  }, [activeTab, selectedYear, selectedSeason])

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-300 dark:bg-gray-600 rounded-xl h-80 mb-4"></div>
          <div className="space-y-2">
            <div className="bg-gray-300 dark:bg-gray-600 rounded h-4 w-3/4"></div>
            <div className="bg-gray-300 dark:bg-gray-600 rounded h-3 w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const currentSeasonInfo = SEASONS.find(s => s.key === currentSeason)
  const selectedSeasonInfo = SEASONS.find(s => s.key === selectedSeason)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-theme">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            🗓️ Seasonal Anime
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>🌐</span>
            <span>Powered by Jikan</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'current'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {currentSeasonInfo?.emoji} Current Season
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'seasonal'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            📅 Browse Seasons
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🚀 Upcoming
          </button>
        </div>

        {/* Season/Year Selectors for Browse tab */}
        {activeTab === 'seasonal' && (
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Season
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {SEASONS.map(season => (
                  <option key={season.key} value={season.key}>
                    {season.emoji} {season.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Current Season */}
        {activeTab === 'current' && (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {currentSeasonInfo?.emoji} {currentSeasonInfo?.label} {currentYear}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Currently airing anime this season
              </p>
            </div>

            {loading.current ? (
              <LoadingSkeleton />
            ) : seasonalAnime.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {seasonalAnime.map((anime) => (
                  <AnimeCard key={`current-${anime.id}`} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{currentSeasonInfo?.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Current Season Data
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Unable to load current season anime at this time.
                </p>
              </div>
            )}
          </>
        )}

        {/* Seasonal Browse */}
        {activeTab === 'seasonal' && (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {selectedSeasonInfo?.emoji} {selectedSeasonInfo?.label} {selectedYear}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Anime from {selectedSeasonInfo?.label.toLowerCase()} {selectedYear}
              </p>
            </div>

            {loading.seasonal ? (
              <LoadingSkeleton />
            ) : seasonalAnime.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {seasonalAnime.map((anime) => (
                  <AnimeCard key={`seasonal-${anime.id}`} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{selectedSeasonInfo?.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Anime Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No anime data available for {selectedSeasonInfo?.label} {selectedYear}.
                </p>
              </div>
            )}
          </>
        )}

        {/* Upcoming */}
        {activeTab === 'upcoming' && (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                🚀 Upcoming Anime
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Anime scheduled to air in future seasons
              </p>
            </div>

            {loading.upcoming ? (
              <LoadingSkeleton />
            ) : upcomingAnime.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {upcomingAnime.map((anime) => (
                  <AnimeCard key={`upcoming-${anime.id}`} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Upcoming Anime
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No upcoming anime data available at this time.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}