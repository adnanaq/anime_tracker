# Modular Authentication System

A scalable, modular authentication system that supports multiple OAuth providers.

## Architecture

```
src/services/auth/
├── types.ts                     # Common auth interfaces
├── BaseAuthService.ts           # Abstract base class with common functionality
├── index.ts                     # Central registry and exports
├── mal/
│   └── MalAuthService.ts        # MyAnimeList OAuth implementation
├── anilist/
│   └── AniListAuthService.ts    # AniList OAuth implementation
└── example/
    └── CrunchyrollAuthService.example.ts  # Example for adding new providers
```

## Features

- **🔧 Modular Design**: Each auth provider is isolated in its own service
- **🔒 Secure**: Automatic token expiration, secure storage, PKCE support
- **🚀 Scalable**: Easy to add new providers without touching existing code
- **🛡️ Protected**: Prevents duplicate token exchanges, handles edge cases
- **📝 Type-Safe**: Full TypeScript support with interfaces
- **🧪 Testable**: Each service can be unit tested independently

## Usage

### Getting an Auth Service
```typescript
import { getAuthService } from '../services/auth'

const malAuth = getAuthService('mal')
const anilistAuth = getAuthService('anilist')
```

### Checking Authentication
```typescript
if (malAuth?.isAuthenticated()) {
  const token = malAuth.getToken()
  // Use token for API calls
}
```

### Initiating Login
```typescript
const authUrl = await malAuth.initiateLogin()
window.location.href = authUrl
```

### Handling Callback
```typescript
const token = await malAuth.exchangeCodeForToken(authCode)
if (token) {
  // Login successful
}
```

## Adding a New Provider

1. **Create the service class**:
```typescript
// src/services/auth/newprovider/NewProviderAuthService.ts
export class NewProviderAuthService extends BaseAuthService {
  async initiateLogin(): Promise<string> { /* implement */ }
  async exchangeCodeForToken(code: string): Promise<AuthToken | null> { /* implement */ }
}
```

2. **Register the service**:
```typescript
// src/services/auth/index.ts
import { newProviderAuthService } from './newprovider/NewProviderAuthService'

export const authServices: Record<string, AuthService> = {
  mal: malAuthService,
  anilist: anilistAuthService,
  newprovider: newProviderAuthService, // Add this
}
```

3. **Add the route**:
```typescript
// src/routes/AppRoutes.tsx
<Route path="/auth/newprovider/callback" element={<AuthCallback />} />
```

4. **Update types**:
```typescript
// src/types/anime.ts
export type AnimeSource = 'mal' | 'anilist' | 'newprovider'
```

That's it! The system handles everything else automatically.

## Benefits Over Monolithic Auth

### Before (Monolithic)
- ❌ Single large service handling all providers
- ❌ Hard to add new providers without breaking existing ones
- ❌ Complex conditional logic everywhere
- ❌ Difficult to test specific provider logic
- ❌ Tight coupling between different OAuth flows

### After (Modular)
- ✅ Each provider isolated in its own service
- ✅ Add new providers without touching existing code
- ✅ Clean, provider-specific logic
- ✅ Easy to unit test each service
- ✅ Loose coupling with shared interfaces

## Security Features

- **Token Expiration**: Automatic token validation and cleanup
- **PKCE Support**: For providers that require it (like MAL)
- **Duplicate Prevention**: Prevents multiple concurrent token exchanges
- **Secure Storage**: Tokens stored with expiration timestamps
- **State Validation**: CSRF protection with state parameters