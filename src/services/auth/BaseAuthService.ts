import { AuthToken, AuthConfig, AuthService } from './types'

export abstract class BaseAuthService implements AuthService {
  protected config: AuthConfig
  protected storageKey: string
  private pendingExchanges: Map<string, Promise<AuthToken | null>> = new Map()

  constructor(config: AuthConfig, storageKey: string) {
    this.config = config
    this.storageKey = storageKey
  }

  abstract initiateLogin(): Promise<string>
  abstract exchangeCodeForToken(code: string): Promise<AuthToken | null>

  getToken(): AuthToken | null {
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return null

    try {
      const token = JSON.parse(stored) as AuthToken
      if (this.isTokenExpired(token)) {
        this.logout()
        return null
      }
      return token
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  logout(): void {
    localStorage.removeItem(this.storageKey)
    // Clear any auth-related localStorage items for this service
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.storageKey)) {
        localStorage.removeItem(key)
      }
    })
  }

  protected saveToken(token: AuthToken): void {
    // Add expiration timestamp if expires_in is provided
    if (token.expires_in) {
      token.expires_at = Date.now() + (token.expires_in * 1000)
    }
    localStorage.setItem(this.storageKey, JSON.stringify(token))
  }

  protected isTokenExpired(token: AuthToken): boolean {
    if (!token.expires_at) return false
    return Date.now() >= token.expires_at
  }

  protected async preventDuplicateExchange(
    exchangeKey: string, 
    exchangeFn: () => Promise<AuthToken | null>
  ): Promise<AuthToken | null> {
    if (this.pendingExchanges.has(exchangeKey)) {
      return this.pendingExchanges.get(exchangeKey)!
    }

    const exchangePromise = exchangeFn()
    this.pendingExchanges.set(exchangeKey, exchangePromise)
    
    try {
      return await exchangePromise
    } finally {
      this.pendingExchanges.delete(exchangeKey)
    }
  }
}