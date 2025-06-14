import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../components/ui/Badge'
import { fn } from '@storybook/test'

// Mock icons for stories
const InfoIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile badge component with multiple variants, sizes, and interactive states. Built with class-variance-authority for consistent styling and accessibility features.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral', 'outline'],
      description: 'Visual style variant of the badge'
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of the badge'
    },
    shape: {
      control: 'select',
      options: ['rounded', 'pill', 'square'],
      description: 'Shape style of the badge'
    },
    animated: {
      control: 'boolean',
      description: 'Enable animation effects'
    },
    interactive: {
      control: 'boolean',
      description: 'Make badge interactive with hover effects'
    },
    icon: {
      control: false,
      description: 'Icon element to display before text'
    },
    children: {
      control: 'text',
      description: 'Badge content'
    },
    onRemove: {
      control: false,
      description: 'Callback for remove button'
    }
  },
  args: {
    children: 'Badge',
    onRemove: undefined
  }
}

export default meta
type Story = StoryObj<typeof meta>

// === BASIC VARIANTS ===
export const Default: Story = {
  args: {
    children: 'Default Badge'
  }
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary'
  }
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success'
  }
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning'
  }
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger'
  }
}

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info'
  }
}

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'Neutral'
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline'
  }
}

// === SIZE VARIANTS ===
export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4 flex-wrap">
      <Badge {...args} size="xs">Extra Small</Badge>
      <Badge {...args} size="sm">Small</Badge>
      <Badge {...args} size="md">Medium</Badge>
      <Badge {...args} size="lg">Large</Badge>
    </div>
  ),
  args: {
    variant: 'primary'
  },
  parameters: {
    docs: {
      description: {
        story: 'Different size variants from extra small to large. Use controls to change variant, shape, or interactive properties across all sizes.'
      }
    }
  }
}

// === SHAPE VARIANTS ===
export const AllShapes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4 flex-wrap">
      <Badge {...args} shape="rounded">Rounded</Badge>
      <Badge {...args} shape="pill">Pill</Badge>
      <Badge {...args} shape="square">Square</Badge>
    </div>
  ),
  args: {
    variant: 'success'
  },
  parameters: {
    docs: {
      description: {
        story: 'Different shape variants: rounded corners, pill-shaped, and square corners. Use controls to change variant, size, or interactive properties across all shapes.'
      }
    }
  }
}

// === COLOR SHOWCASE ===
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge {...args} variant="primary">Primary</Badge>
      <Badge {...args} variant="secondary">Secondary</Badge>
      <Badge {...args} variant="success">Success</Badge>
      <Badge {...args} variant="warning">Warning</Badge>
      <Badge {...args} variant="danger">Danger</Badge>
      <Badge {...args} variant="info">Info</Badge>
      <Badge {...args} variant="neutral">Neutral</Badge>
      <Badge {...args} variant="outline">Outline</Badge>
    </div>
  ),
  args: {
    size: 'sm'
  },
  parameters: {
    docs: {
      description: {
        story: 'All available color variants displayed together. Use controls to change size, shape, or interactive properties across all variants.'
      }
    }
  }
}

// === WITH ICONS ===
export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Badge variant="info" icon={<InfoIcon />}>Info</Badge>
      <Badge variant="warning" icon={<StarIcon />}>Featured</Badge>
      <Badge variant="success" icon={<UserIcon />}>User</Badge>
      <Badge variant="primary" icon={<StarIcon />} size="lg">Premium</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges with icons for enhanced visual communication.'
      }
    }
  }
}

// === INTERACTIVE BADGES ===
export const Interactive: Story = {
  args: {
    variant: 'primary',
    interactive: true,
    children: 'Click me',
    onClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive badge with hover effects and click handler.'
      }
    }
  }
}

export const InteractiveVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Badge variant="primary" interactive onClick={fn()}>Primary</Badge>
      <Badge variant="success" interactive onClick={fn()}>Success</Badge>
      <Badge variant="warning" interactive onClick={fn()}>Warning</Badge>
      <Badge variant="outline" interactive onClick={fn()}>Outline</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple interactive badge variants with hover effects.'
      }
    }
  }
}

// === ANIMATED BADGES ===
export const Animated: Story = {
  args: {
    variant: 'success',
    animated: true,
    children: 'Animated Badge'
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge with animation effects. Hover to see the shimmer effect.'
      }
    }
  }
}

