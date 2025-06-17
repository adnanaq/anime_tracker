import React, { useEffect, useCallback, memo } from "react";
import { useAnimeStore } from "../../store/animeStore";
import { shallow } from "zustand/shallow";
import { SourceToggle } from "../SourceToggle";
import { ThemeToggle } from "../ThemeToggle";
import { SearchBar } from "../SearchBar";
import { AuthButton } from "../AuthButton";
import { Hero, HeroSkeleton } from "../Hero";
import { AnimeSchedule } from "../AnimeSchedule";
import { AdvancedSearch } from "../AdvancedSearch";
import { RandomAnime } from "../RandomAnime";
import { SeasonalAnime } from "../SeasonalAnime";
import { CacheStats } from "../CacheManager/CacheStats";
import { CacheTest } from "../CacheTest";
import { ExpandingAnimeCards } from "../ExpandingAnimeCards";
import { ExpandableGrid } from "../ExpandableGrid";
import { BaseAnimeCardSection } from "../BaseAnimeCardSection";
import { Typography, AnimeGridSkeleton } from "../ui";
import type { AnimeBase } from "../../types/anime";

interface AnimeSectionProps {
  title: string;
  anime: AnimeBase[];
  isLoading: boolean;
  LoadingGrid: () => JSX.Element;
}

const AnimeSection = memo(
  ({ title, anime, isLoading, LoadingGrid }: AnimeSectionProps) => {
    return (
      <section className="mb-12">
        {isLoading ? (
          <>
            <Typography variant="h2" className="mb-6 tracking-tight">
              {title}
            </Typography>
            <LoadingGrid />
          </>
        ) : (
          <ExpandableGrid anime={anime} title={title} maxCards={10} />
        )}
      </section>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.anime === nextProps.anime
    );
  }
);


