import { useState } from 'react'
import { getAuthService } from '../services/shared'
import { AnimeSource } from '../types/anime'
import { Button } from './ui'

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
      <Button
        variant="danger"
        size="sm"
        onClick={handleLogout}
        leftIcon="🚪"
        className="!h-8"
      >
        Logout from {sourceName}
      </Button>
    )
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleLogin}
      loading={isLoading}
      leftIcon={isLoading ? undefined : "🔑"}
      className="!h-8"
    >
      {isLoading ? "Connecting..." : `Login with ${sourceName}`}
    </Button>
  )
}