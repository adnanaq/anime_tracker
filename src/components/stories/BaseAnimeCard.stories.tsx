import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BaseAnimeCard } from '../ui/BaseAnimeCard';
import { AnimeBase } from '../../types/anime';

const mockAnime: AnimeBase = {
  id: 1,
  title: 'Attack on Titan',
  coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXOQOoS9.jpg',
  score: 9.0,
  format: 'TV',
  year: 2013,
  status: 'FINISHED',
  episodes: 25,
  genres: ['Action', 'Drama', 'Fantasy'],
  description: 'Humanity fights for survival against the giant humanoid Titans who have brought humanity to the brink of extinction.',
  season: 'SPRING',
  userStatus: 'COMPLETED'
};

const meta: Meta<typeof BaseAnimeCard> = {
  title: 'UI/BaseAnimeCard',
  component: BaseAnimeCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BaseAnimeCard** is a foundational empty card component for the ExpandableGrid refactoring.

## Current Implementation
This is a **minimal empty card** with exact ExpandableGrid dimensions:
- Fixed size: 200px × 370px  
- Gray background (\`bg-gray-200\`) for visibility
- Border (\`border border-gray-300\`)
- Rounded corners (\`rounded-xl\`)
- Overflow hidden (\`overflow-hidden\`)

## Actual Props (Current)
- \`anime\`: AnimeBase - Required prop (not used internally yet)
- \`expanded\`: boolean - Initial expanded state (default: false)
- \`onClick\`: function - Callback fired when card is clicked (optional)
- \`groupName\`: string - Radio group name for mutual exclusion (optional)
- \`cardIndex\`: number - Index within the radio group (optional)
- \`className\`: string - Additional CSS classes  
- \`children\`: ReactNode - Content to render inside the empty card
- \`expandable\`: boolean - Whether card can expand to larger size (default: true)

## What It Does
- Renders a gray rectangle: 200px × 370px (normal) or 480px × 370px (expanded)
- **Interactive**: Click to toggle between normal and expanded states
- **Mutual Exclusion**: Only one card can be expanded at a time (uses radio buttons like ExpandableGrid)
- **Group Management**: Cards with same groupName share radio group (defaults to "base-anime-cards")
- **Mobile-Friendly**: Non-expandable mode prevents expansion on mobile devices or constrained layouts
- Smooth transition between states (0.7s duration, matches ExpandableGrid)
- Keyboard accessible (Enter/Space to toggle)
- Accepts children for custom content
- Provides foundation for iterative development

## What It Doesn't Do (Yet)
- No image rendering
- No anime data display  
- No interactions or animations
- No overlays or content areas

This is intentionally minimal - a starting foundation to build upon.
        `
      }
    }
  },
  argTypes: {
    anime: {
      description: 'AnimeBase object - Required but not used internally in current version',
      control: false
    },
    expanded: {
      description: 'Initial expanded state - card manages its own state internally',
      control: 'boolean'
    },
    onClick: {
      description: 'Callback function fired when card is clicked (in addition to internal toggle)',
      control: false
    },
    groupName: {
      description: 'Radio group name for mutual exclusion (defaults to "base-anime-cards")',
      control: 'text'
    },
    cardIndex: {
      description: 'Index within the radio group (defaults to anime.id)',
      control: 'number'
    },
    className: {
      description: 'Additional CSS classes to apply to the card container',
      control: 'text'
    },
    children: {
      description: 'ReactNode content to render inside the empty card',
      control: false
    },
    expandable: {
      description: 'Whether card can expand to larger size (default: true)',
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof BaseAnimeCard>;

export const Default: Story = {
  args: {
    anime: mockAnime
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive empty card that starts at 200px × 370px. Click to expand to 480px × 370px. Click again to collapse back.'
      }
    }
  }
};

export const Expanded: Story = {
  args: {
    anime: mockAnime,
    expanded: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Card that starts in expanded state (480px × 370px). Click to collapse to 200px × 370px. Click again to expand.'
      }
    }
  }
};

export const WithCustomContent: Story = {
  args: {
    anime: mockAnime,
    children: (
      <div className="p-4 text-center">
        <p className="text-gray-600">Custom content inside the card</p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how to add custom content inside the empty card using the `children` prop.'
      }
    }
  }
};

export const WithCallback: Story = {
  render: () => {
    const [clickCount, setClickCount] = React.useState(0);
    return (
      <div className="space-y-4">
        <BaseAnimeCard 
          anime={mockAnime} 
          onClick={() => setClickCount(count => count + 1)}
        />
        <p className="text-sm text-gray-600">
          Click count: {clickCount}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the onClick callback. Each click toggles the card size and increments the counter.'
      }
    }
  }
};

