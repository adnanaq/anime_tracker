# AnimeTrackr (Working Title# AnimeTrackr (Working Title)

A modern, dual-source anime tracking and recommendation platform powered by **MyAnimeList** and **AniList** APIs, supporting rich interactions, offline access, and vector-based recommendation — built to scale into a streaming-first modular app.

## 🎯 **CURRENT STATUS: Phase 1 MVP Complete!**

✅ **What's Been Completed:**
- Full dual API integration (MyAnimeList + AniList)
- OAuth authentication for both platforms  
- User score display on anime cards (personal ratings with green badges)
- Currently watching section on dashboard
- Related anime exploration with full hover details and user scores
- Stunning animation system with Anime.js v4 + Three.js
- Interactive anime cards with smooth hover effects
- Comprehensive detail pages with 3D transitions
- Real-time search across both platforms
- Source switching with clean UI
- Responsive design with Tailwind CSS
- Three.js particle background animations
- Custom loading spinners and micro-interactions
- Performance optimizations (reduced API calls from 20 to 6 per section)
- Fixed CORS issues and proxy server authentication
- Clean console output and production-ready build
- Smart hover system with intelligent animation delays
- Enhanced hover cards with changeable status management
- Proper z-index management for overlay interactions

🔜 **Next Phase Focus:**
- Vector-based recommendations with FAISS
- Watch status updates and progress tracking
- Offline caching with IndexedDB
- Social features and friend comparisons
- Cross-platform sync between MAL and AniList
- **MCP Server Integration**: Convert backend to Model Context Protocol server for AI assistant integration

---

## 🌟 Features

- ✅ **COMPLETED:** Toggle between **MyAnimeList** and **AniList** as data sources
- ✅ **COMPLETED:** Browse anime by:
  - ✅ Recently Updated (Trending Now)
  - ✅ Most Recently Added (Most Popular)
  - ✅ Top 10 All-Time (Top Rated)
  - ✅ Currently airing (Current Season)
  - ✅ Currently trending
- ✅ **COMPLETED:** OAuth login for both platforms
- ✅ **COMPLETED:** Hover cards with detailed anime information
- ✅ **COMPLETED:** Detail view with comprehensive anime information
- ✅ **COMPLETED:** User score display on anime cards (personal ratings)
- ✅ **COMPLETED:** Currently watching section on dashboard
- ✅ **COMPLETED:** Related anime on detail pages with full hover details and user scores
- ✅ **COMPLETED:** Performance optimizations (6 anime per section vs 20)
- ✅ **COMPLETED:** Stunning animations and visual effects:
  - ✅ Smooth hover effects with scale, translate, and shadow animations
  - ✅ Page load animations with staggered entrance effects
  - ✅ Three.js particle background with floating geometric shapes
  - ✅ Custom loading spinners with rotating elements
  - ✅ Detailed page transitions with element choreography
  - ✅ Smart hover delays to prevent animation spam during fast mouse movement
  - ✅ Enhanced hover cards with actionable status management buttons
  - ✅ Proper z-index layering for seamless overlay interactions
- 🔜 **TODO:** Recommendation system using **vector indexing**, not genre/tags
- 🔜 **TODO:** Cross-platform sync (MAL ↔ AniList)
- 🔜 **TODO:** Social compare: view shared anime & overlap stats
- 🔜 **TODO:** Offline dashboard caching (IndexedDB)
- ✅ **COMPLETED:** Modular structure for future streaming support

---

## 👤 User Stories

