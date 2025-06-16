import React from 'react';
import { AnimeBase } from '../../../types/anime';
import { useDimensions } from '../../../hooks/useDimensions';
import { useAutoCycling } from '../../../hooks/useAutoCycling';
import { Card } from '../Card';
import './BaseAnimeCard.css';

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
  width = 200,
  height = 370,
  expandedWidth = 480,
  // Auto-cycling props
  autoLoop = false,
  loopInterval = 4000,
  pauseOnInteraction = true,
  pauseDuration = 10000,
  onAutoLoop,
}) => {
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
      className={`base-anime-card ${className}`}
      style={cardStyles}
    >
      {children}
    </Card>
  );
};