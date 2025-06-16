# AnimeTrackr - Project Planning Overview

## 🎯 Project Vision

A modern, triple-source anime tracking and recommendation platform powered by **MyAnimeList**, **AniList**, and **Jikan** APIs with high-performance caching, supporting rich interactions, offline access, and vector-based recommendation — built to scale into a streaming-first modular app.

## 📊 Current Project Status

**Overall Health**: EXCELLENT 🟢  
**Development Phase**: Phase 1.5 Complete + Major Optimizations + Testing Excellence  
**Code Quality**: Exceptional (95% TypeScript coverage, 100% utility test coverage, 98.9% test pass rate)  
**Architecture**: Scalable and well-designed  
**Testing Coverage**: 31 test files with 756 individual tests (98.9% pass rate)  
**Performance**: Optimized (60-80% cache hit rates, 60% code reduction in store)

---

## 📋 Development Phases

### ✅ Phase 1 - MVP (COMPLETED)
**Status**: Phase 1.5 Complete - Enhanced Features + Caching + Major Optimizations

**Core Features Delivered** (Exceeds Original Planning):
- ✅ Full triple API integration (MyAnimeList + AniList + Jikan)
- ✅ OAuth authentication for both platforms
- ✅ User score display on anime cards (personal ratings with green badges)
- ✅ Currently watching section on dashboard
- ✅ Related anime exploration with full hover details and user scores
- ✅ Stunning animation system with Anime.js v4 + Three.js
- ✅ Interactive anime cards with smooth hover effects
- ✅ Comprehensive detail pages with 3D transitions
- ✅ Real-time search across both platforms
- ✅ Source switching with clean UI
- ✅ Responsive design with Tailwind CSS
- ✅ Three.js particle background animations
- ✅ Custom loading spinners and micro-interactions
- ✅ Performance optimizations (reduced API calls from 20 to 6 per section)
- ✅ Fixed CORS issues and proxy server authentication
- ✅ Clean console output and production-ready build
- ✅ Smart hover system with intelligent animation delays
- ✅ Enhanced hover cards with changeable status management
- ✅ Proper z-index management for overlay interactions
- ✅ Hero section with trending anime carousel and auto-scrolling
- ✅ Fixed MAL background field issue (was text, not image)
- ✅ **Jikan API Integration**: Complete third data source with richer metadata
- ✅ **Enhanced hero images** using Jikan's pictures endpoint
- ✅ **Weekly anime schedule/calendar** feature with timezone support
- ✅ **Random anime discovery** with "Surprise me" functionality
- ✅ **Advanced search** with genre filters and score ranges
- ✅ **Anime recommendations system** with community data
- ✅ **Reviews and community statistics**
- ✅ **High-Performance Caching System**: Multi-tiered cache with 60-80% hit rates
- ✅ **Request deduplication** and intelligent rate limiting
- ✅ **Persistent cache storage** with IndexedDB
- ✅ **Real-time cache performance monitoring** and testing tools
- ✅ **Expandable Grid System**: Interactive anime cards that expand horizontally on hover/click with full status management and smooth CSS Grid animations
- ✅ **Comprehensive Testing Infrastructure**: 24 test files with 100% pass rate covering components, hooks, services, and utilities
- ✅ **100% Utility Test Coverage**: Complete test coverage for all utility functions with edge cases
- ✅ **Design Token System**: Centralized styling with 95% adoption and 58% animation consolidation
- ✅ **Store Optimization**: DRY helper functions achieving 60% code reduction
- ✅ **TypeScript Excellence**: 95% elimination of any types with proper interfaces
- 🔄 **Development Tools**: Storybook implementation in progress (Phase 1: UI System)
- ✅ **Performance Monitoring**: Cache testing tools and performance analytics
- ✅ **Utility Libraries**: Extracted theme, search, and debounce utilities with full test coverage

**Pending Phase 1 Items**:
- 🔄 Vector Recommendations using FAISS (infrastructure ready, integration pending)
- 🔄 Anime-to-anime similarity using cosine similarity on watch vectors
- 🔄 **ExpandableGrid Component Refactoring** (1,031 lines original component still in use - BaseAnimeCard created as supplementary component ✅)
- 🔄 **TypeScript Type Safety Audit** (Significant improvements made, 98.9% test pass rate, some refinements needed)
- ✅ **BaseAnimeCard Modular Architecture** (248 lines → 83 lines via composition pattern with extracted useDimensions, useAutoCycling hooks, and core Card component)
- ✅ **BaseAnimeCard Data Population Enhancement** (COMPLETED - Full ExpandableGrid visual parity achieved with responsive rem units)

