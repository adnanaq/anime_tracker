import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '../Badge';
import './StatusBadgeDropdown.css';

// Anime status types
export type AnimeStatus = 
  | 'plan_to_watch' 
  | 'currently_watching' 
  | 'completed' 
  | 'on_hold' 
  | 'dropped' 
  | 'not_in_list';

export interface StatusOption {
  value: AnimeStatus;
  label: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export interface StatusBadgeDropdownProps {
  currentStatus: AnimeStatus;
  availableStatuses?: AnimeStatus[];
  onStatusChange: (newStatus: AnimeStatus) => Promise<void> | void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md';
  position?: 'auto' | 'top' | 'bottom';
  className?: string;
}

// Default status options configuration
const DEFAULT_STATUS_OPTIONS: Record<AnimeStatus, StatusOption> = {
  plan_to_watch: {
    value: 'plan_to_watch',
    label: 'Plan to Watch',
    variant: 'primary'
  },
  currently_watching: {
    value: 'currently_watching',
    label: 'Currently Watching',
    variant: 'success'
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    variant: 'success'
  },
  on_hold: {
    value: 'on_hold',
    label: 'On Hold',
    variant: 'warning'
  },
  dropped: {
    value: 'dropped',
    label: 'Dropped',
    variant: 'danger'
  },
  not_in_list: {
    value: 'not_in_list',
    label: 'Remove from List',
    variant: 'neutral'
  }
};

const DEFAULT_AVAILABLE_STATUSES: AnimeStatus[] = [
  'plan_to_watch',
  'currently_watching', 
  'completed',
  'on_hold',
  'dropped',
  'not_in_list'
];

export const StatusBadgeDropdown: React.FC<StatusBadgeDropdownProps> = ({
  currentStatus,
  availableStatuses = DEFAULT_AVAILABLE_STATUSES,
  onStatusChange,
  isAuthenticated = true,
  isLoading = false,
  disabled = false,
  size = 'sm',
  position = 'auto',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Get current status configuration
  const currentStatusConfig = DEFAULT_STATUS_OPTIONS[currentStatus];

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

  const handleTriggerClick = () => {
    if (disabled || !isAuthenticated) return;
    setIsOpen(!isOpen);
  };

  const handleStatusSelect = async (newStatus: AnimeStatus) => {
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
        variant={currentStatusConfig.variant}
        size={size}
        shape="pill"
        className={className}
      >
        {currentStatusConfig.label}
      </Badge>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Badge */}
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        disabled={disabled || isLoading}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current status: ${currentStatusConfig.label}. Click to change.`}
      >
        <Badge
          variant={currentStatusConfig.variant}
          size={size}
          shape="pill"
          interactive
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            isOpen ? 'status-badge-active' : ''
          } ${isLoading || isUpdating ? 'status-loading' : ''}`}
        >
          {currentStatusConfig.label}
        </Badge>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 min-w-[140px] -left-2 status-dropdown-backdrop py-2 status-dropdown-enter"
          role="listbox"
          aria-label="Status options"
        >
          {availableStatuses
            .filter(status => status !== currentStatus)
            .map((status, index) => {
              const statusConfig = DEFAULT_STATUS_OPTIONS[status];
              return (
                <div className="px-1 py-1">
                  <button
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    disabled={isUpdating}
                    className={`w-full px-3 py-1 focus:outline-none disabled:opacity-50 status-option status-option-${statusConfig.variant} rounded-full`}
                    role="option"
                    aria-selected={false}
                    style={{
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {statusConfig.label}
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