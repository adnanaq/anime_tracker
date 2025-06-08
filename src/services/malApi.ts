import axios from "axios";
import { MALAnime, AnimeBase } from "../types/anime";
import { getAuthService } from "./auth";

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const MAL_BASE_URL = isDevelopment
  ? "http://localhost:3002/mal"
  : "https://api.myanimelist.net/v2";
const CLIENT_ID = import.meta.env.VITE_MAL_CLIENT_ID;

// Function to get headers with optional auth
const getHeaders = () => {
  const baseHeaders = isDevelopment
    ? {
        "Content-Type": "application/json",
      }
    : {
        "X-MAL-CLIENT-ID": CLIENT_ID,
        "Content-Type": "application/json",
      };

  // Add authorization header if user is authenticated
  const authServiceInstance = getAuthService("mal");
  const isAuth = authServiceInstance?.isAuthenticated();
  const token = authServiceInstance?.getToken();

  if (isAuth && token) {
    const headers = {
      ...baseHeaders,
      Authorization: `Bearer ${token.access_token}`,
    };
    return headers;
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

export const normalizeMALAnime = (anime: MALAnime, includeRelated: boolean = false): AnimeBase => {
  const userScore = (anime as any).my_list_status?.score || undefined;

  const normalized: AnimeBase = {
    id: anime.id,
    title: anime.title,
    synopsis: anime.synopsis,
    image: anime.main_picture?.large || anime.main_picture?.medium,
    coverImage: anime.main_picture?.large || anime.main_picture?.medium,
    score: anime.mean,
    userScore: userScore,
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
      .filter(related => related.node && related.node.id !== anime.id) // Avoid self-references
      .slice(0, 10) // Limit to 10 related anime to avoid too much data
      .map(related => normalizeMALAnime(related.node, false)); // Don't include nested related anime
  }

  return normalized;
};

export const malService = {
  async getSeasonalAnime(season?: string, year?: number) {
    try {
      if (!season || !year) {
        // Fallback to ranking if season/year not provided
        return await this.getRankingAnime("airing");
      }

      const response = await malApi.get(`/anime/season/${year}/${season}`, {
        headers: getHeaders(),
        params: {
          fields:
            "id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type",
          limit: 6,
        },
      });
      return response.data.data.map((item: { node: MALAnime }) =>
        normalizeMALAnime(item.node)
      );
    } catch (error) {
      console.error("MAL seasonal anime error:", error);
      // Fallback to ranking on error
      return await this.getRankingAnime("airing");
    }
  },

  async getRankingAnime(rankingType: string = "all") {
    try {
      const response = await malApi.get("/anime/ranking", {
        headers: getHeaders(),
        params: {
          ranking_type: rankingType,
          fields:
            "id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type",
          limit: 6,
        },
      });
      return response.data.data.map((item: { node: MALAnime }) =>
        normalizeMALAnime(item.node)
      );
    } catch (error) {
      console.error("MAL ranking anime error:", error);
      throw error;
    }
  },

  async searchAnime(query: string) {
    try {
      const response = await malApi.get("/anime", {
        headers: getHeaders(),
        params: {
          q: query,
          fields:
            "id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type",
          limit: 6,
        },
      });
      return response.data.data.map((item: { node: MALAnime }) =>
        normalizeMALAnime(item.node)
      );
    } catch (error) {
      console.error("MAL search error:", error);
      throw error;
    }
  },

  async getAnimeDetails(id: number) {
    try {
      const headers = getHeaders();

      const response = await malApi.get(`/anime/${id}`, {
        headers,
        params: {
          fields:
            "id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type,related_anime,my_list_status",
        },
      });

      const animeData = normalizeMALAnime(response.data, true);

      // Fetch detailed information for related anime
      if (animeData.relatedAnime && animeData.relatedAnime.length > 0) {
        const detailedRelatedAnime = await Promise.all(
          animeData.relatedAnime.slice(0, 5).map(async (relatedAnime) => {
            try {
              const detailedResponse = await malApi.get(`/anime/${relatedAnime.id}`, {
                headers,
                params: {
                  fields: "id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type",
                },
              });
              return normalizeMALAnime(detailedResponse.data, false);
            } catch (error) {
              // If we can't fetch details, return the basic info
              return relatedAnime;
            }
          })
        );
        animeData.relatedAnime = detailedRelatedAnime;
      }

      return animeData;
    } catch (error) {
      console.error("MAL anime details error:", error);
      throw error;
    }
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
          fields: "id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type,my_list_status",
          limit: 50,
        },
      });

      if (!response.data.data) {
        return [];
      }

      return response.data.data.map(
        (item: { list_status: any; node: MALAnime }) => {
          const normalizedAnime = normalizeMALAnime(item.node);
          // Add user score from list_status
          if (item.list_status?.score && item.list_status.score > 0) {
            normalizedAnime.userScore = item.list_status.score;
          }
          return normalizedAnime;
        }
      );
    } catch (error) {
      console.error("MAL getUserWatchingAnime error:", error);
      throw error;
    }
  },
};
