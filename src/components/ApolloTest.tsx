import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_TRENDING_ANIME_QUERY } from '../lib/graphql/queries'

interface TrendingAnimeData {
  Page: {
    pageInfo: {
      currentPage: number
      hasNextPage: boolean
      total: number
      perPage: number
    }
    media: Array<{
      id: number
      title: {
        romaji: string
        english?: string
        native: string
      }
      description?: string
      coverImage: {
        large: string
        medium: string
      }
      averageScore?: number
      episodes?: number
      status: string
      genres: string[]
      season?: string
      seasonYear?: number
      format: string
    }>
  }
}

export const ApolloTest: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<TrendingAnimeData>(
    GET_TRENDING_ANIME_QUERY,
    {
      variables: {
        page: 1,
        perPage: 6
      },
      fetchPolicy: 'cache-first', // Test caching
      notifyOnNetworkStatusChange: true
    }
  )


  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          🧪 Apollo Client Test - Loading...
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 dark:bg-gray-600 rounded-lg h-64 mb-2"></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-4 mb-1"></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-3 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">
          ❌ Apollo Client Test - Error
        </h3>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <pre className="text-red-700 dark:text-red-300 text-sm overflow-auto">
            {error.message}
          </pre>
        </div>
        <button
          onClick={() => refetch()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          🤔 Apollo Client Test - No Data
        </h3>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
          ✅ Apollo Client Test - Success!
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Cache: {loading ? 'Loading' : 'Hit'}
          </span>
          <button
            onClick={() => refetch()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Refetch
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Found {data.Page.media.length} trending anime (Page {data.Page.pageInfo.currentPage} of {Math.ceil(data.Page.pageInfo.total / data.Page.pageInfo.perPage)})
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.Page.media.map((anime) => (
          <div
            key={anime.id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={anime.coverImage.medium}
              alt={anime.title.english || anime.title.romaji}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm line-clamp-2 mb-1">
                {anime.title.english || anime.title.romaji}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{anime.format}</span>
                {anime.averageScore && (
                  <span className="text-green-600 dark:text-green-400">
                    {anime.averageScore}%
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {anime.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApolloTest