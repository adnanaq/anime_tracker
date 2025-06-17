import { AniListAnime, AnimeBase } from '../../types/anime'
import { 
  buildPageQuery, 
  buildSearchQuery, 
  buildSeasonQuery, 
  buildAnimeDetailsQuery,
} from '../graphql/fragments'

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const ANILIST_BASE_URL = isDevelopment 
  ? 'http://localhost:3002/anilist/graphql' 
  : 'https://graphql.anilist.co'
const ANILIST_GRAPHQL_URL = ANILIST_BASE_URL

interface AniListAnimeWithUserData extends AniListAnime {
  mediaListEntry?: {
    score?: number;
    status?: string;
    progress?: number;
  };
  score?: number;
  status?: string;
  progress?: number;
}

interface AniListMediaListEntry {
  id: number;
  score?: number;
  status?: string;
  progress?: number;
  media: {
    id: number;
    title?: {
      romaji?: string;
      english?: string;
      native?: string;
    };
    description?: string;
    coverImage?: {
      large?: string;
      medium?: string;
    };
    averageScore?: number;
    episodes?: number;
    status?: string;
    genres?: string[];
    startDate?: {
      year?: number;
    };
    format?: string;
  };
}

interface AniListMediaList {
  entries: AniListMediaListEntry[];
}

interface AniListMediaListCollection {
  lists: AniListMediaList[];
}

interface AniListUpdateVariables {
  mediaId: number;
  status?: string;
  score?: number;
  progress?: number;
  notes?: string;
}

export const normalizeAniListAnime = (anime: AniListAnime, includeRelated: boolean = false): AnimeBase => {
  // Handle user data if available (for anime from user's list)
  const animeWithUserData = anime as AniListAnimeWithUserData;
  const userEntry = animeWithUserData.mediaListEntry || animeWithUserData;
  const userScore = userEntry?.score || undefined;
  const userStatus = userEntry?.status || undefined;
  const userProgress = userEntry?.progress || undefined;

  const normalized: AnimeBase = {
    id: anime.id,
    title: anime.title.romaji || anime.title.english || anime.title.native || '',
    synopsis: anime.description?.replace(/<[^>]*>/g, ''), // Remove HTML tags
    image: anime.coverImage?.large || anime.coverImage?.medium,
    coverImage: anime.coverImage?.large || anime.coverImage?.medium,
    score: anime.averageScore ? anime.averageScore / 10 : undefined,
    userScore: userScore,
    userStatus: userStatus,
    userProgress: userProgress,
    episodes: anime.episodes,
    status: anime.status,
    genres: anime.genres || [],
    year: anime.startDate?.year,
    format: anime.format,
    source: 'anilist',
    // Enhanced metadata
    duration: anime.duration ? anime.duration.toString() : undefined,
    studios: anime.studios?.edges?.map(edge => edge.node.name) || [],
    popularity: anime.popularity,
  };

  // Process related anime if requested and available
  if (includeRelated && anime.relations?.edges) {
    normalized.relatedAnime = anime.relations.edges
      .filter(edge => edge.node && edge.node.id !== anime.id) // Avoid self-references
      .slice(0, 10) // Limit to 10 related anime
      .map(edge => normalizeAniListAnime(edge.node, false)); // Don't include nested related anime
  }

  return normalized;
}

// Helper function to make GraphQL requests with rate limiting
const makeGraphQLRequest = async (query: string, variables?: Record<string, unknown>) => {
  try {
    const response = await fetch(ANILIST_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    })

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error(`AniList rate limit exceeded. Please try again later.`)
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      // Handle rate limiting in error response
      if (data.errors[0]?.message?.includes('Too Many Requests')) {
        throw new Error(`AniList rate limit exceeded. Please try again later.`)
      }
      throw new Error(`GraphQL error: ${data.errors[0].message}`)
    }

    return data.data
  } catch (error) {
    console.error('AniList API Error:', error)
    throw error
  }
}

