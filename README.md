# 🎌 AnimeTrackr

A modern anime tracking platform with triple-source API integration (MyAnimeList + AniList + Jikan), OAuth authentication, and intelligent caching.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development with proxy (recommended)
npm run dev:full

# Or start manually
npm run proxy  # Terminal 1
npm run dev    # Terminal 2

# Build for production
npm run build
```

**Open**: `http://localhost:3000`

## ✨ Key Features

- **🔑 OAuth Authentication**: MyAnimeList and AniList login
- **🔄 Triple API Integration**: MAL + AniList + Jikan for comprehensive data
- **⚡ High-Performance Caching**: 60-80% hit rates with multi-tiered system
- **🎨 Interactive UI**: Expandable cards with smooth animations
- **📊 Personal Tracking**: View scores and watch status
- **🔍 Advanced Search**: Genre filters, score ranges, real-time search
- **📅 Anime Schedule**: Weekly calendar with timezone support and delayed episode tracking
- **🎲 Discovery Features**: Random anime and recommendations
- **🌊 Airing Status Indicator**: Subtle ripple effects for currently airing anime
- **🧪 Comprehensive Testing**: 756+ tests with 98.9% pass rate and full utility coverage
- **🔧 Type Safety**: 100% TypeScript compliance with zero production type errors

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Design Tokens
- **State**: Zustand
- **Animations**: Anime.js + Three.js
- **APIs**: MAL REST + AniList GraphQL + Jikan REST
- **Auth**: OAuth 2.0 with PKCE
- **Cache**: Memory + IndexedDB + Request deduplication
- **Testing**: Vitest + Testing Library + Playwright + Storybook
- **Date/Time**: Temporal API for accurate timezone handling

## 🔧 Configuration

Create `.env` file:
```env
VITE_MAL_CLIENT_ID=your_mal_client_id
VITE_MAL_CLIENT_SECRET=your_mal_client_secret
VITE_ANILIST_CLIENT_ID=your_anilist_client_id
VITE_ANILIST_CLIENT_SECRET=your_anilist_client_secret
```

### OAuth Setup

**MyAnimeList**:
- Redirect URI: `http://localhost:3000/auth/mal/callback`
- PKCE Method: `plain`

**AniList**:
- Redirect URI: `http://localhost:3000/auth/anilist/callback`  
- PKCE Method: `S256`

## 🎯 Usage

1. **Login** with MAL or AniList for full features
2. **Browse** trending, popular, and seasonal anime
3. **Search** across all platforms
4. **Track** your anime with personal scores
5. **Discover** new anime with recommendations
6. **Schedule** upcoming episodes with calendar

## ⚠️ CORS Proxy

MyAnimeList requires a CORS proxy for browser requests:
- **Development**: Automatic proxy on port 3002
- **Production**: Requires backend deployment

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run dev:full     # Start with proxy server
npm run proxy        # Start MAL CORS proxy only
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run test suite (756+ tests, 98.9% pass rate)
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
npm run storybook    # Start component storybook
npm run cache-test   # Cache performance testing
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Design system components
│   ├── AnimeCard/       # Anime display cards
│   ├── Dashboard/       # Main dashboard
│   ├── ExpandableGrid/  # Interactive grid system
│   └── AdvancedSearch/  # Search functionality
├── pages/               # Route components
│   ├── AnimeDetail/     # Individual anime pages
│   └── AuthCallback/    # OAuth handlers
├── services/            # API and business logic
│   ├── auth/           # Authentication services
│   ├── api/            # API integrations
│   ├── mal/            # MyAnimeList service
│   ├── anilist/        # AniList service
│   └── jikan/          # Jikan service
├── store/               # Zustand state management
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
│   ├── dateUtils.ts     # Date and timezone utilities
│   └── __tests__/       # Utility test files (100% coverage)
├── types/               # TypeScript definitions
├── styles/              # Design tokens and CSS
├── stories/             # Storybook component stories
└── test/               # Test utilities and setup
```

### Key Files
- `proxy-server.js` - CORS proxy for MyAnimeList
- `tailwind.config.js` - Design system configuration
- `vite.config.ts` - Build configuration
- `vitest.config.ts` - Test configuration
- `PLANNING.md` - Development roadmap and technical planning
- `TASK.md` - Current development tasks and sprint planning