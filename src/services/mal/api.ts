import axios from "axios";
import { MALAnime, AnimeBase } from "../../types/anime";
import { malCache, malRequestManager } from "../../lib/cache";

// Jikan API for enhanced features (built on MAL data)
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'

// Rate limiting for Jikan: 30 requests per minute, 2 requests per second
const RATE_LIMIT_DELAY = 500 // 500ms between requests
let lastJikanRequestTime = 0

const rateLimitedJikanFetch = async (url: string): Promise<Response> => {
  const now = Date.now()
  const timeSinceLastRequest = now - lastJikanRequestTime
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
  }
  
  lastJikanRequestTime = Date.now()
  return fetch(url)
}

// Enhanced types for Jikan integration
export interface JikanScheduleEntry {
  mal_id: number
  title: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  synopsis?: string
  score?: number
  episodes?: number
  broadcast: {
    day?: string
    time?: string
    timezone?: string
    string?: string
  }
  genres?: Array<{ mal_id: number; name: string }>
}

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const MAL_BASE_URL = isDevelopment
  ? "http://localhost:3002/mal"
  : "https://api.myanimelist.net/v2";
const CLIENT_ID = import.meta.env.VITE_MAL_CLIENT_ID;

// Function to get headers with optional auth
const getHeaders = (accessToken?: string) => {
  const baseHeaders = isDevelopment
    ? {
        "Content-Type": "application/json",
      }
    : {
        "X-MAL-CLIENT-ID": CLIENT_ID,
        "Content-Type": "application/json",
      };

  // Add authorization header if token is provided
  if (accessToken) {
    return {
      ...baseHeaders,
      "Authorization": `Bearer ${accessToken}`,
    };
  }

  return baseHeaders;
};

const malApi = axios.create({
  baseURL: MAL_BASE_URL,
});

