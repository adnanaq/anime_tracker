import { AnimeBase } from "../../types/anime";

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV;
const ANIME_SCHEDULE_BASE_URL = isDevelopment
  ? "http://localhost:3002/animeschedule"
  : "https://animeschedule.net/api/v3";

// Rate limiting: 120 requests per minute
const RATE_LIMIT_DELAY = 500; // 500ms between requests (safe margin)
let lastRequestTime = 0;

const rateLimitedFetch = async (url: string): Promise<Response> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();

  // In development, use proxy (no need for auth header as proxy handles it)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!isDevelopment) {
    const token = import.meta.env.VITE_ANIME_SCHEDULE_TOKEN;
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { headers });
};

// AnimeSchedule.net response types
export interface AnimeScheduleEntry {
  title: string;
  route: string;
  romaji?: string;
  english?: string;
  native?: string;
  episodeDate: string;
  episodeNumber: number;
  lengthMin?: number;
  airType: "raw" | "sub" | "dub";
  delayedText?: string;
  delayedFrom?: string;
  delayedUntil?: string;
  episodeDelay?: number;
  airingStatus: "aired" | "airing" | "delayed" | "skipped" | "tba" | "unaired";
  streams?: {
    crunchyroll?: string;
    funimation?: string;
    youtube?: string;
    amazon?: string;
    apple?: string;
    hidive?: string;
    [key: string]: string | undefined;
  };
  malId?: number;
  anilistId?: number;
  status?: string;
  episodes?: number;
  donghua?: boolean;
  imageVersionRoute?: string;
}

// Note: AnimeSchedule API returns direct array, not paginated response

const normalizeAnimeScheduleEntry = (entry: AnimeScheduleEntry): AnimeBase => {
  const hasValidMalId = !!(entry.malId && entry.malId > 0);

  // Handle delay logic based on delayedText presence
  let actualAiringStatus = entry.airingStatus;
  let calculatedEpisodeDelay = entry.episodeDelay;

  // If delayedText is present, this episode is delayed
  if (entry.delayedText) {
    actualAiringStatus = "delayed";
    
    // Calculate episode delay from date range if not already provided by API
    if (!calculatedEpisodeDelay && entry.delayedFrom && entry.delayedUntil) {
      try {
        const delayedFromDate = new Date(entry.delayedFrom);
        const delayedUntilDate = new Date(entry.delayedUntil);
        
        // Check if dates are valid
        if (!isNaN(delayedFromDate.getTime()) && !isNaN(delayedUntilDate.getTime())) {
          const delayDurationMs = delayedUntilDate.getTime() - delayedFromDate.getTime();
          calculatedEpisodeDelay = Math.round(delayDurationMs / (1000 * 60)); // Convert to minutes
        }
      } catch (error) {
        // Invalid dates - keep calculatedEpisodeDelay as undefined
      }
    }
  }

  return {
    id: hasValidMalId ? entry.malId! : Math.floor(Math.random() * 1000000), // Use random ID for display only
    title: entry.english || entry.romaji || entry.title,
    synopsis: undefined, // AnimeSchedule doesn't provide synopsis
    image: undefined, // AnimeSchedule doesn't provide images
    coverImage: undefined,
    score: undefined,
    episodes: entry.episodes, // Total episodes if available
    status:
      actualAiringStatus === "aired"
        ? "finished_airing"
        : actualAiringStatus === "airing"
        ? "currently_airing"
        : actualAiringStatus === "delayed"
        ? "not_yet_aired"
        : "not_yet_aired",
    genres: [],
    source: "mal" as const, // Using mal as source since these are MAL IDs
    // Additional AnimeSchedule-specific data
    episodeNumber: entry.episodeNumber,
    episodeDate: entry.episodeDate,
    lengthMin: entry.lengthMin,
    airingStatus: actualAiringStatus,
    episodeDelay: calculatedEpisodeDelay,
    delayedFrom: entry.delayedFrom,
    delayedUntil: entry.delayedUntil,
    hasValidId: hasValidMalId, // Flag to indicate this has a valid MAL ID
    malId: entry.malId, // Store the original MAL ID
  };
};

// Note: Date/week conversion helpers removed - component handles its own date logic

export const animeScheduleService = {
  async getTimetables(params?: {
    week?: number; // Week number (1-53)
    year?: number; // Year (e.g., 2025)
    timezone?: string; // IANA timezone (e.g., 'America/New_York') - converted to 'tz'
  }): Promise<AnimeBase[]> {
    try {
      const searchParams = new URLSearchParams();

      // Add week and year parameters (both required by API)
      if (params?.week && params?.year) {
        searchParams.append("week", params.week.toString());
        searchParams.append("year", params.year.toString());
      }

      // Convert 'timezone' to 'tz' parameter as expected by API
      if (params?.timezone) {
        searchParams.append("tz", params.timezone);
      }

      const url = `${ANIME_SCHEDULE_BASE_URL}/timetables${
        searchParams.toString() ? `?${searchParams}` : ""
      }`;
      const response = await rateLimitedFetch(url);

      if (!response.ok) {
        throw new Error(
          `AnimeSchedule API error: ${response.status} ${response.statusText}`
        );
      }

      const data: AnimeScheduleEntry[] = await response.json();
      return data.map(normalizeAnimeScheduleEntry);
    } catch (error) {
      console.error("AnimeSchedule timetables error:", error);
      return [];
    }
  },
};
