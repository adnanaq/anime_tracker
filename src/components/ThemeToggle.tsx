import { useTheme } from '../context/ThemeContext'

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative inline-flex flex-col items-center w-6 h-10 bg-gray-300 dark:bg-gray-600 rounded-full p-0.5 at-transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div
        className={`relative w-5 h-5 rounded-full shadow-md at-transition flex items-center justify-center ${
          isDark ? 'translate-y-4 bg-gray-800' : 'translate-y-0 bg-yellow-400'
        }`}
      >
        {/* Sun icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isDark ? 'opacity-0 scale-50 rotate-180' : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full relative">
            {/* Sun rays */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-1 bg-orange-500 rounded-full"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-4px)`,
                  transformOrigin: 'center 4px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Moon icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-180'
          }`}
        >
          <div className="w-3 h-3 bg-gray-200 rounded-full relative overflow-hidden">
            <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-gray-700 rounded-full transform -translate-x-0.5 -translate-y-0.5" />
          </div>
        </div>
      </div>
    </button>
  )
}