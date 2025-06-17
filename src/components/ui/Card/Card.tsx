import React from 'react';
import './Card.css';

export interface CardProps {
  expanded?: boolean;
  expandable?: boolean;
  groupName?: string;
  cardIndex?: number;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * Core Card component for pure UI concerns
 * Handles expansion, radio groups, click interactions, and keyboard navigation
 */
export const Card: React.FC<CardProps> = ({
  expanded = false,
  expandable = true,
  groupName = 'default-card-group',
  cardIndex = 0,
  onClick,
  className = '',
  children,
  style,
  onKeyDown,
}) => {
  const radioRef = React.useRef<HTMLInputElement>(null);

  // Sync radio button state when expanded prop changes (needed for auto-cycling)
  React.useEffect(() => {
    if (radioRef.current) {
      radioRef.current.checked = expanded;
    }
  }, [expanded]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    onKeyDown && onKeyDown(e);
  };

  return (
    <div
      className={`
        card
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
      style={style}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden radio button for mutual exclusion */}
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