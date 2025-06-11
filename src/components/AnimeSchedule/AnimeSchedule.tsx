import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { animeScheduleService } from '../../services/animeSchedule'
import { jikanService } from '../../services/jikan'
import { AnimeBase } from '../../types/anime'

// Common timezones for the dropdown
const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', emoji: '🌍' },
  { value: 'America/New_York', label: 'Eastern Time (US)', emoji: '🇺🇸' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)', emoji: '🇺🇸' },
  { value: 'America/Chicago', label: 'Central Time (US)', emoji: '🇺🇸' },
  { value: 'Europe/London', label: 'British Time', emoji: '🇬🇧' },
  { value: 'Europe/Paris', label: 'Central European Time', emoji: '🇪🇺' },
  { value: 'Europe/Berlin', label: 'Central European Time', emoji: '🇩🇪' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time', emoji: '🇯🇵' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time', emoji: '🇰🇷' },
  { value: 'Asia/Shanghai', label: 'China Standard Time', emoji: '🇨🇳' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time', emoji: '🇦🇺' },
  { value: 'Asia/Kolkata', label: 'India Standard Time', emoji: '🇮🇳' },
]

// Function to detect user's timezone
const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    return 'UTC'
  }
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', emoji: '🌙' },
  { key: 'tuesday', label: 'Tuesday', emoji: '🔥' },
  { key: 'wednesday', label: 'Wednesday', emoji: '🌸' },
  { key: 'thursday', label: 'Thursday', emoji: '⚡' },
  { key: 'friday', label: 'Friday', emoji: '🌟' },
  { key: 'saturday', label: 'Saturday', emoji: '🎯' },
  { key: 'sunday', label: 'Sunday', emoji: '☀️' },
]

interface ScheduleData {
  [key: string]: AnimeBase[]
}

