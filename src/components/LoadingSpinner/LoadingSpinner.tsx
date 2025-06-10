interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Main spinner */}
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        />
        
        {/* Inner particles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      </div>

      {/* Loading message */}
      {message && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}