import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';
import { StatusBadgeDropdown } from '../components/ui/StatusBadgeDropdown';
import { Badge } from '../components/ui/Badge';
import type { AnimeStatus } from '../components/ui/StatusBadgeDropdown';

const meta: Meta<typeof StatusBadgeDropdown> = {
  title: 'UI/StatusBadgeDropdown',
  component: StatusBadgeDropdown,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a1a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 max-w-md">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    currentStatus: {
      control: 'select',
      options: ['plan_to_watch', 'currently_watching', 'completed', 'on_hold', 'dropped', 'not_in_list'],
      description: 'Current anime status',
    },
    availableStatuses: {
      control: 'object',
      description: 'Array of available status options',
    },
    onStatusChange: {
      action: 'status-changed',
      description: 'Callback fired when status is changed',
    },
    isAuthenticated: {
      control: 'boolean',
      description: 'Whether user is authenticated',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
      description: 'Badge size',
    },
    position: {
      control: 'select',
      options: ['auto', 'top', 'bottom'],
      description: 'Dropdown position',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    currentStatus: 'plan_to_watch',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
};

// Interactive story with state management
export const Interactive: Story = {
  render: () => {
    const [currentStatus, setCurrentStatus] = useState<AnimeStatus>('plan_to_watch');
    
    const handleStatusChange = async (newStatus: AnimeStatus) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStatus(newStatus);
      fn()(newStatus); // Log the action for Storybook
    };

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Current Status: <strong>{currentStatus.replace(/_/g, ' ')}</strong>
        </div>
        <StatusBadgeDropdown
          currentStatus={currentStatus}
          source="mal"
          onStatusChange={handleStatusChange}
          isAuthenticated={true}
        />
        <div className="text-xs text-gray-500">
          Click the badge and select a new status to see it update!
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing status updates. Click the badge and select a new status to see the badge update with loading animation.',
      },
    },
  },
};

// All status variants
export const PlanToWatch: Story = {
  args: {
    currentStatus: 'plan_to_watch',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Status badge for anime planned to watch.',
      },
    },
  },
};

export const CurrentlyWatching: Story = {
  args: {
    currentStatus: 'currently_watching',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Status badge for currently watching anime.',
      },
    },
  },
};

export const Completed: Story = {
  args: {
    currentStatus: 'completed',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Status badge for completed anime.',
      },
    },
  },
};

export const OnHold: Story = {
  args: {
    currentStatus: 'on_hold',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Status badge for anime on hold.',
      },
    },
  },
};

export const Dropped: Story = {
  args: {
    currentStatus: 'dropped',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Status badge for dropped anime.',
      },
    },
  },
};

export const NotInList: Story = {
  args: {
    currentStatus: 'not_in_list',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Status badge for anime not in list.',
      },
    },
  },
};

// Authentication states
export const NotAuthenticated: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="on_hold" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'completed',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Non-interactive badges when user is not authenticated. No click functionality, displayed as simple pill badges.',
      },
    },
  },
};

export const AuthenticatedInteractive: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="currently_watching" source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'plan_to_watch',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive pill-shaped badges with smooth dropdown animation for authenticated users.',
      },
    },
  },
};

// Loading states
export const Loading: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="completed" isLoading={false} source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'currently_watching',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state with pulsing animation and disabled interaction. Shows one service loading while other is normal.',
      },
    },
  },
};

export const UpdatingStatus: Story = {
  render: () => {
    const [malStatus, setMalStatus] = useState<AnimeStatus>('plan_to_watch');
    const [anilistStatus, setAnilistStatus] = useState<AnimeStatus>('currently_watching');
    
    const handleMalStatusChange = async (newStatus: AnimeStatus) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMalStatus(newStatus);
    };

    const handleAnilistStatusChange = async (newStatus: AnimeStatus) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnilistStatus(newStatus);
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            MAL: <strong>{malStatus.replace(/_/g, ' ')}</strong>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            AniList: <strong>{anilistStatus.replace(/_/g, ' ')}</strong>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
            <StatusBadgeDropdown
              currentStatus={malStatus}
              source="mal"
              onStatusChange={handleMalStatusChange}
              isAuthenticated={true}
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
            <StatusBadgeDropdown
              currentStatus={anilistStatus}
              source="anilist"
              onStatusChange={handleAnilistStatusChange}
              isAuthenticated={true}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Select a new status on either service to see the 2-second loading animation
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates updating state when status change is in progress. Each service has independent 2-second loading animations.',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="dropped" disabled={false} source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'completed',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows disabled state (MAL) vs enabled state (AniList) for comparison.',
      },
    },
  },
};