export const anilistService = {
  async getTrendingAnime() {
    try {
      const query = buildPageQuery('TRENDING_DESC')
      const data = await makeGraphQLRequest(query)
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList trending error:', error)
      throw error
    }
  },

  async getPopularAnime() {
    try {
      const query = buildPageQuery('POPULARITY_DESC')
      const data = await makeGraphQLRequest(query)
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList popular error:', error)
      throw error
    }
  },

  async getTopRatedAnime() {
    try {
      const query = buildPageQuery('SCORE_DESC')
      const data = await makeGraphQLRequest(query)
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList top rated error:', error)
      throw error
    }
  },

  async getCurrentSeasonAnime() {
    try {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      
      // Determine current season
      let season = 'SPRING'
      if (currentMonth >= 1 && currentMonth <= 3) season = 'WINTER'
      else if (currentMonth >= 4 && currentMonth <= 6) season = 'SPRING'
      else if (currentMonth >= 7 && currentMonth <= 9) season = 'SUMMER'
      else if (currentMonth >= 10 && currentMonth <= 12) season = 'FALL'

      const query = buildSeasonQuery()
      const data = await makeGraphQLRequest(query, { season, year: currentYear })
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList current season error:', error)
      throw error
    }
  },

  async searchAnime(query: string) {
    try {
      const searchQuery = buildSearchQuery()
      const data = await makeGraphQLRequest(searchQuery, { search: query })
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList search error:', error)
      throw error
    }
  },

  async getAnimeDetails(id: number) {
    try {
      const query = buildAnimeDetailsQuery()
      const data = await makeGraphQLRequest(query, { id })
      return normalizeAniListAnime(data.Media, true) // Include related anime for detail view
    } catch (error) {
      console.error('AniList anime details error:', error)
      throw error
    }
  },

  async getUserAnimeList(userId: number) {
    try {
      const query = `
        query($userId: Int) {
          MediaListCollection(userId: $userId, type: ANIME) {
            lists {
              entries {
                id
                score
                status
                media {
                  id
                  title {
                    romaji
                    english
                    native
                  }
                  description(asHtml: false)
                  coverImage {
                    large
                    medium
                  }
                  averageScore
                  episodes
                  status
                  genres
                  startDate {
                    year
                  }
                  format
                }
              }
            }
          }
        }
      `
      
      const data = await makeGraphQLRequest(query, { userId })
      const userAnimeMap = new Map<number, number>()
      
      // Flatten all lists and create a map of anime ID to user score
      const collection = data.MediaListCollection as AniListMediaListCollection
      collection.lists.forEach((list: AniListMediaList) => {
        list.entries.forEach((entry: AniListMediaListEntry) => {
          if (entry.score && entry.score > 0) {
            userAnimeMap.set(entry.media.id, entry.score)
          }
        })
      })
      
      return userAnimeMap
    } catch (error) {
      console.error('AniList user anime list error:', error)
      throw error
    }
  },

  async getCurrentUser(token: string) {
    try {
      const query = `
        query {
          Viewer {
            id
            name
          }
        }
      `
      
      const response = await fetch(ANILIST_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(`GraphQL error: ${data.errors[0].message}`)
      }

      return data.data.Viewer
    } catch (error) {
      console.error('AniList get current user error:', error)
      throw error
    }
  },

  async getUserWatchingAnime(token: string) {
    try {
      // First get the current user
      const user = await this.getCurrentUser(token)
      
      const query = `
        query($userId: Int) {
          MediaListCollection(userId: $userId, type: ANIME, status: CURRENT) {
            lists {
              entries {
                id
                score
                status
                progress
                media {
                  id
                  title {
                    romaji
                    english
                    native
                  }
                  description(asHtml: false)
                  coverImage {
                    large
                    medium
                  }
                  averageScore
                  episodes
                  status
                  genres
                  startDate {
                    year
                  }
                  format
                  duration
                  studios {
                    edges {
                      node {
                        id
                        name
                      }
                    }
                  }
                  popularity
                }
              }
            }
          }
        }
      `
      
      const response = await fetch(ANILIST_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query,
          variables: { userId: user.id }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      
      if (data.errors) {
        console.error('AniList: GraphQL errors:', data.errors)
        throw new Error(`GraphQL error: ${data.errors[0].message}`)
      }

      const watchingAnime: AnimeBase[] = []
      
      
      // Check if MediaListCollection exists and has lists
      if (data.data?.MediaListCollection?.lists) {
        // Flatten all lists and create normalized anime objects
        const collection = data.data.MediaListCollection as AniListMediaListCollection
        collection.lists.forEach((list: AniListMediaList) => {
          list.entries?.forEach((entry: AniListMediaListEntry) => {
            const normalizedAnime = normalizeAniListAnime(entry.media)
            // Add user data from the entry
            normalizedAnime.userScore = entry.score && entry.score > 0 ? entry.score : undefined
            normalizedAnime.userStatus = entry.status || undefined
            normalizedAnime.userProgress = entry.progress || undefined
            watchingAnime.push(normalizedAnime)
          })
        })
      } else {
      }
      
      return watchingAnime
    } catch (error) {
      console.error('AniList getUserWatchingAnime error:', error)
      throw error
    }
  },

  async getUserAnimeStatusMap(token: string) {
    try {
      const user = await this.getCurrentUser(token);
      const statusMap = new Map<number, string>();
      
      const query = `
        query($userId: Int) {
          MediaListCollection(userId: $userId, type: ANIME) {
            lists {
              entries {
                id
                status
                media {
                  id
                }
              }
            }
          }
        }
      `;
      
      const response = await fetch(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: query,
          variables: { userId: user.id }
        })
      });

      if (!response.ok) {
        throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`AniList GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      // Process all lists (watching, completed, planning, etc.)
      if (data.data.MediaListCollection?.lists) {
        const collection = data.data.MediaListCollection as AniListMediaListCollection
        collection.lists.forEach((list: AniListMediaList) => {
          if (list.entries) {
            list.entries.forEach((entry: AniListMediaListEntry) => {
              if (entry.status && entry.media?.id) {
                statusMap.set(entry.media.id, entry.status);
              }
            });
          }
        });
      }

      return statusMap;
    } catch (error) {
      console.error('AniList getUserAnimeStatusMap error:', error);
      throw error;
    }
  },

  async updateAnimeStatus(animeId: number, token: string, statusData: {
    status?: 'CURRENT' | 'COMPLETED' | 'PAUSED' | 'DROPPED' | 'PLANNING' | 'REPEATING';
    score?: number;
    progress?: number;
    startedAt?: { year?: number; month?: number; day?: number };
    completedAt?: { year?: number; month?: number; day?: number };
    notes?: string;
  }) {
    try {
      
      const mutation = `
        mutation($mediaId: Int, $status: MediaListStatus, $score: Float, $progress: Int, $notes: String) {
          SaveMediaListEntry(mediaId: $mediaId, status: $status, score: $score, progress: $progress, notes: $notes) {
            id
            status
            score
            progress
            notes
          }
        }
      `

      // Clean up variables - remove undefined values
      const variables: AniListUpdateVariables = {
        mediaId: animeId
      }
      
      if (statusData.status !== undefined) variables.status = statusData.status
      if (statusData.score !== undefined && statusData.score > 0) variables.score = statusData.score
      if (statusData.progress !== undefined) variables.progress = statusData.progress
      if (statusData.notes) variables.notes = statusData.notes


      const response = await fetch(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables
        })
      })

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`)
      }

      const data = JSON.parse(responseText)
      
      if (data.errors) {
        console.error('🎬 GraphQL errors:', data.errors)
        throw new Error(data.errors[0]?.message || 'GraphQL error')
      }

      return data.data.SaveMediaListEntry
    } catch (error) {
      console.error('AniList updateAnimeStatus error:', error)
      throw error
    }
  },

  // Optimized method to get specific anime details with user data
  async getAnimeWithUserDetails(animeId: number, token: string, _relatedAnimeIds: number[] = []) {
    try {
      // First get user ID
      const user = await this.getCurrentUser(token)

      // Single GraphQL query that gets everything we need
      const query = `
        query($animeId: Int, $userId: Int) {
          Media(id: $animeId, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description(asHtml: false)
            coverImage {
              large
              medium
            }
            averageScore
            episodes
            status
            genres
            startDate {
              year
            }
            format
            relations {
              edges {
                relationType
                node {
                  id
                  title {
                    romaji
                    english
                    native
                  }
                  description(asHtml: false)
                  coverImage {
                    large
                    medium
                  }
                  averageScore
                  episodes
                  status
                  genres
                  startDate {
                    year
                  }
                  format
                  type
                }
              }
            }
          }
          
          MediaListCollection(userId: $userId, type: ANIME) {
            lists {
              entries {
                id
                status
                score
                progress
                media {
                  id
                }
              }
            }
          }
        }
      `

      const response = await fetch(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          variables: { 
            animeId, 
            userId: user.id
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🚨 AniList GraphQL Response Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          query: query,
          variables: { animeId, userId: user.id }
        })
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        console.error('🚨 AniList GraphQL Errors:', data.errors)
        throw new Error(data.errors[0]?.message || 'GraphQL error')
      }

      // Process the results
      const animeData = normalizeAniListAnime(data.data.Media, true)
      
      // Create user list lookup
      const userListMap = new Map()
      if (data.data.MediaListCollection?.lists) {
        const collection = data.data.MediaListCollection as AniListMediaListCollection
        collection.lists.forEach((list: AniListMediaList) => {
          list.entries?.forEach((entry: AniListMediaListEntry) => {
            userListMap.set(entry.media.id, {
              status: entry.status,
              score: entry.score,
              progress: entry.progress,
              id: entry.id
            })
          })
        })
      }

      // Add user data to main anime
      const userEntry = userListMap.get(animeId)
      if (userEntry) {
        animeData.userScore = userEntry.score || undefined
      }

      // Add user scores to related anime
      if (animeData.relatedAnime) {
        animeData.relatedAnime = animeData.relatedAnime.map(related => ({
          ...related,
          userScore: userListMap.get(related.id)?.score || undefined
        }))
      }

      return {
        animeData,
        userEntry: userEntry || null,
        userListMap
      }
    } catch (error) {
      console.error('AniList getAnimeWithUserDetails error:', error)
      throw error
    }
  },

  // Keep the old method for backward compatibility but mark it as deprecated
  async getUserAnimeDetails(animeId: number, token: string) {
    console.warn('⚠️ getUserAnimeDetails is deprecated, use getAnimeWithUserDetails instead')
    try {
      const user = await this.getCurrentUser(token)
      
      const query = `
        query($userId: Int) {
          MediaListCollection(userId: $userId, type: ANIME) {
            lists {
              entries {
                id
                status
                score
                progress
                media {
                  id
                }
              }
            }
          }
        }
      `

      const response = await fetch(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: query,
          variables: { userId: user.id }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error')
      }

      // Find the specific anime entry
      const collection = data.data.MediaListCollection as AniListMediaListCollection | undefined
      const allEntries = collection?.lists?.flatMap((list: AniListMediaList) => list.entries) || []
      const entry = allEntries.find((entry: AniListMediaListEntry) => entry.media.id === animeId)

      return entry || null
    } catch (error) {
      console.error('AniList getUserAnimeDetails error:', error)
      throw error
    }
  },

  async deleteAnimeFromList(animeId: number, token: string) {
    try {
      // First we need to get the list entry ID
      const user = await this.getCurrentUser(token)
      
      // Find the entry for this anime
      const query = `
        query($userId: Int) {
          MediaListCollection(userId: $userId, type: ANIME) {
            lists {
              entries {
                id
                media {
                  id
                }
              }
            }
          }
        }
      `

      const response = await fetch(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: query,
          variables: { userId: user.id }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const listData = await response.json()
      
      if (listData.errors) {
        throw new Error(listData.errors[0]?.message || 'GraphQL error')
      }

      const collection = listData.data.MediaListCollection as AniListMediaListCollection | undefined
      const allEntries = collection?.lists?.flatMap((list: AniListMediaList) => list.entries) || []
      const entry = allEntries.find((entry: AniListMediaListEntry) => entry.media.id === animeId)

      if (!entry) {
        throw new Error('Anime not found in user list')
      }

      // Now delete the entry
      const mutation = `
        mutation($id: Int) {
          DeleteMediaListEntry(id: $id) {
            deleted
          }
        }
      `

      const deleteResponse = await fetch(ANILIST_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { id: entry.id }
        })
      })

      if (!deleteResponse.ok) {
        throw new Error(`HTTP error! status: ${deleteResponse.status}`)
      }

      const data = await deleteResponse.json()
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error')
      }

      return data.data.DeleteMediaListEntry
    } catch (error) {
      console.error('AniList deleteAnimeFromList error:', error)
      throw error
    }
  }
}