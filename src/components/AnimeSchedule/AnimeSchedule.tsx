import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { animeScheduleService } from "../../services/animeSchedule";
import { jikanService } from "../../services/jikan";
import { AnimeBase } from "../../types/anime";
import { Typography, Button, AnimeGridSkeleton } from "../ui";

interface ScheduledAnime extends AnimeBase {
  episodeNumber?: number;
  lengthMin?: number;
  episodeDate?: string;
}

// Common timezones for the dropdown
const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)", emoji: "🌍" },
  { value: "America/New_York", label: "Eastern Time (US)", emoji: "🇺🇸" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)", emoji: "🇺🇸" },
  { value: "America/Chicago", label: "Central Time (US)", emoji: "🇺🇸" },
  { value: "Europe/London", label: "British Time", emoji: "🇬🇧" },
  { value: "Europe/Paris", label: "Central European Time", emoji: "🇪🇺" },
  { value: "Europe/Berlin", label: "Central European Time", emoji: "🇩🇪" },
  { value: "Asia/Tokyo", label: "Japan Standard Time", emoji: "🇯🇵" },
  { value: "Asia/Seoul", label: "Korea Standard Time", emoji: "🇰🇷" },
  { value: "Asia/Shanghai", label: "China Standard Time", emoji: "🇨🇳" },
  { value: "Australia/Sydney", label: "Australian Eastern Time", emoji: "🇦🇺" },
  { value: "Asia/Kolkata", label: "India Standard Time", emoji: "🇮🇳" },
];

// Function to detect user's timezone
const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return "UTC";
  }
};

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday", emoji: "🌙" },
  { key: "tuesday", label: "Tuesday", emoji: "🔥" },
  { key: "wednesday", label: "Wednesday", emoji: "🌸" },
  { key: "thursday", label: "Thursday", emoji: "⚡" },
  { key: "friday", label: "Friday", emoji: "🌟" },
  { key: "saturday", label: "Saturday", emoji: "🎯" },
  { key: "sunday", label: "Sunday", emoji: "☀️" },
];

interface ScheduleData {
  [key: string]: AnimeBase[];
}

