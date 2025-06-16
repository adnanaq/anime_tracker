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
  const radioRef = React.useRef<HTMLInputElement>(null);
  const timerRef = React.useRef<number | null>(null);
  
  // Use a global pause state shared across all cards in the group
  const pauseStateKey = `${groupName}-pause`;
  const [isPaused, setIsPaused] = React.useState(false);
  
  // Initialize global pause state
  React.useEffect(() => {
    if (!(window as any)[pauseStateKey]) {
      (window as any)[pauseStateKey] = { isPaused: false, subscribers: new Set() };
    }
    
    const globalState = (window as any)[pauseStateKey];
    globalState.subscribers.add(setIsPaused);
    setIsPaused(globalState.isPaused);
    
    return () => {
      globalState.subscribers.delete(setIsPaused);
    };
  }, [pauseStateKey]);

  // Helper function to validate and format dimension values
  const validateAndFormatDimension = (value: number | string, fallback: number): string => {
    if (typeof value === 'number') {
      // Ensure no negative values
      const validValue = Math.max(0, value);
      return `${validValue}px`;
    }
    return value; // Allow string values (e.g., "10rem", "50%") - assume they're valid
  };

  // Validate dimensions
  const validatedWidth = typeof width === 'number' ? Math.max(0, width) : width;
  const validatedHeight = typeof height === 'number' ? Math.max(0, height) : height;
  const validatedExpandedWidth = typeof expandedWidth === 'number' ? Math.max(0, expandedWidth) : expandedWidth;

  // Ensure expandedWidth is greater than width (only for numeric values)
  const finalExpandedWidth = (() => {
    if (typeof validatedWidth === 'number' && typeof validatedExpandedWidth === 'number') {
      return Math.max(validatedExpandedWidth, validatedWidth + 1); // At least 1px bigger than width
    }
    return validatedExpandedWidth;
  })();

  // Calculate dynamic styles - height is always fixed for horizontal-only expansion
  const cardStyles: React.CSSProperties = {
    width: validateAndFormatDimension(validatedWidth, 200),
    height: validateAndFormatDimension(validatedHeight, 370),
    '--expanded-width': validateAndFormatDimension(finalExpandedWidth, 480),
    '--original-width': validateAndFormatDimension(validatedWidth, 200),
  } as React.CSSProperties;

  const handleClick = () => {
    // If not expandable, only call onClick callback but don't toggle expansion
    if (!expandable) {
      onClick && onClick();
      return;
    }

    // Handle auto-loop pause on interaction (set global pause state)
    if (autoLoop && pauseOnInteraction) {
      const globalState = (window as any)[pauseStateKey];
      if (globalState) {
        globalState.isPaused = true;
        globalState.subscribers.forEach((subscriber: (value: boolean) => void) => {
          subscriber(true);
        });
      }
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Resume auto-cycling after pause duration
      timerRef.current = setTimeout(() => {
        const globalState = (window as any)[pauseStateKey];
        if (globalState) {
          globalState.isPaused = false;
          globalState.subscribers.forEach((subscriber: (value: boolean) => void) => {
            subscriber(false);
          });
        }
      }, pauseDuration);
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

  // Auto-cycling effect (similar to ExpandableGrid click mode)
  // Only the first card (cardIndex 0) manages the auto-cycling for the entire group
  React.useEffect(() => {
    if (!autoLoop || !expandable || cardIndex !== 0) return;

    let interval: number | null = null;

    const startInterval = () => {
      if (interval) clearInterval(interval);
      
      interval = setInterval(() => {
        // Check if paused before each cycle
        const globalState = (window as any)[pauseStateKey];
        if (globalState?.isPaused) return;

        // Find all cards in the same group to cycle through
        const allRadios = document.querySelectorAll(`input[name="${groupName}"]`);
        if (allRadios.length === 0) return;

        const currentIndex = Array.from(allRadios).findIndex((radio) => 
          (radio as HTMLInputElement).checked
        );
        
        let nextIndex;
        if (currentIndex === -1) {
          // No card is currently selected, start with first card
          nextIndex = 0;
        } else {
          // Move to next card
          nextIndex = currentIndex + 1;
          if (nextIndex >= allRadios.length) {
            nextIndex = 0; // Loop back to first card
          }
        }

        // Uncheck all cards and check next card
        allRadios.forEach((radio, index) => {
          (radio as HTMLInputElement).checked = index === nextIndex;
        });

        // Call onAutoLoop callback if provided
        if (onAutoLoop) {
          const nextRadio = allRadios[nextIndex] as HTMLInputElement;
          const nextCardIndex = parseInt(nextRadio.getAttribute('data-index') || '0');
          onAutoLoop(nextCardIndex);
        }
      }, loopInterval);
    };

    // Start the interval
    startInterval();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoLoop, expandable, groupName, loopInterval, onAutoLoop, cardIndex, pauseStateKey]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`
        base-anime-card
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
      style={cardStyles}
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