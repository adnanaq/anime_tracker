import React, { useEffect, useRef } from 'react';
import { fadeIn } from '../../../utils/animations';
import './AiringIndicator.css';

export interface AiringIndicatorProps {
  status?: string;
  airingStatus?: 'aired' | 'airing' | 'delayed' | 'skipped' | 'tba';
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'blue' | 'red' | 'yellow';
  disabled?: boolean;
  fullCardRipple?: boolean; // Enable full card ripple effect
  onRippleRender?: (rippleElement: HTMLDivElement, position: string) => void; // Callback for card integration
}

export const AiringIndicator: React.FC<AiringIndicatorProps> = ({
  status,
  airingStatus,
  className = '',
  position = 'top-right',
  size = 'md',
  color = 'green',
  disabled = false,
  fullCardRipple = false,
  onRippleRender,
}) => {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const cardRippleRef = useRef<HTMLDivElement>(null);

  // Determine if anime is currently airing
  const isAiring = (() => {
    if (disabled) return false;
    
    // Priority: airingStatus over general status
    if (airingStatus) {
      return airingStatus === 'airing';
    }
    
    if (status) {
      const normalizedStatus = status.toLowerCase();
      return normalizedStatus === 'releasing' || normalizedStatus === 'currently_airing';
    }
    
    return false;
  })();

  // Apply fade-in animation when component mounts and setup card ripple
  useEffect(() => {
    if (isAiring && indicatorRef.current) {
      fadeIn(indicatorRef.current, 300, 100);
      
      // Setup full card ripple if enabled
      if (fullCardRipple && cardRippleRef.current && onRippleRender) {
        onRippleRender(cardRippleRef.current, position);
      }
    }
  }, [isAiring, fullCardRipple, position, onRippleRender]);

  // Don't render if not airing
  if (!isAiring) {
    return null;
  }

  // Position classes mapping
  const positionClasses = {
    'top-right': 'top-3 right-3',
    'top-left': 'top-3 left-3',
    'bottom-right': 'bottom-3 right-3',
    'bottom-left': 'bottom-3 left-3',
  };

  // Size classes mapping
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Color classes mapping
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <>
      {/* Full card ripple overlay (rendered as sibling to card content) */}
      {fullCardRipple && (
        <div
          ref={cardRippleRef}
          data-testid="card-ripple-overlay"
          className="card-ripple-overlay"
        />
      )}
      
      {/* Indicator dot */}
      <div
        ref={indicatorRef}
        data-testid="airing-indicator"
        className={`
          absolute ${positionClasses[position]} ${sizeClasses[size]}
          pointer-events-none z-10 ${className}
        `.trim()}
        aria-label="Currently airing"
        title="This anime is currently airing new episodes"
      >
        {fullCardRipple ? (
          // Subtle pulsing dot when full card ripple is enabled
          <div
            className={`
              absolute inset-0 rounded-full ${colorClasses[color]}
              opacity-80 animate-pulse
            `.trim()}
            style={{
              animationDuration: '2s',
              animationIterationCount: 'infinite',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.5), 0 0 16px rgba(34, 197, 94, 0.2)',
            }}
          />
        ) : (
          // Original concentric ripples when full card ripple is disabled
          <>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                data-testid={`ripple-wave-${index}`}
                className={`
                  absolute inset-0 rounded-full ${colorClasses[color]}
                  animate-pulse opacity-30 airing-ripple
                `.trim()}
                style={{
                  animationName: 'ripple',
                  animationDuration: '2s',
                  animationIterationCount: 'infinite',
                  animationDelay: `${index * 0.5}s`,
                }}
              />
            ))}
            
            {/* Center dot */}
            <div
              className={`
                absolute inset-0 rounded-full ${colorClasses[color]}
                opacity-80 scale-50
              `.trim()}
            />
          </>
        )}
      </div>
    </>
  );
};

// Set displayName for component detection
AiringIndicator.displayName = 'AiringIndicator';