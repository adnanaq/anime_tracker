import React from 'react';
import { AnimeBase } from '../../../types/anime';
import { useDimensions } from '../../../hooks/useDimensions';
import { useAutoCycling } from '../../../hooks/useAutoCycling';
import { Card } from '../Card';
import { Typography } from '../Typography';
import { Badge } from '../Badge';
import { StatusBadgeDropdown } from '../StatusBadgeDropdown';
import { AnimeInfoCard } from '../AnimeInfoCard';
import './BaseAnimeCard.css';

export interface StatusDropdownConfig {
  enabled: boolean;
  position?: 'overlay' | 'bottom';
  onStatusChange?: (newStatus: string) => Promise<void> | void;
  isAuthenticated?: boolean;
}

export interface BaseAnimeCardProps {
  anime: AnimeBase;
  expanded?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  groupName?: string; // Radio group name for mutual exclusion (defaults to "base-anime-cards")
  cardIndex?: number; // Index within the group
  expandable?: boolean; // Whether card can expand (default: true)
  width?: number | string; // Custom width (default: 200px)  
  height?: number | string; // Custom height (default: 370px) - remains constant during expansion
  expandedWidth?: number | string; // Custom expanded width (default: 480px) - only horizontal expansion
  // Auto-cycling loop props (similar to ExpandableGrid click mode)
  autoLoop?: boolean; // Enable auto-cycling to next card in group (default: false)
  loopInterval?: number; // Time in milliseconds between auto-cycling (default: 4000ms)
  pauseOnInteraction?: boolean; // Pause auto-cycling when user interacts (default: true)
  pauseDuration?: number; // How long to pause after interaction in ms (default: 10000ms)
  onAutoLoop?: (cardIndex: number) => void; // Callback when auto-cycling occurs
  // Status dropdown integration
  statusDropdown?: StatusDropdownConfig;
  // Built-in expanded content
  expandedContent?: boolean; // Whether to automatically show AnimeInfoCard in expanded state (default: true when statusDropdown.enabled)
  // Note: aspectRatio is incompatible with horizontal-only expansion as it would change height
}

