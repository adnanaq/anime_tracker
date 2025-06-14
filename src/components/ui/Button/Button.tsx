import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import { Spinner } from '../Spinner'
import './Button.css'

const buttonVariants = cva(
  // Base styles
  'at-button-base inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'at-button-primary',
        secondary: 'at-button-secondary', 
        success: 'at-button-success',
        warning: 'at-button-warning',
        danger: 'at-button-danger',
        ghost: 'at-button-ghost',
        outline: 'at-button-outline',
        link: 'at-button-link'
      },
      size: {
        xs: 'at-button-xs',
        sm: 'at-button-sm',
        md: 'at-button-md',
        lg: 'at-button-lg',
        xl: 'at-button-xl'
      },
      animated: {
        true: 'at-button-animated',
        false: ''
      },
      fullWidth: {
        true: 'w-full',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      animated: false,
      fullWidth: false
    }
  }
)

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'as'>,
    VariantProps<typeof buttonVariants> {
  as?: React.ElementType
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  [key: string]: any // Allow any additional props for polymorphic behavior
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animated, 
    fullWidth,
    as: Component = 'button',
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props 
  }, ref) => {
    // Check if this is an icon-only button
    const isIconOnly = !children && (leftIcon || rightIcon)
    
    return (
      <Component
        className={cn(
          buttonVariants({ variant, size, animated, fullWidth, className }),
          isIconOnly && 'at-button-icon-only'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Animated background for hover effects */}
        {animated && (
          <div className="at-button-bg-animation" />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <div className="at-button-spinner">
            <Spinner size="xs" color="primary" />
          </div>
        )}
        
        {/* Left icon */}
        {leftIcon && !loading && (
          <span className="at-button-icon-left">
            {leftIcon}
          </span>
        )}
        
        {/* Button content */}
        {children && (
          <span className={cn('at-button-content', loading && 'opacity-0')}>
            {children}
          </span>
        )}
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="at-button-icon-right">
            {rightIcon}
          </span>
        )}
      </Component>
    )
  }
)

Button.displayName = 'Button'

// Export variants for external use
export { buttonVariants }
export type { VariantProps }