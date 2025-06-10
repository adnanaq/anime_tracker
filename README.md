# 🎌 AnimeTrackr

A modern, triple-source anime tracking and recommendation platform powered by **MyAnimeList**, **AniList**, and **Jikan** APIs with full OAuth authentication support.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Start with MAL proxy (recommended):**
   ```bash
   npm run dev:full
   ```

4. **Manual setup:**
   ```bash
   # Terminal 1: Start MAL proxy server
   npm run proxy
   
   # Terminal 2: Start development server  
   npm run dev
   ```

5. **Open in browser:**
   - Navigate to `http://localhost:3000` (or check console for port)

6. **Build for production:**
   ```bash
   npm run build
   ```

### ⚠️ MyAnimeList CORS Issue

MyAnimeList API has CORS restrictions that prevent direct browser requests. The application includes:

- **✅ Proxy Solution**: Local proxy server (`proxy-server.js`) running on port 3002
- **✅ Fallback Mechanism**: Falls back to AniList data when MAL API fails
- **✅ Development Mode**: Uses proxy automatically in development
- **⚠️ Production**: Requires backend deployment for full MAL integration

## ✨ Features

### ✅ Phase 1 (Complete)
- **🔑 OAuth Authentication**: Full login support for MyAnimeList and AniList
- **🔄 Triple API Integration**: MyAnimeList, AniList, and Jikan for comprehensive data
- **📊 Browse Categories**: 
  - Trending Now
  - Most Popular  
  - Top Rated
  - Current Season
- **🔍 Real-time Search**: Search across both platforms instantly
- **🎴 Interactive Cards**: Hover for detailed anime information with smooth animations
- **📱 Detail Pages**: Comprehensive anime information with 3D transitions
- **⭐ User Score Display**: Personal ratings displayed on anime cards when authenticated
- **📺 Currently Watching**: Dedicated section for anime you're currently watching
- **🔗 Related Anime**: View and explore related anime (prequels, sequels, adaptations) with full hover details
- **💫 Responsive Design**: Beautiful UI that works on all devices
- **🎨 Stunning Animations**: 
  - Smooth hover effects with scale, translate, and shadow animations
  - Page load animations with staggered entrance effects
  - Three.js particle background with floating geometric shapes
  - Custom loading spinners with rotating elements
  - Detailed page transitions with element choreography
- **🏗️ Modular Architecture**: Easy to add new anime sources

### 🚀 Phase 1.5 (In Progress - Jikan Integration)
- **📸 Enhanced Images**: High-quality backgrounds from Jikan pictures endpoint
- **📅 Anime Schedule**: Weekly calendar with airing times
- **🎲 Random Discovery**: "Surprise me" feature for anime discovery
- **🔍 Advanced Search**: Genre filters, score ranges, status filters
- **💬 Recommendations**: Community-driven anime suggestions
- **📊 Reviews & Stats**: Community reviews and viewing statistics

### 🔜 Future Phases
- Vector-based recommendations (FAISS)
- Social features and friend comparison
- Offline caching with IndexedDB
- Watch status updates and progress tracking
- Cross-platform sync between MAL and AniList
- Advanced filtering and sorting options

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Anime.js v4 + Three.js
- **State Management**: Zustand
- **Routing**: React Router
- **APIs**: MyAnimeList REST + AniList GraphQL + Jikan REST
- **Authentication**: OAuth 2.0 with PKCE (MAL) and standard OAuth (AniList)
- **Proxy**: Express.js CORS proxy for MyAnimeList API

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AnimeCard/       # Anime card with hover effects
│   ├── AuthButton/      # OAuth login buttons
│   ├── Dashboard/       # Main dashboard layout
│   └── HoverCard/       # Detailed hover information
├── pages/               # Page components
│   ├── AuthCallback/    # OAuth callback handler
│   ├── AnimeDetail/     # Individual anime pages
│   └── Dashboard/       # Main application page
├── services/            # API services and data layer
│   ├── auth/           # Modular authentication system
│   │   ├── mal/        # MyAnimeList OAuth service
│   │   ├── anilist/    # AniList OAuth service
│   │   └── example/    # Template for adding new sources
│   ├── api/            # API integration services
│   └── data/           # Data normalization
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
proxy-server.js          # CORS proxy for MyAnimeList API
```

## 🔧 Configuration

The application uses environment variables for API credentials:

```env
VITE_MAL_CLIENT_ID=your_mal_client_id
VITE_MAL_CLIENT_SECRET=your_mal_client_secret
VITE_ANILIST_CLIENT_ID=your_anilist_client_id
VITE_ANILIST_CLIENT_SECRET=your_anilist_client_secret
```

## 🎯 Usage

1. **🔑 Authentication**: Login with MyAnimeList or AniList for full features
2. **📊 Browse Anime**: Explore categories like Popular, Top Rated, Seasonal
3. **⭐ View Your Scores**: See your personal ratings on anime cards (green badges)
4. **📺 Track Progress**: View your currently watching anime in dedicated section
5. **🔄 Switch Sources**: Toggle between MyAnimeList and AniList data
6. **🔍 Search**: Find specific anime across both platforms
7. **👆 View Details**: Click anime cards for comprehensive information
8. **🎴 Quick Preview**: Hover over cards for instant details with synopsis, genres, and stats
9. **🔗 Explore Related**: Discover prequels, sequels, and adaptations with full hover details

## 🔐 Authentication Setup

### MyAnimeList OAuth App Configuration
- **Redirect URI**: `http://localhost:3000/auth/mal/callback`
- **PKCE Method**: `plain` (code challenge = code verifier)
- **Required Scopes**: Basic profile access

### AniList OAuth App Configuration  
- **Redirect URI**: `http://localhost:3000/auth/anilist/callback`
- **PKCE Method**: `S256` (SHA256 hash of code verifier)
- **Required Scopes**: User profile and anime list access

## 📱 Development Status

**✅ Phase 1 Complete**: Full authentication and browsing functionality
**🚀 Servers Running**: 
- Main app: `http://localhost:3000` 
- MAL Proxy: `http://localhost:3002`
**✅ OAuth Working**: Both MyAnimeList and AniList authentication
**✅ MAL API Fixed**: MyAnimeList integration via CORS proxy
**✅ Build Tested**: Production build working without errors
**✅ Modular Architecture**: Easy to add new anime sources

## 🏗️ Adding New Anime Sources

The modular authentication system makes it easy to add new providers:

1. **Create service**: Extend `BaseAuthService` in `src/services/auth/newprovider/`
2. **Register service**: Add to auth services registry
3. **Add route**: Update routing for OAuth callback
4. **Update types**: Add to `AnimeSource` type definition

See `src/services/auth/example/CrunchyrollAuthService.example.ts` for implementation template.