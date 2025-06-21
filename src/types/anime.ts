export interface AnimeBase {
  id: number;
  title: string;
  synopsis?: string;
  image?: string;
  coverImage?: string;
  score?: number;
  userScore?: number;
  userStatus?: string; // User's watch status (watching, completed, etc.)
  userProgress?: number; // Episodes watched by user
  episodes?: number;
  status?: string;
  genres?: string[];
  year?: number;
  season?: string;
  format?: string;
  source: "mal" | "anilist" | "jikan";
  relatedAnime?: AnimeBase[];
  malId?: number; // MAL ID for cross-referencing
  hasValidId?: boolean; // Whether the anime has a valid ID for navigation
  episodeNumber?: number; // For scheduled anime episodes
  episodeDate?: string; // For scheduled anime episodes
  duration?: string; // Episode duration
  studios?: string[]; // Animation studios
  popularity?: number; // Popularity ranking
  lengthMin?: number; // Episode length in minutes
  airingStatus?: 'aired' | 'airing' | 'delayed' | 'skipped' | 'tba'; // Current airing status
  episodeDelay?: number; // Episode delay information in minutes
  delayedFrom?: string; // Date when delay started
  delayedUntil?: string; // Date when delay is expected to end
}

export interface MALAnime {
  id: number;
  title: string;
  main_picture?: {
    medium: string;
    large: string;
  };
  pictures?: Array<{
    large: string | null;
    medium: string;
  }>;
  synopsis?: string;
  mean?: number;
  num_episodes?: number;
  status?: string;
  genres?: Array<{ id: number; name: string }>;
  start_date?: string;
  media_type?: string;
  related_anime?: Array<{
    node: MALAnime;
    relation_type: string;
    relation_type_formatted: string;
  }>;
  average_episode_duration?: number; // Duration in seconds
  studios?: Array<{ id: number; name: string }>;
  popularity?: number; // Popularity ranking
}

export interface AniListAnime {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage?: {
    medium: string;
    large: string;
  };
  averageScore?: number;
  episodes?: number;
  status?: string;
  genres?: string[];
  startDate?: {
    year?: number;
  };
  season?: string;
  format?: string;
  relations?: {
    edges: Array<{
      relationType: string;
      node: AniListAnime;
    }>;
  };
  duration?: number; // Episode duration in minutes
  studios?: {
    edges: Array<{
      node: {
        id: number;
        name: string;
      };
    }>;
  };
  popularity?: number; // Popularity ranking
}

export interface AnimeListResponse {
  data: AnimeBase[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
  };
}

export type AnimeSource = "mal" | "anilist" | "jikan";
