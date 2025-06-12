import React, { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import './Badge.css'

const badgeVariants = cva(
  'at-badge-base inline-flex items-center gap-1 font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        primary: 'at-badge-primary',
        secondary: 'at-badge-secondary',
        success: 'at-badge-success',
        warning: 'at-badge-warning',
        danger: 'at-badge-danger',
        info: 'at-badge-info',
        neutral: 'at-badge-neutral',
        outline: 'at-badge-outline'
      },
      size: {
        xs: 'at-badge-xs',
        sm: 'at-badge-sm',
        md: 'at-badge-md',
        lg: 'at-badge-lg'
      },
      shape: {
        rounded: 'at-badge-rounded',
        pill: 'at-badge-pill',
        square: 'at-badge-square'
      },
      animated: {
        true: 'at-badge-animated',
        false: ''
      },
      interactive: {
        true: 'at-badge-interactive cursor-pointer',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'sm',
      shape: 'rounded',
      animated: false,
      interactive: false
    }
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  children?: React.ReactNode
  onRemove?: () => void
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className,
    variant,
    size,
    shape,
    animated,
    interactive,
    icon,
    children,
    onRemove,
    onClick,
    ...props 
  }, ref) => {
    const isClickable = interactive || onClick || onRemove

    return (
      <span
        className={cn(
          badgeVariants({ 
            variant, 
            size, 
            shape, 
            animated, 
            interactive: isClickable ? true : false,
            className 
          })
        )}
        ref={ref}
        onClick={onClick}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <span className="at-badge-icon">
            {icon}
          </span>
        )}
        
        {/* Content */}
        <span className="at-badge-content">
          {children}
        </span>
        
        {/* Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="at-badge-remove"
            aria-label="Remove"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Export variants for external use
export { badgeVariants }