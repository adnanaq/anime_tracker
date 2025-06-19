/**
 * Filter types and interfaces for the anime schedule component
 */

/**
 * Comprehensive filter interface for anime schedule filtering
 */
export interface ScheduleFilters {
  /** Search term for anime titles */
  search: string;
  
  /** Filter by air type (raw/sub/dub) */
  airType: "all" | "raw" | "sub" | "dub";
  
  /** Filter by airing status */
  airingStatus: "all" | "aired" | "airing" | "delayed" | "skipped" | "tba";
  
  /** Filter by streaming platform availability */
  streamingPlatform: "all" | "crunchyroll" | "funimation" | "youtube" | "amazon" | "hidive";
  
  /** Show only episodes with delays */
  episodeDelay: boolean;
  
  /** Filter for Chinese animation (donghua) */
  donghua: boolean;
  
  /** Show only anime with streaming links available */
  hasStreaming: boolean;
}

/**
 * Statistics about filter results and available options
 */
export interface FilterStats {
  /** Total number of episodes available */
  total: number;
  
  /** Number of episodes after filtering */
  filtered: number;
  
  /** Count of episodes by air type */
  byAirType: Record<string, number>;
  
  /** Count of episodes by airing status */
  byStatus: Record<string, number>;
  
  /** Count of episodes by streaming platform */
  byPlatform: Record<string, number>;
}

/**
 * Filter option configuration for UI components
 */
export interface FilterOption {
  /** Option value */
  value: string;
  
  /** Display label */
  label: string;
  
  /** Number of items with this option */
  count?: number;
  
  /** Whether this option is disabled */
  disabled?: boolean;
}

/**
 * Filter category configuration
 */
export interface FilterCategory {
  /** Category key */
  key: keyof ScheduleFilters;
  
  /** Display label for the category */
  label: string;
  
  /** Available options for this category */
  options: FilterOption[];
  
  /** Filter type (select, toggle, search) */
  type: "select" | "toggle" | "search";
}