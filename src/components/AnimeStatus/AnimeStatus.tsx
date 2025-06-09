import { useState } from 'react'
import { AnimeBase, AnimeSource } from '../../types/anime'
import { malService } from '../../services/malApi'
import { anilistService } from '../../services/anilistApiFetch'
import { getAuthService } from '../../services/auth'

interface AnimeStatusProps {
  anime: AnimeBase
  onStatusUpdate?: (newStatus: string, newScore?: number) => void
}

const MAL_STATUS_OPTIONS = [
  { value: 'watching', label: 'Watching', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-500' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-500' },
  { value: 'dropped', label: 'Dropped', color: 'bg-red-500' },
  { value: 'plan_to_watch', label: 'Plan to Watch', color: 'bg-purple-500' },
]

const ANILIST_STATUS_OPTIONS = [
  { value: 'CURRENT', label: 'Watching', color: 'bg-green-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-blue-500' },
  { value: 'PAUSED', label: 'On Hold', color: 'bg-yellow-500' },
  { value: 'DROPPED', label: 'Dropped', color: 'bg-red-500' },
  { value: 'PLANNING', label: 'Plan to Watch', color: 'bg-purple-500' },
  { value: 'REPEATING', label: 'Rewatching', color: 'bg-indigo-500' },
]

export const AnimeStatus = ({ anime, onStatusUpdate }: AnimeStatusProps) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string | null>(null)
  const [currentScore, setCurrentScore] = useState<number>(anime.userScore || 0)
  const [showScoreInput, setShowScoreInput] = useState(false)

  // Check if user is authenticated for this anime's source
  const authServiceInstance = getAuthService(anime.source as AnimeSource)
  const isAuthenticated = authServiceInstance?.isAuthenticated() ?? false

  if (!isAuthenticated) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 mb-2">Login to track this anime</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          Login with {anime.source === 'mal' ? 'MyAnimeList' : 'AniList'}
        </button>
      </div>
    )
  }

  const statusOptions = anime.source === 'mal' ? MAL_STATUS_OPTIONS : ANILIST_STATUS_OPTIONS

  const handleStatusUpdate = async (status: string) => {
    if (!authServiceInstance) return

    setIsUpdating(true)
    try {
      const token = authServiceInstance.getToken()?.access_token
      if (!token) throw new Error('No auth token')

      if (anime.source === 'mal') {
        await malService.updateAnimeStatus(anime.id, token, { status: status as any })
      } else {
        await anilistService.updateAnimeStatus(anime.id, token, { status: status as any })
      }

      setCurrentStatus(status)
      onStatusUpdate?.(status, currentScore)
      
      // Show success feedback
      console.log(`Successfully updated anime status to: ${status}`)
    } catch (error) {
      console.error('Failed to update anime status:', error)
      alert('Failed to update anime status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleScoreUpdate = async (score: number) => {
    if (!authServiceInstance) return

    setIsUpdating(true)
    try {
      const token = authServiceInstance.getToken()?.access_token
      if (!token) throw new Error('No auth token')

      if (anime.source === 'mal') {
        await malService.updateAnimeStatus(anime.id, token, { score })
      } else {
        await anilistService.updateAnimeStatus(anime.id, token, { score })
      }

      setCurrentScore(score)
      onStatusUpdate?.(currentStatus || '', score)
      setShowScoreInput(false)
      
      console.log(`Successfully updated anime score to: ${score}`)
    } catch (error) {
      console.error('Failed to update anime score:', error)
      alert('Failed to update anime score. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveFromList = async () => {
    if (!authServiceInstance) return
    if (!confirm('Are you sure you want to remove this anime from your list?')) return

    setIsUpdating(true)
    try {
      const token = authServiceInstance.getToken()?.access_token
      if (!token) throw new Error('No auth token')

      if (anime.source === 'mal') {
        await malService.deleteAnimeFromList(anime.id, token)
      } else {
        await anilistService.deleteAnimeFromList(anime.id, token)
      }

      setCurrentStatus(null)
      setCurrentScore(0)
      onStatusUpdate?.('', 0)
      
      console.log('Successfully removed anime from list')
    } catch (error) {
      console.error('Failed to remove anime from list:', error)
      alert('Failed to remove anime from list. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Status</h3>
      
      {/* Status Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusUpdate(option.value)}
            disabled={isUpdating}
            className={`
              px-3 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200
              ${currentStatus === option.value ? option.color : 'bg-gray-400 hover:bg-gray-500'}
              ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-md'}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Score Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">My Score:</span>
          {showScoreInput ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="10"
                value={currentScore || ''}
                onChange={(e) => setCurrentScore(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="1-10"
              />
              <button
                onClick={() => handleScoreUpdate(currentScore)}
                disabled={isUpdating || currentScore < 1 || currentScore > 10}
                className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setShowScoreInput(false)}
                className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                currentScore > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {currentScore > 0 ? currentScore : 'Not Rated'}
              </span>
              <button
                onClick={() => setShowScoreInput(true)}
                disabled={isUpdating}
                className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {currentScore > 0 ? 'Edit' : 'Rate'}
              </button>
            </div>
          )}
        </div>

        {/* Remove from List */}
        {currentStatus && (
          <button
            onClick={handleRemoveFromList}
            disabled={isUpdating}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isUpdating && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Updating...</span>
          </div>
        </div>
      )}
    </div>
  )
}