// Size variations
export const SizeXS: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="completed" source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'currently_watching',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
    size: 'xs',
  },
  parameters: {
    docs: {
      description: {
        story: 'Extra small size variant on both services.',
      },
    },
  },
};

export const SizeSmall: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="on_hold" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'currently_watching',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small size variant (default) on both services.',
      },
    },
  },
};

export const SizeMedium: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="plan_to_watch" source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'currently_watching',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium size variant on both services.',
      },
    },
  },
};

// Custom available statuses
export const LimitedOptions: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="completed" source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'plan_to_watch',
    source: 'mal',
    availableStatuses: ['plan_to_watch', 'currently_watching', 'completed'] as AnimeStatus[],
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom limited set of available status options on both services.',
      },
    },
  },
};

export const TwoOptionsOnly: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="completed" source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'plan_to_watch',
    source: 'mal',
    availableStatuses: ['plan_to_watch', 'completed'] as AnimeStatus[],
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal set with only two status options on both services.',
      },
    },
  },
};

// Error handling
export const StatusChangeError: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="completed" onStatusChange={fn()} source="anilist" />
      </div>
      <div className="text-xs text-gray-500 mt-2">
        MAL will simulate an error, AniList will work normally
      </div>
    </div>
  ),
  args: {
    currentStatus: 'plan_to_watch',
    source: 'mal',
    onStatusChange: async () => {
      // Simulate API error
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('Failed to update status');
    },
    isAuthenticated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error handling when status change fails. MAL badge will error, AniList works normally.',
      },
    },
  },
};

// Dark theme showcase
export const DarkTheme: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-300 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-300 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="completed" source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'currently_watching',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-gray-900 rounded-lg">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Status dropdowns in dark theme environment for both services.',
      },
    },
  },
};

// Light theme showcase
export const LightTheme: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="on_hold" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'completed',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-white rounded-lg border">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'light',
    },
    docs: {
      description: {
        story: 'Status dropdowns in light theme environment for both services.',
      },
    },
  },
};

// Multiple instances
export const MultipleStatuses: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">MyAnimeList Statuses</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Plan to Watch:</span>
            <StatusBadgeDropdown
              currentStatus="plan_to_watch"
              source="mal"
              onStatusChange={fn()}
              isAuthenticated={true}
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Currently Watching:</span>
            <StatusBadgeDropdown
              currentStatus="currently_watching"
              source="mal"
              onStatusChange={fn()}
              isAuthenticated={true}
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Completed:</span>
            <StatusBadgeDropdown
              currentStatus="completed"
              source="mal"
              onStatusChange={fn()}
              isAuthenticated={true}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AniList Statuses</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">On Hold:</span>
            <StatusBadgeDropdown
              currentStatus="on_hold"
              source="anilist"
              onStatusChange={fn()}
              isAuthenticated={true}
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Dropped:</span>
            <StatusBadgeDropdown
              currentStatus="dropped"
              source="anilist"
              onStatusChange={fn()}
              isAuthenticated={true}
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">Not in List:</span>
            <StatusBadgeDropdown
              currentStatus="not_in_list"
              source="anilist"
              onStatusChange={fn()}
              isAuthenticated={true}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple status dropdowns showing all available statuses organized by service (MyAnimeList and AniList).',
      },
    },
  },
};

// Animation showcase
export const AnimationShowcase: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-lg font-semibold text-white mb-2">
          Ripple Animation Demo
        </div>
        <div className="text-sm text-gray-400 mb-6">
          Click either badge to see the beautiful water ripple effect ✨<br/>
          Each option appears sequentially like gentle water droplets
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm font-medium text-gray-300 w-20">MyAnimeList:</span>
          <StatusBadgeDropdown {...args} source="mal" />
        </div>
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm font-medium text-gray-300 w-20">AniList:</span>
          <StatusBadgeDropdown {...args} currentStatus="currently_watching" source="anilist" />
        </div>
      </div>
    </div>
  ),
  args: {
    currentStatus: 'plan_to_watch',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  decorators: [
    (Story) => (
      <div className="p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Showcases the beautiful ripple/water effect animation on both services. Each option appears sequentially with smooth transitions.',
      },
    },
  },
};