// Add response interceptor for error handling
malApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("MAL API Error:", {
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const normalizeMALAnime = (
  anime: MALAnime,
  includeRelated: boolean = false
): AnimeBase => {
  const userScore = (anime as any).my_list_status?.score || undefined;
  const userStatus = (anime as any).my_list_status?.status || undefined;
  const userProgress = (anime as any).my_list_status?.num_episodes_watched || undefined;

  const normalized: AnimeBase = {
    id: anime.id,
    title: anime.title,
    synopsis: anime.synopsis,
    image: anime.main_picture?.large || anime.main_picture?.medium,
    coverImage: anime.main_picture?.large || anime.main_picture?.medium,
    score: anime.mean,
    userScore: userScore,
    userStatus: userStatus,
    userProgress: userProgress,
    episodes: anime.num_episodes,
    status: anime.status,
    genres: anime.genres?.map((g) => g.name) || [],
    year: anime.start_date
      ? new Date(anime.start_date).getFullYear()
      : undefined,
    format: anime.media_type,
    source: "mal",
  };

  // Process related anime if requested and available
  if (includeRelated && anime.related_anime) {
    normalized.relatedAnime = anime.related_anime
      .filter((related) => related.node && related.node.id !== anime.id) // Avoid self-references
      .slice(0, 10) // Limit to 10 related anime to avoid too much data
      .map((related) => normalizeMALAnime(related.node, false)); // Don't include nested related anime
  }

  return normalized;
};

export const malService = {
  async getSeasonalAnime(season?: string, year?: number, accessToken?: string) {
    if (!season || !year) {
      // Fallback to ranking if season/year not provided
      return await this.getRankingAnime("airing", accessToken);
    }

    const requestKey = `mal:seasonal:${year}:${season}:${!!accessToken}`
    
    return await malRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await malCache.getSeasonalAnime(
          season,
          year,
          async () => {
            const response = await malApi.get(`/anime/season/${year}/${season}`, {
              headers: getHeaders(accessToken),
              params: {
                fields:
                  "id,title,main_picture,pictures,synopsis,mean,num_episodes,status,genres,start_date,media_type,my_list_status",
                limit: 12,
              },
            });
            return response.data.data.map((item: { node: MALAnime }) =>
              normalizeMALAnime(item.node)
            );
          },
          !!accessToken
        )
      }
    ).catch(async (error) => {
      console.error("MAL seasonal anime error:", error);
      // Fallback to ranking on error
      return await this.getRankingAnime("airing", accessToken);
    })
  },

  async getRankingAnime(rankingType: string = "all", accessToken?: string) {
    const requestKey = `mal:ranking:${rankingType}:${!!accessToken}`
    
    return await malRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await malCache.getRankingAnime(
          rankingType,
          async () => {
            const response = await malApi.get("/anime/ranking", {
              headers: getHeaders(accessToken),
              params: {
                ranking_type: rankingType,
                fields:
                  "id,title,main_picture,pictures,synopsis,mean,num_episodes,status,genres,start_date,media_type,my_list_status",
                limit: 12,
              },
            });
            
            return response.data.data.map((item: { node: MALAnime }) =>
              normalizeMALAnime(item.node)
            );
          },
          !!accessToken
        )
      }
    )
  },

  async searchAnime(query: string, accessToken?: string) {
    const requestKey = `mal:search:${query}:${!!accessToken}`
    
    return await malRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await malCache.searchAnime(
          query,
          async () => {
            const response = await malApi.get("/anime", {
              headers: getHeaders(accessToken),
              params: {
                q: query,
                fields:
                  "id,title,main_picture,pictures,synopsis,mean,num_episodes,status,genres,start_date,media_type,my_list_status",
                limit: 12,
              },
            });
            return response.data.data.map((item: { node: MALAnime }) =>
              normalizeMALAnime(item.node)
            );
          }
        )
      }
    )
  },

  async getAnimeDetails(id: number, accessToken?: string) {
    const requestKey = `mal:details:${id}:${!!accessToken}`
    
    return await malRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await malCache.getAnimeDetails(
          id,
          async () => {
            const headers = getHeaders(accessToken);

            const response = await malApi.get(`/anime/${id}`, {
              headers,
              params: {
                fields:
                  "id,title,main_picture,pictures,synopsis,mean,num_episodes,status,genres,start_date,media_type,related_anime,my_list_status",
              },
            });

            const animeData = normalizeMALAnime(response.data, true);

            // Fetch detailed information for related anime
            if (animeData.relatedAnime && animeData.relatedAnime.length > 0) {
              const detailedRelatedAnime = await Promise.all(
                animeData.relatedAnime.slice(0, 5).map(async (relatedAnime) => {
                  // Cache related anime details too
                  return await malCache.getAnimeDetails(
                    relatedAnime.id,
                    async () => {
                      const detailedResponse = await malApi.get(
                        `/anime/${relatedAnime.id}`,
                        {
                          headers,
                          params: {
                            fields:
                              "id,title,main_picture,pictures,synopsis,mean,num_episodes,status,genres,start_date,media_type",
                          },
                        }
                      );
                      return normalizeMALAnime(detailedResponse.data, false);
                    },
                    !!accessToken
                  ).catch(() => relatedAnime) // If cache fails, return basic info
                })
              );
              animeData.relatedAnime = detailedRelatedAnime;
            }

            return animeData;
          },
          !!accessToken
        )
      }
    )
  },

  async getCurrentUser(accessToken: string) {
    try {
      const response = await malApi.get("/users/@me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("MAL get current user error:", error);
      throw error;
    }
  },

  async getUserScoresForAnime(animeIds: number[], accessToken: string) {
    try {
      const userScoreMap = new Map<number, number>();

      // Fetch user scores for each anime individually using the existing getAnimeDetails method
      const scorePromises = animeIds.map(async (animeId) => {
        try {
          // Use the existing getAnimeDetails which already includes my_list_status
          const response = await malApi.get(`/anime/${animeId}`, {
            headers: {
              ...getHeaders(),
              Authorization: `Bearer ${accessToken}`, // Explicitly add auth header
            },
            params: {
              fields: "id,title,my_list_status",
            },
          });

          // Extract user score from my_list_status
          if (
            response.data.my_list_status?.score &&
            response.data.my_list_status.score > 0
          ) {
            userScoreMap.set(animeId, response.data.my_list_status.score);
          }
        } catch (error) {
          // Continue with other anime even if one fails
        }
      });

      await Promise.all(scorePromises);

      return userScoreMap;
    } catch (error) {
      console.error("MAL getUserScoresForAnime error:", error);
      throw error;
    }
  },

  async getUserWatchingAnime(accessToken: string) {
    try {
      const response = await malApi.get(`/users/@me/animelist`, {
        headers: {
          ...getHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          status: "watching",
          fields:
            "id,title,main_picture,pictures,synopsis,mean,num_episodes,status,genres,start_date,media_type,my_list_status",
          limit: 50,
        },
      });

      if (!response.data.data) {
        return [];
      }

      return response.data.data.map(
        (item: { list_status: any; node: MALAnime }) => {
          const normalizedAnime = normalizeMALAnime(item.node);
          // Add user data from list_status
          if (item.list_status) {
            if (item.list_status.score && item.list_status.score > 0) {
              normalizedAnime.userScore = item.list_status.score;
            }
            if (item.list_status.status) {
              normalizedAnime.userStatus = item.list_status.status;
            }
            if (item.list_status.num_episodes_watched !== undefined) {
              normalizedAnime.userProgress = item.list_status.num_episodes_watched;
            }
          }
          return normalizedAnime;
        }
      );
    } catch (error) {
      console.error("MAL getUserWatchingAnime error:", error);
      throw error;
    }
  },

  async getUserAnimeStatusMap(accessToken: string) {
    try {
      const statusMap = new Map<number, string>();
      const statuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];
      
      // Fetch anime for each status
      const promises = statuses.map(async (status) => {
        try {
          const response = await malApi.get(`/users/@me/animelist`, {
            headers: {
              ...getHeaders(),
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              status: status,
              fields: "id,my_list_status",
              limit: 1000,
            },
          });

          if (response.data.data) {
            response.data.data.forEach((item: { node: { id: number }, list_status: { status: string } }) => {
              if (item.list_status?.status) {
                statusMap.set(item.node.id, item.list_status.status);
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching ${status} anime:`, error);
        }
      });

      await Promise.all(promises);
      return statusMap;
    } catch (error) {
      console.error("MAL getUserAnimeStatusMap error:", error);
      throw error;
    }
  },

  async updateAnimeStatus(
    animeId: number,
    accessToken: string,
    statusData: {
      status?:
        | "watching"
        | "completed"
        | "on_hold"
        | "dropped"
        | "plan_to_watch";
      score?: number;
      num_watched_episodes?: number;
      start_date?: string;
      finish_date?: string;
      comments?: string;
    }
  ) {
    try {

      // Convert to form data
      const formData = new URLSearchParams();
      Object.entries(statusData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });


      const response = await malApi.put(
        `/anime/${animeId}/my_list_status`,
        formData.toString(),
        {
          headers: {
            ...getHeaders(),
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("MAL updateAnimeStatus error:", error);
      console.error("Error details:", {
        status: (error as any).response?.status,
        statusText: (error as any).response?.statusText,
        data: (error as any).response?.data,
        url: (error as any).config?.url,
        method: (error as any).config?.method,
      });
      throw error;
    }
  },

  async deleteAnimeFromList(animeId: number, accessToken: string) {
    try {
      const response = await malApi.delete(`/anime/${animeId}/my_list_status`, {
        headers: {
          ...getHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("MAL deleteAnimeFromList error:", error);
      throw error;
    }
  },

  async getUserAnimeDetails(animeId: number, accessToken: string) {
    try {
      const response = await malApi.get(`/anime/${animeId}`, {
        headers: {
          ...getHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          fields: "my_list_status",
        },
      });

      return response.data.my_list_status;
    } catch (error) {
      console.error("MAL getUserAnimeDetails error:", error);
      throw error;
    }
  },

  // Enhanced features using Jikan API (built on MAL data)
  
  async getWeeklySchedule(): Promise<{ [day: string]: AnimeBase[] }> {
    try {
      const response = await rateLimitedJikanFetch(`${JIKAN_BASE_URL}/schedules`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const animeList = data.data || []
      
      // Group anime by broadcast day
      const weeklySchedule: { [day: string]: AnimeBase[] } = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
      
      animeList.forEach((anime: JikanScheduleEntry) => {
        if (anime.broadcast?.day) {
          const broadcastDay = anime.broadcast.day.toLowerCase()
          // Handle plural forms (e.g., "mondays" -> "monday")
          const dayKey = broadcastDay.endsWith('s') ? broadcastDay.slice(0, -1) : broadcastDay
          
          if (weeklySchedule[dayKey]) {
            // Normalize Jikan data to AnimeBase format
            const normalizedAnime: AnimeBase = {
              id: anime.mal_id,
              title: anime.title,
              synopsis: anime.synopsis,
              image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
              coverImage: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
              score: anime.score,
              episodes: anime.episodes,
              genres: anime.genres?.map(g => g.name) || [],
              source: 'mal' as const
            }
            
            weeklySchedule[dayKey].push(normalizedAnime)
          }
        }
      })
      
      return weeklySchedule
    } catch (error) {
      console.error('MAL getWeeklySchedule error:', error)
      return {}
    }
  },

  async getDaySchedule(day: string): Promise<AnimeBase[]> {
    try {
      const response = await rateLimitedJikanFetch(`${JIKAN_BASE_URL}/schedules?filter=${day.toLowerCase()}`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const animeList = data.data || []
      
      return animeList.map((anime: JikanScheduleEntry) => ({
        id: anime.mal_id,
        title: anime.title,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        coverImage: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        score: anime.score,
        episodes: anime.episodes,
        genres: anime.genres?.map(g => g.name) || [],
        source: 'mal' as const
      }))
    } catch (error) {
      console.error(`MAL get${day} schedule error:`, error)
      return []
    }
  },

  async advancedSearchAnime(params: {
    query?: string
    type?: 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music'
    status?: 'airing' | 'complete' | 'upcoming'
    rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx'
    genre?: string
    min_score?: number
    max_score?: number
    limit?: number
  }): Promise<AnimeBase[]> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params.query) searchParams.append('q', params.query)
      if (params.type) searchParams.append('type', params.type)
      if (params.status) searchParams.append('status', params.status)
      if (params.rating) searchParams.append('rating', params.rating)
      if (params.genre) searchParams.append('genres', params.genre)
      if (params.min_score) searchParams.append('min_score', params.min_score.toString())
      if (params.max_score) searchParams.append('max_score', params.max_score.toString())
      searchParams.append('limit', (params.limit || 12).toString())
      
      const response = await rateLimitedJikanFetch(`${JIKAN_BASE_URL}/anime?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const animeList = data.data || []
      
      return animeList.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        coverImage: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        score: anime.score,
        episodes: anime.episodes,
        status: anime.status,
        genres: anime.genres?.map((g: any) => g.name) || [],
        year: anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined),
        format: anime.type,
        source: 'mal' as const
      }))
    } catch (error) {
      console.error('MAL advanced search error:', error)
      return []
    }
  },

  async getGenres(): Promise<Array<{ mal_id: number; name: string }>> {
    try {
      const response = await rateLimitedJikanFetch(`${JIKAN_BASE_URL}/genres/anime`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('MAL get genres error:', error)
      return []
    }
  },

  async getRandomAnime(): Promise<AnimeBase> {
    try {
      const response = await rateLimitedJikanFetch(`${JIKAN_BASE_URL}/random/anime`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const anime = data.data
      
      return {
        id: anime.mal_id,
        title: anime.title,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        coverImage: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        score: anime.score,
        episodes: anime.episodes,
        status: anime.status,
        genres: anime.genres?.map((g: any) => g.name) || [],
        year: anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined),
        format: anime.type,
        source: 'mal' as const
      }
    } catch (error) {
      console.error('MAL get random anime error:', error)
      throw error
    }
  },


  async getUpcomingAnime(): Promise<AnimeBase[]> {
    try {
      const response = await rateLimitedJikanFetch(`${JIKAN_BASE_URL}/seasons/upcoming?limit=12`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const animeList = data.data || []
      
      return animeList.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        coverImage: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        score: anime.score,
        episodes: anime.episodes,
        status: anime.status,
        genres: anime.genres?.map((g: any) => g.name) || [],
        year: anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined),
        season: anime.season,
        format: anime.type,
        source: 'mal' as const
      }))
    } catch (error) {
      console.error('MAL get upcoming anime error:', error)
      return []
    }
  },
};
