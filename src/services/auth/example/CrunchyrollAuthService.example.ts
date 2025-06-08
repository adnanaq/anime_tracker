// Example: How to add a new auth service (Crunchyroll)
// Just extend BaseAuthService and implement the required methods

import { BaseAuthService } from '../BaseAuthService'
import { AuthToken, AuthConfig } from '../types'

const CRUNCHYROLL_CONFIG: AuthConfig = {
  clientId: 'your_crunchyroll_client_id',
  clientSecret: 'your_crunchyroll_client_secret',
  redirectUri: `http://localhost:3000/auth/crunchyroll/callback`,
  authUrl: 'https://api.crunchyroll.com/oauth/authorize',
  tokenUrl: 'https://api.crunchyroll.com/oauth/token',
}

export class CrunchyrollAuthService extends BaseAuthService {
  constructor() {
    super(CRUNCHYROLL_CONFIG, 'crunchyroll_auth_token')
  }

  async initiateLogin(): Promise<string> {
    // Implement Crunchyroll-specific OAuth flow
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'offline_access', // Crunchyroll specific scopes
      state: Math.random().toString(36).substring(7),
    })

    return `${this.config.authUrl}?${params.toString()}`
  }

  async exchangeCodeForToken(code: string): Promise<AuthToken | null> {
    // Implement Crunchyroll-specific token exchange
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      redirect_uri: this.config.redirectUri,
    })

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      throw new Error(`Crunchyroll token exchange failed: ${response.status}`)
    }

    const tokenData = await response.json()
    const token: AuthToken = { ...tokenData }
    
    this.saveToken(token)
    return token
  }
}

// To use:
// 1. Add to src/services/auth/index.ts:
//    export * from './example/CrunchyrollAuthService'
//    import { crunchyrollAuthService } from './example/CrunchyrollAuthService'
//    
// 2. Add to authServices registry:
//    export const authServices: Record<string, AuthService> = {
//      mal: malAuthService,
//      anilist: anilistAuthService,
//      crunchyroll: crunchyrollAuthService, // <-- Add this
//    }
//
// 3. Add route in AppRoutes.tsx:
//    <Route path="/auth/crunchyroll/callback" element={<AuthCallback />} />
//
// 4. Update AnimeSource type in types/anime.ts:
//    export type AnimeSource = 'mal' | 'anilist' | 'crunchyroll'
//
// That's it! The auth system automatically handles the rest.