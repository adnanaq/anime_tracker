import React, { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import './Typography.css'

const typographyVariants = cva(
  'at-typography-base',
  {
    variants: {
      variant: {
        h1: 'at-typography-h1',
        h2: 'at-typography-h2', 
        h3: 'at-typography-h3',
        h4: 'at-typography-h4',
        h5: 'at-typography-h5',
        h6: 'at-typography-h6',
        body: 'at-typography-body',
        bodyLarge: 'at-typography-body-large',
        bodySmall: 'at-typography-body-small',
        caption: 'at-typography-caption',
        overline: 'at-typography-overline',
        label: 'at-typography-label'
      },
      color: {
        primary: 'text-gray-900 dark:text-white',
        secondary: 'text-gray-700 dark:text-gray-200',
        tertiary: 'text-gray-500 dark:text-gray-400',
        inverse: 'text-white dark:text-gray-900',
        muted: 'text-gray-400 dark:text-gray-500',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        danger: 'text-red-600 dark:text-red-400',
        info: 'text-blue-600 dark:text-blue-400'
      },
      weight: {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold'
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify'
      },
      truncate: {
        true: 'truncate',
        false: ''
      },
      lineClamp: {
        1: 'line-clamp-1',
        2: 'line-clamp-2',
        3: 'line-clamp-3',
        4: 'line-clamp-4',
        none: ''
      }
    },
    defaultVariants: {
      variant: 'body',
      color: 'primary',
      weight: 'normal',
      align: 'left',
      truncate: false,
      lineClamp: 'none'
    }
  }
)

type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'

export interface TypographyProps 
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement
  children?: React.ReactNode
}

// Map variants to default HTML elements
const variantElementMap: Record<string, TypographyElement> = {
  h1: 'h1',
  h2: 'h2', 
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  bodyLarge: 'p',
  bodySmall: 'p',
  caption: 'span',
  overline: 'span',
  label: 'label'
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ 
    className,
    variant = 'body',
    color,
    weight,
    align,
    truncate,
    lineClamp,
    as,
    children,
    ...props 
  }, ref) => {
    // Determine the HTML element to render
    const Element = as || variantElementMap[variant || 'body'] || 'p'
    
    // Apply default weights based on variant if no weight is specified
    const effectiveWeight = weight || (() => {
      switch (variant) {
        case 'h1':
        case 'h2':
          return 'bold'
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return 'semibold'
        case 'overline':
          return 'semibold'
        case 'label':
          return 'medium'
        default:
          return 'normal'
      }
    })()
    
    return React.createElement(
      Element,
      {
        className: cn(
          typographyVariants({ 
            variant, 
            color, 
            weight: effectiveWeight, 
            align, 
            truncate, 
            lineClamp,
            className 
          })
        ),
        ref,
        ...props
      },
      children
    )
  }
)

Typography.displayName = 'Typography'

// Export variants for external use
export { typographyVariants }