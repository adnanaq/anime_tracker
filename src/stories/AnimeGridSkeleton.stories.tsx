import type { Meta, StoryObj } from '@storybook/react'
import { AnimeGridSkeleton } from '../components/ui/AnimeGridSkeleton/AnimeGridSkeleton'

const meta: Meta<typeof AnimeGridSkeleton> = {
  title: 'UI/AnimeGridSkeleton',
  component: AnimeGridSkeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# AnimeGridSkeleton Component

A specialized skeleton loading component designed for anime grid layouts. Provides animated placeholders while anime data is being fetched, maintaining visual consistency and user engagement during loading states.

## Features

- **Responsive Grid Layout**: Adapts from 2 columns on mobile to 5 columns on xl screens
- **Staggered Animations**: Individual cards animate in with progressive delays for smooth visual flow
- **Optional Detail Skeletons**: Toggle detailed information skeletons below cards (title, subtitle, metadata)
- **Multiple Count Options**: Display 1-20+ skeleton cards as needed
- **Consistent Styling**: Uses design tokens and matches real anime card proportions
- **Accessibility**: Respects reduced motion preferences and provides proper semantic structure
- **Dark Mode Support**: Automatic dark mode adaptation with proper contrast

## Design System Integration

Uses the base Skeleton component with:
- Card variant for 3:4 aspect ratio anime posters
- Shimmer animations with design token colors
- Responsive breakpoints matching the actual anime grid
- Consistent spacing and shadows

## Usage Examples

Perfect for loading states in:
- Dashboard anime sections
- Advanced search results
- Seasonal anime browsing
- Anime schedule/calendar views
- Any anime grid or list interface
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'range', min: 1, max: 20, step: 1 },
      description: 'Number of skeleton cards to display'
    },
    showDetails: {
      control: 'boolean',
      description: 'Show detailed skeleton information below cards (title, subtitle, metadata)'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the grid container'
    },
    cardClassName: {
      control: 'text',
      description: 'Additional CSS classes for individual skeleton cards'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// === BASIC VARIANTS ===

export const Default: Story = {
  args: {
    count: 10,
    showDetails: false
  }
}

export const WithDetails: Story = {
  render: (args) => {
    const { showDetails, ...otherArgs } = args
    return <AnimeGridSkeleton {...otherArgs} showDetails={true} />
  },
  args: {
    count: 10
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid skeleton with detailed information placeholders below each card. ShowDetails is fixed to true, but you can control count, className, and cardClassName.'
      }
    }
  }
}

export const WithoutDetails: Story = {
  render: (args) => {
    const { showDetails, ...otherArgs } = args
    return <AnimeGridSkeleton {...otherArgs} showDetails={false} />
  },
  args: {
    count: 10
  },
  parameters: {
    docs: {
      description: {
        story: 'Clean grid skeleton without detail placeholders. ShowDetails is fixed to false, but you can control count, className, and cardClassName.'
      }
    }
  }
}

// === COUNT VARIANTS ===

export const SmallGrid: Story = {
  render: (args) => {
    const { count, ...otherArgs } = args
    return <AnimeGridSkeleton {...otherArgs} count={4} />
  },
  args: {
    showDetails: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Small grid with 4 skeleton cards. Count is fixed to 4, but you can control showDetails, className, and cardClassName.'
      }
    }
  }
}

export const MediumGrid: Story = {
  render: (args) => {
    const { count, ...otherArgs } = args
    return <AnimeGridSkeleton {...otherArgs} count={8} />
  },
  args: {
    showDetails: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium grid with 8 skeleton cards. Count is fixed to 8, but you can control showDetails, className, and cardClassName.'
      }
    }
  }
}

export const LargeGrid: Story = {
  render: (args) => {
    const { count, ...otherArgs } = args
    return <AnimeGridSkeleton {...otherArgs} count={15} />
  },
  args: {
    showDetails: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Large grid with 15 skeleton cards. Count is fixed to 15, but you can control showDetails, className, and cardClassName.'
      }
    }
  }
}

// === RESPONSIVE SHOWCASE ===

export const ResponsiveBehavior: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Mobile (2 columns)</h3>
        <div className="max-w-sm">
          <AnimeGridSkeleton count={6} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Tablet (3 columns)</h3>
        <div className="max-w-2xl">
          <AnimeGridSkeleton count={9} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Desktop (4-5 columns)</h3>
        <div className="max-w-6xl">
          <AnimeGridSkeleton count={12} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates responsive grid behavior at different screen sizes. The grid automatically adjusts from 2 columns on mobile to 5 columns on extra large screens.'
      }
    }
  }
}