export const Multiple: Story = {
  render: () => (
    <div className="flex gap-4">
      <BaseAnimeCard anime={mockAnime} />
      <BaseAnimeCard anime={{...mockAnime, id: 2, title: 'One Piece'}} />
      <BaseAnimeCard anime={{...mockAnime, id: 3, title: 'Naruto'}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple interactive cards side by side. Each card toggles independently when clicked.'
      }
    }
  }
};

export const StateComparison: Story = {
  render: () => (
    <div className="flex gap-8 items-start">
      <div className="text-center">
        <BaseAnimeCard anime={mockAnime} />
        <p className="mt-2 text-sm text-gray-600">Normal (200px)</p>
      </div>
      <div className="text-center">
        <BaseAnimeCard anime={mockAnime} expanded />
        <p className="mt-2 text-sm text-gray-600">Expanded (480px)</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of normal and expanded states, showing the exact dimension difference (200px vs 480px).'
      }
    }
  }
};

export const GroupBehavior: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <BaseAnimeCard anime={mockAnime} groupName="grid-group" cardIndex={0} />
      <BaseAnimeCard anime={{...mockAnime, id: 2, title: 'One Piece'}} groupName="grid-group" cardIndex={1} />
      <BaseAnimeCard anime={{...mockAnime, id: 3, title: 'Naruto'}} groupName="grid-group" cardIndex={2} />
      <BaseAnimeCard anime={{...mockAnime, id: 4, title: 'Demon Slayer'}} groupName="grid-group" cardIndex={3} />
      <BaseAnimeCard anime={{...mockAnime, id: 5, title: 'Your Name'}} groupName="grid-group" cardIndex={4} />
      <BaseAnimeCard anime={{...mockAnime, id: 6, title: 'Spirited Away'}} groupName="grid-group" cardIndex={5} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards using radio buttons for mutual exclusion - only one card can be expanded at a time. Click any card to expand it and collapse the previously expanded one.'
      }
    }
  }
};

export const DefaultGroupBehavior: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <BaseAnimeCard anime={mockAnime} />
      <BaseAnimeCard anime={{...mockAnime, id: 2, title: 'One Piece'}} />
      <BaseAnimeCard anime={{...mockAnime, id: 3, title: 'Naruto'}} />
      <BaseAnimeCard anime={{...mockAnime, id: 4, title: 'Demon Slayer'}} />
      <BaseAnimeCard anime={{...mockAnime, id: 5, title: 'Your Name'}} />
      <BaseAnimeCard anime={{...mockAnime, id: 6, title: 'Spirited Away'}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards using default groupName ("base-anime-cards") - only one card can be expanded at a time across all cards.'
      }
    }
  }
};

export const GridLayout: Story = {
  render: () => (
    <div className="flex gap-4 overflow-x-auto p-4">
      <BaseAnimeCard anime={mockAnime} groupName="horizontal-group" cardIndex={0} />
      <BaseAnimeCard anime={{...mockAnime, id: 2, title: 'One Piece'}} groupName="horizontal-group" cardIndex={1} />
      <BaseAnimeCard anime={{...mockAnime, id: 3, title: 'Naruto'}} groupName="horizontal-group" cardIndex={2} />
      <BaseAnimeCard anime={{...mockAnime, id: 4, title: 'Demon Slayer'}} groupName="horizontal-group" cardIndex={3} />
      <BaseAnimeCard anime={{...mockAnime, id: 5, title: 'Your Name'}} groupName="horizontal-group" cardIndex={4} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Horizontal scrollable layout with radio group behavior - simulates ExpandableGrid click mode where only one card expands at a time.'
      }
    }
  }
};

export const NonExpandable: Story = {
  args: {
    anime: mockAnime,
    expandable: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with expansion disabled - stays at 200px width even when clicked. Useful for mobile devices or constrained layouts.'
      }
    }
  }
};


export const MobileLayout: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        <BaseAnimeCard anime={mockAnime} groupName="mobile-group" cardIndex={0} expandable={false} />
        <BaseAnimeCard anime={{...mockAnime, id: 2, title: 'One Piece'}} groupName="mobile-group" cardIndex={1} expandable={false} />
        <BaseAnimeCard anime={{...mockAnime, id: 3, title: 'Naruto'}} groupName="mobile-group" cardIndex={2} expandable={false} />
        <BaseAnimeCard anime={{...mockAnime, id: 4, title: 'Demon Slayer'}} groupName="mobile-group" cardIndex={3} expandable={false} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mobile-optimized layout where all cards are set to non-expandable to maintain grid structure on small screens.'
      }
    }
  }
};