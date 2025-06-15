import React from 'react';
import { AnimeBase } from '../../../types/anime';
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
}) => {
  const radioRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // If not expandable, only call onClick callback but don't toggle expansion
    if (!expandable) {
      onClick && onClick();
      return;
    }

    if (radioRef.current) {
      // Always use radio button for mutual exclusion
      if (radioRef.current.checked) {
        // If already expanded, collapse by unchecking
        radioRef.current.checked = false;
      } else {
        // Expand this card (automatically collapses others due to radio group)
        radioRef.current.checked = true;
      }
    }
    onClick && onClick();
  };

  return (
    <div
      className={`
        base-anime-card
        w-[200px]
        h-[370px] 
        rounded-xl 
        overflow-hidden 
        bg-gray-200 
        border 
        border-gray-300
        cursor-pointer
        hover:border-gray-400
        relative
        ${!expandable ? 'non-expandable' : ''}
        ${className}
      `.trim()}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Hidden radio button for mutual exclusion (like ExpandableGrid) */}
      <input
        ref={radioRef}
        type="radio"
        name={groupName}
        className="absolute opacity-0 pointer-events-none"
        data-index={cardIndex}
        defaultChecked={expanded}
      />
      
      {children}
    </div>
  );
};