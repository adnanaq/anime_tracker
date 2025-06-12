import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import './Skeleton.css'

const skeletonVariants = cva(
  'at-skeleton-base animate-pulse',
  {
    variants: {
      variant: {
        default: 'at-skeleton-default',
        card: 'at-skeleton-card',
        text: 'at-skeleton-text',
        avatar: 'at-skeleton-avatar',
        button: 'at-skeleton-button'
      },
      size: {
        sm: 'at-skeleton-sm',
        md: 'at-skeleton-md',
        lg: 'at-skeleton-lg',
        xl: 'at-skeleton-xl'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md'
    }
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
  count?: number
  delay?: number
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    width,
    height,
    count = 1,
    delay = 0,
    style,
    ...props 
  }, ref) => {
    const baseStyle = {
      width,
      height,
      animationDelay: `${delay}ms`,
      ...style
    }

    if (count === 1) {
      return (
        <div
          className={cn(skeletonVariants({ variant, size, rounded, className }))}
          ref={ref}
          style={baseStyle}
          {...props}
        />
      )
    }

    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(skeletonVariants({ variant, size, rounded, className }))}
            style={{
              ...baseStyle,
              animationDelay: `${delay + index * 150}ms`
            }}
            {...props}
          />
        ))}
      </div>
    )
  }
)

Skeleton.displayName = 'Skeleton'

export { skeletonVariants }