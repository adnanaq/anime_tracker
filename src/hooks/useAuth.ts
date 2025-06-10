import { useMemo } from 'react'
import { getAuthService } from '../services/shared'
import { AnimeSource } from '../types/anime'

/**
 * Custom hook for authentication management
 * Consolidates auth logic that was repeated across components
 */
export const useAuth = (source: AnimeSource) => {
  const authService = useMemo(() => getAuthService(source), [source])
  
  const isAuthenticated = useMemo(() => {
    return authService?.isAuthenticated() ?? false
  }, [authService])
  
  const token = useMemo(() => {
    return authService?.getToken() ?? null
  }, [authService])
  
  const accessToken = useMemo(() => {
    return token?.access_token ?? null
  }, [token])
  
  return {
    authService,
    isAuthenticated,
    token,
    accessToken,
    // Helper methods
    login: () => authService?.initiateLogin(),
    logout: () => authService?.logout(),
    refreshToken: () => authService?.refreshToken?.(),
  }
}

/**
 * Hook specifically for anime-related authentication
 * Provides auth state for a specific anime source
 */
export const useAnimeAuth = (source: AnimeSource) => {
  const auth = useAuth(source)
  
  return {
    ...auth,
    // Anime-specific helpers
    canUpdateStatus: auth.isAuthenticated,
    canUpdateScore: auth.isAuthenticated,
    canAddToList: auth.isAuthenticated,
  }
}

/**
 * Hook for checking authentication across multiple sources
 * Useful for components that work with both MAL and AniList
 */
export const useMultiSourceAuth = () => {
  const malAuth = useAuth('mal')
  const anilistAuth = useAuth('anilist')
  
  return {
    mal: malAuth,
    anilist: anilistAuth,
    isAnyAuthenticated: malAuth.isAuthenticated || anilistAuth.isAuthenticated,
    authenticatedSources: [
      ...(malAuth.isAuthenticated ? ['mal' as const] : []),
      ...(anilistAuth.isAuthenticated ? ['anilist' as const] : []),
    ],
  }
}