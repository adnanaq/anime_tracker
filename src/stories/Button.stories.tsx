import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../components/ui/Button'
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  StarIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PencilSquareIcon as EditIcon,
  ShareIcon,
  ArrowDownTrayIcon as DownloadIcon,
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is a versatile, accessible button with multiple variants, sizes, and interactive features.

## Features
- **8 Variants**: Primary, Secondary, Success, Warning, Danger, Ghost, Outline, Link
- **5 Sizes**: xs, sm, md, lg, xl
- **Interactive States**: Loading, Disabled, Animated, Hover effects
- **Icon Support**: Left icons, right icons, icon-only buttons
- **Polymorphic**: Can render as different HTML elements
- **Accessibility**: Full keyboard navigation and ARIA support
- **Animation**: Optional hover and click animations with ripple effects

## Design System Integration
- Uses CVA (Class Variance Authority) for consistent variant management
- Integrates with design tokens for consistent theming
- Supports dark mode with automatic color adjustments
- Responsive design with mobile-optimized sizing

## Usage Examples
Perfect for AnimeTrackr actions like adding to watchlist, rating anime, navigation, and form submissions.
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost', 'outline', 'link'],
      description: 'Visual style variant'
    },
    size: {
      control: 'select', 
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Button size'
    },
    animated: {
      control: 'boolean',
      description: 'Enable hover and click animations'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interaction'
    },
    leftIcon: {
      control: false,
      description: 'Icon to display on the left'
    },
    rightIcon: {
      control: false,
      description: 'Icon to display on the right'
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function'
    },
    children: {
      control: 'text',
      description: 'Button content/text'
    }
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// === BASIC VARIANTS ===

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
}

// === SIZE VARIANTS ===

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button {...args} size="xs">Extra Small</Button>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
      <Button {...args} size="xl">Extra Large</Button>
    </div>
  ),
  args: {
    variant: 'primary'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all available button sizes from xs to xl. Use controls to change variant, animation, or other properties across all sizes.'
      }
    }
  }
}

export const AllVariants: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="success">Success</Button>
      <Button {...args} variant="warning">Warning</Button>
      <Button {...args} variant="danger">Danger</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
  args: {
    size: 'md'
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all button variants with consistent sizing. Use controls to change size, animation, or other properties across all variants.'
      }
    }
  }
}

// === INTERACTIVE FEATURES ===

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <Button {...args} leftIcon={<StarIcon className="h-4 w-4" />}>
        Add to Favorites
      </Button>
      <Button {...args} variant="success" rightIcon={<ChevronRightIcon className="h-4 w-4" />}>
        Continue
      </Button>
      <Button {...args} variant="outline" leftIcon={<DownloadIcon className="h-4 w-4" />} rightIcon={<ChevronDownIcon className="h-4 w-4" />}>
        Download
      </Button>
      <Button {...args} variant="ghost" leftIcon={<ShareIcon className="h-4 w-4" />}>
        Share
      </Button>
    </div>
  ),
  args: {
    size: 'md'
  },
  parameters: {
    docs: {
      description: {
        story: 'Buttons with left icons, right icons, and both icons combined. Use controls to change size, animation, or other properties across all icon buttons.'
      }
    }
  }
}

export const IconOnly: Story = {
  render: (args) => (
    <div className="flex gap-2 items-center">
      <Button {...args} size="xs" leftIcon={<HeartIcon className="h-3 w-3" />} aria-label="Like" />
      <Button {...args} size="sm" leftIcon={<BookmarkIcon className="h-4 w-4" />} aria-label="Bookmark" />
      <Button {...args} size="md" leftIcon={<PlayIcon className="h-5 w-5" />} aria-label="Play" />
      <Button {...args} size="lg" leftIcon={<EditIcon className="h-6 w-6" />} aria-label="Edit" />
      <Button {...args} size="xl" leftIcon={<TrashIcon className="h-7 w-7" />} variant="danger" aria-label="Delete" />
    </div>
  ),
  args: {
    variant: 'primary'
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons with proper ARIA labels for accessibility. Use controls to change variant, animation, or other properties across all icon-only buttons.'
      }
    }
  }
}

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button loading>Loading...</Button>
      <Button variant="secondary" loading>Processing</Button>
      <Button variant="success" loading>Saving</Button>
      <Button variant="outline" loading leftIcon={<DownloadIcon className="h-4 w-4" />}>
        Downloading
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons in loading state with spinner animation. Content becomes transparent while loading.'
      }
    }
  }
}

export const Animated: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button animated>Animated Button</Button>
      <Button variant="secondary" animated>Hover Me</Button>
      <Button variant="success" animated leftIcon={<StarIcon className="h-4 w-4" />}>
        Click for Ripple
      </Button>
      <Button variant="outline" animated>
        Shimmer Effect
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with animation effects including shimmer on hover and ripple on click.'
      }
    }
  }
}

export const Interactive: Story = {
  args: {
    variant: 'primary',
    animated: true,
    onClick: () => alert('Button clicked!'),
    children: 'Click me',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive button with click handler and animations.'
      }
    }
  }
}

