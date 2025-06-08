import { AniListAnime, AnimeBase } from '../types/anime'

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const ANILIST_BASE_URL = isDevelopment 
  ? 'http://localhost:3002/anilist/graphql' 
  : 'https://graphql.anilist.co'

export const normalizeAniListAnime = (anime: AniListAnime, includeRelated: boolean = false): AnimeBase => {
  const normalized: AnimeBase = {
    id: anime.id,
    title: anime.title.romaji || anime.title.english || anime.title.native || '',
    synopsis: anime.description?.replace(/<[^>]*>/g, ''), // Remove HTML tags
    image: anime.coverImage?.large || anime.coverImage?.medium,
    coverImage: anime.coverImage?.large || anime.coverImage?.medium,
    score: anime.averageScore ? anime.averageScore / 10 : undefined,
    userScore: undefined, // Will be populated by user data fetch
    episodes: anime.episodes,
    status: anime.status,
    genres: anime.genres || [],
    year: anime.startDate?.year,
    format: anime.format,
    source: 'anilist'
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
const makeGraphQLRequest = async (query: string, variables?: any) => {
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
      const query = `
        query {
          Page(page: 1, perPage: 6) {
            media(type: ANIME, sort: TRENDING_DESC) {
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
      `
      
      const data = await makeGraphQLRequest(query)
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList trending error:', error)
      throw error
    }
  },

  async getPopularAnime() {
    try {
      const query = `
        query {
          Page(page: 1, perPage: 6) {
            media(type: ANIME, sort: POPULARITY_DESC) {
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
      `
      
      const data = await makeGraphQLRequest(query)
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList popular error:', error)
      throw error
    }
  },

  async getTopRatedAnime() {
    try {
      const query = `
        query {
          Page(page: 1, perPage: 6) {
            media(type: ANIME, sort: SCORE_DESC) {
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
      `
      
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

      const query = `
        query($season: MediaSeason, $year: Int) {
          Page(page: 1, perPage: 6) {
            media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) {
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
      `
      
      const data = await makeGraphQLRequest(query, { season, year: currentYear })
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList current season error:', error)
      throw error
    }
  },

  async searchAnime(query: string) {
    try {
      const searchQuery = `
        query($search: String) {
          Page(page: 1, perPage: 6) {
            media(type: ANIME, search: $search) {
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
      `
      
      const data = await makeGraphQLRequest(searchQuery, { search: query })
      return data.Page.media.map((anime: AniListAnime) => normalizeAniListAnime(anime))
    } catch (error) {
      console.error('AniList search error:', error)
      throw error
    }
  },

  async getAnimeDetails(id: number) {
    try {
      const query = `
        query($id: Int) {
          Media(id: $id, type: ANIME) {
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
        }
      `
      
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
      data.MediaListCollection.lists.forEach((list: any) => {
        list.entries.forEach((entry: any) => {
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
      
      const query = `
        query {
          Viewer {
            mediaListOptions {
              scoreFormat
            }
          }
          MediaListCollection(userId: null, type: ANIME, status: CURRENT) {
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
        body: JSON.stringify({ query })
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
        data.data.MediaListCollection.lists.forEach((list: any) => {
          list.entries?.forEach((entry: any) => {
            const normalizedAnime = normalizeAniListAnime(entry.media)
            // Add user score from the entry
            normalizedAnime.userScore = entry.score && entry.score > 0 ? entry.score : undefined
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
  }
}