import { AnimeSource } from '../types/anime'

interface AuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
}

const MAL_CONFIG: AuthConfig = {
  clientId: import.meta.env.VITE_MAL_CLIENT_ID,
  clientSecret: import.meta.env.VITE_MAL_CLIENT_SECRET,
  redirectUri: `http://localhost:3000/auth/mal/callback`, // Should match MAL app settings
  authUrl: 'https://myanimelist.net/v1/oauth2/authorize',
  tokenUrl: 'https://myanimelist.net/v1/oauth2/token',
}

// Use proxy for AniList token exchange in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV
const ANILIST_CONFIG: AuthConfig = {
  clientId: import.meta.env.VITE_ANILIST_CLIENT_ID,
  clientSecret: import.meta.env.VITE_ANILIST_CLIENT_SECRET,
  redirectUri: `http://localhost:3000/auth/anilist/callback`, // Fixed for development
  authUrl: 'https://anilist.co/api/v2/oauth/authorize',
  tokenUrl: isDevelopment 
    ? 'http://localhost:3002/anilist/oauth/token'  // Use proxy in development
    : 'https://anilist.co/api/v2/oauth/token',      // Direct in production
}

export interface AuthToken {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
  source: AnimeSource
}

export class AuthService {
  private static instance: AuthService
  private tokens: Map<AnimeSource, AuthToken> = new Map()
  private pendingExchanges: Map<string, Promise<AuthToken | null>> = new Map()

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  async generateCodeChallenge(verifier: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(verifier)
      const digest = await crypto.subtle.digest('SHA-256', data)
      return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    } catch (error) {
      console.error('Error generating code challenge:', error)
      throw error
    }
  }

  async initiateLogin(source: AnimeSource): Promise<string> {
    const config = source === 'mal' ? MAL_CONFIG : ANILIST_CONFIG

    if (source === 'mal') {
      // MAL uses PKCE
      const codeVerifier = this.generateCodeVerifier()
      const codeChallenge = await this.generateCodeChallenge(codeVerifier)
      
      // Store code verifier for later use
      localStorage.setItem(`${source}_code_verifier`, codeVerifier)

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: Math.random().toString(36).substring(7),
      })

      const authUrl = `${config.authUrl}?${params.toString()}`
      
      return authUrl
    } else {
      // AniList uses simpler OAuth without PKCE
      const params = new URLSearchParams({
        client_id: config.clientId,
        response_type: 'code',
        redirect_uri: config.redirectUri,
        state: Math.random().toString(36).substring(7),
      })

      const authUrl = `${config.authUrl}?${params.toString()}`
      
      return authUrl
    }
  }

  async exchangeCodeForToken(source: AnimeSource, code: string): Promise<AuthToken | null> {
    // Prevent duplicate calls with same code
    const exchangeKey = `${source}-${code}`
    if (this.pendingExchanges.has(exchangeKey)) {
      return this.pendingExchanges.get(exchangeKey)!
    }

    const config = source === 'mal' ? MAL_CONFIG : ANILIST_CONFIG
    const codeVerifier = localStorage.getItem(`${source}_code_verifier`)


    if (!codeVerifier && source === 'mal') {
      throw new Error('Code verifier not found')
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    })

    if (source === 'mal' && codeVerifier) {
      body.append('code_verifier', codeVerifier)
    }


    // Create and track the exchange promise
    const exchangePromise = this.performTokenExchange(config, body, source, exchangeKey)
    this.pendingExchanges.set(exchangeKey, exchangePromise)
    
    return exchangePromise
  }

  private async performTokenExchange(config: AuthConfig, body: URLSearchParams, source: AnimeSource, exchangeKey: string): Promise<AuthToken | null> {
    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: body.toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`${source} token exchange failed:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestBody: body.toString()
        })
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const tokenData = await response.json()
      
      const token: AuthToken = {
        ...tokenData,
        source,
      }

      this.tokens.set(source, token)
      this.saveTokenToStorage(source, token)
      
      // Clean up code verifier
      if (source === 'mal') {
        localStorage.removeItem(`${source}_code_verifier`)
      }

      return token
    } catch (error) {
      console.error(`${source} token exchange error:`, error)
      return null
    } finally {
      // Clean up the pending exchange
      this.pendingExchanges.delete(exchangeKey)
    }
  }

  getToken(source: AnimeSource): AuthToken | null {
    return this.tokens.get(source) || this.loadTokenFromStorage(source)
  }

  isAuthenticated(source: AnimeSource): boolean {
    const token = this.getToken(source)
    return !!token && !this.isTokenExpired(token)
  }

  private isTokenExpired(token: AuthToken): boolean {
    if (!token.expires_in) return false
    // This is a simplified check - in a real app you'd store the issued timestamp
    return false
  }

  private saveTokenToStorage(source: AnimeSource, token: AuthToken): void {
    localStorage.setItem(`${source}_token`, JSON.stringify(token))
  }

  private loadTokenFromStorage(source: AnimeSource): AuthToken | null {
    const stored = localStorage.getItem(`${source}_token`)
    if (!stored) return null

    try {
      const token = JSON.parse(stored) as AuthToken
      this.tokens.set(source, token)
      return token
    } catch {
      return null
    }
  }

  logout(source: AnimeSource): void {
    this.tokens.delete(source)
    localStorage.removeItem(`${source}_token`)
    localStorage.removeItem(`${source}_code_verifier`)
  }

  logoutAll(): void {
    this.logout('mal')
    this.logout('anilist')
  }
}

export const authService = AuthService.getInstance()