// Full options showcase
export const FullOptionsRipple: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4">
        Maximum ripple effect with all 5 status options - watch the wave cascade!
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
          <StatusBadgeDropdown {...args} source="mal" />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
          <StatusBadgeDropdown {...args} currentStatus="plan_to_watch" source="anilist" />
        </div>
      </div>
    </div>
  ),
  args: {
    currentStatus: 'not_in_list',
    source: 'mal',
    availableStatuses: ['plan_to_watch', 'currently_watching', 'completed', 'on_hold', 'dropped', 'not_in_list'] as AnimeStatus[],
    onStatusChange: fn(),
    isAuthenticated: true,
  },
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows the full ripple effect with all 5 status options appearing in sequence on both services. Perfect for demonstrating the water-like cascade animation.',
      },
    },
  },
};

// Interactive playground
export const InteractivePlayground: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">MyAnimeList:</span>
        <StatusBadgeDropdown {...args} source="mal" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">AniList:</span>
        <StatusBadgeDropdown {...args} currentStatus="dropped" source="anilist" />
      </div>
    </div>
  ),
  args: {
    currentStatus: 'plan_to_watch',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
    isLoading: false,
    disabled: false,
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test all component props and states on both services.',
      },
    },
  },
};

// Alignment test with regular badges
export const AlignmentTest: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
          🧪 Alignment Test: StatusBadgeDropdown vs Regular Badges
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Testing vertical alignment when StatusBadgeDropdown is placed alongside regular Badge components in a flex container.
        </p>
      </div>
      
      {/* Test: Same size badges in flex container */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Size "sm" badges in flex container (as used in AnimeInfoCard):
        </h4>
        <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <StatusBadgeDropdown 
            {...args} 
            currentStatus="watching"
            source="mal" 
            size="sm"
            shape="rounded"
          />
          <Badge variant="warning" size="sm" shape="rounded" icon="⭐">
            9.0
          </Badge>
          <Badge variant="info" size="sm" shape="rounded" icon="👤">
            8/10
          </Badge>
          <Badge variant="secondary" size="sm" shape="rounded" icon="📺">
            TV
          </Badge>
        </div>
      </div>

      {/* Test: Different sizes for comparison */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Size "xs" badges in flex container (as used in BaseAnimeCard overlays):
        </h4>
        <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <Badge variant="warning" size="xs" shape="pill" icon="⭐">
            9.0
          </Badge>
          <StatusBadgeDropdown 
            {...args} 
            currentStatus="completed"
            source="anilist" 
            size="xs"
            shape="pill"
          />
          <Badge variant="secondary" size="xs" shape="pill">
            10/10
          </Badge>
          <Badge variant="danger" size="xs" shape="pill">
            TV
          </Badge>
        </div>
      </div>

      {/* Visual reference lines for alignment */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          With alignment reference lines:
        </h4>
        <div className="relative p-4 bg-gray-100 dark:bg-gray-800 rounded">
          {/* Baseline reference lines */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div className="w-full border-t border-red-300 opacity-50"></div>
          </div>
          <div className="absolute inset-0 flex items-start pt-2 pointer-events-none">
            <div className="w-full border-t border-blue-300 opacity-50"></div>
          </div>
          <div className="absolute inset-0 flex items-end pb-2 pointer-events-none">
            <div className="w-full border-t border-blue-300 opacity-50"></div>
          </div>
          
          <div className="flex flex-wrap gap-2 relative z-10">
            <Badge variant="warning" size="sm" shape="rounded" icon="⭐">
              9.0
            </Badge>
            <StatusBadgeDropdown 
              {...args} 
              currentStatus="watching"
              source="mal" 
              size="sm"
              shape="rounded"
            />
            <Badge variant="info" size="sm" shape="rounded" icon="👤">
              8/10
            </Badge>
            <Badge variant="secondary" size="sm" shape="rounded" icon="📺">
              TV
            </Badge>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Red line = center, Blue lines = top/bottom bounds. All badges should align to center line.
        </p>
      </div>
    </div>
  ),
  args: {
    currentStatus: 'watching',
    source: 'mal',
    onStatusChange: fn(),
    isAuthenticated: true,
    isLoading: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Visual test for alignment issues between StatusBadgeDropdown and regular Badge components in flex containers.',
      },
    },
  },
};