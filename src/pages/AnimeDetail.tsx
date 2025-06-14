import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { AnimeBase } from '../types/anime'
import { animeService } from '../services/animeService'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ExpandableGrid } from '../components/ExpandableGrid'
import { getAuthService } from '../services/shared'
import { animeStatusService } from '../services/shared/animeStatusService'
import { malService } from '../services/mal'
import { anilistService } from '../services/anilist'
import { getStatusOptions } from '../utils/animeStatus'
import { createDebouncedFunction } from '../utils/debounce'

export const AnimeDetail = () => {
  const { source, id } = useParams<{ source: string; id: string }>()
  const [animeData, setAnimeData] = useState<AnimeBase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userStatus, setUserStatus] = useState<string | null>(null)
  const [userScore, setUserScore] = useState<number>(0)
  const [userEpisodes, setUserEpisodes] = useState<number>(0)
  const [tempEpisodes, setTempEpisodes] = useState<number>(0)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingScore, setIsUpdatingScore] = useState(false)
  const [isUpdatingEpisodes, setIsUpdatingEpisodes] = useState(false)
  
  // Create debounced functions for score and episode updates
  const { debouncedFn: debouncedScoreUpdate, cleanup: cleanupScoreDebounce } = createDebouncedFunction(
    (newScore: number) => {
      if (newScore !== userScore) {
        handleScoreUpdate(newScore)
      }
    },
    1000
  )
  
  const { debouncedFn: debouncedEpisodesUpdate, cleanup: cleanupEpisodesDebounce } = createDebouncedFunction(
    (newEpisodes: number) => {
      if (newEpisodes !== userEpisodes) {
        handleEpisodesUpdate(newEpisodes)
      }
    },
    1000
  )
  
  const headerRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const genresRef = useRef<HTMLDivElement>(null)
  const genresContainerRef = useRef<HTMLDivElement>(null)
  const synopsisRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAnime = async () => {
      if (!source || !id) {
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Set the service source to match the requested anime
        // jikan source maps to mal since they use the same IDs
        animeService.setSource(source as 'mal' | 'anilist' | 'jikan')
        
        const animeData = await animeService.getAnimeDetails(parseInt(id))
        
        // Fetch user score and status if authenticated
        // For jikan source, use MAL auth since jikan uses MAL IDs
        const authSource = source === 'jikan' ? 'mal' : source
        const authServiceInstance = getAuthService(authSource as 'mal' | 'anilist')
        const isAuth = authServiceInstance?.isAuthenticated()
        
        if (isAuth && authServiceInstance) {
          const tokenObj = authServiceInstance.getToken()
          
          if (tokenObj) {
            try {
              const token = tokenObj.access_token
              if (source === 'mal' || source === 'jikan') {
                // For MAL, fetch detailed anime info which includes my_list_status
                const detailResponse: any = await malService.getAnimeDetails(parseInt(id))
                if (detailResponse.userScore) {
                  animeData.userScore = detailResponse.userScore
                }
                // For MAL, we need to make a separate API call to get user status
                try {
                  const userAnimeResponse = await malService.getUserAnimeDetails(parseInt(id), token)
                  if (userAnimeResponse) {
                    setUserStatus(userAnimeResponse.status || null)
                    const score = userAnimeResponse.score || 0
                    const episodes = userAnimeResponse.num_episodes_watched || 0
                    setUserScore(score)
                    setUserEpisodes(episodes)
                    setTempEpisodes(episodes)
                  }
                } catch (error) {
                }
              } else if (source === 'anilist') {
                // For AniList, use optimized single call to get everything
                try {
                  const relatedAnimeIds = animeData.relatedAnime?.map(anime => anime.id) || []
                  const result = await anilistService.getAnimeWithUserDetails(parseInt(id), token, relatedAnimeIds)
                  
                  if (result.userEntry) {
                    setUserStatus(result.userEntry.status || null)
                    const score = result.userEntry.score || 0
                    const episodes = result.userEntry.progress || 0
                    setUserScore(score)
                    setUserEpisodes(episodes)
                    setTempEpisodes(episodes)
                  }
                  
                  // Update anime data with optimized result
                  animeData.userScore = result.userEntry?.score || undefined
                  
                  // Update related anime with user scores (already included in optimized call)
                  if (result.animeData.relatedAnime) {
                    animeData.relatedAnime = result.animeData.relatedAnime
                  }
                } catch (error) {
                }
              }
            } catch (error) {
              console.error('🎬 AnimeDetail: Failed to fetch user data:', error)
            }
          }
        }
        
        // Fetch user scores for related anime if available (MAL only, AniList handled above)
        if (source === 'mal' && isAuth && authServiceInstance && animeData.relatedAnime && animeData.relatedAnime.length > 0) {
          const relatedTokenObj = authServiceInstance.getToken()
          if (relatedTokenObj) {
            try {
              const token = relatedTokenObj.access_token
              const relatedAnimeIds = animeData.relatedAnime.map(anime => anime.id)
              
              const userScores = await malService.getUserScoresForAnime(relatedAnimeIds, token)
              animeData.relatedAnime = animeData.relatedAnime.map(anime => ({
                ...anime,
                userScore: userScores.get(anime.id)
              }))
            } catch (error) {
              console.error('🎬 AnimeDetail: Failed to fetch user scores for related anime:', error)
            }
          }
        }
        
        setAnimeData(animeData)
      } catch (err) {
        const errorMessage = `Failed to load anime details: ${err instanceof Error ? err.message : 'Unknown error'}`
        setError(errorMessage)
        console.error('Error fetching anime details:', {
          source,
          id,
          error: err,
          errorMessage: err instanceof Error ? err.message : err
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnime()
  }, [source, id])

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value
    if (!source || !id || !newStatus) return

    const authServiceInstance = getAuthService(source as 'mal' | 'anilist')
    if (!authServiceInstance?.isAuthenticated()) return

    setIsUpdatingStatus(true)
    try {
      // Prepare update data with automatic episode adjustment
      const updateData: any = { status: newStatus }
      
      // Auto-logic: When status becomes "completed", set episodes to max
      const isCompletedStatus = newStatus === 'completed' || newStatus === 'COMPLETED'
      if (isCompletedStatus && animeData?.episodes) {
        if (source === 'mal') {
          updateData.num_watched_episodes = animeData.episodes
        } else {
          updateData.progress = animeData.episodes  
        }
        // Update local state immediately
        setUserEpisodes(animeData.episodes)
        setTempEpisodes(animeData.episodes)
      }
      
      await animeStatusService.updateAnimeStatus(parseInt(id), source as 'mal' | 'anilist', updateData)

      setUserStatus(newStatus)
    } catch (error) {
      console.error('Failed to update anime status:', error)
      alert('Failed to update anime status. Please try again.')
      // Reset the dropdown to previous value
      event.target.value = userStatus || ''
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleScoreUpdate = async (newScore: number) => {
    if (!source || !id) return

    const authServiceInstance = getAuthService(source as 'mal' | 'anilist')
    if (!authServiceInstance?.isAuthenticated()) return

    setIsUpdatingScore(true)
    try {
      const token = authServiceInstance.getToken()?.access_token
      if (!token) throw new Error('No auth token')

      // Auto-logic: If user sets a score and isn't watching/completed, change status to watching
      let newStatus = userStatus
      const currentStatus = userStatus
      const isWatching = currentStatus === (source === 'mal' ? 'watching' : 'CURRENT')
      const isCompleted = currentStatus === (source === 'mal' ? 'completed' : 'COMPLETED')
      
      if (newScore > 0 && !isWatching && !isCompleted) {
        newStatus = source === 'mal' ? 'watching' : 'CURRENT'
      }

      // Prepare update data
      const updateData: any = { score: newScore }
      if (newStatus !== currentStatus) {
        updateData.status = newStatus
      }

      if (source === 'mal') {
        await malService.updateAnimeStatus(parseInt(id), token, updateData)
      } else {
        await anilistService.updateAnimeStatus(parseInt(id), token, updateData)
      }

      setUserScore(newScore)
      if (newStatus !== currentStatus) {
        setUserStatus(newStatus)
      }
    } catch (error) {
      console.error('Failed to update anime score:', error)
      alert('Failed to update anime score. Please try again.')
      // Reset score on error handled by component
    } finally {
      setIsUpdatingScore(false)
    }
  }

  const handleEpisodesUpdate = async (newEpisodes: number) => {
    if (!source || !id) return

    const authServiceInstance = getAuthService(source as 'mal' | 'anilist')
    if (!authServiceInstance?.isAuthenticated()) return

    setIsUpdatingEpisodes(true)
    try {
      const token = authServiceInstance.getToken()?.access_token
      if (!token) throw new Error('No auth token')

      // Determine if status should auto-change based on episode progress
      let newStatus = userStatus
      const maxEpisodes = animeData?.episodes
      
      if (maxEpisodes && newEpisodes > 0) {
        if (newEpisodes >= maxEpisodes) {
          // Watched all episodes = Completed
          newStatus = source === 'mal' ? 'completed' : 'COMPLETED'
        } else if (newEpisodes > 0) {
          // Watching some episodes = Watching (unless already watching)
          const isCurrentlyWatching = userStatus === (source === 'mal' ? 'watching' : 'CURRENT')
          if (!isCurrentlyWatching) {
            newStatus = source === 'mal' ? 'watching' : 'CURRENT'
          }
        }
      }

      // Update both episodes and status if needed
      const updateData: any = source === 'mal' 
        ? { num_watched_episodes: newEpisodes }
        : { progress: newEpisodes }
      
      if (newStatus !== userStatus) {
        updateData.status = newStatus
      }

      if (source === 'mal') {
        await malService.updateAnimeStatus(parseInt(id), token, updateData)
      } else {
        await anilistService.updateAnimeStatus(parseInt(id), token, updateData)
      }

      setUserEpisodes(newEpisodes)
      
      // Update status if it changed
      if (newStatus !== userStatus) {
        setUserStatus(newStatus)
      }
    } catch (error) {
      console.error('Failed to update episodes watched:', error)
      alert('Failed to update episodes watched. Please try again.')
      // Reset temp value to actual value on error
      setTempEpisodes(userEpisodes)
    } finally {
      setIsUpdatingEpisodes(false)
    }
  }

  // Helper function for episode updates that includes temp state
  const handleDebouncedEpisodesUpdate = (newEpisodes: number) => {
    setTempEpisodes(newEpisodes)
    debouncedEpisodesUpdate(newEpisodes)
  }

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      cleanupScoreDebounce()
      cleanupEpisodesDebounce()
    }
  }, [])

  // Trigger animations only after data is loaded and component is ready
  useEffect(() => {
    if (animeData && !loading && !error) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        animatePageElements()
      }, 50)
      
      return () => clearTimeout(timer)
    }
  }, [animeData, loading, error])

  const animatePageElements = () => {
    // Header animation
    if (headerRef.current) {
      animate(headerRef.current, {
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart'
      })
    }

    // Image animation with 3D effect
    if (imageRef.current) {
      animate(imageRef.current, {
        scale: [0.8, 1],
        rotateY: [-10, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutBack',
        delay: 200
      })
    }

    // Title animation
    if (titleRef.current) {
      animate(titleRef.current, {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart',
        delay: 400
      })
    }

    // Content stagger animation (stats section)
    if (contentRef.current) {
      animate(contentRef.current, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuart',
        delay: 600
      })
    }

    // Genres container animation
    if (genresContainerRef.current) {
      animate(genresContainerRef.current, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuart',
        delay: 700
      })
    }

    // Individual genre tags animation
    if (genresRef.current?.children) {
      animate(Array.from(genresRef.current.children), {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutBack',
        delay: stagger(50, { start: 800 })
      })
    }

    // Synopsis animation
    if (synopsisRef.current) {
      animate(synopsisRef.current, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart',
        delay: 900
      })
    }

    // Buttons animation
    if (buttonsRef.current?.children) {
      animate(Array.from(buttonsRef.current.children), {
        scale: [0.8, 1],
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutElastic(1, .8)',
        delay: stagger(100, { start: 1000 })
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading anime details..." />
      </div>
    )
  }

  if (error || !animeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Anime</h2>
          <p className="text-gray-600 mb-4">{error || 'Anime not found'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm">
      {/* Header */}
      <header 
        ref={headerRef}
        className="bg-white/90 backdrop-blur-md shadow-sm border-b opacity-0"
        style={{ transform: 'translateY(-30px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <span className="text-sm text-gray-500 uppercase font-medium">{animeData.source}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:flex-shrink-0">
              <div 
                ref={imageRef}
                className="h-96 w-full md:w-72 opacity-0"
                style={{ transform: 'scale(0.8) rotateY(-10deg)' }}
              >
                {animeData.coverImage || animeData.image ? (
                  <img
                    src={animeData.coverImage || animeData.image}
                    alt={animeData.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">No Image Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 flex-1">
              <div className="mb-6">
                <h1 
                  ref={titleRef}
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 opacity-0"
                  style={{ transform: 'translateX(-50px)' }}
                >
                  {animeData.title}
                </h1>
                
                {/* Stats */}
                <div 
                  ref={contentRef}
                  className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 opacity-0"
                  style={{ transform: 'translateY(30px)' }}
                >
                  {animeData.score && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Global Score:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                        {animeData.score.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  {animeData.userScore && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Your Score:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                        {animeData.userScore}
                      </span>
                    </div>
                  )}
                  
                  {animeData.episodes && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Episodes:</span>
                      <span>{animeData.episodes}</span>
                    </div>
                  )}
                  
                  {animeData.status && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Status:</span>
                      <span className="capitalize">{animeData.status.toLowerCase()}</span>
                    </div>
                  )}
                  
                  {animeData.year && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Year:</span>
                      <span>{animeData.year}</span>
                    </div>
                  )}
                  
                  {animeData.format && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Format:</span>
                      <span className="capitalize">{animeData.format.toLowerCase()}</span>
                    </div>
                  )}
                  
                  {/* User Status Section */}
                  {getAuthService(source as 'mal' | 'anilist')?.isAuthenticated() && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      {/* Status Dropdown */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">My Status</label>
                        <div className="flex items-center space-x-2">
                          <select
                            value={userStatus || ''}
                            onChange={handleStatusChange}
                            disabled={isUpdatingStatus}
                            className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Add to List</option>
                            {getStatusOptions(source as 'mal' | 'anilist').map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {isUpdatingStatus && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          )}
                        </div>
                      </div>

                      {/* Score Input */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">My Score (1-10)</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={userScore || ''}
                            onChange={(e) => {
                              const newScore = parseInt(e.target.value) || 0
                              if (newScore >= 0 && newScore <= 10) {
                                debouncedScoreUpdate(newScore)
                              }
                            }}
                            disabled={isUpdatingScore}
                            className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                          {isUpdatingScore && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          )}
                        </div>
                        {userScore > 0 && (
                          <div className="mt-1">
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-semibold">
                              {userScore}/10
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Episodes Input */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Episodes Watched {animeData.episodes && `(max: ${animeData.episodes})`}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max={animeData.episodes || undefined}
                            value={tempEpisodes || ''}
                            onChange={(e) => {
                              const newEpisodes = parseInt(e.target.value) || 0
                              const maxEpisodes = animeData.episodes || Infinity
                              if (newEpisodes >= 0 && newEpisodes <= maxEpisodes) {
                                handleDebouncedEpisodesUpdate(newEpisodes)
                              }
                            }}
                            disabled={isUpdatingEpisodes}
                            className={`flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              tempEpisodes !== userEpisodes ? 'border-yellow-400 bg-yellow-50' : ''
                            }`}
                            placeholder="0"
                          />
                          {isUpdatingEpisodes && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          )}
                          {tempEpisodes !== userEpisodes && !isUpdatingEpisodes && (
                            <div className="text-yellow-600 text-xs">
                              {animeData.episodes && tempEpisodes >= animeData.episodes ? 'Completing...' : 'Saving...'}
                            </div>
                          )}
                        </div>
                        {userEpisodes > 0 && (
                          <div className="mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                              {userEpisodes}{animeData.episodes ? `/${animeData.episodes}` : ''} episodes {tempEpisodes !== userEpisodes && '(pending)'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {animeData.genres && animeData.genres.length > 0 && (
                  <div ref={genresContainerRef} className="mb-4 opacity-0" style={{ transform: 'translateY(20px)' }}>
                    <h3 className="font-medium text-gray-900 mb-2">Genres</h3>
                    <div ref={genresRef} className="flex flex-wrap gap-2">
                      {animeData.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm px-3 py-1 rounded-full opacity-0"
                          style={{ transform: 'scale(0)' }}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synopsis */}
                {animeData.synopsis && (
                  <div 
                    ref={synopsisRef}
                    className="opacity-0"
                    style={{ transform: 'translateY(20px)' }}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">Synopsis</h3>
                    <p className="text-gray-700 leading-relaxed">{animeData.synopsis}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>


        {/* Related anime section */}
        {animeData.relatedAnime && animeData.relatedAnime.length > 0 && (
          <div className="mt-8">
            <ExpandableGrid 
              anime={animeData.relatedAnime} 
              title="Related Anime" 
              maxCards={10} 
            />
          </div>
        )}
      </main>
    </div>
  )
}