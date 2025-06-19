import React from "react";
import { AnimeBase } from "../../../types/anime";
import { Badge } from "../Badge";
import { Typography } from "../Typography";
import { StatusBadgeDropdown } from "../StatusBadgeDropdown";
import "./AnimeInfoCard.css";

export interface AnimeInfoCardProps {
  anime: AnimeBase;
  className?: string;
  // Status dropdown integration for expanded state
  statusDropdown?: {
    enabled: boolean;
    onStatusChange?: (newStatus: string) => Promise<void> | void;
    isAuthenticated?: boolean;
  };
  // Optional navigation handler for title clicks
  onTitleClick?: () => void;
}

export const AnimeInfoCard: React.FC<AnimeInfoCardProps> = ({
  anime,
  className = "",
  statusDropdown,
  onTitleClick,
}) => {
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className={`anime-info-card py-2 ${className}`}>
      {/* Header Section - Title and Badges */}
      <div className="flex-shrink-0">
        {/* Title */}
        <div className="mb-3">
          <Typography
            variant="h4"
            color="primary"
            className={`mb-2 line-clamp-2 text-white ${onTitleClick ? 'cursor-pointer hover:text-blue-200 transition-colors' : ''}`}
            onClick={onTitleClick ? (e) => {
              e.stopPropagation();
              e.preventDefault();
              onTitleClick();
            } : undefined}
            role={onTitleClick ? "button" : undefined}
            tabIndex={onTitleClick ? 0 : undefined}
            data-anime-info-title="true"
          >
            {anime.title}
          </Typography>
        </div>

        {/* User Status, Format, and Score Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* User Status - Replace anime.status with StatusBadgeDropdown */}
          {statusDropdown?.enabled && statusDropdown.onStatusChange ? (
            <StatusBadgeDropdown
              currentStatus={anime.userStatus || null}
              source={anime.source}
              onStatusChange={statusDropdown.onStatusChange}
              isAuthenticated={statusDropdown.isAuthenticated ?? true}
              size="sm"
              shape="rounded"
            />
          ) : (
            // Fallback to anime release status if no status dropdown
            anime.status && (
              <Badge
                variant={
                  anime.status === "FINISHED" || anime.status === "completed"
                    ? "success"
                    : anime.status === "RELEASING" ||
                        anime.status === "currently_airing"
                      ? "primary"
                      : anime.status === "NOT_YET_RELEASED" ||
                          anime.status === "not_yet_aired"
                        ? "warning"
                        : "neutral"
                }
                shape="rounded"
                size="sm"
                icon={
                  anime.status === "FINISHED" || anime.status === "completed"
                    ? "✅"
                    : anime.status === "RELEASING" ||
                        anime.status === "currently_airing"
                      ? "📺"
                      : anime.status === "NOT_YET_RELEASED" ||
                          anime.status === "not_yet_aired"
                        ? "⏳"
                        : "❓"
                }
              >
                {anime.status
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            )
          )}

          {anime.score && (
            <Badge variant="warning" size="sm" shape="rounded" icon="⭐">
              {anime.score.toFixed(1)}
            </Badge>
          )}

          {anime.userScore && (
            <Badge variant="info" size="sm" shape="rounded" icon="👤">
              {anime.userScore}/10
            </Badge>
          )}

          {anime.format && (
            <Badge
              variant={
                anime.format === "TV"
                  ? "secondary"
                  : anime.format === "MOVIE"
                    ? "danger"
                    : anime.format === "OVA" || anime.format === "ONA"
                      ? "primary"
                      : anime.format === "SPECIAL"
                        ? "warning"
                        : "neutral"
              }
              shape="rounded"
              size="sm"
              icon={
                anime.format === "TV"
                  ? "📺"
                  : anime.format === "MOVIE"
                    ? "🎬"
                    : anime.format === "OVA" || anime.format === "ONA"
                      ? "💿"
                      : anime.format === "SPECIAL"
                        ? "⭐"
                        : "📼"
              }
            >
              {anime.format}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content Section - Metadata */}
      <div className="flex-1 min-h-0">
        {/* Enhanced Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div className="space-y-1.5">
            {anime.episodes && (
              <div className="flex items-start space-x-2">
                <Typography variant="label" className="text-white/70">
                  Episodes:
                </Typography>
                <Typography variant="bodySmall" className="font-medium">{anime.episodes}</Typography>
              </div>
            )}

            {anime.year && (
              <div className="flex items-start space-x-2">
                <Typography variant="label" className="text-white/70">
                  Year:
                </Typography>
                <Typography variant="bodySmall">{anime.year}</Typography>
              </div>
            )}

            {anime.season && (
              <div className="flex items-start space-x-2">
                <Typography variant="label" className="text-white/70">
                  Season:
                </Typography>
                <Typography variant="bodySmall" className="capitalize">
                  {anime.season.toLowerCase()}
                </Typography>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            {(anime.duration || anime.lengthMin) && (
              <div className="flex items-start space-x-2">
                <Typography
                  variant="label"
                  className="text-white/70 flex-shrink-0"
                >
                  Duration:
                </Typography>
                <Typography variant="bodySmall" className="flex-1 font-medium">
                  {anime.duration ? `${anime.duration} min/episode` : `${anime.lengthMin} min/episode`}
                </Typography>
              </div>
            )}

            {anime.studios && anime.studios.length > 0 && (
              <div className="flex items-start space-x-2">
                <Typography
                  variant="label"
                  className="text-white/70 flex-shrink-0"
                >
                  Studio:
                </Typography>
                <Typography variant="bodySmall" className="flex-1 font-medium">
                  {anime.studios.slice(0, 2).join(", ").trim()}
                </Typography>
              </div>
            )}

            {anime.popularity && (
              <div className="flex items-start space-x-2">
                <Typography
                  variant="label"
                  className="text-white/70 flex-shrink-0"
                >
                  Popularity:
                </Typography>
                <Typography variant="bodySmall" className="flex-1 font-medium">
                  #{anime.popularity}
                </Typography>
              </div>
            )}

            {anime.genres && anime.genres.length > 0 && (
              <div>
                <Typography variant="label" className="mb-1 text-white/70">
                  Genres:
                </Typography>
                <div className="flex flex-wrap gap-1">
                  {anime.genres.slice(0, 4).map((genre, index) => (
                    <Badge
                      key={index}
                      variant="primary"
                      size="xs"
                      shape="rounded"
                    >
                      {genre}
                    </Badge>
                  ))}
                  {anime.genres.length > 4 && (
                    <Typography variant="caption" color="tertiary">
                      +{anime.genres.length - 4} more
                    </Typography>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Synopsis Section - flexible height */}
        {anime.synopsis && (
          <div className="mt-2 flex-1 min-h-0">
            <div
              className={`scrolling-synopsis ${
                anime.synopsis.length > 150 ? "long-text" : "short-text"
              }`}
            >
              <Typography
                variant="bodySmall"
                className="text-white/80 leading-relaxed synopsis-text"
              >
                {anime.synopsis.length > 150
                  ? anime.synopsis
                  : truncateText(anime.synopsis, 200)}
              </Typography>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Set displayName for component detection in BaseAnimeCard
AnimeInfoCard.displayName = 'AnimeInfoCard';