const Dashboard = () => {
  // Optimized selector 1: Core state data with shallow comparison
  const { currentSource, loading } = useAnimeStore(
    (state) => ({
      currentSource: state.currentSource,
      loading: state.loading,
    }),
    shallow
  );

  // Optimized selector 2: All anime data with shallow comparison
  const {
    trendingAnime,
    popularAnime,
    topRatedAnime,
    currentSeasonAnime,
    searchResults,
    currentlyWatching,
  } = useAnimeStore(
    (state) => ({
      trendingAnime: state.trendingAnime,
      popularAnime: state.popularAnime,
      topRatedAnime: state.topRatedAnime,
      currentSeasonAnime: state.currentSeasonAnime,
      searchResults: state.searchResults,
      currentlyWatching: state.currentlyWatching,
    }),
    shallow
  );

  // Optimized selector 3: Action functions with shallow comparison
  const {
    fetchTrendingAnime,
    fetchPopularAnime,
    fetchTopRatedAnime,
    fetchCurrentSeasonAnime,
    fetchUserScores,
    fetchUserStatus,
    fetchCurrentlyWatching,
    updateAnimeStatus,
  } = useAnimeStore(
    (state) => ({
      fetchTrendingAnime: state.fetchTrendingAnime,
      fetchPopularAnime: state.fetchPopularAnime,
      fetchTopRatedAnime: state.fetchTopRatedAnime,
      fetchCurrentSeasonAnime: state.fetchCurrentSeasonAnime,
      fetchUserScores: state.fetchUserScores,
      fetchUserStatus: state.fetchUserStatus,
      fetchCurrentlyWatching: state.fetchCurrentlyWatching,
      updateAnimeStatus: state.updateAnimeStatus,
    }),
    shallow
  );

  useEffect(() => {
    const fetchData = async () => {
      if (currentSource === "anilist") {
        await Promise.all([
          fetchUserScores(),
          fetchUserStatus(),
          fetchCurrentlyWatching(),
        ]);
      } else {
        await fetchCurrentlyWatching();
      }
      await Promise.all([
        fetchTrendingAnime(),
        fetchPopularAnime(),
        fetchTopRatedAnime(),
        fetchCurrentSeasonAnime(),
      ]);
    };

    fetchData();
  }, [currentSource]);

  const LoadingGrid = useCallback(() => {
    return <AnimeGridSkeleton count={10} />;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm transition-theme">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 transition-theme at-animate-fade-in">
        <div className="mx-auto px-5">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-shrink-0">
              <Typography
                variant="h3"
                className="at-typography-gradient font-bold"
              >
                AnimeTracker
              </Typography>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0 h-full">
              <div className="hidden md:flex items-center h-full">
                <SearchBar />
              </div>
              <div className="flex items-center h-full">
                <SourceToggle />
              </div>
              <div className="flex items-center h-full">
                <AuthButton source={currentSource} />
              </div>
              <div className="flex items-center h-full ml-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        </div>
      </header>

      {searchResults.length === 0 &&
        (loading.trending ? (
          <HeroSkeleton />
        ) : trendingAnime.length > 0 ? (
          <Hero anime={trendingAnime} />
        ) : null)}

      <main className="mx-auto px-5 py-8 at-animate-slide-up">
        {searchResults.length > 0 && (
          <AnimeSection
            title="Search Results"
            anime={searchResults}
            isLoading={loading.search}
            LoadingGrid={LoadingGrid}
          />
        )}

        {searchResults.length === 0 && (
          <>
            {/* Featured Expanding Cards Section */}
            {trendingAnime.length > 0 && (
              <section className="mb-12">
                <ExpandingAnimeCards
                  anime={trendingAnime}
                  title="✨ Featured Trending Anime"
                  variant="horizontal"
                  maxCards={6}
                />
              </section>
            )}

            {currentlyWatching.length > 0 && (
              <section className="mb-12">
                <Typography variant="h2" className="mb-6 tracking-tight">
                  📺 Continue Watching
                </Typography>
                <BaseAnimeCardSection
                  anime={currentlyWatching.slice(0, 12)}
                  currentSource={currentSource}
                  updateAnimeStatus={updateAnimeStatus}
                  groupName="currently-watching-basecard"
                />
              </section>
            )}

            <section className="mb-12">
              <Typography variant="h2" className="mb-6 tracking-tight">
                Trending Now
              </Typography>
              {loading.trending ? (
                <AnimeGridSkeleton count={10} />
              ) : (
                <BaseAnimeCardSection
                  anime={trendingAnime.slice(0, 12)}
                  currentSource={currentSource}
                  updateAnimeStatus={updateAnimeStatus}
                  groupName="trending-basecard"
                />
              )}
            </section>

            <section className="mb-12">
              <Typography variant="h2" className="mb-6 tracking-tight">
                Top Rated
              </Typography>
              {loading.topRated ? (
                <AnimeGridSkeleton count={10} />
              ) : (
                <BaseAnimeCardSection
                  anime={topRatedAnime.slice(0, 12)}
                  currentSource={currentSource}
                  updateAnimeStatus={updateAnimeStatus}
                  groupName="top-rated-basecard"
                />
              )}
            </section>

            <section className="mb-12">
              <Typography variant="h2" className="mb-6 tracking-tight">
                Most Popular
              </Typography>
              {loading.popular ? (
                <AnimeGridSkeleton count={10} />
              ) : (
                <BaseAnimeCardSection
                  anime={popularAnime.slice(0, 12)}
                  currentSource={currentSource}
                  updateAnimeStatus={updateAnimeStatus}
                  groupName="popular-basecard"
                />
              )}
            </section>

            <section className="mb-12">
              <Typography variant="h2" className="mb-6 tracking-tight">
                Current Season
              </Typography>
              {loading.currentSeason ? (
                <AnimeGridSkeleton count={10} />
              ) : (
                <BaseAnimeCardSection
                  anime={currentSeasonAnime.slice(0, 12)}
                  currentSource={currentSource}
                  updateAnimeStatus={updateAnimeStatus}
                  groupName="current-season-basecard"
                />
              )}
            </section>

            {/* MAL-specific enhanced features */}
            {currentSource === "mal" && (
              <>
                <section className="mb-12">
                  <AdvancedSearch />
                </section>

                <section className="mb-12">
                  <SeasonalAnime />
                </section>

                <section className="mb-12">
                  <AnimeSchedule />
                </section>

                <section className="mb-12">
                  <RandomAnime />
                </section>

                {/* Developer Tools - Cache Management */}
                <section className="mb-12">
                  <CacheStats />
                </section>

                <section className="mb-12">
                  <CacheTest />
                </section>
              </>
            )}
          </>
        )}

        {!loading.trending &&
          !loading.popular &&
          !loading.topRated &&
          !loading.currentSeason &&
          trendingAnime.length === 0 &&
          popularAnime.length === 0 &&
          topRatedAnime.length === 0 &&
          currentSeasonAnime.length === 0 &&
          currentlyWatching.length === 0 && (
            <div className="text-center py-12">
              <Typography variant="bodyLarge" color="muted">
                No anime data available. Please try switching sources or check
                your connection.
              </Typography>
            </div>
          )}
      </main>
    </div>
  );
};

export { Dashboard };
