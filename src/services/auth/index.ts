export * from './types'
export * from './BaseAuthService'
export * from './mal/MalAuthService'
export * from './anilist/AniListAuthService'

// Centralized auth service registry
import { malAuthService } from './mal/MalAuthService'
import { anilistAuthService } from './anilist/AniListAuthService'
import { AuthService } from './types'

export const authServices: Record<string, AuthService> = {
  mal: malAuthService,
  anilist: anilistAuthService,
}

export const getAuthService = (source: string): AuthService | undefined => {
  return authServices[source]
}