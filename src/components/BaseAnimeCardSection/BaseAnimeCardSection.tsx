import React from 'react';
import { BaseAnimeCard } from '../ui';
import { useAnimeAuth } from '../../hooks/useAuth';
import { animeStatusService } from '../../services/shared/animeStatusService';
import type { AnimeBase } from '../../types/anime';

interface BaseAnimeCardSectionProps {
  anime: AnimeBase[];
  currentSource: string;
  updateAnimeStatus: (animeId: number, source: string, status: string) => void;
  groupName?: string;
}

export const BaseAnimeCardSection: React.FC<BaseAnimeCardSectionProps> = ({
  anime,
  currentSource,
  updateAnimeStatus,
  groupName = "basecard-section",
}) => {
  const [currentCard, setCurrentCard] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAnimeAuth(currentSource as any);

  const handleStatusChange = async (
    animeItem: AnimeBase,
    newStatus: string
  ) => {
    try {
      // Same API call pattern as ExpandableGrid
      await animeStatusService.updateAnimeStatus(
        animeItem.id,
        animeItem.source,
        { status: newStatus }
      );

      // Update local store
      updateAnimeStatus(animeItem.id, animeItem.source, newStatus);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex gap-4 justify-start overflow-x-auto p-4"
    >
      {anime.map((animeItem, index) => (
        <div
          key={`wrapper-${animeItem.source}-${animeItem.id}`}
          style={{ minWidth: "200px", flexShrink: 0 }}
        >
          <BaseAnimeCard
            key={`basecard-${groupName}-${animeItem.source}-${animeItem.id}`}
            anime={animeItem}
            width={200} // ExpandableGrid default
            height={370} // ExpandableGrid default
            expandedWidth={480} // ExpandableGrid default
            groupName={groupName}
            cardIndex={index}
            expanded={index === currentCard} // Expand the current card
            autoLoop={true} // ExpandableGrid click mode default
            loopInterval={4000} // ExpandableGrid default: 4 seconds
            pauseOnInteraction={true} // ExpandableGrid default: pause on click
            pauseDuration={10000} // ExpandableGrid default: 10 seconds
            onClick={() => {
              setCurrentCard(index); // Update current card when manually clicked
            }}
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);

              // Auto-scroll only when card would go out of view
              if (containerRef.current) {
                const container = containerRef.current;
                const cardWidth = 200 + 16; // card width + gap
                const containerWidth = container.clientWidth;
                const visibleCards = Math.floor(containerWidth / cardWidth);
                const middleThreshold = Math.floor(visibleCards / 2);

                // Handle scroll logic
                if (cardIndex === 0) {
                  // When looping back to first card, scroll to beginning
                  container.scrollTo({
                    left: 0,
                    behavior: "smooth",
                  });
                } else if (cardIndex >= middleThreshold) {
                  // Only scroll when current card index exceeds the middle threshold
                  const scrollPosition =
                    (cardIndex - middleThreshold) * cardWidth;
                  container.scrollTo({
                    left: scrollPosition,
                    behavior: "smooth",
                  });
                }
              }
            }}
            statusDropdown={{
              enabled: true,
              position: "overlay",
              onStatusChange: (newStatus) =>
                handleStatusChange(animeItem, newStatus),
              isAuthenticated,
            }}
          />
        </div>
      ))}
    </div>
  );
};