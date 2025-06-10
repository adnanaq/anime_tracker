import { useState } from 'react'

interface DraggableScoreSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  isUpdating?: boolean
}

export const DraggableScoreSlider = ({ 
  value, 
  onChange, 
  disabled = false, 
  isUpdating = false 
}: DraggableScoreSliderProps) => {
  const [tempValue, setTempValue] = useState(value)
  const [isDragging, setIsDragging] = useState(false)

  const getScoreColor = (score: number) => {
    if (score === 0) return '#6b7280'
    if (score <= 3) return '#ef4444'
    if (score <= 5) return '#f59e0b'
    if (score <= 7) return '#3b82f6'
    if (score <= 9) return '#10b981'
    return '#8b5cf6'
  }

  const getScoreLabel = (score: number) => {
    if (score === 0) return 'Not Rated'
    if (score <= 3) return 'Poor'
    if (score <= 5) return 'Average'
    if (score <= 7) return 'Good'
    if (score <= 9) return 'Great'
    return 'Masterpiece'
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    setTempValue(newValue)
    setIsDragging(true)
  }

  const handleSliderMouseUp = () => {
    setIsDragging(false)
    
    if (tempValue !== value) {
      onChange(tempValue)
    }
  }

  // Update temp value when external value changes
  if (!isDragging && value !== tempValue) {
    setTempValue(value)
  }

  const currentValue = isDragging ? tempValue : value
  const scoreColor = getScoreColor(currentValue)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          My Score
        </label>
        <div 
          className="flex items-center space-x-2 transition-all duration-300 hover:scale-110"
          style={{ color: scoreColor }}
        >
          <span className="text-2xl font-bold">
            {currentValue}
          </span>
          <span className="text-sm opacity-70">/10</span>
        </div>
      </div>

      {/* Modern Slider */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="10"
          value={currentValue}
          onChange={handleSliderChange}
          onMouseUp={handleSliderMouseUp}
          onTouchEnd={handleSliderMouseUp}
          disabled={disabled || isUpdating}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${scoreColor} 0%, ${scoreColor} ${currentValue * 10}%, #e5e7eb ${currentValue * 10}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Custom slider styling */}
        <style>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: ${scoreColor};
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 2px white;
            transition: all 0.2s ease;
          }
          
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 0 0 3px white;
          }
          
          .slider::-webkit-slider-thumb:active {
            transform: scale(1.2);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25), 0 0 0 4px white;
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: ${scoreColor};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .slider:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .slider:disabled::-webkit-slider-thumb {
            cursor: not-allowed;
          }
        `}</style>
      </div>

      {/* Score Labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>0</span>
        <span>2</span>
        <span>4</span>
        <span>6</span>
        <span>8</span>
        <span>10</span>
      </div>

      {/* Status Display */}
      <div className="text-center">
        <span 
          className="inline-block px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
          style={{
            backgroundColor: `${scoreColor}20`,
            color: scoreColor,
            border: `1px solid ${scoreColor}40`
          }}
        >
          {getScoreLabel(currentValue)}
        </span>
      </div>

      {/* Loading indicator */}
      {isUpdating && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          <span>Updating score...</span>
        </div>
      )}
    </div>
  )
}