# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Development Environment

```bash
# Start development with proxy server (recommended)
npm run dev:full

# Or start components separately
npm run proxy   # Terminal 1 - CORS proxy on port 3002
npm run dev     # Terminal 2 - Vite dev server on port 3000

# Production build
npm run build

# Preview production build
npm run preview
```

### Testing Commands

```bash
# Run all tests (756 tests, 98.9% pass rate)
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests once and exit
npm run test:run

# Run E2E tests with Playwright
npm run test:e2e
npm run test:e2e:ui

# Run all tests (unit + e2e)
npm run test:all
```

### Code Quality

```bash
# Lint TypeScript/React code
npm run lint

# Component development with Storybook
npm run storybook
npm run build-storybook
```

## Architecture Overview

### Core Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand with devtools
- **Styling**: Tailwind CSS + CSS modules for components
- **Animations**: Anime.js v4 + Three.js + Framer Motion
- **APIs**: Triple integration (MyAnimeList REST + AniList GraphQL + Jikan REST)
- **Authentication**: OAuth 2.0 with PKCE for both MAL and AniList
- **Caching**: Multi-tiered system (Memory + IndexedDB + Request deduplication)
- **Testing**: Vitest + Testing Library + Playwright

### Project Structure & Key Patterns

#### Service Layer Architecture

The app uses a service-oriented architecture with three main API integrations:

1. **`src/services/animeService.ts`** - Main service abstraction that coordinates between sources
2. **Source-specific services**:
   - `src/services/mal/` - MyAnimeList integration
   - `src/services/anilist/` - AniList GraphQL integration
   - `src/services/jikan/` - Jikan REST API integration
3. **`src/services/shared/`** - Authentication registry and common utilities

#### State Management Pattern

- **`src/store/animeStore.ts`** - Main Zustand store with 60+ actions
- Centralized state for anime data, user preferences, loading states
- Smart data merging between different API sources
- User authentication tokens and status management

#### Component Architecture

- **`src/components/ui/`** - Reusable design system components (Badge, Button, Card, etc.)
- **`src/components/`** - Feature-specific components (Dashboard, SearchBar, etc.)
- Each component has dedicated CSS module and comprehensive tests
- Storybook integration for component development

#### Caching System

- **`src/lib/cache/`** - Sophisticated caching with multiple strategies
- Request deduplication to prevent duplicate API calls
- Cache hit rates of 60-80% in production
- Different TTL strategies based on data type (static vs dynamic)

### Authentication Flow

The app supports dual OAuth authentication:

- **MyAnimeList**: OAuth 2.0 with PKCE (plain method)
- **AniList**: OAuth 2.0 with PKCE (S256 method)
- Tokens stored securely, automatic refresh handling
- Callback URLs: `/auth/mal/callback` and `/auth/anilist/callback`

### Data Flow Pattern

1. **User Action** ’ Component
2. **Component** ’ Zustand Store Action
3. **Store Action** ’ Service Layer
4. **Service Layer** ’ Cache Check ’ API Call (if needed)
5. **Response** ’ Data Normalization ’ Store Update
6. **Store Update** ’ Component Re-render

## Development Guidelines

### Component Development

- Always use TDD
- All UI components in `src/components/ui/` must have:
  - TypeScript interfaces for props
  - CSS module for styling
  - Comprehensive test coverage
  - Storybook stories
- Use the existing design system components before creating new ones
- Follow the established component patterns (index.ts exports, etc.)

### API Integration

- Always use the `animeService` abstraction rather than calling APIs directly
- Handle both authenticated and unauthenticated states
- Implement proper error handling and fallbacks
- Use the existing caching system for performance

### State Management

- Use Zustand store for global state
- Follow the established patterns for loading states and error handling
- When adding new actions, maintain the same patterns as existing actions
- Update user data merging logic when adding new user-specific features

### Testing Requirements

- Write tests for all new utilities (aim for 100% coverage like existing utils)
- Use mocks whereever possible
- Component tests should cover user interactions and edge cases
- Integration tests for complex user flows
- E2E tests for critical paths using Playwright

### Performance Considerations

- The app maintains 60-80% cache hit rates - preserve this when adding features
- Use the existing request deduplication system
- Minimize API calls by leveraging cached data
- Follow the established patterns for loading states to maintain good UX

## Environment Setup

### Required Environment Variables

```env
VITE_MAL_CLIENT_ID=your_mal_client_id
VITE_MAL_CLIENT_SECRET=your_mal_client_secret
VITE_ANILIST_CLIENT_ID=your_anilist_client_id
VITE_ANILIST_CLIENT_SECRET=your_anilist_client_secret
```

### CORS Proxy Requirement

MyAnimeList API requires a CORS proxy for browser requests. The development setup includes `proxy-server.js` that runs on port 3002. Always use `npm run dev:full` to ensure both the proxy and dev server are running.

## Key Files & Their Purpose

- **`src/store/animeStore.ts`** - Main application state (600+ lines, core business logic)
- **`src/services/animeService.ts`** - API coordination layer
- **`src/lib/cache/`** - High-performance caching system
- **`src/types/anime.ts`** - TypeScript definitions for anime data
- **`proxy-server.js`** - CORS proxy server for MyAnimeList API
- **`src/test/setup.ts`** - Global test configuration and mocks
- **`PLANNING.md`** - Technical roadmap and architecture decisions

## Testing Infrastructure

The project has exceptional test coverage with 756 individual tests across 31 test files:

- **Unit Tests**: All utilities have 100% test coverage
- **Component Tests**: Comprehensive coverage of UI components and user interactions
- **Integration Tests**: Cross-component functionality and API integration
- **E2E Tests**: Full user workflows with Playwright
- **Business Logic Tests**: Complex anime status management and data flow

Test configuration uses Vitest with jsdom environment and comprehensive mocking setup in `src/test/setup.ts`.