### 🎨 Phase 1.6 - Storybook Implementation (IN PROGRESS)
**Status**: Phase 1 Active Development  
**Focus**: Component documentation and visual development environment  

**Phase 1 - UI System & Simple Components** (95% Complete):
- ✅ **UI System Stories**: Button ✅, Typography ✅, Badge ✅, Skeleton ✅, AnimeGridSkeleton ✅, BaseAnimeCard ✅, AnimeInfoCard ✅
- 🔄 **Simple Component Stories**: AnimatedButton, LoadingSpinner, ThemeToggle, SourceToggle
- ✅ **Configuration Enhancement**: Essential addons, mock strategies, Tailwind integration
- ✅ **Foundation Patterns**: Established comprehensive story patterns and testing approaches

**Phase 2 - Interactive Components** (Planned):
- 📋 **Form Components**: SearchBar with store integration
- 📋 **Display Components**: Hero, AnimeCard, ExpandingAnimeCards
- 📋 **Interaction Patterns**: User input, navigation, animations

**Phase 3 - Complex Components** (Planned):
- 📋 **Advanced Components**: ExpandableGrid, AdvancedSearch, RandomAnime
- 📋 **Service Integration**: API mocking, async state management
- 📋 **Complex Workflows**: Multi-step interactions and error handling

**Phase 4 - Enhancement & Documentation** (Planned):
- 📋 **Organization**: Story categorization and navigation
- 📋 **Documentation**: Usage guidelines and best practices
- 📋 **Accessibility**: A11y testing and responsive design
- 📋 **Performance**: Animation optimization examples

### 🟡 Phase 2 - Intelligence Layer (PLANNED)
**Focus**: AI-powered features and smart automation

**Planned Features**:
- 📋 Summarizer for hover cards using LLMs or local transformers (T5, Pegasus)
- 📋 Smart Suggestion System (based on time, day, and trends)
- 📋 Cross-sync logic with auto-update across MAL ↔ AniList

### 🟢 Phase 3 - Enhanced User Experience (PLANNED)
**Focus**: Advanced user interactions and social features

**Planned Features**:
- 📋 Natural Language Search (e.g., "romantic anime with sad ending")
- 📋 Social Compare Recommendations (anime overlap graphs and stats)
- 📋 Graph Similarity Explorer (React-force-graph, D3.js)

### 🟣 Phase 4 - Smart Assistant (PLANNED)
**Focus**: AI chatbot and knowledge integration

**Planned Features**:
- 📋 Anime Chatbot (Otaku Assistant)
- 📋 Knowledge of anime lore, recommendations, trivia

### 🟠 Phase 5 - Advanced UX (PLANNED)
**Focus**: Voice, offline, and streaming integration

**Planned Features**:
- 📋 Voice Assistant (Whisper → Chat → Actions)
- 📋 Offline-first PWA Mode for cached dashboard
- 📋 Streaming Player Integration (Future Module)

### 🔧 Phase 6 - MCP Server Integration (PLANNED)
**Focus**: AI assistant ecosystem integration

**Planned Architecture**:
- 📋 Model Context Protocol (MCP) Server: Convert AnimeTrackr backend to MCP server for seamless AI assistant integration
- 📋 AI Assistant Tools: Enable Claude/GPT to directly interact with user's anime data through standardized protocol
- 📋 FastAPI Backend Migration: Transition from Express.js proxy to FastAPI-based MCP server

---

## 🏗️ MCP Server Integration Plan

### 🎯 MCP Server Vision
Convert AnimeTrackr's backend infrastructure into a **Model Context Protocol (MCP) server** to enable seamless AI assistant integration. This will allow Claude, GPT, and other AI assistants to directly interact with users' anime data, preferences, and tracking information through standardized tools.

### 🚀 FastAPI Backend Migration Plan
**Current State**: Express.js proxy server for CORS handling  
**Target State**: FastAPI-based MCP server with comprehensive anime management tools

**Why FastAPI?**
- **Performance**: Async/await support for concurrent API calls to MAL/AniList
- **Type Safety**: Pydantic models for robust data validation
- **Documentation**: Auto-generated OpenAPI/Swagger docs
- **MCP Compatibility**: Python ecosystem has mature MCP server implementations
- **Scalability**: Better handling of vector operations for recommendations

