import { useState, useEffect } from "react";
import { malService } from "../../services/mal";
import { AnimeBase } from "../../types/anime";
import { ExpandableGrid } from "../ExpandableGrid";
import { Typography, Button, AnimeGridSkeleton, Spinner } from "../ui";
import {
  buildSearchParams,
  createDefaultSearchParams,
  validateSearchParams,
  createSearchSummary,
  type AdvancedSearchParams,
} from "../../utils/search";

const ANIME_TYPES = [
  { value: "", label: "All Types" },
  { value: "tv", label: "TV Series" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
  { value: "special", label: "Special" },
  { value: "ona", label: "ONA" },
  { value: "music", label: "Music" },
];

const ANIME_STATUS = [
  { value: "", label: "All Status" },
  { value: "airing", label: "Currently Airing" },
  { value: "complete", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];

const ANIME_RATINGS = [
  { value: "", label: "All Ratings" },
  { value: "g", label: "G - All Ages" },
  { value: "pg", label: "PG - Children" },
  { value: "pg13", label: "PG-13 - Teens 13+" },
  { value: "r17", label: "R - 17+ (violence/profanity)" },
  { value: "r", label: "R+ - Mild Nudity" },
];

export const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>(() =>
    createDefaultSearchParams(),
  );
  const [results, setResults] = useState<AnimeBase[]>([]);
  const [genres, setGenres] = useState<Array<{ mal_id: number; name: string }>>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await malService.getGenres();
        setGenres(genreList.slice(0, 20)); // Limit to first 20 genres for UI
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    };

    fetchGenres();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Validate search parameters
      const validation = validateSearchParams(searchParams);
      if (!validation.isValid) {
        setError(validation.errors.join(" "));
        return;
      }

      // Build clean search parameters using utility
      const apiParams = buildSearchParams(searchParams);

      // Add API-specific mappings
      const malParams: any = { ...apiParams, limit: 24 };
      if (apiParams.minScore) malParams.min_score = apiParams.minScore;
      if (apiParams.maxScore) malParams.max_score = apiParams.maxScore;

      const searchResults = await malService.advancedSearchAnime(malParams);
      setResults(searchResults);
    } catch (err) {
      setError("Failed to search anime. Please try again.");
      console.error("Advanced search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams(createDefaultSearchParams());
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const LoadingSkeleton = () => <AnimeGridSkeleton count={12} showDetails />;

  return (
    <div className="at-bg-surface rounded-xl at-shadow-lg at-transition">
      {/* Header */}
      <div className="p-6 at-border-b">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3" className="font-bold">
            🔍 Advanced Search
          </Typography>
          <Typography
            variant="bodySmall"
            color="muted"
            className="flex items-center space-x-2"
          >
            <span>🌐</span>
            <span>Powered by MyAnimeList</span>
          </Typography>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          {/* Query Input */}
          <div>
            <Typography variant="label" className="block mb-2">
              Search Query
            </Typography>
            <input
              type="text"
              value={searchParams.query}
              onChange={(e) =>
                setSearchParams((prev) => ({ ...prev, query: e.target.value }))
              }
              placeholder="Enter anime title, character, or keyword..."
              className="w-full at-bg-surface at-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:at-border-focus at-transition-colors at-text-primary"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <Typography variant="label" className="block mb-2">
                Type
              </Typography>
              <select
                value={searchParams.type}
                onChange={(e) =>
                  setSearchParams((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full at-bg-surface at-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:at-border-focus at-transition-colors at-text-primary"
              >
                {ANIME_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <Typography variant="label" className="block mb-2">
                Status
              </Typography>
              <select
                value={searchParams.status}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full at-bg-surface at-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:at-border-focus at-transition-colors at-text-primary"
              >
                {ANIME_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <Typography variant="label" className="block mb-2">
                Rating
              </Typography>
              <select
                value={searchParams.rating}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    rating: e.target.value,
                  }))
                }
                className="w-full at-bg-surface at-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:at-border-focus at-transition-colors at-text-primary"
              >
                {ANIME_RATINGS.map((rating) => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <Typography variant="label" className="block mb-2">
                Genre
              </Typography>
              <select
                value={searchParams.genre}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    genre: e.target.value,
                  }))
                }
                className="w-full at-bg-surface at-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:at-border-focus at-transition-colors at-text-primary"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.mal_id} value={genre.mal_id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Range */}
            <div>
              <Typography variant="label" className="block mb-2">
                Min Score: {searchParams.minScore}
              </Typography>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={searchParams.minScore}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    minScore: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            <div>
              <Typography variant="label" className="block mb-2">
                Max Score: {searchParams.maxScore}
              </Typography>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={searchParams.maxScore}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    maxScore: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleSearch}
              disabled={loading}
              variant="primary"
              size="md"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Spinner variant="default" size="xs" className="mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  Search Anime
                </>
              )}
            </Button>

            <Button onClick={handleReset} variant="ghost" size="md">
              <span className="mr-2">🔄</span>
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
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
        ) : hasSearched ? (
          results.length > 0 ? (
            <>
              <ExpandableGrid
                anime={results}
                title={createSearchSummary(
                  results.length,
                  searchParams.query,
                  searchParams,
                )}
                maxCards={20}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤷‍♂️</div>
              <Typography variant="h3" weight="semibold" className="mb-2">
                No Results Found
              </Typography>
              <Typography variant="body" color="muted">
                Try adjusting your search criteria or removing some filters.
              </Typography>
            </div>
          )
        ) : (
          <div className="text-center py-12"></div>
        )}
      </div>
    </div>
  );
};

