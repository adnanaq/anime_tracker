import { useState } from "react";
import { AnimeBase } from "../../types/anime";
import { malService } from "../../services/mal";
import { ExpandableGrid } from "../ExpandableGrid";
import { Typography, Button, Spinner } from "../ui";

export const RandomAnime = () => {
  const [randomAnime, setRandomAnime] = useState<AnimeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomAnime = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch multiple random anime for better discovery
      const animePromises = Array.from({ length: 6 }, () =>
        malService.getRandomAnime(),
      );
      const animeResults = await Promise.all(animePromises);
      setRandomAnime(animeResults.filter((anime) => anime !== null));
    } catch (err) {
      setError("Failed to fetch random anime. Please try again.");
      console.error("Random anime fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="at-bg-surface rounded-xl at-shadow-lg p-6 at-transition">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h2">🎲 Surprise Me!</Typography>
        <Button
          onClick={fetchRandomAnime}
          disabled={loading}
          variant="primary"
          size="md"
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Spinner variant="default" size="xs" className="mr-2" />
              Finding...
            </>
          ) : (
            <>
              <span className="mr-2">🔄</span>
              Get Random Anime
            </>
          )}
        </Button>
      </div>

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

      {randomAnime.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <Typography variant="h3" weight="semibold" className="mb-2">
            Discover Something New
          </Typography>
          <Typography variant="body" color="muted" className="mb-6">
            Click the button above to discover a random anime recommendation
            from Jikan's vast database.
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-center space-x-2">
              <span>🎪</span>
              <Typography variant="bodySmall" color="muted">
                All genres included
              </Typography>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>📚</span>
              <Typography variant="bodySmall" color="muted">
                Classic & modern anime
              </Typography>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>⭐</span>
              <Typography variant="bodySmall" color="muted">
                Quality recommendations
              </Typography>
            </div>
          </div>
        </div>
      )}

      {randomAnime.length > 0 && (
        <div className="space-y-4">
          <ExpandableGrid
            anime={randomAnime}
            title="🎲 Random Discoveries"
            maxCards={6}
          />

          <div className="text-center pt-4">
            <Typography variant="bodySmall" color="muted" className="mb-4">
              Not your style? Try another random pick!
            </Typography>
            <Button
              onClick={fetchRandomAnime}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              <span className="mr-2">🔄</span>
              Try Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