export const BaseAnimeCard: React.FC<BaseAnimeCardProps> = ({
  anime,
  expanded = false,
  onClick,
  className = '',
  children,
  groupName = 'base-anime-cards', // Default group name for mutual exclusion
  cardIndex = anime.id, // Default to anime ID if not provided
  expandable = true, // Default to expandable
  width = "13rem", // ~208px equivalent - responsive with rem
  height = "23rem", // 368px equivalent - responsive with rem
  expandedWidth = "30rem", // 480px equivalent - responsive with rem
  // Auto-cycling props
  autoLoop = false,
  loopInterval = 4000,
  pauseOnInteraction = true,
  pauseDuration = 10000,
  onAutoLoop,
  // Status dropdown props
  statusDropdown,
  // Built-in expanded content
  expandedContent,
}) => {
  // State to track image loading errors
  const [imageError, setImageError] = React.useState(false);

  // Reset image error when anime changes
  React.useEffect(() => {
    setImageError(false);
  }, [anime.coverImage]);

  // Determine if we should show built-in AnimeInfoCard
  const shouldShowBuiltInContent = (() => {
    // If children are provided, they take precedence
    if (children) return false;
    
    // If expandedContent is explicitly set, use that
    if (expandedContent !== undefined) return expandedContent;
    
    // Default: show built-in content when statusDropdown is enabled
    return statusDropdown?.enabled ?? false;
  })();

  // Use the useDimensions hook for all dimension validation and formatting
  const { cardStyles } = useDimensions({ width, height, expandedWidth });

  // Use the useAutoCycling hook for auto-cycling functionality
  const { handleInteraction } = useAutoCycling({
    autoLoop,
    loopInterval,
    pauseOnInteraction,
    pauseDuration,
    onAutoLoop,
    groupName,
    cardIndex,
    expandable,
  });

  const handleClick = () => {
    // Handle auto-cycling pause on interaction
    handleInteraction();
    // Call the provided onClick callback
    onClick && onClick();
  };

  return (
    <Card
      expanded={expanded}
      expandable={expandable}
      groupName={groupName}
      cardIndex={cardIndex}
      onClick={handleClick}
      className={`base-anime-card ${expanded ? 'expanded' : ''} ${className}`}
      style={cardStyles}
    >
      {/* Card Image Container */}
      <div className="card-image-container w-full h-full relative cursor-pointer">
        {/* Image Display with Fallback */}
        {anime.coverImage && !imageError ? (
          <img
            src={anime.coverImage}
            alt={anime.title}
            className="w-full h-full object-cover rounded-xl"
            style={{ objectPosition: 'top center' }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-xl">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Gradient Overlay with Anime Metadata */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl">
          {/* Score badge - top left */}
          {anime.score && (
            <div className="absolute top-3 left-3 card-score-badge">
              <Badge
                variant="warning"
                size="xs"
                icon="⭐"
                className="backdrop-blur-sm"
              >
                {anime.score.toFixed(1)}
              </Badge>
            </div>
          )}

          {/* Status dropdown - top right (mirrors score badge positioning) */}
          {statusDropdown?.enabled && statusDropdown.onStatusChange && (
            <div className="absolute top-3 right-3 card-status-badge">
              <StatusBadgeDropdown
                currentStatus={anime.userStatus || null}
                source={anime.source}
                onStatusChange={statusDropdown.onStatusChange}
                isAuthenticated={statusDropdown.isAuthenticated ?? true}
                size="xs"
                className="backdrop-blur-sm"
              />
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <Typography
              variant="h6"
              color="inverse"
              className="mb-1 line-clamp-2 text-sm"
            >
              {anime.title}
            </Typography>
            <div className="flex items-center gap-2 text-xs text-white/90">
              {anime.year && <span>📅 {anime.year}</span>}
              {anime.episodes && (
                <span>📺 {anime.episodes} eps</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Built-in expanded content or enhanced children */}
      {shouldShowBuiltInContent && expanded ? (
        <div className="card-expanded-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-800 pointer-events-none rounded-xl p-4">
          <AnimeInfoCard 
            anime={anime}
            statusDropdown={statusDropdown?.enabled ? {
              enabled: true,
              onStatusChange: statusDropdown.onStatusChange,
              isAuthenticated: statusDropdown.isAuthenticated
            } : undefined}
          />
        </div>
      ) : shouldShowBuiltInContent ? null : (
        statusDropdown?.enabled ? 
          React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Check if this is a div containing AnimeInfoCard (common pattern in stories)
              if (child.type === 'div' && child.props.children) {
                return React.cloneElement(child, {
                  ...child.props,
                  children: React.Children.map(child.props.children, (grandChild) => {
                    if (React.isValidElement(grandChild) && 
                        (grandChild.type?.displayName === 'AnimeInfoCard' || 
                         grandChild.type?.name === 'AnimeInfoCard' ||
                         String(grandChild.type).includes('AnimeInfoCard'))) {
                      return React.cloneElement(grandChild, {
                        ...grandChild.props,
                        statusDropdown: {
                          enabled: true,
                          onStatusChange: statusDropdown.onStatusChange,
                          isAuthenticated: statusDropdown.isAuthenticated
                        }
                      });
                    }
                    return grandChild;
                  })
                });
              }
              // Direct AnimeInfoCard
              else if (child.type?.displayName === 'AnimeInfoCard' || 
                       child.type?.name === 'AnimeInfoCard' ||
                       String(child.type).includes('AnimeInfoCard')) {
                return React.cloneElement(child, {
                  ...child.props,
                  statusDropdown: {
                    enabled: true,
                    onStatusChange: statusDropdown.onStatusChange,
                    isAuthenticated: statusDropdown.isAuthenticated
                  }
                });
              }
            }
            return child;
          }) 
          : children
      )}
    </Card>
  );
};