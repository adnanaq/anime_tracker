import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimeBase } from '../../types/anime'
import { getAuthService } from '../../services/auth'

interface HoverCardProps {
  anime: AnimeBase
}

export const HoverCard = ({ anime }: HoverCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showStatusOptions, setShowStatusOptions] = useState(false)
  
  // Check if user is authenticated for this anime's source
  const authServiceInstance = getAuthService(anime.source)
  const isAuthenticated = authServiceInstance?.isAuthenticated() ?? false
  
  // Get current user status for this anime (this would come from your store/API)
  const getCurrentStatus = () => {
    // TODO: Get actual user status from your anime store/state
    // For now, return null to simulate not in list
    return null // or anime.userStatus if available
  }
  
  const currentStatus = getCurrentStatus()
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const handleStatusChange = (status: string) => {
    setIsUpdating(true)
    // TODO: Implement status change functionality
    console.log(`Changing ${anime.title} status to: ${status}`)
    setTimeout(() => {
      setIsUpdating(false)
      setShowStatusOptions(false)
    }, 1000)
  }

  const getStatusLabel = (status: string | null) => {
    if (!status) return 'Add to List'
    
    switch (status) {
      case 'watching': case 'CURRENT': return 'Watching'
      case 'completed': case 'COMPLETED': return 'Completed'
      case 'plan_to_watch': case 'PLANNING': return 'Plan to Watch'
      case 'on_hold': case 'PAUSED': return 'On Hold'
      case 'dropped': case 'DROPPED': return 'Dropped'
      default: return 'Unknown Status'
    }
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-green-500 hover:bg-green-600'
    
    switch (status) {
      case 'watching': case 'CURRENT': return 'bg-blue-500 hover:bg-blue-600'
      case 'completed': case 'COMPLETED': return 'bg-green-500 hover:bg-green-600'
      case 'plan_to_watch': case 'PLANNING': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'on_hold': case 'PAUSED': return 'bg-orange-500 hover:bg-orange-600'
      case 'dropped': case 'DROPPED': return 'bg-red-500 hover:bg-red-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'watching': case 'CURRENT': return '👁️'
      case 'completed': case 'COMPLETED': return '✅'
      case 'plan_to_watch': case 'PLANNING': return '📋'
      case 'on_hold': case 'PAUSED': return '⏸️'
      case 'dropped': case 'DROPPED': return '❌'
      default: return '📺'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
    >
      <div className="flex space-x-3">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {anime.image ? (
            <img
              src={anime.image}
              alt={anime.title}
              className="w-16 h-20 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
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

          {/* Genres */}
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

          {/* Synopsis */}
          {anime.synopsis && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                {truncateText(anime.synopsis, 120)}
              </p>
            </div>
          )}

          {/* Status Actions */}
          {isAuthenticated && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              {!showStatusOptions ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowStatusOptions(true)}
                    className={`flex-1 text-xs text-white px-3 py-2 rounded-md transition-colors font-medium ${getStatusColor(currentStatus)}`}
                    disabled={isUpdating}
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
                      onClick={() => handleStatusChange(anime.source === 'mal' ? 'watching' : 'CURRENT')}
                      disabled={isUpdating}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1.5 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('watching')} Watching
                    </button>
                    <button
                      onClick={() => handleStatusChange(anime.source === 'mal' ? 'completed' : 'COMPLETED')}
                      disabled={isUpdating}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1.5 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('completed')} Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange(anime.source === 'mal' ? 'plan_to_watch' : 'PLANNING')}
                      disabled={isUpdating}
                      className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1.5 rounded hover:bg-yellow-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('plan_to_watch')} Plan to Watch
                    </button>
                    <button
                      onClick={() => handleStatusChange(anime.source === 'mal' ? 'on_hold' : 'PAUSED')}
                      disabled={isUpdating}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1.5 rounded hover:bg-orange-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('on_hold')} On Hold
                    </button>
                    <button
                      onClick={() => handleStatusChange(anime.source === 'mal' ? 'dropped' : 'DROPPED')}
                      disabled={isUpdating}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1.5 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {getStatusIcon('dropped')} Dropped
                    </button>
                    <button
                      onClick={() => setShowStatusOptions(false)}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                  {currentStatus && (
                    <button
                      onClick={() => {
                        // TODO: Remove from list functionality
                        console.log(`Removing ${anime.title} from list`)
                      }}
                      className="w-full text-xs bg-red-50 text-red-600 px-2 py-1.5 rounded hover:bg-red-100 transition-colors border border-red-200"
                    >
                      🗑️ Remove from List
                    </button>
                  )}
                  {isUpdating && (
                    <div className="text-xs text-center text-blue-600 py-1">
                      ⏳ Updating status...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Non-authenticated actions */}
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
                  onClick={() => {
                    // TODO: Trigger auth modal or redirect
                    console.log('Triggering auth for', anime.source)
                  }}
                  className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors font-medium"
                >
                  🔒 Sign In to Track
                </button>
              </div>
            </div>
          )}

          {/* Source indicator */}
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
    </motion.div>
  )
}