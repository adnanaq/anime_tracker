import React, { useState, useEffect } from "react";
import { AnimeBase } from "../../types/anime";
import { useNavigate } from "react-router-dom";
import "./ExpandingAnimeCards.css";

interface ExpandingAnimeCardsProps {
  anime: AnimeBase[];
  title?: string;
  variant?: "horizontal" | "vertical" | "grid";
  maxCards?: number;
  interactive?: boolean;
}

export const ExpandingAnimeCards: React.FC<ExpandingAnimeCardsProps> = ({
  anime,
  title = "Featured Anime",
  variant = "horizontal",
  maxCards = 6,
  interactive = true,
}) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayAnime = anime.slice(0, maxCards);

  const handleCardClick = (index: number, animeItem: AnimeBase) => {
    // Skip click interactions if not interactive
    if (!interactive) return;

    if (variant === "grid") {
      // For grid variant, navigate directly
      navigate(`/anime/${animeItem.source}/${animeItem.id}`);
    } else {
      // For horizontal/vertical variants, set as selected
      setSelectedIndex(index);
    }
  };

  const handleNavigate = (animeItem: AnimeBase) => {
    // Skip navigation if not interactive
    if (!interactive) return;
    navigate(`/anime/${animeItem.source}/${animeItem.id}`);
  };

  // Auto-rotate for horizontal variant
  useEffect(() => {
    if (variant === "horizontal" && displayAnime.length > 1) {
      const interval = setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % displayAnime.length);
      }, 8000); // Change every 8 seconds

      return () => clearInterval(interval);
    }
  }, [variant, displayAnime.length]);

  if (variant === "horizontal") {
    return (
      <div className="expanding-cards-container mb-12">
        {title && (
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
            {title}
          </h2>
        )}

        <div className="horizontal-panels">
          {displayAnime.map((animeItem, index) => (
            <div
              key={`${animeItem.source}-${animeItem.id}`}
              className={`panel ${index === selectedIndex ? "active" : ""}`}
              style={{
                backgroundImage: `url(${
                  animeItem.coverImage || animeItem.image
                })`,
              }}
              onClick={() => handleCardClick(index, animeItem)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="panel-overlay">
                <div className="panel-content">
                  <h3 className="panel-title">{animeItem.title}</h3>
                  <div className="panel-info">
                    {animeItem.score && (
                      <span className="score-badge">
                        ⭐ {animeItem.score.toFixed(1)}
                      </span>
                    )}
                    {animeItem.year && (
                      <span className="year-badge">{animeItem.year}</span>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <div className="panel-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(animeItem);
                        }}
                        className="view-details-btn"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation dots */}
        <div className="panel-dots">
          {displayAnime.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === selectedIndex ? "active" : ""}`}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="expanding-cards-container mb-12">
      {title && (
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          {title}
        </h2>
      )}

      <div className="grid-container">
        {displayAnime.map((animeItem, index) => (
          <div
            key={`${animeItem.source}-${animeItem.id}`}
            className={`grid-card ${hoveredIndex === index ? "expanded" : ""}`}
            onClick={() => handleCardClick(index, animeItem)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="grid-image-container">
              <img
                src={animeItem.coverImage || animeItem.image}
                alt={animeItem.title}
                className="grid-image"
              />
              <div className="grid-overlay">
                <div className="grid-content">
                  <h3 className="grid-title">{animeItem.title}</h3>
                  {hoveredIndex === index && (
                    <div className="grid-expanded-content">
                      <p className="grid-synopsis">
                        {animeItem.synopsis?.substring(0, 100)}...
                      </p>
                      <div className="grid-stats">
                        {animeItem.score && (
                          <span className="grid-stat">
                            ⭐ {animeItem.score.toFixed(1)}
                          </span>
                        )}
                        {animeItem.year && (
                          <span className="grid-stat">{animeItem.year}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandingAnimeCards;
