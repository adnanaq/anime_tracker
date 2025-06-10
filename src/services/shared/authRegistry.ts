export * from './authTypes'
export * from './BaseAuthService'
export * from '../mal/auth'
export * from '../anilist/auth'

// Centralized auth service registry
import { malAuthService } from '../mal/auth'
import { anilistAuthService } from '../anilist/auth'
import { AuthService } from './authTypes'

export const authServices: Record<string, AuthService> = {
  mal: malAuthService,
  anilist: anilistAuthService,
}

export const getAuthService = (source: string): AuthService | undefined => {
  return authServices[source]
}