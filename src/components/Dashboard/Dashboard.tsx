import { useEffect, useCallback, memo } from 'react'
import { useAnimeStore } from '../../store/animeStore'
import { SourceToggle } from '../SourceToggle'
import { ThemeToggle } from '../ThemeToggle'
import { SearchBar } from '../SearchBar'
import { AuthButton } from '../AuthButton'
import { Hero, HeroSkeleton } from '../Hero'
import { AnimeSchedule } from '../AnimeSchedule'
import { AdvancedSearch } from '../AdvancedSearch'
import { RandomAnime } from '../RandomAnime'
import { SeasonalAnime } from '../SeasonalAnime'
import { CacheStats } from '../CacheManager/CacheStats'
import { CacheTest } from '../CacheTest'
import { ExpandingAnimeCards } from '../ExpandingAnimeCards'
import { ExpandableGrid } from '../ExpandableGrid'
import { Typography, AnimeGridSkeleton } from '../ui'

const AnimeSection = memo(({
  title,
  anime,
  isLoading,
  LoadingGrid,
}: {
  title: string
  anime: any[]
  isLoading: boolean
  LoadingGrid: () => JSX.Element
}) => {
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
  )
}, (prevProps, nextProps) => {
  return prevProps.title === nextProps.title &&
         prevProps.isLoading === nextProps.isLoading &&
         prevProps.anime === nextProps.anime
})

const Dashboard = () => {
  const currentSource = useAnimeStore(state => state.currentSource)
  const trendingAnime = useAnimeStore(state => state.trendingAnime)
  const popularAnime = useAnimeStore(state => state.popularAnime)
  const topRatedAnime = useAnimeStore(state => state.topRatedAnime)
  const currentSeasonAnime = useAnimeStore(state => state.currentSeasonAnime)
  const searchResults = useAnimeStore(state => state.searchResults)
  const currentlyWatching = useAnimeStore(state => state.currentlyWatching)
  const loading = useAnimeStore(state => state.loading)
  const fetchTrendingAnime = useAnimeStore(state => state.fetchTrendingAnime)
  const fetchPopularAnime = useAnimeStore(state => state.fetchPopularAnime)
  const fetchTopRatedAnime = useAnimeStore(state => state.fetchTopRatedAnime)
  const fetchCurrentSeasonAnime = useAnimeStore(state => state.fetchCurrentSeasonAnime)
  const fetchUserScores = useAnimeStore(state => state.fetchUserScores)
  const fetchUserStatus = useAnimeStore(state => state.fetchUserStatus)
  const fetchCurrentlyWatching = useAnimeStore(state => state.fetchCurrentlyWatching)

  useEffect(() => {
    const fetchData = async () => {
      if (currentSource === 'anilist') {
        await Promise.all([
          fetchUserScores(),
          fetchUserStatus(),
          fetchCurrentlyWatching()
        ])
      } else {
        await fetchCurrentlyWatching()
      }
      await Promise.all([
        fetchTrendingAnime(),
        fetchPopularAnime(),
        fetchTopRatedAnime(),
        fetchCurrentSeasonAnime()
      ])
    }
    
    fetchData()
  }, [currentSource])


  const LoadingGrid = useCallback(() => {
    return <AnimeGridSkeleton count={10} />
  }, [])


  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm transition-theme">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 transition-theme animate-fade-in">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-shrink-0">
              <Typography variant="h3" className="at-typography-gradient font-bold">
                AnimeTrackr
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

      {searchResults.length === 0 && (
        loading.trending ? (
          <HeroSkeleton />
        ) : trendingAnime.length > 0 ? (
          <Hero anime={trendingAnime} />
        ) : null
      )}

      <main className="max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4 py-8 animate-slide-up">
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
              <>
                <section className="mb-12">
                  <ExpandingAnimeCards
                    anime={currentlyWatching}
                    title="📺 Continue Watching"
                    variant="vertical"
                    maxCards={5}
                  />
                </section>
                
                <section className="mb-12">
                  <ExpandableGrid
                    anime={currentlyWatching}
                    title="Currently Watching (Grid View)"
                    maxCards={12}
                    useClickMode={true}
                  />
                </section>
              </>
            )}

            <section className="mb-12">
              {loading.trending ? (
                <>
                  <Typography variant="h2" className="mb-6 tracking-tight">
                    Trending Now
                  </Typography>
                  <AnimeGridSkeleton count={10} />
                </>
              ) : (
                <ExpandableGrid 
                  anime={trendingAnime} 
                  title="Trending Now" 
                  maxCards={12} 
                  useClickMode={true}
                />
              )}
            </section>

            <section className="mb-12">
              {loading.popular ? (
                <>
                  <Typography variant="h2" className="mb-6 tracking-tight">
                    Most Popular
                  </Typography>
                  <AnimeGridSkeleton count={10} />
                </>
              ) : (
                <ExpandableGrid 
                  anime={popularAnime} 
                  title="Most Popular" 
                  maxCards={12} 
                  useClickMode={true}
                />
              )}
            </section>

            <section className="mb-12">
              <ExpandingAnimeCards
                anime={topRatedAnime}
                title="🏆 Top Rated - Interactive Grid"
                variant="grid"
                maxCards={8}
              />
            </section>

            {/* Expandable Grid Test Section */}
            {trendingAnime.length > 0 && (
              <section className="mb-12">
                <ExpandableGrid
                  anime={trendingAnime}
                  title="🔥 Expandable Grid Test"
                  maxCards={12}
                  useClickMode={true}
                />
              </section>
            )}

            <section className="mb-12">
              {loading.topRated ? (
                <>
                  <Typography variant="h2" className="mb-6 tracking-tight">
                    Top Rated
                  </Typography>
                  <AnimeGridSkeleton count={10} />
                </>
              ) : (
                <ExpandableGrid 
                  anime={topRatedAnime} 
                  title="Top Rated" 
                  maxCards={12} 
                  useClickMode={true}
                />
              )}
            </section>

            <section className="mb-12">
              {loading.currentSeason ? (
                <>
                  <Typography variant="h2" className="mb-6 tracking-tight">
                    Current Season
                  </Typography>
                  <AnimeGridSkeleton count={10} />
                </>
              ) : (
                <ExpandableGrid 
                  anime={currentSeasonAnime} 
                  title="Current Season" 
                  maxCards={12} 
                  useClickMode={true}
                />
              )}
            </section>


            {/* MAL-specific enhanced features */}
            {currentSource === 'mal' && (
              <>
                <section className="mb-12">
                  <CacheStats />
                </section>
                
                <section className="mb-12">
                  <CacheTest />
                </section>
                
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
                No anime data available. Please try switching sources or check your connection.
              </Typography>
            </div>
          )}
      </main>
    </div>
  )
}

export { Dashboard }