| ID  | As a...        | I want to...                                   | So that...                       |
| --- | -------------- | ---------------------------------------------- | -------------------------------- |
| U1  | Visitor        | View popular/recent anime from MAL or AniList  | Browse trending content          |
| U2  | Visitor        | Toggle between MyAnimeList and AniList sources | Choose my preferred anime source |
| U3  | Visitor        | Hover over an anime card to see quick info     | Learn more without leaving page  |
| U4  | Visitor        | Click an anime to open a full detail page      | Explore deeper info              |
| U5  | Logged-in user | Log in via MyAnimeList or AniList              | Manage my anime watchlist        |
| U6  | Logged-in user | See a dashboard sorted by recent/top anime     | Stay updated on anime trends     |
| U7  | Logged-in user | Update watch status and episodes from hover    | Track progress faster            |
| U8  | Logged-in user | Get recommendations based on my watchlist      | Discover personalized anime      |
| U9  | Logged-in user | Switch between MAL and AniList accounts        | Manage both accounts easily      |
| U10 | Logged-in user | Search anime across both platforms             | Find anime quickly               |
| U11 | User           | View related media (prequel/sequel/etc.)       | Understand story connections     |
| U12 | Logged-in user | Cache last dashboard state locally             | Browse offline                   |
| U13 | Logged-in user | Compare my anime list with friends             | Get social discovery             |
| U14 | Logged-in user | See shared anime stats with friends            | Explore overlap-based recs       |
| U15 | Logged-in user | Sync list updates to MAL/AniList automatically | Avoid duplicate work             |
| U16 | Logged-in user | Sync watchlists across MAL and AniList         | Consolidate data                 |
| U17 | Logged-in user | Watch anime directly in future versions        | Keep everything in one platform  |
| U18 | Power user     | Use hotkeys to add/update anime                | Interact faster                  |
| U19 | Logged-in user | See upcoming anime in a calendar               | Track airing times               |
| U20 | Logged-in user | View anime progress as charts                  | Understand my progress visually  |
| U21 | Logged-in user | See activity feed of friends                   | Stay socially connected          |
| U22 | Logged-in user | Track rewatches separately                     | Differentiate my anime history   |

---

## 🛠 Developer Stories

| ID  | As a dev... | I want to...                                                     | So that...                        |
| --- | ----------- | ---------------------------------------------------------------- | --------------------------------- |
| D1  | Dev         | Implement a toggle for source switching (MAL/AniList)            | Fetch from correct API            |
| D2  | Dev         | Use MAL public API with `X-MAL-CLIENT-ID` for visitors           | Support unauthenticated browsing  |
| D3  | Dev         | Integrate MAL OAuth2 login and token exchange                    | Allow secure user logins          |
| D4  | Dev         | Implement AniList GraphQL OAuth login                            | Support AniList logins too        |
| D5  | Dev         | Normalize MAL REST and AniList GraphQL data into internal format | Standardize frontend interface    |
| D6  | Dev         | Create hover-card with update options if logged in               | Provide in-place interaction      |
| D7  | Dev         | Fetch and show related anime in detail page                      | Add continuity/context            |
| D8  | Dev         | Use FAISS for local vector indexing from watchlist               | Power recs with similarity search |
| D9  | Dev         | Cache dashboard data in IndexedDB                                | Enable offline mode               |
| D10 | Dev         | Compute overlap vectors between friends                          | Enable shared recommendations     |
| D11 | Dev         | Sync anime list updates to MAL/AniList APIs                      | Keep data accurate on all sources |
| D12 | Dev         | Offer cross-platform sync (MAL ↔ AniList)                       | Consolidate user libraries        |
| D13 | Dev         | Refresh auth tokens and store securely                           | Maintain long-lived sessions      |
| D14 | Dev         | Build a modular layout for future streaming support              | Enable smooth feature upgrades    |
| D15 | Dev         | Implement add-to-list/update hotkey feature                      | Boost user productivity           |
| D16 | Dev         | Create anime airing calendar from AniList                        | Help users track airing shows     |
| D17 | Dev         | Build anime progress chart (watched %, scores, etc.)             | Provide visual insights           |
| D18 | Dev         | Create a friend activity feed                                    | Enhance social interaction        |
| D19 | Dev         | Add support for rewatch tracking field                           | Track more detailed progress      |
| D20 | Dev         | Add global fallback handlers for expired tokens/rate limits      | Improve reliability               |

---

## 🧱 Tech Stack

