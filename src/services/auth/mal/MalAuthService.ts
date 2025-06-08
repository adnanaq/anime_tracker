import { BaseAuthService } from '../BaseAuthService'
import { AuthToken, AuthConfig } from '../types'

const MAL_CONFIG: AuthConfig = {
  clientId: import.meta.env.VITE_MAL_CLIENT_ID,
  clientSecret: import.meta.env.VITE_MAL_CLIENT_SECRET,
  redirectUri: `http://localhost:3000/auth/mal/callback`,
  authUrl: 'https://myanimelist.net/v1/oauth2/authorize',
  tokenUrl: import.meta.env.DEV 
    ? 'http://localhost:3002/mal/oauth/token'      // Use proxy in development
    : 'https://myanimelist.net/v1/oauth2/token',   // Direct in production
}

export class MalAuthService extends BaseAuthService {
  constructor() {
    super(MAL_CONFIG, 'mal_auth_token')
  }

  async initiateLogin(): Promise<string> {
    try {
      const codeVerifier = this.generateCodeVerifier()
      const codeChallenge = codeVerifier // MAL uses "plain" method, not SHA256
      
      // Store code verifier for later use
      localStorage.setItem('mal_code_verifier', codeVerifier)

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: 'plain',
        state: Math.random().toString(36).substring(7),
      })

      const authUrl = `${this.config.authUrl}?${params.toString()}`
      
      return authUrl
    } catch (error) {
      console.error('MAL OAuth initiation error:', error)
      throw error
    }
  }

  async exchangeCodeForToken(code: string): Promise<AuthToken | null> {
    const exchangeKey = `mal-${code}`
    
    return this.preventDuplicateExchange(exchangeKey, async () => {
      const codeVerifier = localStorage.getItem('mal_code_verifier')

      if (!codeVerifier) {
        throw new Error('MAL code verifier not found')
      }


      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier,
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
          console.error('MAL token exchange failed:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            requestBody: body.toString()
          })
          throw new Error(`MAL token exchange failed: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const tokenData = await response.json()
        
        const token: AuthToken = {
          ...tokenData,
        }

        this.saveToken(token)
        
        // Clean up code verifier
        localStorage.removeItem('mal_code_verifier')

        return token
      } catch (error) {
        console.error('MAL token exchange error:', error)
        return null
      }
    })
  }

  private generateCodeVerifier(): string {
    // Generate a cryptographically random 43-128 character string using base64url alphabet
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    const array = new Uint8Array(43) // Generate exactly 43 characters
    crypto.getRandomValues(array)
    
    return Array.from(array, byte => charset[byte % charset.length]).join('')
  }

  // Unused - MAL uses "plain" method
  // private async generateCodeChallenge(verifier: string): Promise<string> {
  //   try {
  //     const encoder = new TextEncoder()
  //     const data = encoder.encode(verifier)
  //     const digest = await crypto.subtle.digest('SHA-256', data)
  //     
  //     // Convert to base64url format
  //     const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  //     return base64
  //       .replace(/\+/g, '-')
  //       .replace(/\//g, '_')
  //       .replace(/=/g, '')
  //   } catch (error) {
  //     console.error('Error generating MAL code challenge:', error)
  //     throw error
  //   }
  // }
}

export const malAuthService = new MalAuthService()