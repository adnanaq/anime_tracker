import { motion } from 'framer-motion'
import { AnimeBase } from '../../types/anime'

interface HoverCardProps {
  anime: AnimeBase
}

export const HoverCard = ({ anime }: HoverCardProps) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
    >
      <div className="flex space-x-3">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {anime.image ? (
            <img
              src={anime.image}
              alt={anime.title}
              className="w-16 h-20 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {anime.title}
          </h3>
          
          <div className="space-y-1 text-xs text-gray-600">
            {anime.score && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Score:</span>
                <span className="text-blue-600 font-semibold">{anime.score.toFixed(1)}</span>
              </div>
            )}
            
            {anime.episodes && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Episodes:</span>
                <span>{anime.episodes}</span>
              </div>
            )}
            
            {anime.status && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{anime.status.toLowerCase()}</span>
              </div>
            )}
            
            {anime.year && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">Year:</span>
                <span>{anime.year}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {anime.genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {genre}
                  </span>
                ))}
                {anime.genres.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{anime.genres.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {anime.synopsis && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                {truncateText(anime.synopsis, 120)}
              </p>
            </div>
          )}

          {/* Source indicator */}
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-400 uppercase font-medium">
              {anime.source}
            </span>
            <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}