| Layer                  | Technology                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Frontend Framework** | [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)                                               |
| **Styling**            | [Tailwind CSS](https://tailwindcss.com/)                                                                   |
| **Routing**            | [React Router](https://reactrouter.com/)                                                                   |
| **State Management**   | [Zustand](https://github.com/pmndrs/zustand) (or React Context)                                            |
| **API Clients**        | Axios (MAL REST), urql or Apollo (AniList GraphQL)                                                         |
| **OAuth/Auth**         | Custom OAuth handlers for MAL and AniList                                                                  |
| **Offline Caching**    | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via `idb-keyval` or `dexie.js` |
| **Recommendations**    | Local FAISS vector indexing via Python backend                                                             |
| **Backend**            | Node.js + Express (API proxy, vector service, syncing)                                                     |
| **Database**           | SQLite (initial) or Supabase (optional)                                                                    |
| **Icons**              | [Heroicons](https://heroicons.com/), React Icons                                                           |
| **Animations**         | ✅ **COMPLETED:** [Anime.js v4](https://animejs.com/) + [Three.js](https://threejs.org/)                   |
| **Notifications**      | [React Hot Toast](https://react-hot-toast.com/)                                                            |
| **Hosting**            | [Vercel](https://vercel.com/) (frontend), Render/Fly.io (backend)                                          |

---

## 🧠 AI Features by Phase

### ✅ Phase 1 – MVP

- ✅ **COMPLETED:** Basic anime browsing and authentication
- ✅ **COMPLETED:** Dual API support (MAL + AniList)
- ✅ **COMPLETED:** Stunning animation system with Anime.js and Three.js
- ✅ **COMPLETED:** Responsive design with Tailwind CSS
- ✅ **COMPLETED:** OAuth authentication for both platforms
- ✅ **COMPLETED:** Interactive anime cards with hover effects
- ✅ **COMPLETED:** Detail pages with comprehensive information
- ✅ **COMPLETED:** Real-time search functionality
- ✅ **COMPLETED:** Source switching between MAL and AniList
- 🔜 **TODO:** Vector Recommendations using FAISS (based on watch history and scores)
- 🔜 **TODO:** Anime-to-anime similarity using cosine similarity on watch vectors

### 🟡 Phase 2 – Intelligence Layer

- ✂️ **Summarizer** for hover cards using LLMs or local transformers (T5, Pegasus)
- 💬 **Smart Suggestion System** (based on time, day, and trends)
- 🔄 **Cross-sync logic** with auto-update across MAL ↔ AniList

### 🟢 Phase 3 – Enhanced User Experience

- 🗣️ **Natural Language Search** (e.g., "romantic anime with sad ending")
- 📈 **Social Compare Recommendations** (anime overlap graphs and stats)
- 🧩 **Graph Similarity Explorer** (React-force-graph, D3.js)

### 🟣 Phase 4 – Smart Assistant

- 🤖 **Anime Chatbot** (Otaku Assistant)
- 🧠 Knowledge of anime lore, recommendations, trivia

### 🟠 Phase 5 – Advanced UX

- 🎙️ **Voice Assistant** (Whisper → Chat → Actions)
- 📱 **Offline-first PWA Mode** for cached dashboard
- 📺 **Streaming Player Integration (Future Module)**

---

## 🧰 AI Tool Suggestions

| Purpose       | Free Tool                     | Alt/Advanced                    |
| ------------- | ----------------------------- | ------------------------------- |
| Vector Search | FAISS                         | Weaviate, Pinecone              |
| Embeddings    | InstructorXL, SBERT           | OpenAI `text-embedding-3-small` |
| Summarization | T5-small / Pegasus            | GPT-4                           |
| NLP Chat      | LLama2 (local)                | OpenAI Assistants               |
| Speech        | Whisper.cpp                   | AssemblyAI, Deepgram            |
| Caching       | IndexedDB (Dexie, idb-keyval) | PWA tooling                     |

---

## 🗂 Project Structure

```
anime-trackr/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AnimeCard/
│   │   ├── Dashboard/
│   │   ├── HoverCard/
│   ├── context/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── AnimeDetail.tsx
│   │   └── Compare.tsx
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── .env
└── README.md
```

---

### AI Features

AI Features by Phase
✅ Phase 1 – MVP
🔍 Vector Recommendations using FAISS (based on watch history and scores)

🧠 Anime-to-anime similarity using cosine similarity on watch vectors

🟡 Phase 2 – Intelligence Layer
✂️ Summarizer for hover cards using LLMs or local transformers (T5, Pegasus)

💬 Smart Suggestion System (based on time, day, and trends)

🔄 Cross-sync logic with auto-update across MAL ↔ AniList

🟢 Phase 3 – Enhanced User Experience
🗣️ Natural Language Search (e.g., "romantic anime with sad ending")

📈 Social Compare Recommendations (anime overlap graphs and stats)

🧩 Graph Similarity Explorer (React-force-graph, D3.js)

🟣 Phase 4 – Smart Assistant
🤖 Anime Chatbot (Otaku Assistant)

🧠 Knowledge of anime lore, recommendations, trivia

🟠 Phase 5 – Advanced UX
🎙️ Voice Assistant (Whisper → Chat → Actions)

📱 Offline-first PWA Mode for cached dashboard

📺 Streaming Player Integration (Future Module)

### 🔧 Phase 6 – MCP Server Integration

🤖 **Model Context Protocol (MCP) Server**: Convert AnimeTrackr backend to MCP server for seamless AI assistant integration

🔌 **AI Assistant Tools**: Enable Claude/GPT to directly interact with user's anime data through standardized protocol

🚀 **FastAPI Backend Migration**: Transition from Express.js proxy to FastAPI-based MCP server

---

## 🔧 MCP Server Integration Plan

### 🎯 **MCP Server Vision**

Convert AnimeTrackr's backend infrastructure into a **Model Context Protocol (MCP) server** to enable seamless AI assistant integration. This will allow Claude, GPT, and other AI assistants to directly interact with users' anime data, preferences, and tracking information through standardized tools.

### 🚀 **FastAPI Backend Migration**

**Current State**: Express.js proxy server for CORS handling
**Target State**: FastAPI-based MCP server with comprehensive anime management tools

#### **Why FastAPI?**
- **Performance**: Async/await support for concurrent API calls to MAL/AniList
- **Type Safety**: Pydantic models for robust data validation
- **Documentation**: Auto-generated OpenAPI/Swagger docs
- **MCP Compatibility**: Python ecosystem has mature MCP server implementations
- **Scalability**: Better handling of vector operations for recommendations

### 🛠️ **MCP Server Implementation Roadmap**

#### **Phase 1: Backend Migration**
- **FastAPI Setup**: Replace Express.js proxy with FastAPI server
- **API Integration**: Migrate MAL/AniList API clients to Python
- **Authentication**: Implement OAuth flows for both platforms
- **Database Layer**: Add PostgreSQL/SQLite for user data persistence
- **CORS Handling**: Maintain existing CORS proxy functionality

#### **Phase 2: MCP Protocol Implementation**
- **MCP Server Framework**: Implement MCP server using `mcp` Python package
- **Tool Registration**: Define standardized tools for anime operations
- **Resource Management**: Expose user anime lists and preferences as resources
- **Prompt Templates**: Create context-aware prompts for anime recommendations

#### **Phase 3: AI Assistant Tools**

**Core MCP Tools**:
```python
# Anime Discovery Tools
@mcp_tool
async def search_anime(query: str, source: str = "both") -> List[Anime]:
    """Search for anime across MAL and AniList"""

@mcp_tool  
async def get_anime_details(anime_id: int, source: str) -> AnimeDetails:
    """Get comprehensive anime information"""

@mcp_tool
async def get_recommendations(user_id: str, preferences: dict) -> List[Anime]:
    """Get personalized anime recommendations using FAISS vectors"""

# User List Management Tools
@mcp_tool
async def add_to_watchlist(user_id: str, anime_id: int, status: str) -> bool:
    """Add anime to user's tracking list"""

@mcp_tool
async def update_anime_status(user_id: str, anime_id: int, status: str, score: int) -> bool:
    """Update anime watch status and rating"""

@mcp_tool
async def get_user_stats(user_id: str) -> UserStats:
    """Get user's anime watching statistics and preferences"""

# Social Features
@mcp_tool
async def compare_anime_lists(user1_id: str, user2_id: str) -> ComparisonResult:
    """Compare anime lists between users"""

@mcp_tool
async def get_trending_discussions(timeframe: str = "week") -> List[Discussion]:
    """Get trending anime discussions and community insights"""
```

**MCP Resources**:
```python
# User's anime data as queryable resources
@mcp_resource("user_watchlist")
async def get_user_watchlist(user_id: str) -> str:
    """User's complete anime watchlist with scores and status"""

@mcp_resource("user_preferences") 
async def get_user_preferences(user_id: str) -> str:
    """User's anime genre preferences and rating patterns"""

@mcp_resource("anime_database")
async def get_anime_database() -> str:
    """Searchable anime database with metadata"""
```

#### **Phase 4: Advanced AI Features**

**Vector Recommendations**:
- **FAISS Integration**: Implement vector similarity search for anime recommendations
- **User Embeddings**: Create user preference vectors from watch history
- **Contextual Recommendations**: AI can ask "recommend anime similar to Attack on Titan but more lighthearted"

**Natural Language Interface**:
- **Conversational Updates**: "Mark Demon Slayer as completed with a score of 9"
- **Complex Queries**: "Show me anime I might like based on my recent 10/10 ratings"
- **Smart Scheduling**: "What should I watch next for a 2-hour session?"

### 🏗️ **Technical Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Assistant  │◄──►│   MCP Server     │◄──►│  AnimeTrackr    │
│   (Claude/GPT)  │    │   (FastAPI)      │    │   Frontend      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Data Sources    │
                    │ ┌──────────────┐ │
                    │ │ MAL API      │ │
                    │ │ AniList API  │ │  
                    │ │ User DB      │ │
                    │ │ Vector Store │ │
                    │ └──────────────┘ │
                    └──────────────────┘
```

### 🔌 **Integration Benefits**

**For Users**:
- **Natural Interaction**: "Hey Claude, update my anime list and recommend something new"
- **Smart Discovery**: AI-powered recommendations based on conversation context
- **Cross-Platform Sync**: Unified management across MAL and AniList through AI
- **Contextual Help**: "What anime should I watch while studying?" gets personalized suggestions

**For Developers**:
- **Standardized API**: MCP protocol provides consistent interface for AI integration
- **Modular Architecture**: Easy to add new anime sources or AI capabilities
- **Type Safety**: FastAPI + Pydantic ensures robust data handling
- **Scalability**: FastAPI's async support handles concurrent user requests efficiently

### 📋 **Implementation Checklist**

#### **Backend Migration (FastAPI)**
- [ ] Set up FastAPI project structure
- [ ] Migrate MAL API client to Python (httpx/aiohttp)
- [ ] Migrate AniList GraphQL client to Python (gql/httpx)
- [ ] Implement OAuth flows for both platforms
- [ ] Add database models (SQLAlchemy/Prisma)
- [ ] Create user session management
- [ ] Implement CORS middleware
- [ ] Add API rate limiting and caching
- [ ] Write comprehensive tests

#### **MCP Server Implementation**
- [ ] Install and configure MCP server framework
- [ ] Define MCP tools for anime operations
- [ ] Implement MCP resources for user data
- [ ] Create prompt templates for AI context
- [ ] Add authentication/authorization for MCP
- [ ] Test MCP integration with Claude Desktop
- [ ] Document MCP tool usage and examples

#### **Vector Recommendations**
- [ ] Set up FAISS vector store
- [ ] Create anime embedding pipeline
- [ ] Implement user preference vectors
- [ ] Build similarity search algorithms
- [ ] Add recommendation explanation system
- [ ] Integrate with MCP recommendation tools

#### **Frontend Updates**
- [ ] Update API endpoints to FastAPI backend
- [ ] Add MCP status indicators in UI
- [ ] Implement AI recommendation display
- [ ] Add MCP tool usage analytics
- [ ] Update authentication flows

### 🌟 **Future Possibilities**

- **Multi-Modal AI**: Upload anime screenshots for AI identification and recommendations
- **Voice Integration**: "Alexa, add this anime to my watchlist" through MCP
- **Smart Notifications**: AI suggests optimal watch times based on user patterns
- **Community Integration**: AI facilitates anime discussions and watch parties
- **Content Creation**: AI helps generate anime reviews and recommendation posts

---

## 🛡️ API References

### 🔹 MyAnimeList

- Docs: https://myanimelist.net/apiconfig/references/api/v2
- Public Header: `X-MAL-CLIENT-ID`
- OAuth: `https://myanimelist.net/v1/oauth2/authorize`
- Token: `https://myanimelist.net/v1/oauth2/token`
- Base URL: `https://api.myanimelist.net/v2/`

### 🔸 AniList

- Docs: https://docs.anilist.co/reference
- OAuth: `https://anilist.co/api/v2/oauth/authorize?client_id=...&response_type=token`
- GraphQL: `https://graphql.anilist.co`

---
