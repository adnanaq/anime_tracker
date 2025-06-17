import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '../Badge';
import { AnimeSource } from '../../../types/anime';
import { getStatusOptions, getStatusLabel, getStatusColor } from '../../../utils/animeStatus';
import './StatusBadgeDropdown.css';

export interface StatusBadgeDropdownProps {
  currentStatus: string | null;
  source: AnimeSource;
  availableStatuses?: string[];
  onStatusChange: (newStatus: string) => Promise<void> | void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md';
  shape?: 'pill' | 'rounded' | 'square';
  position?: 'auto' | 'top' | 'bottom';
  className?: string;
}

// Map status to badge variant
const getStatusVariant = (status: string | null): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' => {
  if (!status) return 'neutral';
  
  switch (status.toLowerCase()) {
    case 'watching':
    case 'current':
      return 'success';
    case 'completed':
      return 'success';
    case 'plan_to_watch':
    case 'planning':
      return 'primary';
    case 'on_hold':
    case 'paused':
      return 'warning';
    case 'dropped':
      return 'danger';
    case 'repeating':
      return 'secondary';
    default:
      return 'neutral';
  }
};

export const StatusBadgeDropdown: React.FC<StatusBadgeDropdownProps> = ({
  currentStatus,
  source,
  availableStatuses,
  onStatusChange,
  isAuthenticated = true,
  isLoading = false,
  disabled = false,
  size = 'sm',
  shape = 'pill',
  position = 'auto',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Get status options from utility based on source
  const sourceStatusOptions = getStatusOptions(source);
  const actualAvailableStatuses = availableStatuses || sourceStatusOptions.map(option => option.value);
  
  // Get current status display info
  const currentStatusLabel = getStatusLabel(currentStatus);
  const currentStatusVariant = getStatusVariant(currentStatus);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleTriggerClick = (event: React.MouseEvent) => {
    if (disabled || !isAuthenticated) return;
    
    // Prevent event bubbling to parent elements (like card expansion)
    event.stopPropagation();
    
    setIsOpen(!isOpen);
  };

  const handleStatusSelect = async (newStatus: string) => {
    if (disabled || isUpdating || newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Keep dropdown open on error for retry
    } finally {
      setIsUpdating(false);
    }
  };


  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <Badge
        variant={currentStatusVariant}
        size={size}
        shape={shape}
        className={className}
      >
        {currentStatusLabel}
      </Badge>
    );
  }

  return (
    <div className={`relative inline-block status-badge-dropdown-wrapper ${className}`}>
      {/* Trigger Badge */}
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        disabled={disabled || isLoading}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded inline-flex items-center"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current status: ${currentStatusLabel}. Click to change.`}
      >
        <Badge
          variant={currentStatusVariant}
          size={size}
          shape={shape}
          interactive
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            isOpen ? 'status-badge-active' : ''
          } ${isLoading || isUpdating ? 'status-loading' : ''}`}
        >
          {currentStatusLabel}
        </Badge>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full mt-1 min-w-[140px] -left-2 status-dropdown-backdrop py-2 status-dropdown-enter"
          role="listbox"
          aria-label="Status options"
        >
          {actualAvailableStatuses
            .filter(status => status !== currentStatus)
            .map((status, index) => {
              const statusLabel = getStatusLabel(status);
              const statusVariant = getStatusVariant(status);
              return (
                <div key={status} className="px-1 py-1">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleStatusSelect(status);
                    }}
                    disabled={isUpdating}
                    className={`w-full px-3 py-1 focus:outline-none disabled:opacity-50 status-option status-option-${statusVariant} rounded-full`}
                    role="option"
                    aria-selected={false}
                    style={{
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {statusLabel}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};