// === STATES ===

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <span className="w-20 text-sm">Normal:</span>
        <Button>Normal Button</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex gap-4 items-center">
        <span className="w-20 text-sm">Disabled:</span>
        <Button disabled>Disabled Button</Button>
        <Button variant="outline" disabled>Disabled Outline</Button>
        <Button variant="ghost" disabled>Disabled Ghost</Button>
      </div>
      <div className="flex gap-4 items-center">
        <span className="w-20 text-sm">Loading:</span>
        <Button loading>Loading Button</Button>
        <Button variant="outline" loading>Loading Outline</Button>
        <Button variant="ghost" loading>Loading Ghost</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button states: normal, disabled, and loading.'
      }
    }
  }
}

// === POLYMORPHIC USAGE ===

export const AsLink: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button as="a" href="#" variant="primary">
        Link Button
      </Button>
      <Button as="a" href="#" variant="outline">
        Outline Link
      </Button>
      <Button as="a" href="#" variant="link">
        Text Link
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons rendered as anchor tags using the polymorphic "as" prop.'
      }
    }
  }
}

// === LAYOUT VARIANTS ===

export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-3">
      <Button fullWidth variant="primary">
        Full Width Primary
      </Button>
      <Button fullWidth variant="outline">
        Full Width Outline
      </Button>
      <Button fullWidth variant="ghost" leftIcon={<PlusIcon className="h-4 w-4" />}>
        Full Width with Icon
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-width buttons that expand to fit their container.'
      }
    }
  }
}

// === REAL-WORLD EXAMPLES ===

export const AnimeActions: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Anime Detail Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" leftIcon={<PlusIcon className="h-4 w-4" />}>
            Add to List
          </Button>
          <Button variant="success" leftIcon={<StarIcon className="h-4 w-4" />}>
            Rate Anime
          </Button>
          <Button variant="outline" leftIcon={<HeartIcon className="h-4 w-4" />}>
            Add to Favorites
          </Button>
          <Button variant="ghost" leftIcon={<ShareIcon className="h-4 w-4" />}>
            Share
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Playback Controls</h3>
        <div className="flex gap-2">
          <Button size="sm" leftIcon={<PlayIcon className="h-4 w-4" />} variant="success">
            Play
          </Button>
          <Button size="sm" leftIcon={<PauseIcon className="h-4 w-4" />} variant="warning">
            Pause
          </Button>
          <Button size="sm" leftIcon={<DownloadIcon className="h-4 w-4" />} variant="outline">
            Download
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Status Updates</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="xs" variant="success">Watching</Button>
          <Button size="xs" variant="primary">Completed</Button>
          <Button size="xs" variant="warning">On Hold</Button>
          <Button size="xs" variant="danger">Dropped</Button>
          <Button size="xs" variant="outline">Plan to Watch</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world usage examples from AnimeTrackr application scenarios.'
      }
    }
  }
}

export const FormButtons: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Form Actions</h3>
        <div className="flex gap-3">
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button variant="danger" type="button">
            Delete
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Search & Navigation</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="primary" rightIcon={<ChevronRightIcon className="h-4 w-4" />}>
            Search Anime
          </Button>
          <Button variant="outline">
            Advanced Search
          </Button>
          <Button variant="ghost" leftIcon={<ChevronDownIcon className="h-4 w-4" />}>
            Load More
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common form and navigation button patterns.'
      }
    }
  }
}

// === ACCESSIBILITY ===

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Keyboard Navigation</h3>
        <div className="flex gap-3">
          <Button tabIndex={0}>Focusable</Button>
          <Button tabIndex={0} variant="outline">Tab Navigation</Button>
          <Button tabIndex={0} variant="ghost">Press Enter/Space</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">ARIA Labels</h3>
        <div className="flex gap-3">
          <Button 
            leftIcon={<HeartIcon className="h-4 w-4" />}
            aria-label="Add to favorites"
            title="Add this anime to your favorites"
          />
          <Button 
            leftIcon={<StarIcon className="h-4 w-4" />}
            aria-label="Rate anime"
            aria-describedby="rating-help"
          />
          <Button 
            variant="danger"
            leftIcon={<TrashIcon className="h-4 w-4" />}
            aria-label="Delete from watchlist"
            role="button"
          />
        </div>
        <p id="rating-help" className="text-sm text-gray-600 mt-2">
          Click to open rating dialog
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including proper ARIA labels, keyboard navigation, and screen reader support.'
      }
    }
  }
}

// === RESPONSIVE DESIGN ===

export const ResponsiveExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button fullWidth size="sm">Mobile: Small</Button>
        <Button fullWidth size="md">Tablet: Medium</Button>
        <Button fullWidth size="lg">Desktop: Large</Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" className="sm:flex-1">
          Responsive Primary
        </Button>
        <Button variant="outline" className="sm:flex-1">
          Responsive Outline
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive button layouts that adapt to different screen sizes.'
      }
    }
  }
}