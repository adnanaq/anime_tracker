import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import { Typography } from '../Typography'
import './Spinner.css'

const spinnerVariants = cva(
  'at-spinner-base',
  {
    variants: {
      variant: {
        default: 'at-spinner-default',
        dots: 'at-spinner-dots',
        pulse: 'at-spinner-pulse',
        bars: 'at-spinner-bars'
      },
      size: {
        xs: 'at-spinner-xs',
        sm: 'at-spinner-sm',
        md: 'at-spinner-md',
        lg: 'at-spinner-lg',
        xl: 'at-spinner-xl'
      },
      color: {
        primary: 'at-spinner-primary',
        secondary: 'at-spinner-secondary',
        success: 'at-spinner-success',
        warning: 'at-spinner-warning',
        danger: 'at-spinner-danger'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      color: 'primary'
    }
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  message?: string
  messageVariant?: 'bodySmall' | 'bodyMedium' | 'bodyLarge'
  centered?: boolean
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ 
    className, 
    variant, 
    size, 
    color,
    message,
    messageVariant = 'bodySmall',
    centered = false,
    ...props 
  }, ref) => {
    const spinnerContent = (
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative">
          {variant === 'default' && (
            <div className={cn(spinnerVariants({ variant, size, color }))}>
              <div className="at-spinner-ring" />
            </div>
          )}
          
          {variant === 'dots' && (
            <div className={cn(spinnerVariants({ variant, size, color }))}>
              <div className="at-spinner-dot" />
              <div className="at-spinner-dot" />
              <div className="at-spinner-dot" />
            </div>
          )}
          
          {variant === 'pulse' && (
            <div className={cn(spinnerVariants({ variant, size, color }))}>
              <div className="at-spinner-pulse-ring" />
            </div>
          )}
          
          {variant === 'bars' && (
            <div className={cn(spinnerVariants({ variant, size, color }))}>
              <div className="at-spinner-bar" />
              <div className="at-spinner-bar" />
              <div className="at-spinner-bar" />
              <div className="at-spinner-bar" />
            </div>
          )}
        </div>

        {message && (
          <Typography 
            variant={messageVariant} 
            color="muted" 
            className="text-center animate-pulse"
          >
            {message}
          </Typography>
        )}
      </div>
    )

    if (centered) {
      return (
        <div 
          className={cn('flex items-center justify-center min-h-32', className)}
          ref={ref}
          {...props}
        >
          {spinnerContent}
        </div>
      )
    }

    return (
      <div
        className={cn(className)}
        ref={ref}
        {...props}
      >
        {spinnerContent}
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

export { spinnerVariants }