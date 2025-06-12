import { useAnimeStore } from '../store/animeStore'

export const SourceToggle = () => {
  const { currentSource, setSource } = useAnimeStore()

  const handleToggle = () => {
    setSource(currentSource === 'mal' ? 'anilist' : 'mal')
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm font-medium at-transition-colors ${
        currentSource === 'mal' ? 'text-blue-600 dark:text-blue-400' : 'at-text-muted'
      }`}>
        MAL
      </span>
      
      <button
        onClick={handleToggle}
        role="switch"
        aria-checked={currentSource === 'anilist'}
        aria-label="Toggle between MyAnimeList and AniList"
        className="relative inline-flex items-center w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full p-0.5 at-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md at-transition ${
            currentSource === 'anilist' ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      
      <span className={`text-sm font-medium at-transition-colors ${
        currentSource === 'anilist' ? 'text-purple-600 dark:text-purple-400' : 'at-text-muted'
      }`}>
        AniList
      </span>
    </div>
  )
}