export const AnimeSchedule = () => {
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    // Default to current day
    const today = new Date().getDay();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return dayNames[today];
  });
  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    // Try to detect user's timezone, fallback to UTC
    const userTz = getUserTimezone();
    // Check if the detected timezone is in our common list
    const isCommonTz = COMMON_TIMEZONES.some((tz) => tz.value === userTz);
    return isCommonTz ? userTz : "UTC";
  });
  const [filters, setFilters] = useState({
    search: "", // Search by title
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);

      try {
        const schedule =
          await animeScheduleService.getWeeklySchedule(selectedTimezone);
        setScheduleData(schedule);
      } catch (err) {
        setError("Failed to fetch anime schedule. Please try again.");
        console.error("Schedule fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedTimezone]);

  const handleAnimeNavigation = async (anime: AnimeBase) => {
    // First try to navigate using MAL ID if available
    if (anime.hasValidId && anime.malId && anime.malId > 0) {
      // Prefer MAL source for better compatibility, since Jikan uses MAL IDs anyway
      navigate(`/anime/mal/${anime.malId}`);
      return;
    }

    // Fallback: Search for anime by title using Jikan to get MAL ID
    try {
      const foundAnime = await jikanService.findAnimeByTitle(anime.title);
      if (foundAnime) {
        // Use MAL source with the found ID for consistency
        navigate(`/anime/mal/${foundAnime.id}`);
      } else {
        // If no anime found, show a message or fallback
      }
    } catch (error) {
      console.error("Error searching for anime:", error);
    }
  };

  // Filter and deduplicate episodes based on current filters
  const filterEpisodes = (episodes: AnimeBase[]) => {
    // First deduplicate by title to show only one entry per anime
    const uniqueEpisodes = new Map<string, AnimeBase>();

    episodes.forEach((episode) => {
      const title = episode.title;
      if (!uniqueEpisodes.has(title)) {
        uniqueEpisodes.set(title, episode);
      }
    });

    // Then apply filters
    return Array.from(uniqueEpisodes.values()).filter((episode) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!episode.title.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  };

  const rawSelectedDayData = scheduleData[selectedDay] || [];
  const selectedDayData = filterEpisodes(rawSelectedDayData);
  const selectedDayInfo =
    DAYS_OF_WEEK.find((day) => day.key === selectedDay) || DAYS_OF_WEEK[0];

  const LoadingSkeleton = () => <AnimeGridSkeleton count={8} />;

  return (
    <div className="at-bg-surface rounded-xl at-shadow-lg at-transition">
      {/* Header */}
      <div className="p-6 at-border-b">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h2">📅 Weekly Anime Schedule</Typography>
          <div className="flex items-center space-x-4">
            {/* Timezone Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm at-text-muted">🕐</span>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="at-bg-surface at-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:at-border-focus at-transition-colors at-text-primary"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.emoji} {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.key;
            const isToday = (() => {
              const today = new Date().getDay();
              const dayNames = [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
              ];
              return dayNames[today] === day.key;
            })();

            return (
              <Button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                variant={isSelected ? "warning" : "ghost"}
                size="sm"
                className={
                  isToday ? "ring-2 ring-blue-400 ring-opacity-50" : ""
                }
              >
                <span className="mr-2">{day.emoji}</span>
                {day.label}
                {isToday && <span className="ml-2 text-xs">📍</span>}
              </Button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm at-text-muted">🔍</span>
            <input
              type="text"
              placeholder="Search anime..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="at-bg-surface at-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:at-border-focus at-transition-colors w-40 at-text-primary"
            />
          </div>

          {/* Filter Results Count */}
          {filters.search && (
            <Typography variant="bodySmall" color="muted">
              {selectedDayData.length} of {rawSelectedDayData.length} anime
            </Typography>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="at-bg-danger/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <Typography
                variant="body"
                className="text-red-700 dark:text-red-300"
              >
                {error}
              </Typography>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : selectedDayData.length > 0 ? (
          <>
            <div className="mb-6">
              <Typography variant="h3" className="mb-2">
                {selectedDayInfo.emoji} Airing on {selectedDayInfo.label}
              </Typography>
              <Typography variant="body" color="muted">
                {selectedDayData.length} anime
                {selectedDayData.length !== 1 ? "" : ""}
                {filters.search && ` (${rawSelectedDayData.length} total)`}
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDayData.slice(0, 12).map((anime) => {
                const ContentArea = ({
                  children,
                }: {
                  children: React.ReactNode;
                }) => {
                  return (
                    <div
                      onClick={() => handleAnimeNavigation(anime)}
                      className="flex-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {children}
                    </div>
                  );
                };

                return (
                  <div
                    key={`${anime.id}-${anime.episodeNumber}`}
                    className="at-bg-surface/80 rounded-lg overflow-hidden at-transition group hover:at-shadow-lg cursor-pointer"
                  >
                    <div className="flex items-start space-x-4 p-4">
                      {/* Content Area - Clickable only if has valid ID */}
                      <ContentArea>
                        <div className="relative">
                          <Typography
                            variant="h4"
                            weight="semibold"
                            className="mb-2 line-clamp-2 at-transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          >
                            {anime.title}
                          </Typography>

                          <div className="space-y-2 text-sm">
                            {(anime as ScheduledAnime).episodeNumber && (
                              <div className="flex items-center space-x-2">
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                                  Episode{" "}
                                  {(anime as ScheduledAnime).episodeNumber}
                                </span>
                                {(anime as ScheduledAnime).lengthMin && (
                                  <Typography variant="bodySmall" color="muted">
                                    {(anime as ScheduledAnime).lengthMin}min
                                  </Typography>
                                )}
                              </div>
                            )}

                            {(anime as ScheduledAnime).episodeDate && (
                              <Typography variant="bodySmall" color="muted">
                                🕒{" "}
                                {new Date(
                                  (anime as ScheduledAnime).episodeDate!,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: selectedTimezone,
                                  timeZoneName: "short",
                                })}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </ContentArea>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedDayData.length > 12 && (
              <div className="text-center mt-6">
                <Typography variant="bodySmall" color="muted">
                  Showing 12 of {selectedDayData.length} anime. More available
                  on AnimeSchedule.net.
                </Typography>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{selectedDayInfo.emoji}</div>
            <Typography variant="h3" weight="semibold" className="mb-2">
              No Anime Scheduled
            </Typography>
            <Typography variant="body" color="muted">
              No anime episodes are scheduled to air on {selectedDayInfo.label}.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

