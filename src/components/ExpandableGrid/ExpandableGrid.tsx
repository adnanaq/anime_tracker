import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AnimeBase } from '../../types/anime'
import { getStatusLabel, getStatusColor, getStatusIcon } from '../../utils/animeStatus'
import { useAnimeAuth } from '../../hooks/useAuth'
import { useAnimeStore } from '../../store/animeStore'
import { animeStatusService } from '../../services/shared/animeStatusService'
import { Button, Typography, Badge } from '../ui'
import './ExpandableGrid.css'

interface ExpandableGridProps {
  anime: AnimeBase[]
  title?: string
  maxCards?: number
}

const ExpandedContent = ({ anime: animeItem, onStatusReset }: { anime: AnimeBase, onStatusReset?: () => void }) => {
  const [showStatusOptions, setShowStatusOptions] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [animationState, setAnimationState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [takeoverReady, setTakeoverReady] = useState(false)
  const { isAuthenticated } = useAnimeAuth(animeItem.source)
  const { updateAnimeStatus } = useAnimeStore()

  // Reset status options when card is collapsed or external reset is triggered
  React.useEffect(() => {
    if (onStatusReset !== undefined) {
      setShowStatusOptions(false)
      setAnimationState('closed')
      setSelectedStatus(null)
      setTakeoverReady(false)
    }
  }, [onStatusReset])

  const toggleStatusOptions = () => {
    if (!showStatusOptions) {
      // Opening
      setShowStatusOptions(true)
      setAnimationState('opening')
      // Trigger opening animation after render
      setTimeout(() => setAnimationState('open'), 10)
    } else {
      // Closing
      setAnimationState('closing')
      
      // If there's a selected status, trigger takeover after others finish
      if (selectedStatus) {
        setTimeout(() => {
          setTakeoverReady(true)
        }, 700) // Wait for other animations to finish (0.35s delay + 0.3s duration)
      }
      
      // Wait for closing animation to complete (including selected takeover)
      setTimeout(() => {
        setShowStatusOptions(false)
        setAnimationState('closed')
        setSelectedStatus(null)
        setTakeoverReady(false)
      }, 1400) // Extended to account for selected option takeover
    }
  }
  
  const getCurrentStatus = () => {
    return animeItem.userStatus || null
  }
  
  const currentStatus = getCurrentStatus()
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const handleStatusChange = async (event: React.MouseEvent, status: string) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (isUpdating) return
    
    setIsUpdating(true)
    setSelectedStatus(status) // Mark this status as selected for animation
    
    try {
      await animeStatusService.updateAnimeStatus(animeItem.id, animeItem.source, { status })
      updateAnimeStatus(animeItem.id, animeItem.source, status)
      
      // Wait a moment for the selection to be visually registered, then start closing
      setTimeout(() => {
        toggleStatusOptions()
      }, 100)
    } catch (error) {
      console.error('Failed to update anime status:', error)
      toggleStatusOptions()
    } finally {
      setIsUpdating(false)
      // Clear selected status after animation completes
      setTimeout(() => setSelectedStatus(null), 1500)
    }
  }

  const handleRemoveFromList = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (isUpdating) return
    
    setIsUpdating(true)
    
    try {
      await animeStatusService.removeAnimeFromList(animeItem.id, animeItem.source)
      updateAnimeStatus(animeItem.id, animeItem.source, '')
      toggleStatusOptions()
    } catch (error) {
      console.error('Failed to remove anime from list:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="expanded-content">
      <div className="expanded-content-inner">
        {/* Top Content Area - with bottom padding for fixed buttons */}
        <div className="pb-28 overflow-hidden">
          <div className="mb-4">
            <Typography variant="h4" color="inverse" className="mb-2 line-clamp-2">
              {animeItem.title}
            </Typography>
            
            {/* Status and Format Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {animeItem.status && (
                <Badge
                  variant={
                    animeItem.status.toLowerCase().includes('airing') || animeItem.status === 'RELEASING' 
                      ? 'success' 
                      : animeItem.status.toLowerCase().includes('completed') || animeItem.status === 'FINISHED'
                      ? 'info'
                      : animeItem.status.toLowerCase().includes('upcoming') || animeItem.status === 'NOT_YET_RELEASED'
                      ? 'warning'
                      : 'neutral'
                  }
                  shape="pill"
                  size="sm"
                  icon={
                    animeItem.status.toLowerCase().includes('airing') || animeItem.status === 'RELEASING' ? '🔴' :
                    animeItem.status.toLowerCase().includes('completed') || animeItem.status === 'FINISHED' ? '✅' :
                    animeItem.status.toLowerCase().includes('upcoming') || animeItem.status === 'NOT_YET_RELEASED' ? '⏳' : '📺'
                  }
                >
                  {animeItem.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
              
              {animeItem.format && (
                <Badge
                  variant={
                    animeItem.format === 'TV' ? 'secondary' :
                    animeItem.format === 'MOVIE' ? 'danger' :
                    animeItem.format === 'OVA' || animeItem.format === 'ONA' ? 'primary' :
                    animeItem.format === 'SPECIAL' ? 'warning' :
                    'neutral'
                  }
                  shape="rounded"
                  size="sm"
                  icon={
                    animeItem.format === 'TV' ? '📺' :
                    animeItem.format === 'MOVIE' ? '🎬' :
                    animeItem.format === 'OVA' || animeItem.format === 'ONA' ? '💿' :
                    animeItem.format === 'SPECIAL' ? '⭐' : '📼'
                  }
                >
                  {animeItem.format}
                </Badge>
              )}
            </div>
          </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2 text-sm text-white/90">
            {animeItem.score && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Score:</span>
                <span className="text-yellow-400 font-semibold">⭐ {animeItem.score.toFixed(1)}</span>
              </div>
            )}
            
            {animeItem.episodes && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Episodes:</span>
                <span>{animeItem.episodes}</span>
              </div>
            )}
            
            {animeItem.year && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Year:</span>
                <span>{animeItem.year}</span>
              </div>
            )}

            {animeItem.season && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Season:</span>
                <span className="capitalize">{animeItem.season.toLowerCase()}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {animeItem.genres && animeItem.genres.length > 0 && (
              <div>
                <Typography variant="caption" color="tertiary" className="mb-2 font-medium">
                  Genres:
                </Typography>
                <div className="flex flex-wrap gap-1">
                  {animeItem.genres.slice(0, 4).map((genre, index) => (
                    <Badge
                      key={index}
                      variant="primary"
                      size="xs"
                      shape="rounded"
                    >
                      {genre}
                    </Badge>
                  ))}
                  {animeItem.genres.length > 4 && (
                    <Typography variant="caption" color="tertiary">
                      +{animeItem.genres.length - 4} more
                    </Typography>
                  )}
                </div>
              </div>
            )}

            {animeItem.duration && (
              <div>
                <div className="text-xs text-white/70 mb-1 font-medium">Duration:</div>
                <div className="text-sm text-white/90">{animeItem.duration} min/episode</div>
              </div>
            )}

            {animeItem.studios && animeItem.studios.length > 0 && (
              <div>
                <div className="text-xs text-white/70 mb-1 font-medium">Studio:</div>
                <div className="text-sm text-white/90">{animeItem.studios.slice(0, 2).join(', ')}</div>
              </div>
            )}

            {animeItem.popularity && (
              <div>
                <div className="text-xs text-white/70 mb-1 font-medium">Popularity:</div>
                <div className="text-sm text-white/90">#{animeItem.popularity}</div>
              </div>
            )}
          </div>
        </div>

          {animeItem.synopsis && (
            <div className="mb-4">
              <div className={`scrolling-synopsis ${animeItem.synopsis.length > 150 ? 'long-text' : 'short-text'}`}>
                <p className="text-sm text-white/80 leading-relaxed">
                  {animeItem.synopsis.length > 150 ? animeItem.synopsis : truncateText(animeItem.synopsis, 200)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Button Area - Fixed Position */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
          {isAuthenticated && (
            <div className="status-options-container">
              {/* Status Options - Ripple Effect from Button */}
              {showStatusOptions && (
                <div className="status-dropdown-overlay">
                  <div className={`status-options-list ${
                    animationState === 'open' ? 'status-options-animate' : 
                    animationState === 'closing' ? 'status-options-closing' : ''
                  }`}>
                    {/* Only show status options that aren't currently selected */}
                    
                    {/* Watching */}
                    {currentStatus !== (animeItem.source === 'mal' ? 'watching' : 'CURRENT') && (
                      <div className={`status-option-item ${selectedStatus === (animeItem.source === 'mal' ? 'watching' : 'CURRENT') ? 'selected-option' : ''} ${selectedStatus === (animeItem.source === 'mal' ? 'watching' : 'CURRENT') && takeoverReady ? 'takeover-ready' : ''}`}>
                        <Button
                          variant="primary"
                          size="xs"
                          fullWidth
                          onClick={(e) => handleStatusChange(e, animeItem.source === 'mal' ? 'watching' : 'CURRENT')}
                          disabled={isUpdating}
                          leftIcon={getStatusIcon('watching')}
                          className="!bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          Watching
                        </Button>
                      </div>
                    )}
                    
                    {/* Completed */}
                    {currentStatus !== (animeItem.source === 'mal' ? 'completed' : 'COMPLETED') && (
                      <div className={`status-option-item ${selectedStatus === (animeItem.source === 'mal' ? 'completed' : 'COMPLETED') ? 'selected-option' : ''} ${selectedStatus === (animeItem.source === 'mal' ? 'completed' : 'COMPLETED') && takeoverReady ? 'takeover-ready' : ''}`}>
                        <Button
                          variant="success"
                          size="xs"
                          fullWidth
                          onClick={(e) => handleStatusChange(e, animeItem.source === 'mal' ? 'completed' : 'COMPLETED')}
                          disabled={isUpdating}
                          leftIcon={getStatusIcon('completed')}
                        >
                          Completed
                        </Button>
                      </div>
                    )}
                    
                    {/* Plan to Watch */}
                    {currentStatus !== (animeItem.source === 'mal' ? 'plan_to_watch' : 'PLANNING') && (
                      <div className={`status-option-item ${selectedStatus === (animeItem.source === 'mal' ? 'plan_to_watch' : 'PLANNING') ? 'selected-option' : ''} ${selectedStatus === (animeItem.source === 'mal' ? 'plan_to_watch' : 'PLANNING') && takeoverReady ? 'takeover-ready' : ''}`}>
                        <Button
                          variant="warning"
                          size="xs"
                          fullWidth
                          onClick={(e) => handleStatusChange(e, animeItem.source === 'mal' ? 'plan_to_watch' : 'PLANNING')}
                          disabled={isUpdating}
                          leftIcon={getStatusIcon('plan_to_watch')}
                        >
                          Plan
                        </Button>
                      </div>
                    )}
                    
                    {/* On Hold */}
                    {currentStatus !== (animeItem.source === 'mal' ? 'on_hold' : 'PAUSED') && (
                      <div className={`status-option-item ${selectedStatus === (animeItem.source === 'mal' ? 'on_hold' : 'PAUSED') ? 'selected-option' : ''} ${selectedStatus === (animeItem.source === 'mal' ? 'on_hold' : 'PAUSED') && takeoverReady ? 'takeover-ready' : ''}`}>
                        <Button
                          variant="info"
                          size="xs"
                          fullWidth
                          onClick={(e) => handleStatusChange(e, animeItem.source === 'mal' ? 'on_hold' : 'PAUSED')}
                          disabled={isUpdating}
                          leftIcon={getStatusIcon('on_hold')}
                          className="!bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                        >
                          Hold
                        </Button>
                      </div>
                    )}
                    
                    {/* Dropped */}
                    {currentStatus !== (animeItem.source === 'mal' ? 'dropped' : 'DROPPED') && (
                      <div className={`status-option-item ${selectedStatus === (animeItem.source === 'mal' ? 'dropped' : 'DROPPED') ? 'selected-option' : ''} ${selectedStatus === (animeItem.source === 'mal' ? 'dropped' : 'DROPPED') && takeoverReady ? 'takeover-ready' : ''}`}>
                        <Button
                          variant="danger"
                          size="xs"
                          fullWidth
                          onClick={(e) => handleStatusChange(e, animeItem.source === 'mal' ? 'dropped' : 'DROPPED')}
                          disabled={isUpdating}
                          leftIcon={getStatusIcon('dropped')}
                        >
                          Drop
                        </Button>
                      </div>
                    )}
                    
                    {/* Remove from List - only if user has a current status */}
                    {currentStatus && (
                      <div className="status-option-item">
                        <Button
                          variant="outline"
                          size="xs"
                          fullWidth
                          onClick={(e) => handleRemoveFromList(e)}
                          disabled={isUpdating}
                          leftIcon="🗑️"
                          className="!border-red-400/30 !text-red-400 hover:!bg-red-600 hover:!text-white !bg-gradient-to-br from-red-900/60 to-red-800/60"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Always Visible Main Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={currentStatus ? "secondary" : "primary"}
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleStatusOptions()
                  }}
                  leftIcon={getStatusIcon(currentStatus || 'add')}
                  rightIcon={
                    <span className={`transition-transform duration-200 ${showStatusOptions ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  }
                  className={`backdrop-blur-sm ${showStatusOptions ? 'ring-2 ring-white/30' : ''}`}
                >
                  {getStatusLabel(currentStatus)}
                </Button>
                <Button
                  as={Link}
                  to={`/anime/${animeItem.source}/${animeItem.id}`}
                  variant="ghost"
                  size="sm"
                  fullWidth
                  leftIcon="📄"
                  className="!bg-gray-600/80 hover:!bg-gray-500/80 !text-white backdrop-blur-sm"
                >
                  Details
                </Button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  as={Link}
                  to={`/anime/${animeItem.source}/${animeItem.id}`}
                  variant="primary"
                  size="sm"
                  fullWidth
                  leftIcon="📄"
                  className="backdrop-blur-sm"
                >
                  View Details
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  fullWidth
                  leftIcon="🔒"
                  className="backdrop-blur-sm"
                >
                  Sign In to Track
                </Button>
              </div>
            </div>
          )}

          {animeItem.userScore && (
            <div className="mt-3 flex justify-end">
              <Badge 
                variant="secondary" 
                size="md" 
                icon="⭐"
                className="backdrop-blur-sm"
              >
                Your Score: {animeItem.userScore}/10
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ExpandableGrid = ({ anime, title, maxCards = 10 }: ExpandableGridProps) => {
  const navigate = useNavigate()
  const displayAnime = anime.slice(0, maxCards)
  const containerRef = useRef<HTMLDivElement>(null)
  const [statusResetTrigger, setStatusResetTrigger] = useState(0)

  const handleCardClick = (animeItem: AnimeBase, event: React.MouseEvent) => {
    // Don't navigate if clicking on expanded content
    if ((event.target as HTMLElement).closest('.expanded-content')) {
      return
    }
    navigate(`/anime/${animeItem.source}/${animeItem.id}`)
  }

  const handleCardHover = (cardIndex: number) => {
    if (containerRef.current) {
      // Check if any card is currently expanded (clicked)
      const expandedRadio = containerRef.current.querySelector('.card-radio:checked') as HTMLInputElement
      if (expandedRadio) {
        const expandedIndex = parseInt(expandedRadio.getAttribute('data-index') || '0')
        // If hovering over a different card than the expanded one, close the expanded card
        if (expandedIndex !== cardIndex) {
          expandedRadio.checked = false
          setStatusResetTrigger(prev => prev + 1) // Reset status options
        }
      }
    }
  }

  // Close expanded cards and reset status options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Reset status options first
        setStatusResetTrigger(prev => prev + 1)
        
        // Then close expanded cards
        const radioButtons = containerRef.current.querySelectorAll('.card-radio:checked')
        radioButtons.forEach((radio) => {
          ;(radio as HTMLInputElement).checked = false
        })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Also reset status options when switching between cards
  const handleCardRadioChange = () => {
    setStatusResetTrigger(prev => prev + 1)
  }

  return (
    <section className="expandable-grid-section">
      {title && (
        <Typography variant="h2" className="mb-6 tracking-tight">
          {title}
        </Typography>
      )}
      <div className="expandable-grid-container" ref={containerRef}>
        {displayAnime.map((animeItem, index) => (
          <div 
            key={`${animeItem.source}-${animeItem.id}`} 
            className="expandable-grid-card"
            onMouseEnter={() => handleCardHover(index)}
          >
            <div 
              className="card-image-container w-full h-full relative cursor-pointer"
              onClick={(e) => handleCardClick(animeItem, e)}
            >
              {animeItem.image ? (
                <img
                  src={animeItem.image}
                  alt={animeItem.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-xl">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
              
              {/* Base gradient overlay with basic info (always visible) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl">
                {/* Score badge - top left */}
                {animeItem.score && (
                  <div className="absolute top-3 left-3 card-score-badge">
                    <Badge 
                      variant="warning" 
                      size="xs" 
                      icon="⭐"
                      className="backdrop-blur-sm"
                    >
                      {animeItem.score.toFixed(1)}
                    </Badge>
                  </div>
                )}
                
                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <Typography variant="h6" color="inverse" className="mb-1 line-clamp-2 text-sm">
                    {animeItem.title}
                  </Typography>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    {animeItem.year && (
                      <span>📅 {animeItem.year}</span>
                    )}
                    {animeItem.episodes && (
                      <span>📺 {animeItem.episodes} eps</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hover overlay for enhanced visibility (non-expanded state) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-xl opacity-0 card-overlay-hover">
              </div>
              
              {/* Expanded content overlay */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60 rounded-xl opacity-0 card-expanded-overlay"
                onClick={(e) => {
                  // Close card if clicking on overlay background (not on content)
                  if (e.target === e.currentTarget) {
                    const radioButton = (e.currentTarget.parentElement?.querySelector('.card-radio') as HTMLInputElement)
                    if (radioButton) {
                      radioButton.checked = false
                      setStatusResetTrigger(prev => prev + 1)
                    }
                  }
                }}
              >
                <div className="w-full h-full px-4 pt-4">
                  <ExpandedContent anime={animeItem} onStatusReset={statusResetTrigger} />
                </div>
              </div>
            </div>
            <input 
              type="radio" 
              name={`expandable-grid-${title?.replace(/\s+/g, '-').toLowerCase()}`}
              className="card-radio"
              data-index={index}
              onChange={handleCardRadioChange}
            />
          </div>
        ))}
      </div>
    </section>
  )
}