export const AnimeSchedule = () => {
  const navigate = useNavigate()
  const [scheduleData, setScheduleData] = useState<ScheduleData>({})
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    // Default to current day
    const today = new Date().getDay()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return dayNames[today]
  })
  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    // Try to detect user's timezone, fallback to UTC
    const userTz = getUserTimezone()
    // Check if the detected timezone is in our common list
    const isCommonTz = COMMON_TIMEZONES.some(tz => tz.value === userTz)
    return isCommonTz ? userTz : 'UTC'
  })
  const [filters, setFilters] = useState({
    airType: 'all', // 'all', 'raw', 'sub', 'dub'
    platform: 'all', // 'all', 'crunchyroll', 'youtube', etc.
    search: '', // Search by title
    favoritesOnly: false, // Show only favorite shows
  })
  const [favoriteShows, setFavoriteShows] = useState<Set<string>>(new Set())
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true)
      setError(null)

      try {
        const schedule = await animeScheduleService.getWeeklySchedule(selectedTimezone)
        setScheduleData(schedule)
      } catch (err) {
        setError('Failed to fetch anime schedule. Please try again.')
        console.error('Schedule fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [selectedTimezone])

  // Check for notification permission and upcoming episodes
  useEffect(() => {
    if (notificationsEnabled) {
      const checkUpcomingEpisodes = () => {
        const now = new Date()
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)
        
        Object.values(scheduleData).flat().forEach(episode => {
          if (episode.episodeDate && favoriteShows.has(episode.title)) {
            const episodeDate = new Date(episode.episodeDate)
            
            // Notify 30 minutes before episode airs
            if (episodeDate > now && episodeDate <= thirtyMinutesFromNow) {
              if (Notification.permission === 'granted') {
                new Notification(`${episode.title} - Episode ${episode.episodeNumber}`, {
                  body: `Airs in ${Math.round((episodeDate.getTime() - now.getTime()) / (1000 * 60))} minutes`,
                  icon: '/anime-icon.png', // You could add an anime icon
                  tag: `episode-${episode.id}-${episode.episodeNumber}`,
                })
              }
            }
          }
        })
      }
      
      // Check every 5 minutes
      const interval = setInterval(checkUpcomingEpisodes, 5 * 60 * 1000)
      
      return () => clearInterval(interval)
    }
  }, [scheduleData, favoriteShows, notificationsEnabled])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
    }
  }

  const handleAnimeNavigation = async (anime: AnimeBase) => {
    // First try to navigate using MAL ID if available
    if (anime.hasValidId && anime.malId && anime.malId > 0) {
      // Prefer MAL source for better compatibility, since Jikan uses MAL IDs anyway
      navigate(`/anime/mal/${anime.malId}`)
      return
    }

    // Fallback: Search for anime by title using Jikan to get MAL ID
    try {
      const foundAnime = await jikanService.findAnimeByTitle(anime.title)
      if (foundAnime) {
        // Use MAL source with the found ID for consistency
        navigate(`/anime/mal/${foundAnime.id}`)
      } else {
        // If no anime found, show a message or fallback
        console.log(`Could not find anime details for: ${anime.title}`)
      }
    } catch (error) {
      console.error('Error searching for anime:', error)
    }
  }

  const toggleFavorite = (title: string) => {
    setFavoriteShows(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(title)) {
        newFavorites.delete(title)
      } else {
        newFavorites.add(title)
      }
      return newFavorites
    })
  }

  const exportToCalendar = () => {
    const favoriteEpisodes = Object.values(scheduleData)
      .flat()
      .filter(episode => favoriteShows.has(episode.title) && episode.episodeDate)
      .sort((a, b) => new Date(a.episodeDate!).getTime() - new Date(b.episodeDate!).getTime())

    if (favoriteEpisodes.length === 0) {
      alert('No favorite episodes to export. Add some shows to favorites first!')
      return
    }

    // Generate ICS file content
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AnimeTrackr//Anime Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ].join('\n')

    favoriteEpisodes.forEach(episode => {
      const startDate = new Date(episode.episodeDate!)
      const endDate = new Date(startDate.getTime() + (episode.lengthMin || 24) * 60 * 1000)
      
      // Format dates for ICS (YYYYMMDDTHHMMSSZ)
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      }

      icsContent += '\n' + [
        'BEGIN:VEVENT',
        `UID:${episode.id}-${episode.episodeNumber}@animetrackr.com`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${episode.title} - Episode ${episode.episodeNumber}`,
        `DESCRIPTION:${episode.airType?.toUpperCase()} episode\\n` +
        `${episode.lengthMin ? `Duration: ${episode.lengthMin} minutes\\n` : ''}` +
        `${episode.streams && Object.keys(episode.streams).length > 0 ? 
          `Available on: ${Object.keys(episode.streams).join(', ')}` : ''}`,
        'CATEGORIES:Anime,Entertainment',
        'END:VEVENT'
      ].join('\n')
    })

    icsContent += '\nEND:VCALENDAR'

    // Create and download file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'anime-schedule.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filter episodes based on current filters
  const filterEpisodes = (episodes: AnimeBase[]) => {
    return episodes.filter(episode => {
      // Air type filter
      if (filters.airType !== 'all' && episode.airType !== filters.airType) {
        return false
      }
      
      // Platform filter
      if (filters.platform !== 'all') {
        if (!episode.streams || !Object.keys(episode.streams).includes(filters.platform)) {
          return false
        }
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        if (!episode.title.toLowerCase().includes(searchTerm)) {
          return false
        }
      }
      
      // Favorites filter
      if (filters.favoritesOnly && !favoriteShows.has(episode.title)) {
        return false
      }
      
      return true
    })
  }

  const rawSelectedDayData = scheduleData[selectedDay] || []
  const selectedDayData = filterEpisodes(rawSelectedDayData)
  const selectedDayInfo = DAYS_OF_WEEK.find(day => day.key === selectedDay) || DAYS_OF_WEEK[0]
  
  // Get available platforms from current day's data for filter dropdown
  const availablePlatforms = React.useMemo(() => {
    const platforms = new Set<string>()
    rawSelectedDayData.forEach(episode => {
      if (episode.streams) {
        Object.keys(episode.streams).forEach(platform => platforms.add(platform))
      }
    })
    return Array.from(platforms).sort()
  }, [rawSelectedDayData])

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-theme">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            📅 Weekly Anime Schedule
          </h2>
          <div className="flex items-center space-x-4">
            {/* Timezone Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">🕐</span>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.emoji} {tz.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications Toggle */}
              <button
                onClick={requestNotificationPermission}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  notificationsEnabled
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications for favorite shows'}
              >
                <span>{notificationsEnabled ? '🔔' : '🔕'}</span>
                <span>{notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}</span>
              </button>

              {/* Calendar Export */}
              <button
                onClick={exportToCalendar}
                className="flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-all duration-200"
                title="Export favorite shows to calendar"
              >
                <span>📅</span>
                <span>Export Calendar</span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>🌐</span>
                <span>Powered by AnimeSchedule.net</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.key
            const isToday = (() => {
              const today = new Date().getDay()
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
              return dayNames[today] === day.key
            })()
            
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } ${isToday ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
              >
                <span className="mr-2">{day.emoji}</span>
                {day.label}
                {isToday && <span className="ml-2 text-xs">📍</span>}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search anime..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-40"
            />
          </div>

          {/* Air Type Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">📺</span>
            <select
              value={filters.airType}
              onChange={(e) => setFilters(prev => ({ ...prev, airType: e.target.value }))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="raw">🔴 RAW</option>
              <option value="sub">🟢 SUB</option>
              <option value="dub">🟣 DUB</option>
            </select>
          </div>

          {/* Platform Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">📱</span>
            <select
              value={filters.platform}
              onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="all">All Platforms</option>
              {availablePlatforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Favorites Filter */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.favoritesOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, favoritesOnly: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">❤️ Favorites only</span>
            </label>
          </div>

          {/* Filter Results Count */}
          {(filters.search || filters.airType !== 'all' || filters.platform !== 'all' || filters.favoritesOnly) && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDayData.length} of {rawSelectedDayData.length} episodes
            </div>
          )}
        </div>
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

        {loading ? (
          <LoadingSkeleton />
        ) : selectedDayData.length > 0 ? (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {selectedDayInfo.emoji} Airing on {selectedDayInfo.label}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedDayData.length} episode{selectedDayData.length !== 1 ? 's' : ''} 
                {(filters.search || filters.airType !== 'all' || filters.platform !== 'all' || filters.favoritesOnly) && 
                  ` (${rawSelectedDayData.length} total)`
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDayData.slice(0, 12).map((anime) => {
                const hasValidId = anime.hasValidId && anime.malId && anime.malId > 0
                
                const ContentArea = ({ children }: { children: React.ReactNode }) => {
                  return (
                    <div 
                      onClick={() => handleAnimeNavigation(anime)}
                      className="flex-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {children}
                    </div>
                  )
                }

                return (
                  <div key={`${anime.id}-${anime.episodeNumber}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden transition-theme group hover:shadow-lg cursor-pointer">
                    <div className="flex items-start space-x-4 p-4">
                      {/* Content Area - Clickable only if has valid ID */}
                      <ContentArea>
                        <div className="relative">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {anime.title}
                            {!hasValidId && (
                              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded">
                                Search Fallback
                              </span>
                            )}
                          </h4>
                          
                          <div className="space-y-2 text-sm">
                            {anime.episodeNumber && (
                              <div className="flex items-center space-x-2">
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                                  Episode {anime.episodeNumber}
                                </span>
                                {anime.lengthMin && (
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {anime.lengthMin}min
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {anime.episodeDate && (
                              <div className="text-gray-600 dark:text-gray-400">
                                🕒 {new Date(anime.episodeDate).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  timeZone: selectedTimezone,
                                  timeZoneName: 'short'
                                })}
                              </div>
                            )}
                            
                            {anime.airType && (
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  anime.airType === 'raw' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                  anime.airType === 'sub' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                  'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                }`}>
                                  {anime.airType.toUpperCase()}
                                </span>
                                {anime.episodeDelay && (
                                  <span className="text-orange-600 dark:text-orange-400 text-xs">
                                    Delayed {anime.episodeDelay}min
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {anime.streams && Object.keys(anime.streams).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.keys(anime.streams).slice(0, 3).map((platform) => (
                                  <span 
                                    key={platform}
                                    className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                                  >
                                    {platform}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </ContentArea>
                    
                    {/* Non-clickable Action Area */}
                    <div className="text-right space-y-2">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite(anime.title)
                        }}
                        className={`p-1 rounded transition-colors ${
                          favoriteShows.has(anime.title)
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        title={favoriteShows.has(anime.title) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favoriteShows.has(anime.title) ? '❤️' : '🤍'}
                      </button>
                      
                      {/* Status Indicator */}
                      <div className={`w-3 h-3 rounded-full mx-auto ${
                        anime.airingStatus === 'aired' ? 'bg-green-400' :
                        anime.airingStatus === 'airing' ? 'bg-blue-400' :
                        anime.airingStatus === 'delayed' ? 'bg-orange-400' :
                        'bg-gray-400'
                      }`} title={anime.airingStatus} />
                      
                      {/* Click hint */}
                      <div className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {hasValidId ? 'Click to view' : 'Click to search'}
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>

            {selectedDayData.length > 12 && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing 12 of {selectedDayData.length} episodes. More available on AnimeSchedule.net.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{selectedDayInfo.emoji}</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Anime Scheduled
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No anime episodes are scheduled to air on {selectedDayInfo.label}.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}