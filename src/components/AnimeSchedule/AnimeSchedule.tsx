import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { animeScheduleService } from "../../services/animeSchedule";
import { jikanService } from "../../services/jikan";
import { AnimeBase } from "../../types/anime";
import { Typography, Button, AnimeGridSkeleton, Badge } from "../ui";
import { Temporal } from "@js-temporal/polyfill";
import { AiringCountdown } from "./AiringCountdown";
import { useAnimeStore } from "../../store/animeStore";
import { getCurrentWeek, getWeeksInYear, getCurrentDay, getTimezoneOffset, getUserTimezone, DAYS_OF_WEEK } from "../../utils/dateUtils";


interface ScheduledAnime extends AnimeBase {
  episodeNumber?: number;
  episodeDate?: string;
}

const COMMON_TIMEZONES = [
  "UTC",
  "America/Toronto",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Asia/Kolkata",
];

const COMMON_TIMEZONE_OPTIONS = COMMON_TIMEZONES.map((tz) => {
  const offset = getTimezoneOffset(tz);
  return {
    value: tz,
    label: `${tz} (UTC${offset})`,
  };
});


interface ScheduleData {
  [key: string]: AnimeBase[];
}

export const AnimeSchedule = () => {
  const navigate = useNavigate();
  const { updateAnimeStatus, currentSource, applyUserData } = useAnimeStore();
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [selectedDay, setSelectedDay] = useState<string>(() => getCurrentDay());
  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    // Try to detect user's timezone, fallback to UTC
    const userTz = getUserTimezone();
    // Check if the detected timezone is in our common list
    const isCommonTz = COMMON_TIMEZONE_OPTIONS.some(
      (tz) => tz.value === userTz,
    );
    return isCommonTz ? userTz : "UTC";
  });

  const [currentWeek, setCurrentWeek] = useState<{
    week: number;
    year: number;
  }>(() => getCurrentWeek());

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
        // Get episodes for the specific week
        const allEpisodes = await animeScheduleService.getTimetables({
          week: currentWeek.week,
          year: currentWeek.year,
          timezone: selectedTimezone,
        });

        // Apply user data (scores and status) to episodes
        const episodesWithUserData = applyUserData(allEpisodes);

        // Group episodes by day of week
        const weeklySchedule: ScheduleData = {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        };

        episodesWithUserData.forEach((episode) => {
          if (episode.episodeDate) {
            const airDate = new Date(episode.episodeDate);
            const dayName = airDate
              .toLocaleDateString("en-US", { weekday: "long" })
              .toLowerCase();

            if (weeklySchedule[dayName]) {
              weeklySchedule[dayName].push(episode);
            }
          }
        });

        setScheduleData(weeklySchedule);
      } catch (err) {
        setError("Failed to fetch anime schedule. Please try again.");
        console.error("Schedule fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedTimezone, currentWeek]);

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

  // Watchlist functionality
  const handleWatchlistToggle = (anime: AnimeBase, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking watchlist button
    
    if (!anime.hasValidId || !anime.malId) {
      console.warn("Cannot add to watchlist: anime has no valid MAL ID");
      return;
    }

    const currentStatus = anime.userStatus;
    const isInWatchlist = currentStatus && currentStatus !== "";
    
    if (isInWatchlist) {
      // Remove from watchlist
      updateAnimeStatus(anime.malId, "mal", "");
    } else {
      // Add to Plan to Watch
      updateAnimeStatus(anime.malId, "mal", "plan_to_watch");
    }
  };

  // Week navigation functions
  const navigateToWeek = (weekDelta: number) => {
    const newWeek = {
      week: currentWeek.week + weekDelta,
      year: currentWeek.year,
    };

    // Handle year rollover
    if (newWeek.week < 1) {
      newWeek.year -= 1;
      newWeek.week = getWeeksInYear(newWeek.year);
    } else if (newWeek.week > getWeeksInYear(newWeek.year)) {
      newWeek.year += 1;
      newWeek.week = 1;
    }

    setCurrentWeek(newWeek);
  };

  const goToPreviousWeek = () => navigateToWeek(-1);
  const goToNextWeek = () => navigateToWeek(1);
  const goToCurrentWeek = () => setCurrentWeek(getCurrentWeek());

  // Check if we can navigate (limit to reasonable range)
  const actualCurrentWeek = getCurrentWeek();
  const weeksDifferenceFromCurrent =
    (currentWeek.year - actualCurrentWeek.year) * 52 +
    (currentWeek.week - actualCurrentWeek.week);

  const canGoToPrevious = weeksDifferenceFromCurrent > -4; // Max 4 weeks back
  const canGoToNext = weeksDifferenceFromCurrent < 4; // Max 4 weeks forward
  const isCurrentWeek =
    currentWeek.week === actualCurrentWeek.week &&
    currentWeek.year === actualCurrentWeek.year;

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
          <div className="flex items-center space-x-4">
            <Typography variant="h2">📅 Weekly Anime Schedule</Typography>

            {/* Week Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={goToPreviousWeek}
                disabled={!canGoToPrevious || loading}
                variant="ghost"
                size="sm"
                className="px-2"
              >
                ←
              </Button>

              <div className="flex items-center space-x-2">
                <Typography variant="bodySmall" color="muted">
                  Week {currentWeek.week}, {currentWeek.year}
                </Typography>
                {!isCurrentWeek && (
                  <Button
                    onClick={goToCurrentWeek}
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2 py-1"
                  >
                    Current
                  </Button>
                )}
              </div>

              <Button
                onClick={goToNextWeek}
                disabled={!canGoToNext || loading}
                variant="ghost"
                size="sm"
                className="px-2"
              >
                →
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timezone Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm at-text-muted">🕐</span>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="at-bg-surface at-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:at-border-focus at-transition-colors at-text-primary"
              >
                {COMMON_TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
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
              {selectedDayData.slice().map((anime) => {
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
                              <div className="flex items-center space-x-2 flex-wrap">
                                <Badge variant="info" size="xs" shape="rounded">
                                  Episode {(anime as ScheduledAnime).episodeNumber}
                                </Badge>
                                
                                {/* Airing Status Badge */}
                                {(anime as any).airingStatus && (
                                  <Badge 
                                    variant={
                                      (anime as any).airingStatus === "aired"
                                        ? "success"
                                        : (anime as any).airingStatus === "airing"
                                        ? "danger"
                                        : (anime as any).airingStatus === "delayed"
                                        ? "warning"
                                        : (anime as any).airingStatus === "skipped"
                                        ? "neutral"
                                        : "primary"
                                    }
                                    size="xs" 
                                    shape="rounded"
                                    animated={(anime as any).airingStatus === "airing"}
                                    icon={(anime as any).airingStatus === "airing" ? <div className="w-2 h-2 bg-current rounded-full"></div> : undefined}
                                  >
                                    {(anime as any).airingStatus === "aired"
                                      ? "Aired"
                                      : (anime as any).airingStatus === "airing"
                                      ? "Live"
                                      : (anime as any).airingStatus === "delayed"
                                      ? "Delayed"
                                      : (anime as any).airingStatus === "skipped"
                                      ? "Skipped"
                                      : "TBA"}
                                  </Badge>
                                )}


                                {(anime as ScheduledAnime).lengthMin && (
                                  <Typography variant="bodySmall" color="muted">
                                    {(anime as ScheduledAnime).lengthMin}min
                                  </Typography>
                                )}
                              </div>
                            )}

                            {(anime as ScheduledAnime).episodeDate && (
                              <div className="space-y-1">
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
                                
                                {/* Show new air time for delayed episodes */}
                                {(anime as any).airingStatus === "delayed" && (anime as any).delayedUntil && (
                                  <Typography variant="bodySmall" color="warning">
                                    📺 New air time: {" "}
                                    {new Date((anime as any).delayedUntil).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      timeZone: selectedTimezone,
                                      timeZoneName: "short",
                                    })}
                                    {" "}
                                    {new Date((anime as any).delayedUntil).toLocaleDateString([], {
                                      month: "short",
                                      day: "numeric",
                                      timeZone: selectedTimezone,
                                    })}
                                  </Typography>
                                )}
                                
                                <AiringCountdown 
                                  episodeDate={(anime as ScheduledAnime).episodeDate!}
                                  airingStatus={(anime as any).airingStatus}
                                  timezone={selectedTimezone}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </ContentArea>

                      {/* Watchlist Button */}
                      {anime.hasValidId && anime.malId && (
                        <div className="flex-shrink-0">
                          <Button
                            onClick={(e) => handleWatchlistToggle(anime, e)}
                            variant={anime.userStatus ? "warning" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            title={
                              anime.userStatus 
                                ? `Remove from list (${anime.userStatus})` 
                                : "Add to Plan to Watch"
                            }
                          >
                            {anime.userStatus ? "✓" : "+"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
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
