import React from 'react';

export interface AutoCyclingOptions {
  autoLoop?: boolean;
  loopInterval?: number;
  pauseOnInteraction?: boolean;
  pauseDuration?: number;
  onAutoLoop?: (cardIndex: number) => void;
  groupName: string;
  cardIndex: number;
  expandable?: boolean;
}

export interface AutoCyclingOutput {
  isPaused: boolean;
  triggerPause: () => void;
  handleInteraction: () => void;
}

/**
 * Custom hook for managing auto-cycling functionality across card groups
 * Handles global pause state, interval management, and card cycling logic
 */
export const useAutoCycling = ({
  autoLoop = false,
  loopInterval = 4000,
  pauseOnInteraction = true,
  pauseDuration = 10000,
  onAutoLoop,
  groupName,
  cardIndex,
  expandable = true,
}: AutoCyclingOptions): AutoCyclingOutput => {
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

  // Function to trigger pause state
  const triggerPause = React.useCallback(() => {
    if (!pauseOnInteraction) return;

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
  }, [pauseOnInteraction, pauseStateKey, pauseDuration]);

  // Handle user interaction (to be called from component)
  const handleInteraction = React.useCallback(() => {
    if (autoLoop && pauseOnInteraction) {
      triggerPause();
    }
  }, [autoLoop, pauseOnInteraction, triggerPause]);

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

  return {
    isPaused,
    triggerPause,
    handleInteraction,
  };
};