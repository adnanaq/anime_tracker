import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from '../components/ui/Skeleton/Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Skeleton Component

A versatile skeleton loading placeholder component that creates animated shimmer effects while content is loading. Provides multiple variants and sizes to match different UI elements, maintaining visual consistency during loading states.

## Features

- **5 Specialized Variants**: Default, Card, Text, Avatar, Button shapes
- **4 Size Options**: Small, Medium, Large, Extra Large
- **Shimmer Animation**: Smooth left-to-right shimmer effect using CSS gradients
- **Accessibility**: Respects reduced motion preferences for users with vestibular disorders
- **Dark Mode Support**: Automatic adaptation with proper contrast ratios
- **Design Token Integration**: Uses centralized color and animation tokens
- **Performance Optimized**: Hardware-accelerated animations with efficient CSS

## Design System Integration

Built with:
- **Class Variance Authority (CVA)**: Consistent variant and size management
- **Design Tokens**: Centralized colors, shadows, and animation timing
- **Tailwind CSS**: Utility-first responsive design
- **Accessibility First**: Motion preferences and semantic HTML support

## Variant Guide

- **Default**: Generic rectangular placeholder
- **Card**: 3:4 aspect ratio for anime cards/posters
- **Text**: Single line text placeholder
- **Avatar**: Circular profile picture placeholder  
- **Button**: Button-shaped placeholder with proper padding

## Usage Examples

Perfect for loading states in:
- Anime cards and grids
- User profiles and avatars
- Text content and lists
- Buttons and interactive elements
- Any UI element requiring placeholder content
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'card', 'text', 'avatar', 'button'],
      description: 'Shape and styling variant of the skeleton'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the skeleton element'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling'
    },
    delay: {
      control: { type: 'range', min: 0, max: 2000, step: 100 },
      description: 'Animation delay in milliseconds'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// === BASIC VARIANTS ===

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md'
  }
}





// === SIZE VARIANTS ===

export const AllSizes: Story = {
  render: (args) => {
    const { size, ...otherArgs } = args
    return (
      <div className="flex items-end gap-4 flex-wrap">
        <div className="text-center">
          <Skeleton {...otherArgs} size="sm" />
          <p className="text-xs mt-2 text-gray-500">Small</p>
        </div>
        <div className="text-center">
          <Skeleton {...otherArgs} size="md" />
          <p className="text-xs mt-2 text-gray-500">Medium</p>
        </div>
        <div className="text-center">
          <Skeleton {...otherArgs} size="lg" />
          <p className="text-xs mt-2 text-gray-500">Large</p>
        </div>
        <div className="text-center">
          <Skeleton {...otherArgs} size="xl" />
          <p className="text-xs mt-2 text-gray-500">Extra Large</p>
        </div>
      </div>
    )
  },
  args: {
    variant: 'default'
  },
  parameters: {
    docs: {
      description: {
        story: 'All available size variants from small to extra large. Size is fixed to show all sizes, but you can control variant, className, and delay.'
      }
    }
  }
}

// === VARIANT SHOWCASE ===

export const AllVariants: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl">
        <div className="text-center">
          <Skeleton {...otherArgs} variant="default" />
          <p className="text-sm mt-2 text-gray-600">Default</p>
        </div>
        <div className="text-center">
          <Skeleton {...otherArgs} variant="card" />
          <p className="text-sm mt-2 text-gray-600">Card</p>
        </div>
        <div className="text-center">
          <Skeleton {...otherArgs} variant="text" />
          <p className="text-sm mt-2 text-gray-600">Text</p>
        </div>
        <div className="text-center">
          <Skeleton {...otherArgs} variant="avatar" />
          <p className="text-sm mt-2 text-gray-600">Avatar</p>
        </div>
        <div className="text-center">
          <Skeleton {...otherArgs} variant="button" />
          <p className="text-sm mt-2 text-gray-600">Button</p>
        </div>
      </div>
    )
  },
  args: {
    size: 'md'
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all skeleton variants with consistent sizing. Variant is fixed to show all variants, but you can control size, className, and delay.'
      }
    }
  }
}

// === ANIMATION SHOWCASE ===

export const AnimationDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Shimmer Animation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Smooth left-to-right shimmer effect using CSS gradients
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton variant="card" size="lg" />
          <Skeleton variant="default" size="lg" />
          <Skeleton variant="text" size="lg" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Staggered Delays</h3>
        <p className="text-sm text-gray-600 mb-4">
          Multiple skeletons with progressive animation delays
        </p>
        <div className="space-y-3">
          <Skeleton variant="text" delay={0} />
          <Skeleton variant="text" delay={200} />
          <Skeleton variant="text" delay={400} />
          <Skeleton variant="text" delay={600} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Animation examples showing the shimmer effect and how to create staggered loading sequences with delays.'
      }
    }
  }
}

// === REAL-WORLD EXAMPLES ===

export const ProfileLoading: Story = {
  render: () => (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton variant="avatar" size="lg" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" size="lg" />
          <Skeleton variant="text" size="sm" className="w-3/4" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-4/6" />
      </div>
      
      <div className="flex gap-3 mt-6">
        <Skeleton variant="button" size="sm" className="flex-1" />
        <Skeleton variant="button" size="sm" className="flex-1" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: User profile loading state combining avatar, text, and button skeletons in a typical card layout.'
      }
    }
  }
}