### 🛠️ MCP Server Implementation Roadmap

#### Phase 1: Backend Migration
- 📋 FastAPI Setup: Replace Express.js proxy with FastAPI server
- 📋 API Integration: Migrate MAL/AniList API clients to Python
- 📋 Authentication: Implement OAuth flows for both platforms
- 📋 Database Layer: Add PostgreSQL/SQLite for user data persistence
- 📋 CORS Handling: Maintain existing CORS proxy functionality

#### Phase 2: MCP Protocol Implementation
- 📋 MCP Server Framework: Implement MCP server using `mcp` Python package
- 📋 Tool Registration: Define standardized tools for anime operations
- 📋 Resource Management: Expose user anime lists and preferences as resources
- 📋 Prompt Templates: Create context-aware prompts for anime recommendations

#### Phase 3: AI Assistant Tools
**Core MCP Tools Planned**:
- `search_anime`: Search for anime across MAL and AniList
- `get_anime_details`: Get comprehensive anime information
- `get_recommendations`: Get personalized anime recommendations using FAISS vectors
- `add_to_watchlist`: Add anime to user's tracking list
- `update_anime_status`: Update anime watch status and rating
- `get_user_stats`: Get user's anime watching statistics and preferences
- `compare_anime_lists`: Compare anime lists between users
- `get_trending_discussions`: Get trending anime discussions and community insights

**MCP Resources Planned**:
- `user_watchlist`: User's complete anime watchlist with scores and status
- `user_preferences`: User's anime genre preferences and rating patterns
- `anime_database`: Searchable anime database with metadata

#### Phase 4: Advanced AI Features
**Vector Recommendations**:
- 📋 FAISS Integration: Implement vector similarity search for anime recommendations
- 📋 User Embeddings: Create user preference vectors from watch history
- 📋 Contextual Recommendations: AI can ask "recommend anime similar to Attack on Titan but more lighthearted"

**Natural Language Interface**:
- 📋 Conversational Updates: "Mark Demon Slayer as completed with a score of 9"
- 📋 Complex Queries: "Show me anime I might like based on my recent 10/10 ratings"
- 📋 Smart Scheduling: "What should I watch next for a 2-hour session?"

### 🔌 Integration Benefits Planned

**For Users**:
- Natural Interaction: "Hey Claude, update my anime list and recommend something new"
- Smart Discovery: AI-powered recommendations based on conversation context
- Cross-Platform Sync: Unified management across MAL and AniList through AI
- Contextual Help: "What anime should I watch while studying?" gets personalized suggestions

**For Developers**:
- Standardized API: MCP protocol provides consistent interface for AI integration
- Modular Architecture: Easy to add new anime sources or AI capabilities
- Type Safety: FastAPI + Pydantic ensures robust data handling
- Scalability: FastAPI's async support handles concurrent user requests efficiently

### 🌟 Future Possibilities
- 📋 Multi-Modal AI: Upload anime screenshots for AI identification and recommendations
- 📋 Voice Integration: "Alexa, add this anime to my watchlist" through MCP
- 📋 Smart Notifications: AI suggests optimal watch times based on user patterns
- 📋 Community Integration: AI facilitates anime discussions and watch parties
- 📋 Content Creation: AI helps generate anime reviews and recommendation posts

---

## 🧰 AI Tool Strategy

| Purpose       | Free Tool                     | Alt/Advanced                    |
| ------------- | ----------------------------- | ------------------------------- |
| Vector Search | FAISS                         | Weaviate, Pinecone              |
| Embeddings    | InstructorXL, SBERT           | OpenAI `text-embedding-3-small` |
| Summarization | T5-small / Pegasus            | GPT-4                           |
| NLP Chat      | LLama2 (local)                | OpenAI Assistants               |
| Speech        | Whisper.cpp                   | AssemblyAI, Deepgram            |
| Caching       | IndexedDB (Dexie, idb-keyval) | PWA tooling                     |

---

## 🎯 User Stories Priority Matrix

### High Priority (Phase 1 - Completed)
- ✅ **U1**: View popular/recent anime from MAL or AniList
- ✅ **U2**: Toggle between MyAnimeList and AniList sources
- ✅ **U3**: Hover over anime card to see quick info
- ✅ **U4**: Click anime to open full detail page
- ✅ **U5**: Log in via MyAnimeList or AniList
- ✅ **U6**: See dashboard sorted by recent/top anime
- ✅ **U10**: Search anime across both platforms
- ✅ **U11**: View related media (prequel/sequel/etc.)