export const AnimatedVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Badge variant="success" animated>Success</Badge>
      <Badge variant="warning" animated>Warning</Badge>
      <Badge variant="danger" animated>Danger</Badge>
      <Badge variant="primary" animated interactive onClick={fn()}>Interactive + Animated</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status badges with pulse animations and combined interactive + animated effects.'
      }
    }
  }
}

// === REMOVABLE BADGES ===
export const Removable: Story = {
  args: {
    variant: 'primary',
    children: 'Removable Badge',
    onRemove: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge with remove functionality. Click the X button to trigger remove callback.'
      }
    }
  }
}

export const RemovableVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Badge variant="primary" onRemove={fn()}>Primary</Badge>
      <Badge variant="success" onRemove={fn()}>Success</Badge>
      <Badge variant="warning" onRemove={fn()}>Warning</Badge>
      <Badge variant="outline" onRemove={fn()}>Outline</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple removable badge variants with remove buttons.'
      }
    }
  }
}

// === COMPLEX COMBINATIONS ===
export const WithIconAndRemove: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Badge 
        variant="success" 
        icon={<StarIcon />} 
        onRemove={fn()}
        size="md"
      >
        Premium User
      </Badge>
      <Badge 
        variant="info" 
        icon={<InfoIcon />} 
        onRemove={fn()}
        animated
        size="lg"
      >
        Important
      </Badge>
      <Badge 
        variant="warning" 
        icon={<UserIcon />} 
        onRemove={fn()}
        interactive
        onClick={fn()}
      >
        Admin
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex badges combining icons, remove functionality, and various features.'
      }
    }
  }
}

// === REAL-WORLD EXAMPLES ===
export const AnimeStatus: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="success" shape="pill">Watching</Badge>
      <Badge variant="primary" shape="pill">Completed</Badge>
      <Badge variant="warning" shape="pill">On Hold</Badge>
      <Badge variant="danger" shape="pill">Dropped</Badge>
      <Badge variant="neutral" shape="pill">Plan to Watch</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Anime watching status badges as used in the AnimeTrackr application.'
      }
    }
  }
}

export const UserScores: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="danger" icon={<StarIcon />} size="sm">3.2</Badge>
      <Badge variant="warning" icon={<StarIcon />} size="sm">5.8</Badge>
      <Badge variant="info" icon={<StarIcon />} size="sm">7.1</Badge>
      <Badge variant="success" icon={<StarIcon />} size="sm">8.9</Badge>
      <Badge variant="primary" icon={<StarIcon />} size="sm" animated>9.5</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: User rating badges with star icons and color-coded scores.'
      }
    }
  }
}

export const Genres: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap max-w-md">
      <Badge variant="outline" size="xs">Action</Badge>
      <Badge variant="outline" size="xs">Adventure</Badge>
      <Badge variant="outline" size="xs">Drama</Badge>
      <Badge variant="outline" size="xs">Romance</Badge>
      <Badge variant="outline" size="xs">Comedy</Badge>
      <Badge variant="outline" size="xs">Supernatural</Badge>
      <Badge variant="outline" size="xs">School</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Genre tags for anime as used in search and filtering.'
      }
    }
  }
}

// === RESPONSIVE SHOWCASE ===
export const ResponsiveExample: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-gray-600">Small Screen</h4>
        <Badge variant="primary" size="sm">Responsive Badge</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-gray-600">Medium Screen</h4>
        <Badge variant="success" size="md">Responsive Badge</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-gray-600">Large Screen</h4>
        <Badge variant="info" size="lg">Responsive Badge</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive behavior example showing different sizes across screen sizes.'
      }
    }
  }
}

// === ACCESSIBILITY EXAMPLE ===
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Semantic Usage</h4>
        <p className="text-sm text-gray-500 mb-2">
          Status: <Badge variant="success">Active</Badge> | 
          Priority: <Badge variant="warning">High</Badge>
        </p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">With Proper Labels</h4>
        <Badge 
          variant="danger" 
          onRemove={fn()} 
          aria-label="Remove error notification"
        >
          Error
        </Badge>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Keyboard Navigation</h4>
        <Badge 
          variant="primary" 
          interactive 
          onClick={fn()}
          onKeyDown={(e) => e.key === 'Enter' && fn()}
          tabIndex={0}
          role="button"
          aria-label="Interactive badge button"
        >
          Clickable Badge
        </Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility best practices including proper ARIA labels, keyboard navigation, and semantic usage.'
      }
    }
  }
}