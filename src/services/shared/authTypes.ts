export interface AuthToken {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
  expires_at?: number
}

export interface AuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
}

export interface AuthService {
  initiateLogin(): Promise<string>
  exchangeCodeForToken(code: string): Promise<AuthToken | null>
  getToken(): AuthToken | null
  isAuthenticated(): boolean
  logout(): void
  refreshToken?(): Promise<AuthToken | null>
}