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

🔜 **Next Phase Focus:**
- Vector-based recommendations with FAISS
- Watch status updates and progress tracking
- Offline caching with IndexedDB
- Social features and friend comparisons
- Cross-platform sync between MAL and AniList

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
