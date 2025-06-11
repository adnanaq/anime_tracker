import { useEffect, useCallback, memo } from 'react'
import { useAnimeStore } from '../../store/animeStore'
import { AnimeCard } from '../AnimeCard/AnimeCard'
import { SourceToggle } from '../SourceToggle'
import { ThemeToggle } from '../ThemeToggle'
import { SearchBar } from '../SearchBar'
import { AuthButton } from '../AuthButton'
import { Hero, HeroSkeleton } from '../Hero'
import { AnimeSchedule } from '../AnimeSchedule'
import { AdvancedSearch } from '../AdvancedSearch'
import { RandomAnime } from '../RandomAnime'
import { SeasonalAnime } from '../SeasonalAnime'
import { ApolloTest } from '../ApolloTest'
import { CacheStats } from '../CacheManager/CacheStats'

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
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 transition-theme tracking-tight">
        {title}
      </h2>
      {isLoading ? (
        <LoadingGrid />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {anime.map((item) => (
            <AnimeCard key={`${item.source}-${item.id}`} anime={item} />
          ))}
        </div>
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
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 aspect-[3/4] rounded-xl shadow-lg animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3 bg-white/30 rounded-full"></div>
                <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
                <div className="h-2 bg-white/20 rounded-full w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }, [])


  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm transition-theme">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 transition-theme animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent transition-theme">
              AnimeTrackr
            </h1>
            <div className="flex items-center space-x-4">
              <SearchBar />
              <SourceToggle />
              <ThemeToggle />
              <AuthButton source={currentSource} />
            </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
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
            {currentlyWatching.length > 0 && (
              <AnimeSection
                title="Currently Watching"
                anime={currentlyWatching}
                isLoading={false}
                LoadingGrid={LoadingGrid}
              />
            )}

            <AnimeSection
              title="Trending Now"
              anime={trendingAnime}
              isLoading={loading.trending}
              LoadingGrid={LoadingGrid}
            />

            <AnimeSection
              title="Most Popular"
              anime={popularAnime}
              isLoading={loading.popular}
              LoadingGrid={LoadingGrid}
            />

            <AnimeSection
              title="Top Rated"
              anime={topRatedAnime}
              isLoading={loading.topRated}
              LoadingGrid={LoadingGrid}
            />

            <AnimeSection
              title="Current Season"
              anime={currentSeasonAnime}
              isLoading={loading.currentSeason}
              LoadingGrid={LoadingGrid}
            />

            {/* Apollo Client Test - Temporary */}
            <section className="mb-12">
              <ApolloTest />
            </section>

            {/* Cache Statistics - Temporary */}
            <section className="mb-12">
              <CacheStats />
            </section>

            {/* MAL-specific enhanced features */}
            {currentSource === 'mal' && (
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
              <div className="text-gray-400 text-lg">
                No anime data available. Please try switching sources or check your connection.
              </div>
            </div>
          )}
      </main>
    </div>
  )
}

export { Dashboard }