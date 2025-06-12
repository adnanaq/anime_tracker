// REFERENCE FILE: Current ExpandableGrid Card Design Implementation
// This preserves the complete card design including hover states, expanded content, 
// animations, and all visual elements for future reference

// Card Structure with all visual elements:
const CardDesignReference = () => {
  return (
    <div className="expandable-grid-card">
      <div className="card-image-container w-full h-full relative cursor-pointer">
        {/* Image */}
        <img
          src="anime-image.jpg"
          alt="Anime Title"
          className="w-full h-full object-cover rounded-xl"
        />
        
        {/* Base gradient overlay with basic info (always visible) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl">
          {/* Score badge - top left */}
          <div className="absolute top-3 left-3 card-score-badge">
            <Badge 
              variant="warning" 
              size="xs" 
              icon="⭐"
              className="backdrop-blur-sm"
            >
              8.5
            </Badge>
          </div>
          
          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <Typography variant="h6" color="inverse" className="mb-1 line-clamp-2 text-sm">
              Anime Title Here
            </Typography>
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span>📅 2024</span>
              <span>📺 24 eps</span>
            </div>
          </div>
        </div>
        
        {/* Hover overlay for enhanced visibility (non-expanded state) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-xl opacity-0 card-overlay-hover">
        </div>
        
        {/* Expanded content overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60 rounded-xl opacity-0 card-expanded-overlay">
          <div className="w-full h-full px-4 pt-4">
            
            {/* EXPANDED CONTENT DESIGN */}
            <div className="expanded-content">
              <div className="expanded-content-inner">
                {/* Top Content Area - with bottom padding for fixed buttons */}
                <div className="pb-28 overflow-hidden">
                  <div className="mb-4">
                    <Typography variant="h4" color="inverse" className="mb-2 line-clamp-2">
                      Full Anime Title Here
                    </Typography>
                    
                    {/* Status and Format Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge
                        variant="success"
                        shape="pill"
                        size="sm"
                        icon="🔴"
                      >
                        Currently Airing
                      </Badge>
                      
                      <Badge
                        variant="secondary"
                        shape="rounded"
                        size="sm"
                        icon="📺"
                      >
                        TV
                      </Badge>
                    </div>
                  </div>
                
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm text-white/90">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Score:</span>
                        <span className="text-yellow-400 font-semibold">⭐ 8.5</span>
                        <span className="text-blue-400 font-semibold ml-2">👤 9/10</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Episodes:</span>
                        <span>24</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Year:</span>
                        <span>2024</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Season:</span>
                        <span className="capitalize">winter</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Typography variant="caption" color="tertiary" className="mb-2 font-medium">
                          Genres:
                        </Typography>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="primary" size="xs" shape="rounded">Action</Badge>
                          <Badge variant="primary" size="xs" shape="rounded">Drama</Badge>
                          <Badge variant="primary" size="xs" shape="rounded">Fantasy</Badge>
                          <Badge variant="primary" size="xs" shape="rounded">Romance</Badge>
                          <Typography variant="caption" color="tertiary">
                            +2 more
                          </Typography>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-white/70 mb-1 font-medium">Duration:</div>
                        <div className="text-sm text-white/90">24 min/episode</div>
                      </div>

                      <div>
                        <div className="text-xs text-white/70 mb-1 font-medium">Studio:</div>
                        <div className="text-sm text-white/90">Studio Name, Another Studio</div>
                      </div>

                      <div>
                        <div className="text-xs text-white/70 mb-1 font-medium">Popularity:</div>
                        <div className="text-sm text-white/90">#123</div>
                      </div>
                    </div>
                  </div>

                  {/* Synopsis with scrolling animation */}
                  <div className="mb-4">
                    <div className="scrolling-synopsis long-text">
                      <p className="text-sm text-white/80 leading-relaxed">
                        This is a long synopsis that will scroll vertically when the card is expanded. 
                        The text demonstrates the scrolling animation feature that allows users to read 
                        longer descriptions within the limited space of the expanded card. The animation 
                        starts after a delay and smoothly scrolls through the entire text content.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Button Area - Fixed Position */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
                  <div className="status-options-container">
                    {/* Status Options Dropdown - Animated */}
                    <div className="status-dropdown-overlay">
                      <div className="status-options-list status-options-animate">
                        
                        <div className="status-option-item">
                          <Button
                            variant="primary"
                            size="xs"
                            fullWidth
                            leftIcon="📺"
                            className="!bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          >
                            Watching
                          </Button>
                        </div>
                        
                        <div className="status-option-item">
                          <Button
                            variant="success"
                            size="xs"
                            fullWidth
                            leftIcon="✅"
                          >
                            Completed
                          </Button>
                        </div>
                        
                        <div className="status-option-item">
                          <Button
                            variant="warning"
                            size="xs"
                            fullWidth
                            leftIcon="📋"
                          >
                            Plan
                          </Button>
                        </div>
                        
                        <div className="status-option-item">
                          <Button
                            variant="info"
                            size="xs"
                            fullWidth
                            leftIcon="⏸️"
                            className="!bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                          >
                            Hold
                          </Button>
                        </div>
                        
                        <div className="status-option-item">
                          <Button
                            variant="danger"
                            size="xs"
                            fullWidth
                            leftIcon="❌"
                          >
                            Drop
                          </Button>
                        </div>
                        
                        <div className="status-option-item">
                          <Button
                            variant="outline"
                            size="xs"
                            fullWidth
                            leftIcon="🗑️"
                            className="!border-red-400/30 !text-red-400 hover:!bg-red-600 hover:!text-white !bg-gradient-to-br from-red-900/60 to-red-800/60"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Always Visible Main Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        leftIcon="📺"
                        rightIcon={
                          <span className="transition-transform duration-200">
                            ▼
                          </span>
                        }
                        className="backdrop-blur-sm"
                      >
                        Watching
                      </Button>
                      <Button
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
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Hidden radio button for expansion control */}
      <input 
        type="radio" 
        name="expandable-grid-section"
        className="card-radio"
        data-index="0"
      />
    </div>
  )
}

// CSS Classes used for the card design:
/*
Core card classes:
- .expandable-grid-card
- .card-image-container
- .card-overlay-hover
- .card-expanded-overlay
- .card-score-badge
- .card-radio

Expanded content classes:
- .expanded-content
- .expanded-content-inner
- .scrolling-synopsis (.long-text, .short-text)

Status dropdown classes:
- .status-options-container
- .status-dropdown-overlay
- .status-options-list
- .status-option-item
- .status-options-animate
- .status-options-closing
- .selected-option
- .takeover-ready

Grid expansion classes:
- .expandable-grid-container
- CSS custom properties: --col-1 through --col-10

Hover/interaction states:
- :hover pseudo-classes
- :has() selectors for parent state changes
- :checked pseudo-class for radio button state

Animation keyframes:
- jumpToPosition1-8
- closeToButton1-8
- selectedTakeover
- scroll-text-vertical
*/