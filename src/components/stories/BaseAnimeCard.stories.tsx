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
- \`width\`: number | string - Custom width (default: 200px)
- \`height\`: number | string - Custom height (default: 370px) - **remains constant during expansion**
- \`expandedWidth\`: number | string - Custom expanded width (default: 480px) - **horizontal expansion only**

## What It Does
- Renders a customizable rectangle with default 200px × 370px (normal) or 480px × 370px (expanded)
- **Horizontal Expansion Only**: Width changes during expansion, height remains constant
- **Interactive**: Click to toggle between normal and expanded states
- **Mutual Exclusion**: Only one card can be expanded at a time (uses radio buttons like ExpandableGrid)
- **Group Management**: Cards with same groupName share radio group (defaults to "base-anime-cards")
- **Mobile-Friendly**: Non-expandable mode prevents expansion on mobile devices or constrained layouts
- **Flexible Dimensions**: Custom width, height, expandedWidth with number or string values
- **Fixed Height**: Height never changes during expansion for consistent vertical alignment
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
    },
    width: {
      description: 'Custom width (default: 200px). Accepts numbers (px) or strings with units. Must be non-negative. Changes during expansion.',
      control: 'text'
    },
    height: {
      description: 'Custom height (default: 370px). Accepts numbers (px) or strings with units. Must be non-negative. REMAINS CONSTANT during expansion.',
      control: 'text'
    },
    expandedWidth: {
      description: 'Custom expanded width (default: 480px). Accepts numbers (px) or strings with units. Must be greater than width when both are numbers. HORIZONTAL EXPANSION ONLY.',
      control: 'text'
    },
    autoLoop: {
      description: 'Enable auto-cycling to next card in group (default: false)',
      control: 'boolean'
    },
    loopInterval: {
      description: 'Time in milliseconds between auto-cycling (default: 4000ms)',
      control: { type: 'range', min: 1000, max: 10000, step: 500 }
    },
    pauseOnInteraction: {
      description: 'Pause auto-cycling when user interacts (default: true)',
      control: 'boolean'
    },
    pauseDuration: {
      description: 'How long to pause after interaction in ms (default: 10000ms)',
      control: { type: 'range', min: 2000, max: 20000, step: 1000 }
    },
    onAutoLoop: {
      description: 'Callback when auto-cycling occurs',
      control: false
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

export const CustomDimensions: Story = {
  args: {
    anime: mockAnime,
    width: 300,
    height: 450,
    expandedWidth: 600
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with custom dimensions: 300px × 450px (normal) expanding to 600px × 450px. Height remains constant during horizontal expansion. Click to see expansion behavior.'
      }
    }
  }
};

export const StringUnitsCard: Story = {
  args: {
    anime: mockAnime,
    width: '15rem',
    height: '20rem',
    expandedWidth: '30rem'
  },
  parameters: {
    docs: {
      description: {
        story: 'Card using rem units for responsive design. 15rem × 20rem expanding to 30rem × 20rem.'
      }
    }
  }
};

export const DifferentHeights: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Different Heights Comparison</h3>
        <p className="text-sm text-gray-600">Same width (200px → 400px) with different fixed heights</p>
      </div>
      
      <div className="flex flex-wrap gap-8 justify-center items-end">
        <div className="text-center">
          <BaseAnimeCard 
            anime={mockAnime} 
            width={200} 
            height={150} 
            expandedWidth={400}
            groupName="height-group" 
            cardIndex={0} 
          />
          <p className="mt-2 text-sm text-gray-600">Short Card (150px height)</p>
          <p className="text-xs text-gray-500">Compact format</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2}} 
            width={200} 
            height={250} 
            expandedWidth={400}
            groupName="height-group" 
            cardIndex={1} 
          />
          <p className="mt-2 text-sm text-gray-600">Medium Card (250px height)</p>
          <p className="text-xs text-gray-500">Standard format</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard 
            anime={{...mockAnime, id: 3}} 
            width={200} 
            height={350} 
            expandedWidth={400}
            groupName="height-group" 
            cardIndex={2} 
          />
          <p className="mt-2 text-sm text-gray-600">Tall Card (350px height)</p>
          <p className="text-xs text-gray-500">Extended format</p>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Click any card to see horizontal expansion with fixed heights
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different fixed heights with the same width settings. All cards expand from 200px to 400px while maintaining their individual heights.'
      }
    }
  }
};

export const ResponsiveUnits: Story = {
  render: () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Responsive Units Demonstration</h3>
        <p className="text-sm text-gray-600">Cards using different responsive units - resize browser to see effects</p>
      </div>
      
      <div className="space-y-8">
        <div className="text-center">
          <BaseAnimeCard 
            anime={mockAnime} 
            width="12rem" 
            height="16rem" 
            expandedWidth="20rem" 
            groupName="responsive-group" 
            cardIndex={0} 
          />
          <p className="mt-2 text-sm text-gray-600">rem units: 12rem → 20rem</p>
          <p className="text-xs text-gray-500">Scales with root font size</p>
        </div>
        
        <div className="text-center">
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2}} 
            width="20vw" 
            height="30vh" 
            expandedWidth="35vw" 
            groupName="responsive-group" 
            cardIndex={1} 
          />
          <p className="mt-2 text-sm text-gray-600">viewport units: 20vw → 35vw, 30vh height</p>
          <p className="text-xs text-gray-500">Scales with viewport size</p>
        </div>
        
        <div className="text-center">
          <BaseAnimeCard 
            anime={{...mockAnime, id: 3}} 
            width="200px" 
            height="250px"
            expandedWidth="320px" 
            groupName="responsive-group" 
            cardIndex={2} 
          />
          <p className="mt-2 text-sm text-gray-600">fixed units: 200px → 320px, 250px height</p>
          <p className="text-xs text-gray-500">Fixed dimensions</p>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Try resizing your browser window to see how different units respond<br/>
        Click any card to see horizontal expansion without overlapping
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of responsive units (rem, vw, vh) with fixed heights. Cards are stacked vertically to prevent overlapping during expansion. Resize your browser window to see how different unit types respond to viewport changes.'
      }
    }
  }
};

export const HorizontalExpansionDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Horizontal Expansion Only</h3>
        <p className="text-sm text-gray-600 mb-6">Height remains constant during expansion - only width changes</p>
      </div>
      
      <div className="flex justify-center items-center gap-8">
        <div className="text-center">
          <BaseAnimeCard 
            anime={mockAnime} 
            width={150} 
            height={200} 
            expandedWidth={300} 
            groupName="demo-group" 
            cardIndex={0}
          >
            <div className="flex items-center justify-center h-full text-sm text-gray-600">
              150px → 300px<br/>
              Height: 200px (constant)
            </div>
          </BaseAnimeCard>
          <p className="mt-2 text-sm text-gray-600">Click to expand horizontally</p>
        </div>
        
        <div className="text-center">
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2}} 
            width={180} 
            height={240} 
            expandedWidth={400} 
            groupName="demo-group" 
            cardIndex={1}
          >
            <div className="flex items-center justify-center h-full text-sm text-gray-600">
              180px → 400px<br/>
              Height: 240px (constant)
            </div>
          </BaseAnimeCard>
          <p className="mt-2 text-sm text-gray-600">Different height, same concept</p>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Notice how only the width changes when you click between cards - height stays the same!
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Explicit demonstration of horizontal-only expansion. Cards only change width during expansion - height remains constant. Click between cards to see the effect.'
      }
    }
  }
};

export const CustomizableGrid: Story = {
  args: {
    width: 180,
    height: 250,
    expandedWidth: 360
  },
  render: (args) => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Customizable Grid Layout</h3>
        <p className="text-sm text-gray-600">Use the controls below to adjust dimensions for all cards in the grid</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <BaseAnimeCard 
          anime={mockAnime} 
          width={args.width}
          height={args.height}
          expandedWidth={args.expandedWidth}
          groupName="customizable-grid" 
          cardIndex={0}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Attack on Titan<br/>
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>
        
        <BaseAnimeCard 
          anime={{...mockAnime, id: 2, title: 'One Piece'}} 
          width={args.width}
          height={args.height}
          expandedWidth={args.expandedWidth}
          groupName="customizable-grid" 
          cardIndex={1}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            One Piece<br/>
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>
        
        <BaseAnimeCard 
          anime={{...mockAnime, id: 3, title: 'Naruto'}} 
          width={args.width}
          height={args.height}
          expandedWidth={args.expandedWidth}
          groupName="customizable-grid" 
          cardIndex={2}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Naruto<br/>
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>
        
        <BaseAnimeCard 
          anime={{...mockAnime, id: 4, title: 'Demon Slayer'}} 
          width={args.width}
          height={args.height}
          expandedWidth={args.expandedWidth}
          groupName="customizable-grid" 
          cardIndex={3}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Demon Slayer<br/>
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>
        
        <BaseAnimeCard 
          anime={{...mockAnime, id: 5, title: 'Your Name'}} 
          width={args.width}
          height={args.height}
          expandedWidth={args.expandedWidth}
          groupName="customizable-grid" 
          cardIndex={4}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Your Name<br/>
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>
        
        <BaseAnimeCard 
          anime={{...mockAnime, id: 6, title: 'Spirited Away'}} 
          width={args.width}
          height={args.height}
          expandedWidth={args.expandedWidth}
          groupName="customizable-grid" 
          cardIndex={5}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Spirited Away<br/>
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>

        <BaseAnimeCard 
          anime={{...mockAnime, id: 7, title: 'Princess Mononoke'}} 
          width={args.width}
          height={args.height}
          expandedWidth={args.expandedWidth}
          groupName="customizable-grid" 
          cardIndex={6}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Princess Mononoke<br/>
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>
        
        <BaseAnimeCard 
          anime={{...mockAnime, id: 8, title: 'Death Note'}} 
          width={args.width}
          height={args.height}
          expandedWidth={args.expandedWidth}
          groupName="customizable-grid" 
          cardIndex={7}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Death Note<br/>
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Adjust the controls above to change dimensions for all cards. Only one card can be expanded at a time.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive grid layout where you can customize dimensions for all cards using Storybook controls. Adjust width, height, and expandedWidth to see how the entire grid responds. Cards maintain mutual exclusion - only one can be expanded at a time.'
      }
    }
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 0, max: 300, step: 10 },
      description: 'Width for all cards in the grid (minimum: 0px)'
    },
    height: {
      control: { type: 'range', min: 0, max: 400, step: 10 },
      description: 'Height for all cards in the grid (minimum: 0px, remains constant during expansion)'
    },
    expandedWidth: {
      control: { type: 'range', min: 0, max: 500, step: 10 },
      description: 'Expanded width for all cards in the grid (auto-corrected to be > width when both are numbers)'
    }
  }
};

export const ExpandableGridDefaults: Story = {
  render: () => {
    const [currentCard, setCurrentCard] = React.useState(0);
    const [loopCount, setLoopCount] = React.useState(0);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">ExpandableGrid Default Behavior</h3>
          <p className="text-sm text-gray-600 mb-4">
            Exact same auto-cycling behavior as ExpandableGrid click mode: 4s intervals, 10s pause on click
          </p>
          <div className="text-xs text-gray-500">
            Current: <span className="font-semibold">Card {currentCard + 1}</span> | 
            Loop count: <span className="font-semibold">{loopCount}</span>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center overflow-x-auto p-4">
          <BaseAnimeCard 
            anime={mockAnime} 
            width={200}    // ExpandableGrid default
            height={370}   // ExpandableGrid default
            expandedWidth={480} // ExpandableGrid default
            groupName="expandable-grid-defaults" 
            cardIndex={0}
            expanded={true} // Start with first card expanded (like ExpandableGrid)
            autoLoop={true}           // ExpandableGrid click mode default
            loopInterval={4000}       // ExpandableGrid default: 4 seconds
            pauseOnInteraction={true} // ExpandableGrid default: pause on click
            pauseDuration={10000}     // ExpandableGrid default: 10 seconds
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount(prev => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Attack on Titan</div>
                <div className="text-xs opacity-75">200px × 370px → 480px × 370px</div>
              </div>
            </div>
          </BaseAnimeCard>
          
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2, title: 'One Piece'}} 
            width={200}
            height={370}
            expandedWidth={480}
            groupName="expandable-grid-defaults" 
            cardIndex={1}
            autoLoop={true}
            loopInterval={4000}
            pauseOnInteraction={true}
            pauseDuration={10000}
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount(prev => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">One Piece</div>
                <div className="text-xs opacity-75">ExpandableGrid dimensions</div>
              </div>
            </div>
          </BaseAnimeCard>
          
          <BaseAnimeCard 
            anime={{...mockAnime, id: 3, title: 'Naruto'}} 
            width={200}
            height={370}
            expandedWidth={480}
            groupName="expandable-grid-defaults" 
            cardIndex={2}
            autoLoop={true}
            loopInterval={4000}
            pauseOnInteraction={true}
            pauseDuration={10000}
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount(prev => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Naruto</div>
                <div className="text-xs opacity-75">4s loop, 10s pause</div>
              </div>
            </div>
          </BaseAnimeCard>

          <BaseAnimeCard 
            anime={{...mockAnime, id: 4, title: 'Demon Slayer'}} 
            width={200}
            height={370}
            expandedWidth={480}
            groupName="expandable-grid-defaults" 
            cardIndex={3}
            autoLoop={true}
            loopInterval={4000}
            pauseOnInteraction={true}
            pauseDuration={10000}
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount(prev => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Demon Slayer</div>
                <div className="text-xs opacity-75">Identical to ExpandableGrid</div>
              </div>
            </div>
          </BaseAnimeCard>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <strong>ExpandableGrid Click Mode Settings:</strong><br/>
          Auto-cycles every 4 seconds • Click any card to pause for 10 seconds • 200px → 480px expansion
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'BaseAnimeCard configured with the exact same defaults as ExpandableGrid click mode: 4-second auto-cycling, 10-second pause on interaction, and identical card dimensions (200px × 370px expanding to 480px × 370px). This demonstrates perfect feature parity with the original ExpandableGrid behavior.'
      }
    }
  }
};

export const AutoLoopingCards: Story = {
  args: {
    autoLoop: true,
    loopInterval: 3000,
    pauseOnInteraction: true,
    pauseDuration: 8000,
    width: 160,
    height: 220,
    expandedWidth: 320
  },
  render: (args) => {
    const [currentCard, setCurrentCard] = React.useState(0);
    const [loopCount, setLoopCount] = React.useState(0);

    // Reset counters when auto-loop is toggled
    React.useEffect(() => {
      if (!args.autoLoop) {
        setCurrentCard(0);
        setLoopCount(0);
      }
    }, [args.autoLoop]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Auto-Cycling Cards</h3>
          <p className="text-sm text-gray-600 mb-4">
            {args.autoLoop 
              ? `Cards automatically cycle every ${args.loopInterval / 1000} seconds. Click any card to pause for ${args.pauseDuration / 1000} seconds.`
              : 'Auto-cycling is disabled. Toggle the "autoLoop" control to enable it.'
            }
          </p>
          <div className="text-xs text-gray-500">
            Current: <span className="font-semibold">Card {currentCard + 1}</span> | 
            Loop count: <span className="font-semibold">{loopCount}</span>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center overflow-x-auto p-4">
          <BaseAnimeCard 
            anime={mockAnime} 
            width={args.width}
            height={args.height}
            expandedWidth={args.expandedWidth}
            groupName="auto-loop-group" 
            cardIndex={0}
            expanded={true} // Start with first card expanded
            autoLoop={args.autoLoop}
            loopInterval={args.loopInterval}
            pauseOnInteraction={args.pauseOnInteraction}
            pauseDuration={args.pauseDuration}
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount(prev => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Attack on Titan</div>
                <div className="text-xs opacity-75">
                  Card 1 - {args.autoLoop ? 'Auto cycling' : 'Click to expand'}
                </div>
              </div>
            </div>
          </BaseAnimeCard>
          
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2, title: 'One Piece'}} 
            width={args.width}
            height={args.height}
            expandedWidth={args.expandedWidth}
            groupName="auto-loop-group" 
            cardIndex={1}
            autoLoop={args.autoLoop}
            loopInterval={args.loopInterval}
            pauseOnInteraction={args.pauseOnInteraction}
            pauseDuration={args.pauseDuration}
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount(prev => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">One Piece</div>
                <div className="text-xs opacity-75">
                  Card 2 - {args.autoLoop ? 'Auto cycling' : 'Click to expand'}
                </div>
              </div>
            </div>
          </BaseAnimeCard>
          
          <BaseAnimeCard 
            anime={{...mockAnime, id: 3, title: 'Naruto'}} 
            width={args.width}
            height={args.height}
            expandedWidth={args.expandedWidth}
            groupName="auto-loop-group" 
            cardIndex={2}
            autoLoop={args.autoLoop}
            loopInterval={args.loopInterval}
            pauseOnInteraction={args.pauseOnInteraction}
            pauseDuration={args.pauseDuration}
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount(prev => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Naruto</div>
                <div className="text-xs opacity-75">
                  Card 3 - {args.autoLoop ? 'Auto cycling' : 'Click to expand'}
                </div>
              </div>
            </div>
          </BaseAnimeCard>

          <BaseAnimeCard 
            anime={{...mockAnime, id: 4, title: 'Demon Slayer'}} 
            width={args.width}
            height={args.height}
            expandedWidth={args.expandedWidth}
            groupName="auto-loop-group" 
            cardIndex={3}
            autoLoop={args.autoLoop}
            loopInterval={args.loopInterval}
            pauseOnInteraction={args.pauseOnInteraction}
            pauseDuration={args.pauseDuration}
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount(prev => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Demon Slayer</div>
                <div className="text-xs opacity-75">
                  Card 4 - {args.autoLoop ? 'Auto cycling' : 'Click to expand'}
                </div>
              </div>
            </div>
          </BaseAnimeCard>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          {args.autoLoop 
            ? `Cards cycle automatically: 1 → 2 → 3 → 4 → 1... ${args.pauseOnInteraction ? `Click any card to pause for ${args.pauseDuration / 1000}s.` : 'Pause on interaction is disabled.'}`
            : 'Auto-cycling is disabled. Use the controls to configure and enable it.'
          }
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration of auto-cycling cards with full control over all auto-loop properties. Use the controls below to adjust loop timing, pause behavior, and card dimensions in real-time. The counter shows current active card and total number of cycles completed.'
      }
    }
  },
  argTypes: {
    autoLoop: {
      control: 'boolean',
      description: 'Enable/disable auto-cycling through cards'
    },
    loopInterval: {
      control: { type: 'range', min: 1000, max: 10000, step: 500 },
      description: 'Time between auto-cycles in milliseconds'
    },
    pauseOnInteraction: {
      control: 'boolean',
      description: 'Whether clicking a card pauses the auto-cycling'
    },
    pauseDuration: {
      control: { type: 'range', min: 2000, max: 20000, step: 1000 },
      description: 'How long to pause after user interaction in milliseconds'
    },
    width: {
      control: { type: 'range', min: 0, max: 250, step: 10 },
      description: 'Width of cards in normal state (minimum: 0px)'
    },
    height: {
      control: { type: 'range', min: 0, max: 300, step: 10 },
      description: 'Height of cards (minimum: 0px, remains constant during expansion)'
    },
    expandedWidth: {
      control: { type: 'range', min: 0, max: 400, step: 10 },
      description: 'Width of cards when expanded (auto-corrected to be > width when both are numbers)'
    }
  }
};