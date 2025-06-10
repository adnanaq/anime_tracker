import { useState } from 'react'
import { getAuthService } from '../services/shared'
import { AnimeSource } from '../types/anime'

interface AuthButtonProps {
  source: AnimeSource
}

export const AuthButton = ({ source }: AuthButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const authService = getAuthService(source)
  const isAuthenticated = authService?.isAuthenticated() ?? false

  const handleLogin = async () => {
    if (!authService) {
      alert(`Auth service not available for ${source}`)
      return
    }

    setIsLoading(true)
    try {
      const authUrl = await authService.initiateLogin()
      
      if (authUrl) {
        window.location.href = authUrl
      } else {
        console.error(`No OAuth URL returned for ${source}`)
      }
    } catch (error) {
      console.error(`${source} login error:`, error)
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (authService) {
      authService.logout()
      window.location.reload()
    }
  }

  const sourceName = source === 'mal' ? 'MyAnimeList' : 'AniList'

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Logout from {sourceName}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          Connecting...
        </>
      ) : (
        `Login with ${sourceName}`
      )}
    </button>
  )
}