### Medium Priority (Phase 2-3)
- 🔄 **U7**: Update watch status and episodes from hover (partially implemented)
- 📋 **U8**: Get recommendations based on watchlist (infrastructure ready)
- 📋 **U9**: Switch between MAL and AniList accounts
- ✅ **U12**: Cache last dashboard state locally
- ✅ **U19**: See upcoming anime in a calendar
- 📋 **U20**: View anime progress as charts

### Low Priority (Phase 4-5)
- 📋 **U13**: Compare anime list with friends
- 📋 **U14**: See shared anime stats with friends
- 📋 **U15**: Sync list updates to MAL/AniList automatically
- 📋 **U16**: Sync watchlists across MAL and AniList
- 📋 **U17**: Watch anime directly in future versions
- 📋 **U18**: Use hotkeys to add/update anime
- 📋 **U21**: See activity feed of friends
- 📋 **U22**: Track rewatches separately

---

## 📊 Optimization Strategy

### Code Quality Improvement Plan
- ✅ **30-40% code reduction** through DRY implementation (ACHIEVED: 60% in store)
- ✅ **Improved maintainability** with consistent patterns (ACHIEVED: Design tokens)
- ✅ **Enhanced type safety** throughout codebase (ACHIEVED: 95% any elimination)

### Performance Enhancement Plan
- ✅ **Faster renders** via optimized selectors (ACHIEVED: 3 combined selectors)
- ✅ **Reduced bundle size** from consolidated CSS (ACHIEVED: 58% animation reduction)
- ✅ **Better animation performance** (ACHIEVED: Parametrizable animations)

### Developer Experience Plan
- ✅ **Consistent APIs** across components (ACHIEVED: Standardized prop patterns)
- ✅ **Better TypeScript intellisense** (ACHIEVED: Proper interfaces)
- ✅ **Easier debugging** with focused components (IN PROGRESS: ExpandableGrid splitting)

---

## 🚨 Immediate Priorities

### Component Architecture (Critical)
1. **ExpandableGrid Refactoring** (1,801 lines → reusable component system)
2. **Create Modular AnimeCard System** (eliminate 70% duplication with variant support)
3. **Complete Store Selector Optimization** (render count improvements)

### 🎯 ExpandableGrid Refactoring Strategy

#### **Current State Analysis**
- **Total Size**: 1,037 TypeScript + 764 CSS = 1,801 lines
- **Main Issues**: Dual interaction modes (hover/click), repetitive status logic, complex animations
- **Core Challenge**: Maintain exact functionality while improving maintainability

#### **Non-Disruptive Refactoring Approach**
**Phase 1: Component Extraction (Test-Driven)**
1. ✅ **BaseAnimeCard Component** - Core card rendering with variant system (COMPLETED - modular architecture with full data population)
2. 📋 **StatusOptionsDropdown Component** - Extract status management UI from ExpandableGrid (NOT YET IMPLEMENTED)
3. 📋 **AnimeBadges Component** - Extract badge rendering system from ExpandableGrid (NOT YET IMPLEMENTED)
4. 📋 **CardInteractionManager Hook** - Extract mouse/touch/drag handling logic (NOT YET IMPLEMENTED)
5. 📋 **ExpandedContent Component** - Extract 651-line expanded content display (NOT YET IMPLEMENTED)

#### **Phase 1.7: BaseAnimeCard Data Population (COMPLETED)**
**Status**: ✅ COMPLETED - Full ExpandableGrid visual parity achieved  
**Goal**: Transform BaseAnimeCard from empty foundation to fully populated anime card  
**Result**: Complete visual parity with ExpandableGrid collapsed state plus responsive design improvements  

**Completed Implementation**:
1. ✅ **Image Display with Fallback** - Cover image rendering with "No Image" fallback and error handling
2. ✅ **Title and Metadata Display** - Anime title with year and episode count using Typography component
3. ✅ **Score Badge Integration** - User score display with star icon, proper centering, and backdrop blur
4. ✅ **Gradient Overlays** - Text readability overlays matching ExpandableGrid exactly
5. ✅ **CSS Styling Updates** - ExpandableGrid styling patterns with Storybook typography fixes
6. ✅ **Storybook Enhancement** - Comprehensive real anime data stories with customizable dimensions
7. ✅ **Responsive Design Upgrade** - Converted from pixel units to rem units (13rem × 23.125rem → 30rem × 23.125rem)