export const AnimeCardLoading: Story = {
  render: () => (
    <div className="max-w-xs mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <Skeleton variant="card" className="w-full" />
      
      <div className="p-4 space-y-3">
        <Skeleton variant="text" size="lg" />
        <Skeleton variant="text" size="sm" className="w-3/4" />
        
        <div className="flex items-center justify-between pt-2">
          <Skeleton variant="text" size="sm" className="w-16" />
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="avatar" size="sm" className="w-4 h-4" />
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Skeleton variant="button" size="sm" className="flex-1" />
          <Skeleton variant="button" size="sm" className="w-10" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Anime card loading state showing poster, title, metadata, ratings, and action buttons.'
      }
    }
  }
}

export const ContentListLoading: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Skeleton variant="avatar" size="lg" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" size="lg" />
            <Skeleton variant="text" size="sm" className="w-3/4" />
            <div className="flex items-center space-x-2">
              <Skeleton variant="text" size="sm" className="w-16" />
              <Skeleton variant="text" size="sm" className="w-20" />
              <Skeleton variant="text" size="sm" className="w-12" />
            </div>
          </div>
          <Skeleton variant="button" size="sm" />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Content list loading state with repeated items, each containing avatar, text content, and action buttons.'
      }
    }
  }
}

export const FormLoading: Story = {
  render: () => (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <Skeleton variant="text" size="xl" className="mb-6" />
      
      <div className="space-y-4">
        <div>
          <Skeleton variant="text" size="sm" className="w-20 mb-2" />
          <Skeleton variant="text" size="lg" className="w-full" />
        </div>
        
        <div>
          <Skeleton variant="text" size="sm" className="w-24 mb-2" />
          <Skeleton variant="text" size="lg" className="w-full" />
        </div>
        
        <div>
          <Skeleton variant="text" size="sm" className="w-32 mb-2" />
          <Skeleton variant="default" className="w-full h-24" />
        </div>
        
        <div className="flex items-center space-x-3 pt-4">
          <Skeleton variant="avatar" size="sm" className="w-4 h-4" />
          <Skeleton variant="text" size="sm" className="flex-1" />
        </div>
        
        <div className="flex gap-3 pt-6">
          <Skeleton variant="button" size="lg" className="flex-1" />
          <Skeleton variant="button" size="lg" className="flex-1" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Form loading state with labels, inputs, textarea, checkbox, and submit buttons showing typical form layout patterns.'
      }
    }
  }
}

// === CUSTOMIZATION EXAMPLES ===

export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Colors & Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton 
            variant="card" 
            className="bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700" 
          />
          <Skeleton 
            variant="card" 
            className="bg-gradient-to-r from-green-200 to-green-300 dark:from-green-800 dark:to-green-700" 
          />
          <Skeleton 
            variant="card" 
            className="bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-700" 
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Shapes & Sizes</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <Skeleton className="w-20 h-20 rounded-none" />
          <Skeleton className="w-16 h-16 rounded-full border-4 border-gray-300" />
          <Skeleton className="w-32 h-8 rounded-full" />
          <Skeleton className="w-24 h-12 rounded-3xl" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom styling examples showing how to override colors, shapes, and sizes using the className prop for specialized use cases.'
      }
    }
  }
}

// === ACCESSIBILITY SHOWCASE ===

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Reduced Motion Support</h3>
        <p className="text-sm text-gray-600 mb-4">
          Animations respect user's motion preferences. Set your system to "Reduce motion" to see static skeletons.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="default" size="lg" />
          <Skeleton variant="text" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Screen Reader Friendly</h3>
        <p className="text-sm text-gray-600 mb-4">
          Proper semantic structure and ARIA attributes for assistive technology
        </p>
        <div className="space-y-3">
          <Skeleton variant="text" aria-label="Loading article title" />
          <Skeleton variant="text" className="w-3/4" aria-label="Loading article subtitle" />
          <Skeleton variant="default" className="h-32" aria-label="Loading article content" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including reduced motion support for users with vestibular disorders and proper ARIA labeling for screen readers.'
      }
    }
  }
}

// === RESPONSIVE BEHAVIOR ===

export const ResponsiveExample: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Mobile Layout</h3>
        <div className="max-w-sm">
          <div className="space-y-3">
            <Skeleton variant="text" size="xl" />
            <Skeleton variant="text" size="sm" className="w-3/4" />
            <Skeleton variant="card" className="w-32 h-48 mx-auto" />
            <div className="flex gap-2">
              <Skeleton variant="button" size="sm" className="flex-1" />
              <Skeleton variant="button" size="sm" className="flex-1" />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Desktop Layout</h3>
        <div className="max-w-4xl">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <Skeleton variant="card" />
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
            <div className="space-y-3">
              <Skeleton variant="card" />
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
            <div className="space-y-3">
              <Skeleton variant="card" />
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive layout examples showing how skeleton components adapt to different screen sizes and layout patterns.'
      }
    }
  }
}

// === PLAYGROUND ===

export const Playground: Story = {
  args: {
    variant: 'default',
    size: 'md',
    className: '',
    delay: 0
  },
  parameters: {
    docs: {
      description: {
        story: `
**Full Control Playground**

This story gives you complete control over every Skeleton property. Perfect for:
- Testing different variants and sizes
- Experimenting with custom styling
- Testing animation delays
- Interactive development and debugging

**Available Controls:**
- \`variant\`: Shape variant (default, card, text, avatar, button)
- \`size\`: Size variant (sm, md, lg, xl)
- \`className\`: Custom CSS classes for styling
- \`delay\`: Animation delay in milliseconds

**Usage:** Change any control to see immediate effects. Unlike showcase stories that demonstrate specific features, this playground lets you test any combination of properties.
        `
      }
    }
  }
}