import { useState, useEffect } from 'react'
import { malService } from '../../services/mal'
import { AnimeBase } from '../../types/anime'
import { BaseAnimeCard } from '../ui/BaseAnimeCard'
import { Typography, Button, AnimeGridSkeleton } from '../ui'

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

  const LoadingSkeleton = () => <AnimeGridSkeleton count={10} showDetails />

  const currentSeasonInfo = SEASONS.find(s => s.key === currentSeason)
  const selectedSeasonInfo = SEASONS.find(s => s.key === selectedSeason)

  return (
    <div className="at-bg-surface rounded-xl at-shadow-lg at-transition">
      {/* Header */}
      <div className="p-6 at-border-b">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h2">
            🗓️ Seasonal Anime
          </Typography>
          <div className="flex items-center space-x-2">
            <span>🌐</span>
            <Typography variant="bodySmall" color="muted">Powered by Jikan</Typography>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-4">
          <Button
            onClick={() => setActiveTab('current')}
            variant={activeTab === 'current' ? 'primary' : 'ghost'}
            size="sm"
          >
            {currentSeasonInfo?.emoji} Current Season
          </Button>
          <Button
            onClick={() => setActiveTab('seasonal')}
            variant={activeTab === 'seasonal' ? 'warning' : 'ghost'}
            size="sm"
          >
            📅 Browse Seasons
          </Button>
          <Button
            onClick={() => setActiveTab('upcoming')}
            variant={activeTab === 'upcoming' ? 'secondary' : 'ghost'}
            size="sm"
          >
            🚀 Upcoming
          </Button>
        </div>

        {/* Season/Year Selectors for Browse tab */}
        {activeTab === 'seasonal' && (
          <div className="flex flex-wrap gap-4">
            <div>
              <Typography variant="bodySmall" weight="medium" className="block mb-2">
                Year
              </Typography>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="at-bg-surface at-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 at-text-primary"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <Typography variant="bodySmall" weight="medium" className="block mb-2">
                Season
              </Typography>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="at-bg-surface at-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 at-text-primary"
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
          <div className="at-bg-danger/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <Typography variant="body" className="text-red-700 dark:text-red-300">{error}</Typography>
            </div>
          </div>
        )}

        {/* Current Season */}
        {activeTab === 'current' && (
          <>
            {loading.current ? (
              <LoadingSkeleton />
            ) : seasonalAnime.length > 0 ? (
              <div className="space-y-4">
                <Typography variant="h3" className="mb-4">
                  {currentSeasonInfo?.emoji} {currentSeasonInfo?.label} {currentYear} - Currently Airing
                </Typography>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {seasonalAnime.map((anime) => (
                    <BaseAnimeCard
                      key={anime.id}
                      anime={anime}
                      expandable={false}
                      autoLoop={false}
                      className="mx-auto"
                    />
                  ))}
                </div>
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
            {loading.seasonal ? (
              <LoadingSkeleton />
            ) : seasonalAnime.length > 0 ? (
              <div className="space-y-4">
                <Typography variant="h3" className="mb-4">
                  {selectedSeasonInfo?.emoji} {selectedSeasonInfo?.label} {selectedYear}
                </Typography>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {seasonalAnime.map((anime) => (
                    <BaseAnimeCard
                      key={anime.id}
                      anime={anime}
                      expandable={false}
                      autoLoop={false}
                      className="mx-auto"
                    />
                  ))}
                </div>
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
            {loading.upcoming ? (
              <LoadingSkeleton />
            ) : upcomingAnime.length > 0 ? (
              <div className="space-y-4">
                <Typography variant="h3" className="mb-4">
                  🚀 Upcoming Anime
                </Typography>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {upcomingAnime.map((anime) => (
                    <BaseAnimeCard
                      key={anime.id}
                      anime={anime}
                      expandable={false}
                      autoLoop={false}
                      className="mx-auto"
                    />
                  ))}
                </div>
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