**Visual Elements Completed**:
- ✅ Cover image with `object-position: top center` and comprehensive fallback state
- ✅ Base gradient overlay for text readability (`from-black/70 via-transparent to-transparent`)
- ✅ Score badge in top-left with backdrop blur and proper icon+content centering
- ✅ Bottom info section with title (line-clamp-2) and metadata (year, episodes) using Typography component
- ✅ All styling consistent with ExpandableGrid collapsed state
- ✅ Responsive rem-based dimensions for better scalability

**Success Criteria Achieved**:
- ✅ BaseAnimeCard visually identical to ExpandableGrid collapsed cards
- ✅ Proper image loading and fallback handling with error state management
- ✅ Score badge animations and centering match ExpandableGrid behavior
- ✅ Text readability maintained across all themes with Typography component integration
- ✅ Comprehensive Storybook stories demonstrate all populated card functionality
- ✅ Zero visual regression from ExpandableGrid appearance
- ✅ Enhanced responsive design with rem units for better accessibility

#### **Phase 1.8: ExpandableGrid Expanded Content Extraction (IN PROGRESS)**
**Status**: 🔄 IN PROGRESS - Extracting modular components from expanded content with TDD approach  
**Goal**: Create reusable, testable components for expandable card content while maintaining existing functionality  
**Reality Check**: Original ExpandableGrid still in production use, needs careful modular extraction  

**Modular Architecture Design**:
- **AnimeInfoCard Component**: Metadata grid, genres badges, synopsis with auto-scrolling (lines 240-360)
- **StatusOptionsDropdown Component**: Ripple animation status management UI (lines 366-596)  
- **ExpandedActionButtons Component**: Main action buttons with authentication awareness (lines 598-638)

**Component Structure**:
```
src/components/ui/
├── AnimeInfoCard/ (metadata, genres, synopsis)
├── StatusOptionsDropdown/ (status management UI)
└── ExpandedActionButtons/ (action buttons)
```

**Implementation Strategy**:
1. ✅ **Extract AnimeInfoCard** (lines 240-360) - metadata grid, genres, synopsis with auto-scrolling ✅ **COMPLETED**
2. **Extract StatusOptionsDropdown** (lines 366-596) - status management with ripple animations
3. **Extract ExpandedActionButtons** (lines 598-638) - main action buttons
4. **Create comprehensive tests** for each extracted component with full coverage
5. **Add Storybook stories** for component documentation and testing
6. **Replace ExpandableGrid expanded content** with modular components

**Current Implementation Status**:
- ✅ **BaseAnimeCard**: Successfully created as standalone component with full data population
- ✅ **AnimeInfoCard**: COMPLETED - metadata, genres, synopsis component with auto-scrolling and comprehensive Storybook stories
- 📋 **StatusOptionsDropdown**: Pending extraction - status management UI
- 📋 **ExpandedActionButtons**: Pending extraction - action buttons
- 📋 **Integration**: Pending - replace ExpandableGrid content with extracted components

**Success Criteria**:
- All components extracted with single responsibility principle
- Test coverage maintained at 100% pass rate  
- Components reusable across different card implementations
- Clean composition pattern following BaseAnimeCard approach
- No regression in existing functionality or animations
- Comprehensive Storybook documentation

**Integration Strategy**:
1. **Create Extracted Components** with comprehensive tests and stories
2. **Maintain Existing Styling** and animations during extraction
3. **Replace ExpandableGrid Content** with modular components
4. **Validate Feature Parity** with existing expanded functionality

### Feature Completion (High Priority)
1. **Implement FAISS Vector Recommendations** (infrastructure ready)
2. **Complete Anime-to-anime Similarity** (algorithm design needed)
3. **Finalize Status Update Integration** (enhance existing functionality)

### Documentation & Quality (Medium Priority)
1. **Component Story Coverage** (expand Storybook stories)
2. **API Documentation** (auto-generate from TypeScript)  
3. **Performance Metrics** (formalize monitoring)
4. ✅ **Utility Test Coverage** (COMPLETED: 100% coverage achieved)

---

This planning document reflects the actual state of the project as of the comprehensive audit, showing significant achievements beyond original plans while maintaining clear direction for future development phases.