// === ANIMATION SHOWCASE ===

export const AnimationTiming: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Staggered Animation Delays</h3>
        <p className="text-sm text-gray-600 mb-4">
          Each card animates in with a progressive delay (150ms * index) for smooth visual flow
        </p>
        <AnimeGridSkeleton count={8} />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">With Detail Animation Layers</h3>
        <p className="text-sm text-gray-600 mb-4">
          Details animate in after the card with additional staggered delays
        </p>
        <AnimeGridSkeleton count={6} showDetails />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows the staggered animation system where each skeleton card appears with a progressive delay, creating a smooth loading experience.'
      }
    }
  }
}

// === REAL-WORLD EXAMPLES ===

export const DashboardLoading: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Currently Watching</h2>
        <AnimeGridSkeleton count={6} showDetails />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Recently Updated</h2>
        <AnimeGridSkeleton count={8} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Dashboard loading state with multiple anime sections, showing how the skeleton maintains the layout structure while data loads.'
      }
    }
  }
}

export const SearchResultsLoading: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Search Results</h2>
        <div className="text-sm text-gray-500">Loading anime...</div>
      </div>
      <AnimeGridSkeleton count={12} showDetails />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Advanced search results loading state, showing detailed skeletons for comprehensive anime information display.'
      }
    }
  }
}

export const SeasonalAnimeLoading: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Fall 2024 Anime</h2>
        <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          Loading...
        </div>
      </div>
      <AnimeGridSkeleton count={16} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Seasonal anime browsing page loading state, showing a larger grid for comprehensive seasonal listings.'
      }
    }
  }
}

export const AnimeScheduleLoading: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">This Week\'s Schedule</h2>
        <p className="text-gray-600">Loading anime airing times...</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">Monday</h3>
          <AnimeGridSkeleton count={4} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Tuesday</h3>
          <AnimeGridSkeleton count={3} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Weekly anime schedule loading state, showing how skeleton grids work within structured layouts like calendars.'
      }
    }
  }
}

// === CUSTOMIZATION EXAMPLES ===

export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Grid Spacing</h3>
        <AnimeGridSkeleton 
          count={6} 
          className="gap-8" 
          cardClassName="ring-2 ring-blue-200" 
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Layout</h3>
        <AnimeGridSkeleton 
          count={9} 
          className="gap-2" 
          cardClassName="rounded-sm" 
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of custom styling using className and cardClassName props to modify grid spacing, card appearance, and layout density.'
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
          Animations respect user's motion preferences. Set your system to "Reduce motion" to see the difference.
        </p>
        <AnimeGridSkeleton count={6} showDetails />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Screen Reader Friendly</h3>
        <p className="text-sm text-gray-600 mb-4">
          Proper semantic structure and ARIA attributes for accessibility
        </p>
        <AnimeGridSkeleton count={4} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including reduced motion support for users with vestibular disorders and proper semantic structure for screen readers.'
      }
    }
  }
}

// === LOADING STATE PATTERNS ===

export const LoadingPatterns: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Preview (No Details)</h3>
        <p className="text-sm text-gray-600 mb-4">Fast loading for basic browsing</p>
        <AnimeGridSkeleton count={8} showDetails={false} />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed View (With Info)</h3>
        <p className="text-sm text-gray-600 mb-4">Comprehensive loading for detailed pages</p>
        <AnimeGridSkeleton count={6} showDetails={true} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different loading patterns for various use cases: quick preview mode for browsing vs detailed mode for comprehensive information display.'
      }
    }
  }
}

// === PLAYGROUND ===

export const Playground: Story = {
  args: {
    count: 10,
    showDetails: false,
    className: '',
    cardClassName: ''
  },
  parameters: {
    docs: {
      description: {
        story: `
**Full Control Playground**

This story gives you complete control over every AnimeGridSkeleton property. Perfect for:
- Testing different grid sizes and layouts
- Experimenting with custom styling
- Comparing detail vs no-detail modes
- Interactive development and debugging

**Available Controls:**
- \`count\`: Number of skeleton cards (1-20+)
- \`showDetails\`: Toggle detailed information skeletons
- \`className\`: Custom CSS classes for grid container
- \`cardClassName\`: Custom CSS classes for individual cards

**Usage:** Change any control to see immediate effects. Unlike showcase stories that demonstrate specific features, this playground lets you test any combination of properties.
        `
      }
    }
  }
}