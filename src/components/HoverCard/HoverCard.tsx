import { useState, useRef, useEffect } from 'react'
import { animate } from 'animejs'
import { Link } from 'react-router-dom'
import { AnimeBase } from '../../types/anime'
import { getStatusLabel, getStatusColor, getStatusIcon } from '../../utils/animeStatus'
import { useAnimeAuth } from '../../hooks/useAuth'
import { useAnimeStore } from '../../store/animeStore'
import { animeStatusService } from '../../services/shared/animeStatusService'

interface HoverCardProps {
  anime: AnimeBase
}

const HoverCardComponent = ({ anime }: HoverCardProps) => {
  const [showStatusOptions, setShowStatusOptions] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Check if user is authenticated for this anime's source
  const { isAuthenticated } = useAnimeAuth(anime.source)
  
  // Get store functions to update data after status changes
  const { updateAnimeStatus } = useAnimeStore()
  
  // Get current user status for this anime from the anime object
  const getCurrentStatus = () => {
    return anime.userStatus || null
  }
  
  const currentStatus = getCurrentStatus()
  
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const handleStatusChange = async (event: React.MouseEvent, status: string) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (isUpdating) return
    
    setIsUpdating(true)
    
    try {
      await animeStatusService.updateAnimeStatus(anime.id, anime.source, { status })
      
      updateAnimeStatus(anime.id, anime.source, status)
      setShowStatusOptions(false)
    } catch (error) {
      console.error('Failed to update anime status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveFromList = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (isUpdating) return
    
    setIsUpdating(true)
    
    try {
      await animeStatusService.removeAnimeFromList(anime.id, anime.source)
      
      updateAnimeStatus(anime.id, anime.source, '')
      setShowStatusOptions(false)
    } catch (error) {
      console.error('Failed to remove anime from list:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.opacity = '0'
      cardRef.current.style.transform = 'scale(0.95) translateY(10px)'
      
      animate(cardRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        translateY: [10, 0],
        duration: 300,
        easing: 'easeOutQuart'
      })
    }
    
    if (imageRef.current) {
      imageRef.current.style.transform = 'scale(0.9)'
      animate(imageRef.current, {
        scale: [0.9, 1],
        duration: 400,
        delay: 100,
        easing: 'easeOutQuart'
      })
    }
    
    if (contentRef.current) {
      contentRef.current.style.opacity = '0'
      contentRef.current.style.transform = 'translateX(10px)'
      animate(contentRef.current, {
        opacity: [0, 1],
        translateX: [10, 0],
        duration: 300,
        delay: 150,
        easing: 'easeOutQuart'
      })
    }
  }, [anime.id])

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
    >
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          {anime.image ? (
            <img
              ref={imageRef}
              src={anime.image}
              alt={anime.title}
              className="w-16 h-20 object-cover rounded"
            />
          ) : (
            <div ref={imageRef} className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>

        <div ref={contentRef} className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {anime.title}
          </h3>
          
          <div className="space-y-1 text-xs text-gray-600">
            {anime.score && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Score:</span>
                <span className="text-blue-600 font-semibold">{anime.score.toFixed(1)}</span>
              </div>
            )}
            
            {anime.episodes && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Episodes:</span>
                <span>{anime.episodes}</span>
              </div>
            )}
            
            {anime.status && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{anime.status.toLowerCase()}</span>
              </div>
            )}
            
            {anime.year && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Year:</span>
                <span>{anime.year}</span>
              </div>
            )}
          </div>

          {anime.genres && anime.genres.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {anime.genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {genre}
                  </span>
                ))}
                {anime.genres.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{anime.genres.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {anime.synopsis && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                {truncateText(anime.synopsis, 120)}
              </p>
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              {!showStatusOptions ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowStatusOptions(true)
                    }}
                    className={`flex-1 text-xs text-white px-3 py-2 rounded-md transition-colors font-medium ${getStatusColor(currentStatus)}`}
                  >
                    {getStatusIcon(currentStatus || 'add')} {getStatusLabel(currentStatus)}
                  </button>
                  <Link 
                    to={`/anime/${anime.source}/${anime.id}`}
                    className="flex-1 text-xs bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors font-medium text-center"
                  >
                    📄 Details
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    {currentStatus ? 'Change status to:' : 'Add to list as:'}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleStatusChange(e, anime.source === 'mal' ? 'watching' : 'CURRENT')}
                      disabled={isUpdating}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1.5 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('watching')} Watching
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStatusChange(e, anime.source === 'mal' ? 'completed' : 'COMPLETED')}
                      disabled={isUpdating}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1.5 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('completed')} Completed
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStatusChange(e, anime.source === 'mal' ? 'plan_to_watch' : 'PLANNING')}
                      disabled={isUpdating}
                      className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1.5 rounded hover:bg-yellow-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('plan_to_watch')} Plan to Watch
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStatusChange(e, anime.source === 'mal' ? 'on_hold' : 'PAUSED')}
                      disabled={isUpdating}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1.5 rounded hover:bg-orange-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('on_hold')} On Hold
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStatusChange(e, anime.source === 'mal' ? 'dropped' : 'DROPPED')}
                      disabled={isUpdating}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1.5 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('dropped')} Dropped
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowStatusOptions(false)
                      }}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                  {currentStatus && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFromList(e)}
                      disabled={isUpdating}
                      className="w-full text-xs bg-red-50 text-red-600 px-2 py-1.5 rounded hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                    >
                      🗑️ Remove from List
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex gap-2">
                <Link 
                  to={`/anime/${anime.source}/${anime.id}`}
                  className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium text-center"
                >
                  📄 View Details
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // TODO: Trigger auth modal or redirect
                  }}
                  className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors font-medium"
                >
                  🔒 Sign In to Track
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs text-gray-400 uppercase font-medium">
              {anime.source}
            </span>
            {anime.userScore && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                ⭐ {anime.userScore}/10
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const HoverCard = HoverCardComponent