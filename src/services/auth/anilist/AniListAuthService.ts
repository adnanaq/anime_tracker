import { BaseAuthService } from '../BaseAuthService'
import { AuthToken, AuthConfig } from '../types'

const ANILIST_CONFIG: AuthConfig = {
  clientId: import.meta.env.VITE_ANILIST_CLIENT_ID,
  clientSecret: import.meta.env.VITE_ANILIST_CLIENT_SECRET,
  redirectUri: `http://localhost:3000/auth/anilist/callback`,
  authUrl: 'https://anilist.co/api/v2/oauth/authorize',
  tokenUrl: import.meta.env.DEV 
    ? 'http://localhost:3002/anilist/oauth/token'  // Use proxy in development
    : 'https://anilist.co/api/v2/oauth/token',      // Direct in production
}

export class AniListAuthService extends BaseAuthService {
  constructor() {
    super(ANILIST_CONFIG, 'anilist_auth_token')
  }

  async initiateLogin(): Promise<string> {
    try {
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        response_type: 'code',
        redirect_uri: this.config.redirectUri,
        state: Math.random().toString(36).substring(7),
      })

      const authUrl = `${this.config.authUrl}?${params.toString()}`
      
      return authUrl
    } catch (error) {
      console.error('AniList OAuth initiation error:', error)
      throw error
    }
  }

  async exchangeCodeForToken(code: string): Promise<AuthToken | null> {
    const exchangeKey = `anilist-${code}`
    
    return this.preventDuplicateExchange(exchangeKey, async () => {

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      })


      try {
        const response = await fetch(this.config.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: body.toString(),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('AniList token exchange failed:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            requestBody: body.toString()
          })
          throw new Error(`AniList token exchange failed: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const tokenData = await response.json()
        
        const token: AuthToken = {
          ...tokenData,
        }

        this.saveToken(token)

        return token
      } catch (error) {
        console.error('AniList token exchange error:', error)
        return null
      }
    })
  }
}

export const anilistAuthService = new AniListAuthService()