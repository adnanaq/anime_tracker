import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BaseAnimeCard } from "../components/ui/BaseAnimeCard";
import { AnimeInfoCard } from "../components/ui/AnimeInfoCard";
import { AnimeBase } from "../types/anime";

const mockAnime: AnimeBase = {
  id: 1,
  title: "Attack on Titan",
  coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg", // Using Demon Slayer image
  score: 9.0,
  format: "TV",
  year: 2013,
  status: "FINISHED",
  episodes: 25,
  genres: ["Action", "Drama", "Fantasy"],
  description:
    "Humanity fights for survival against the giant humanoid Titans who have brought humanity to the brink of extinction.",
  season: "SPRING",
  userStatus: "COMPLETED",
};

// Additional anime data for testing various scenarios
const animeWithImage: AnimeBase = {
  id: 2,
  title: "Your Name",
  coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg", // Using One Piece image
  score: 8.4,
  format: "MOVIE",
  year: 2016,
  status: "FINISHED",
  episodes: 1,
  genres: ["Romance", "Drama", "Supernatural"],
  description: "Two teenagers share a profound, magical connection upon discovering they are swapping bodies.",
  season: undefined,
  userStatus: "COMPLETED",
};

const animeWithoutImage: AnimeBase = {
  id: 3,
  title: "Test Anime Without Cover Image",
  coverImage: undefined, // Test fallback scenario
  score: 7.5,
  format: "TV",
  year: 2024,
  status: "ONGOING",
  episodes: 12,
  genres: ["Action", "Adventure"],
  description: "Test anime for demonstrating fallback image behavior.",
  season: "WINTER",
  userStatus: "WATCHING",
};

const animeWithBrokenImage: AnimeBase = {
  id: 4,
  title: "Test Anime With Broken Image",
  coverImage: "https://invalid-url-that-will-fail.jpg", // Test image loading failure
  score: 6.8,
  format: "OVA",
  year: 2023,
  status: "FINISHED",
  episodes: 3,
  genres: ["Comedy"],
  description: "Test anime for demonstrating broken image handling.",
  season: undefined,
  userStatus: "PLAN_TO_WATCH",
};

const meta: Meta<typeof BaseAnimeCard> = {
  title: "UI/BaseAnimeCard",
  component: BaseAnimeCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
**BaseAnimeCard** is a foundational empty card component for the ExpandableGrid refactoring.

## Current Implementation
This is a **minimal empty card** with exact ExpandableGrid dimensions:
- Fixed size: 13rem × 23.125rem  
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
- \`width\`: number | string - Custom width (default: 13rem)
- \`height\`: number | string - Custom height (default: 23.125rem) - **remains constant during expansion**
- \`expandedWidth\`: number | string - Custom expanded width (default: 30rem) - **horizontal expansion only**

## What It Does
- Renders a customizable rectangle with default 13rem × 23.125rem (normal) or 30rem × 23.125rem (expanded)
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
        `,
      },
    },
  },
  argTypes: {
    anime: {
      description:
        "AnimeBase object - Required but not used internally in current version",
      control: false,
    },
    expanded: {
      description:
        "Initial expanded state - card manages its own state internally",
      control: "boolean",
    },
    onClick: {
      description:
        "Callback function fired when card is clicked (in addition to internal toggle)",
      control: false,
    },
    groupName: {
      description:
        'Radio group name for mutual exclusion (defaults to "base-anime-cards")',
      control: "text",
    },
    cardIndex: {
      description: "Index within the radio group (defaults to anime.id)",
      control: "number",
    },
    className: {
      description: "Additional CSS classes to apply to the card container",
      control: "text",
    },
    children: {
      description: "ReactNode content to render inside the empty card",
      control: false,
    },
    expandable: {
      description: "Whether card can expand to larger size (default: true)",
      control: "boolean",
    },
    width: {
      description:
        "Custom width (default: 13rem). Accepts numbers (px) or strings with units. Must be non-negative. Changes during expansion.",
      control: "text",
    },
    height: {
      description:
        "Custom height (default: 23.125rem). Accepts numbers (px) or strings with units. Must be non-negative. REMAINS CONSTANT during expansion.",
      control: "text",
    },
    expandedWidth: {
      description:
        "Custom expanded width (default: 30rem). Accepts numbers (px) or strings with units. Must be greater than width when both are numbers. HORIZONTAL EXPANSION ONLY.",
      control: "text",
    },
    autoLoop: {
      description: "Enable auto-cycling to next card in group (default: false)",
      control: "boolean",
    },
    loopInterval: {
      description:
        "Time in milliseconds between auto-cycling (default: 4000ms)",
      control: { type: "range", min: 1000, max: 10000, step: 500 },
    },
    pauseOnInteraction: {
      description: "Pause auto-cycling when user interacts (default: true)",
      control: "boolean",
    },
    pauseDuration: {
      description:
        "How long to pause after interaction in ms (default: 10000ms)",
      control: { type: "range", min: 2000, max: 20000, step: 1000 },
    },
    onAutoLoop: {
      description: "Callback when auto-cycling occurs",
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseAnimeCard>;

export const Default: Story = {
  args: {
    anime: mockAnime,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive empty card that starts at 13rem × 23.125rem. Click to expand to 30rem × 23.125rem. Click again to collapse back.",
      },
    },
  },
};

export const Expanded: Story = {
  args: {
    anime: mockAnime,
    expanded: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Card that starts in expanded state (30rem × 23.125rem). Click to collapse to 13rem × 23.125rem. Click again to expand.",
      },
    },
  },
};

export const WithCustomContent: Story = {
  args: {
    anime: mockAnime,
    children: (
      <div className="p-4 text-center">
        <p className="text-gray-600">Custom content inside the card</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows how to add custom content inside the empty card using the `children` prop.",
      },
    },
  },
};

export const WithCallback: Story = {
  render: () => {
    const [clickCount, setClickCount] = React.useState(0);
    return (
      <div className="space-y-4">
        <BaseAnimeCard
          anime={mockAnime}
          onClick={() => setClickCount((count) => count + 1)}
        />
        <p className="text-sm text-gray-600">Click count: {clickCount}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the onClick callback. Each click toggles the card size and increments the counter.",
      },
    },
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="flex gap-4">
      <BaseAnimeCard anime={mockAnime} />
      <BaseAnimeCard anime={{ ...mockAnime, id: 2, title: "One Piece" }} />
      <BaseAnimeCard anime={{ ...mockAnime, id: 3, title: "Naruto" }} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Multiple interactive cards side by side. Each card toggles independently when clicked.",
      },
    },
  },
};

export const StateComparison: Story = {
  render: () => (
    <div className="flex gap-8 items-start">
      <div className="text-center">
        <BaseAnimeCard anime={mockAnime} />
        <p className="mt-2 text-sm text-gray-600">Normal (13rem)</p>
      </div>
      <div className="text-center">
        <BaseAnimeCard anime={mockAnime} expanded />
        <p className="mt-2 text-sm text-gray-600">Expanded (30rem)</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side comparison of normal and expanded states, showing the exact dimension difference (13rem vs 30rem).",
      },
    },
  },
};

export const GroupBehavior: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <BaseAnimeCard anime={mockAnime} groupName="grid-group" cardIndex={0} />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 2, title: "One Piece" }}
        groupName="grid-group"
        cardIndex={1}
      />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 3, title: "Naruto" }}
        groupName="grid-group"
        cardIndex={2}
      />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 4, title: "Demon Slayer" }}
        groupName="grid-group"
        cardIndex={3}
      />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 5, title: "Your Name" }}
        groupName="grid-group"
        cardIndex={4}
      />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 6, title: "Spirited Away" }}
        groupName="grid-group"
        cardIndex={5}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Cards using radio buttons for mutual exclusion - only one card can be expanded at a time. Click any card to expand it and collapse the previously expanded one.",
      },
    },
  },
};

export const DefaultGroupBehavior: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <BaseAnimeCard anime={mockAnime} />
      <BaseAnimeCard anime={{ ...mockAnime, id: 2, title: "One Piece" }} />
      <BaseAnimeCard anime={{ ...mockAnime, id: 3, title: "Naruto" }} />
      <BaseAnimeCard anime={{ ...mockAnime, id: 4, title: "Demon Slayer" }} />
      <BaseAnimeCard anime={{ ...mockAnime, id: 5, title: "Your Name" }} />
      <BaseAnimeCard anime={{ ...mockAnime, id: 6, title: "Spirited Away" }} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Cards using default groupName ("base-anime-cards") - only one card can be expanded at a time across all cards.',
      },
    },
  },
};

export const GridLayout: Story = {
  render: () => (
    <div className="flex gap-4 overflow-x-auto p-4">
      <BaseAnimeCard
        anime={mockAnime}
        groupName="horizontal-group"
        cardIndex={0}
      />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 2, title: "One Piece" }}
        groupName="horizontal-group"
        cardIndex={1}
      />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 3, title: "Naruto" }}
        groupName="horizontal-group"
        cardIndex={2}
      />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 4, title: "Demon Slayer" }}
        groupName="horizontal-group"
        cardIndex={3}
      />
      <BaseAnimeCard
        anime={{ ...mockAnime, id: 5, title: "Your Name" }}
        groupName="horizontal-group"
        cardIndex={4}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Horizontal scrollable layout with radio group behavior - simulates ExpandableGrid click mode where only one card expands at a time.",
      },
    },
  },
};

export const NonExpandable: Story = {
  args: {
    anime: mockAnime,
    expandable: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Card with expansion disabled - stays at 13rem width even when clicked. Useful for mobile devices or constrained layouts.",
      },
    },
  },
};

export const MobileLayout: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        <BaseAnimeCard
          anime={mockAnime}
          groupName="mobile-group"
          cardIndex={0}
          expandable={false}
        />
        <BaseAnimeCard
          anime={{ ...mockAnime, id: 2, title: "One Piece" }}
          groupName="mobile-group"
          cardIndex={1}
          expandable={false}
        />
        <BaseAnimeCard
          anime={{ ...mockAnime, id: 3, title: "Naruto" }}
          groupName="mobile-group"
          cardIndex={2}
          expandable={false}
        />
        <BaseAnimeCard
          anime={{ ...mockAnime, id: 4, title: "Demon Slayer" }}
          groupName="mobile-group"
          cardIndex={3}
          expandable={false}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-optimized layout where all cards are set to non-expandable to maintain grid structure on small screens.",
      },
    },
  },
};

export const CustomDimensions: Story = {
  args: {
    anime: mockAnime,
    width: 300,
    height: 450,
    expandedWidth: 600,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Card with custom dimensions: 300px × 450px (normal) expanding to 600px × 450px. Height remains constant during horizontal expansion. Click to see expansion behavior.",
      },
    },
  },
};

export const StringUnitsCard: Story = {
  args: {
    anime: mockAnime,
    width: "15rem",
    height: "20rem",
    expandedWidth: "30rem",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Card using rem units for responsive design. 15rem × 20rem expanding to 30rem × 20rem.",
      },
    },
  },
};

export const DifferentHeights: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Different Heights Comparison
        </h3>
        <p className="text-sm text-gray-600">
          Same width (13rem → 400px) with different fixed heights
        </p>
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
          <p className="mt-2 text-sm text-gray-600">
            Short Card (150px height)
          </p>
          <p className="text-xs text-gray-500">Compact format</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard
            anime={{ ...mockAnime, id: 2 }}
            width={200}
            height={250}
            expandedWidth={400}
            groupName="height-group"
            cardIndex={1}
          />
          <p className="mt-2 text-sm text-gray-600">
            Medium Card (250px height)
          </p>
          <p className="text-xs text-gray-500">Standard format</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard
            anime={{ ...mockAnime, id: 3 }}
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
        story:
          "Comparison of different fixed heights with the same width settings. All cards expand from 13rem to 400px while maintaining their individual heights.",
      },
    },
  },
};

export const ResponsiveUnits: Story = {
  render: () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Responsive Units Demonstration
        </h3>
        <p className="text-sm text-gray-600">
          Cards using different responsive units - resize browser to see effects
        </p>
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
            anime={{ ...mockAnime, id: 2 }}
            width="20vw"
            height="30vh"
            expandedWidth="35vw"
            groupName="responsive-group"
            cardIndex={1}
          />
          <p className="mt-2 text-sm text-gray-600">
            viewport units: 20vw → 35vw, 30vh height
          </p>
          <p className="text-xs text-gray-500">Scales with viewport size</p>
        </div>

        <div className="text-center">
          <BaseAnimeCard
            anime={{ ...mockAnime, id: 3 }}
            width="13rem"
            height="250px"
            expandedWidth="320px"
            groupName="responsive-group"
            cardIndex={2}
          />
          <p className="mt-2 text-sm text-gray-600">
            fixed units: 13rem → 320px, 250px height
          </p>
          <p className="text-xs text-gray-500">Fixed dimensions</p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Try resizing your browser window to see how different units respond
        <br />
        Click any card to see horizontal expansion without overlapping
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstration of responsive units (rem, vw, vh) with fixed heights. Cards are stacked vertically to prevent overlapping during expansion. Resize your browser window to see how different unit types respond to viewport changes.",
      },
    },
  },
};

export const HorizontalExpansionDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">
          Horizontal Expansion Only
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Height remains constant during expansion - only width changes
        </p>
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
              150px → 300px
              <br />
              Height: 13rem (constant)
            </div>
          </BaseAnimeCard>
          <p className="mt-2 text-sm text-gray-600">
            Click to expand horizontally
          </p>
        </div>

        <div className="text-center">
          <BaseAnimeCard
            anime={{ ...mockAnime, id: 2 }}
            width={180}
            height={240}
            expandedWidth={400}
            groupName="demo-group"
            cardIndex={1}
          >
            <div className="flex items-center justify-center h-full text-sm text-gray-600">
              180px → 400px
              <br />
              Height: 240px (constant)
            </div>
          </BaseAnimeCard>
          <p className="mt-2 text-sm text-gray-600">
            Different height, same concept
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Notice how only the width changes when you click between cards - height
        stays the same!
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Explicit demonstration of horizontal-only expansion. Cards only change width during expansion - height remains constant. Click between cards to see the effect.",
      },
    },
  },
};

export const CustomizableGrid: Story = {
  args: {
    width: 180,
    height: 250,
    expandedWidth: 360,
  },
  render: (args) => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Customizable Grid Layout</h3>
        <p className="text-sm text-gray-600">
          Use the controls below to adjust dimensions for all cards in the grid
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <BaseAnimeCard
          anime={mockAnime}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
          groupName="customizable-grid"
          cardIndex={0}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Attack on Titan
            <br />
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>

        <BaseAnimeCard
          anime={{ ...mockAnime, id: 2, title: "One Piece" }}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
          groupName="customizable-grid"
          cardIndex={1}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            One Piece
            <br />
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>

        <BaseAnimeCard
          anime={{ ...mockAnime, id: 3, title: "Naruto" }}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
          groupName="customizable-grid"
          cardIndex={2}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Naruto
            <br />
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>

        <BaseAnimeCard
          anime={{ ...mockAnime, id: 4, title: "Demon Slayer" }}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
          groupName="customizable-grid"
          cardIndex={3}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Demon Slayer
            <br />
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>

        <BaseAnimeCard
          anime={{ ...mockAnime, id: 5, title: "Your Name" }}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
          groupName="customizable-grid"
          cardIndex={4}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Your Name
            <br />
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>

        <BaseAnimeCard
          anime={{ ...mockAnime, id: 6, title: "Spirited Away" }}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
          groupName="customizable-grid"
          cardIndex={5}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Spirited Away
            <br />
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>

        <BaseAnimeCard
          anime={{ ...mockAnime, id: 7, title: "Princess Mononoke" }}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
          groupName="customizable-grid"
          cardIndex={6}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Princess Mononoke
            <br />
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>

        <BaseAnimeCard
          anime={{ ...mockAnime, id: 8, title: "Death Note" }}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
          groupName="customizable-grid"
          cardIndex={7}
        >
          <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
            Death Note
            <br />
            <span className="text-xs opacity-75">Click to expand</span>
          </div>
        </BaseAnimeCard>
      </div>

      <div className="text-center text-sm text-gray-500">
        Adjust the controls above to change dimensions for all cards. Only one
        card can be expanded at a time.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Interactive grid layout where you can customize dimensions for all cards using Storybook controls. Adjust width, height, and expandedWidth to see how the entire grid responds. Cards maintain mutual exclusion - only one can be expanded at a time.",
      },
    },
  },
  argTypes: {
    width: {
      control: { type: "range", min: 0, max: 300, step: 10 },
      description: "Width for all cards in the grid (minimum: 0px)",
    },
    height: {
      control: { type: "range", min: 0, max: 400, step: 10 },
      description:
        "Height for all cards in the grid (minimum: 0px, remains constant during expansion)",
    },
    expandedWidth: {
      control: { type: "range", min: 0, max: 500, step: 10 },
      description:
        "Expanded width for all cards in the grid (auto-corrected to be > width when both are numbers)",
    },
  },
};

export const ExpandableGridDefaults: Story = {
  render: () => {
    const [currentCard, setCurrentCard] = React.useState(0);
    const [loopCount, setLoopCount] = React.useState(0);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            ExpandableGrid Default Behavior
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Exact same auto-cycling behavior as ExpandableGrid click mode: 4s
            intervals, 10s pause on click
          </p>
          <div className="text-xs text-gray-500">
            Current:{" "}
            <span className="font-semibold">Card {currentCard + 1}</span> | Loop
            count: <span className="font-semibold">{loopCount}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center overflow-x-auto p-4">
          <BaseAnimeCard
            anime={mockAnime}
            width={200} // ExpandableGrid default
            height={370} // ExpandableGrid default
            expandedWidth={480} // ExpandableGrid default
            groupName="expandable-grid-defaults"
            cardIndex={0}
            expanded={true} // Start with first card expanded (like ExpandableGrid)
            autoLoop={true} // ExpandableGrid click mode default
            loopInterval={4000} // ExpandableGrid default: 4 seconds
            pauseOnInteraction={true} // ExpandableGrid default: pause on click
            pauseDuration={10000} // ExpandableGrid default: 10 seconds
            onAutoLoop={(cardIndex) => {
              setCurrentCard(cardIndex);
              setLoopCount((prev) => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Attack on Titan</div>
                <div className="text-xs opacity-75">
                  13rem × 23.125rem → 30rem × 23.125rem
                </div>
              </div>
            </div>
          </BaseAnimeCard>

          <BaseAnimeCard
            anime={{ ...mockAnime, id: 2, title: "One Piece" }}
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
              setLoopCount((prev) => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">One Piece</div>
                <div className="text-xs opacity-75">
                  ExpandableGrid dimensions
                </div>
              </div>
            </div>
          </BaseAnimeCard>

          <BaseAnimeCard
            anime={{ ...mockAnime, id: 3, title: "Naruto" }}
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
              setLoopCount((prev) => prev + 1);
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
            anime={{ ...mockAnime, id: 4, title: "Demon Slayer" }}
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
              setLoopCount((prev) => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Demon Slayer</div>
                <div className="text-xs opacity-75">
                  Identical to ExpandableGrid
                </div>
              </div>
            </div>
          </BaseAnimeCard>
        </div>

        <div className="text-center text-sm text-gray-500">
          <strong>ExpandableGrid Click Mode Settings:</strong>
          <br />
          Auto-cycles every 4 seconds • Click any card to pause for 10 seconds •
          13rem → 30rem expansion
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "BaseAnimeCard configured with the exact same defaults as ExpandableGrid click mode: 4-second auto-cycling, 10-second pause on interaction, and identical card dimensions (13rem × 23.125rem expanding to 30rem × 23.125rem). This demonstrates perfect feature parity with the original ExpandableGrid behavior.",
      },
    },
  },
};

export const AutoLoopingCards: Story = {
  args: {
    autoLoop: true,
    loopInterval: 3000,
    pauseOnInteraction: true,
    pauseDuration: 8000,
    width: 160,
    height: 220,
    expandedWidth: 320,
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
              ? `Cards automatically cycle every ${
                  args.loopInterval / 1000
                } seconds. Click any card to pause for ${
                  args.pauseDuration / 1000
                } seconds.`
              : 'Auto-cycling is disabled. Toggle the "autoLoop" control to enable it.'}
          </p>
          <div className="text-xs text-gray-500">
            Current:{" "}
            <span className="font-semibold">Card {currentCard + 1}</span> | Loop
            count: <span className="font-semibold">{loopCount}</span>
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
              setLoopCount((prev) => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Attack on Titan</div>
                <div className="text-xs opacity-75">
                  Card 1 - {args.autoLoop ? "Auto cycling" : "Click to expand"}
                </div>
              </div>
            </div>
          </BaseAnimeCard>

          <BaseAnimeCard
            anime={{ ...mockAnime, id: 2, title: "One Piece" }}
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
              setLoopCount((prev) => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">One Piece</div>
                <div className="text-xs opacity-75">
                  Card 2 - {args.autoLoop ? "Auto cycling" : "Click to expand"}
                </div>
              </div>
            </div>
          </BaseAnimeCard>

          <BaseAnimeCard
            anime={{ ...mockAnime, id: 3, title: "Naruto" }}
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
              setLoopCount((prev) => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Naruto</div>
                <div className="text-xs opacity-75">
                  Card 3 - {args.autoLoop ? "Auto cycling" : "Click to expand"}
                </div>
              </div>
            </div>
          </BaseAnimeCard>

          <BaseAnimeCard
            anime={{ ...mockAnime, id: 4, title: "Demon Slayer" }}
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
              setLoopCount((prev) => prev + 1);
            }}
          >
            <div className="flex items-center justify-center h-full text-xs text-gray-600 p-2 text-center">
              <div>
                <div className="font-semibold mb-1">Demon Slayer</div>
                <div className="text-xs opacity-75">
                  Card 4 - {args.autoLoop ? "Auto cycling" : "Click to expand"}
                </div>
              </div>
            </div>
          </BaseAnimeCard>
        </div>

        <div className="text-center text-sm text-gray-500">
          {args.autoLoop
            ? `Cards cycle automatically: 1 → 2 → 3 → 4 → 1... ${
                args.pauseOnInteraction
                  ? `Click any card to pause for ${args.pauseDuration / 1000}s.`
                  : "Pause on interaction is disabled."
              }`
            : "Auto-cycling is disabled. Use the controls to configure and enable it."}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demonstration of auto-cycling cards with full control over all auto-loop properties. Use the controls below to adjust loop timing, pause behavior, and card dimensions in real-time. The counter shows current active card and total number of cycles completed.",
      },
    },
  },
  argTypes: {
    autoLoop: {
      control: "boolean",
      description: "Enable/disable auto-cycling through cards",
    },
    loopInterval: {
      control: { type: "range", min: 1000, max: 10000, step: 500 },
      description: "Time between auto-cycles in milliseconds",
    },
    pauseOnInteraction: {
      control: "boolean",
      description: "Whether clicking a card pauses the auto-cycling",
    },
    pauseDuration: {
      control: { type: "range", min: 2000, max: 20000, step: 1000 },
      description: "How long to pause after user interaction in milliseconds",
    },
    width: {
      control: { type: "range", min: 0, max: 250, step: 10 },
      description: "Width of cards in normal state (minimum: 0px)",
    },
    height: {
      control: { type: "range", min: 0, max: 300, step: 10 },
      description:
        "Height of cards (minimum: 0px, remains constant during expansion)",
    },
    expandedWidth: {
      control: { type: "range", min: 0, max: 400, step: 10 },
      description:
        "Width of cards when expanded (auto-corrected to be > width when both are numbers)",
    },
  },
};

// === IMAGE DISPLAY TESTING ===

export const WithImage: Story = {
  args: {
    anime: animeWithImage,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card displaying anime with cover image. The image uses object-position: top center for proper cropping and fills the entire card area.',
      },
    },
  },
};

export const WithoutImage: Story = {
  args: {
    anime: animeWithoutImage,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card showing fallback behavior when anime has no cover image. Displays a gray background with "No Image" text, with proper dark mode support.',
      },
    },
  },
};

export const ImageComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Image Display Comparison</h3>
        <p className="text-sm text-gray-600">Testing image display vs fallback behavior</p>
      </div>
      
      <div className="flex gap-8 justify-center items-start">
        <div>
          <BaseAnimeCard anime={animeWithImage} groupName="image-comparison" cardIndex={0} />
          <p className="mt-2 text-sm text-gray-600 text-center">With Cover Image</p>
        </div>
        
        <div>
          <BaseAnimeCard anime={animeWithoutImage} groupName="image-comparison" cardIndex={1} />
          <p className="mt-2 text-sm text-gray-600 text-center">No Cover Image</p>
        </div>

        <div>
          <BaseAnimeCard anime={animeWithBrokenImage} groupName="image-comparison" cardIndex={2} />
          <p className="mt-2 text-sm text-gray-600 text-center">Broken Image URL</p>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Click any card to test expansion behavior with different image states
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of different image scenarios: valid image, no image, and broken image URL. All cards maintain the same expansion behavior regardless of image state.',
      },
    },
  },
};

export const AllWithImages: Story = {
  args: {
    width: 13, // rem units - equivalent to ~208px
    height: 23.125, // rem units - equivalent to 23.125rem
    expandedWidth: 30, // rem units - equivalent to 30rem
  },
  render: (args) => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Cards with Images</h3>
        <p className="text-sm text-gray-600">All cards showing real anime cover images - customize dimensions below</p>
      </div>
      
      <div className="flex gap-4 overflow-x-auto p-4 max-w-6xl mx-auto">
        <BaseAnimeCard 
          anime={mockAnime} 
          groupName="image-cards" 
          cardIndex={0}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
        />
        <BaseAnimeCard 
          anime={animeWithImage} 
          groupName="image-cards" 
          cardIndex={1}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
        />
        <BaseAnimeCard 
          anime={{
            ...mockAnime,
            id: 5,
            title: "One Piece",
            coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg",
            score: 9.2,
            year: 1999,
            episodes: 1000,
          }} 
          groupName="image-cards" 
          cardIndex={2}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
        />
        <BaseAnimeCard 
          anime={{
            ...mockAnime,
            id: 6,
            title: "Spirited Away",
            coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg", // Using Demon Slayer image
            score: 9.3,
            year: 2001,
            episodes: 1,
            format: "MOVIE",
          }} 
          groupName="image-cards" 
          cardIndex={3}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
        />
        <BaseAnimeCard 
          anime={{
            ...mockAnime,
            id: 7,
            title: "Demon Slayer",
            coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg", // Using Demon Slayer image
            score: 8.7,
            year: 2019,
            episodes: 26,
          }} 
          groupName="image-cards" 
          cardIndex={4}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
        />
        <BaseAnimeCard 
          anime={{
            ...mockAnime,
            id: 8,
            title: "My Hero Academia",
            coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg", // Using One Piece image
            score: 8.5,
            year: 2016,
            episodes: 13,
          }} 
          groupName="image-cards" 
          cardIndex={5}
          width={`${args.width}rem`}
          height={`${args.height}rem`}
          expandedWidth={`${args.expandedWidth}rem`}
        />
      </div>
      
      <div className="text-center text-sm text-gray-500">
        All cards have valid cover images - use controls to adjust dimensions
      </div>
    </div>
  ),
  argTypes: {
    width: {
      control: { type: 'range', min: 6, max: 25, step: 0.5 },
      description: 'Width of cards in normal state (in rem units)'
    },
    height: {
      control: { type: 'range', min: 9, max: 31, step: 0.5 },
      description: 'Height of cards (remains constant during expansion, in rem units)'
    },
    expandedWidth: {
      control: { type: 'range', min: 12, max: 50, step: 0.5 },
      description: 'Width of cards when expanded (in rem units)'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Customizable gallery showing cards with valid cover images. Use the controls below to adjust width, height, and expanded width for all cards simultaneously.',
      },
    },
  },
};

export const PopulatedCards: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Mixed Image States</h3>
        <p className="text-sm text-gray-600">Cards demonstrating all image scenarios: working images, no image, and broken URLs</p>
      </div>
      
      <div className="flex gap-4 overflow-x-auto p-4 max-w-6xl mx-auto">
        <div className="text-center">
          <BaseAnimeCard anime={mockAnime} groupName="populated-cards" cardIndex={0} />
          <p className="mt-2 text-xs text-gray-500">Valid Image</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard anime={animeWithImage} groupName="populated-cards" cardIndex={1} />
          <p className="mt-2 text-xs text-gray-500">Valid Image</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard anime={animeWithoutImage} groupName="populated-cards" cardIndex={2} />
          <p className="mt-2 text-xs text-gray-500">No Image (null)</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard anime={animeWithBrokenImage} groupName="populated-cards" cardIndex={3} />
          <p className="mt-2 text-xs text-gray-500">Broken URL</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard 
            anime={{
              ...mockAnime,
              id: 5,
              title: "One Piece",
              coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg", // Using One Piece image
              score: 9.2,
              year: 1999,
              episodes: 1000,
            }} 
            groupName="populated-cards" 
            cardIndex={4} 
          />
          <p className="mt-2 text-xs text-gray-500">Valid Image</p>
        </div>
        <div className="text-center">
          <BaseAnimeCard 
            anime={{
              ...mockAnime,
              id: 6,
              title: "Spirited Away",
              coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg", // Using Demon Slayer image
              score: 9.3,
              year: 2001,
              episodes: 1,
              format: "MOVIE",
            }} 
            groupName="populated-cards" 
            cardIndex={5} 
          />
          <p className="mt-2 text-xs text-gray-500">Valid Image</p>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Mixed scenarios: 4 cards with images, 2 with fallback states - scroll to see all
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive testing gallery showing all image scenarios: valid images, missing images (null), and broken URLs. Labels below each card indicate the expected behavior.',
      },
    },
  },
};

// Use the same data as AnimeInfoCard DarkBackground story for consistency
const attackOnTitan: AnimeBase = {
  id: 16498,
  title: 'Attack on Titan',
  synopsis: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction. When the Titans breach Wall Maria, Eren Yeager vows to exterminate every last Titan to avenge his mother and reclaim humanity\'s territory. With his childhood friends Mikasa and Armin, Eren joins the Survey Corps, an elite group of soldiers who fight Titans outside the walls.',
  score: 9.0,
  userScore: 10,
  episodes: 25,
  year: 2013,
  season: 'SPRING',
  status: 'FINISHED',
  format: 'TV',
  genres: ['Action', 'Drama', 'Fantasy', 'Military', 'Shounen', 'Super Power'],
  duration: '24',
  studios: ['Madhouse', 'Studio Pierrot'],
  popularity: 1,
  source: 'anilist',
  coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
};

const spiritedAway: AnimeBase = {
  id: 199,
  title: 'Spirited Away',
  synopsis: 'Stubborn, spoiled, and naïve, 10-year-old Chihiro Ogino is less than pleased when she and her parents are moving to a new home. While driving to their new house, Chihiro\'s father makes a wrong turn and drives down a lonely one-lane road which dead-ends in front of a tunnel. Her parents decide to stop the car and explore the area. They go through the tunnel and find an abandoned amusement park on the other side, with its own little town.',
  score: 9.3,
  userScore: 10,
  episodes: 1,
  year: 2001,
  season: 'SUMMER',
  status: 'FINISHED',
  format: 'MOVIE',
  genres: ['Adventure', 'Family', 'Supernatural', 'Drama'],
  duration: '125',
  studios: ['Studio Ghibli'],
  popularity: 15,
  source: 'mal',
  coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
};

const demonSlayer: AnimeBase = {
  id: 101922,
  title: 'Demon Slayer: Kimetsu no Yaiba',
  synopsis: 'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself. Though devastated by this grim reality, Tanjiro resolves to become a demon slayer so that he can turn his sister back into a human and kill the demon that massacred his family.',
  score: 8.7,
  userScore: 9,
  episodes: 26,
  year: 2019,
  season: 'SPRING',
  status: 'FINISHED',
  format: 'TV',
  genres: ['Action', 'Supernatural', 'Historical', 'Shounen'],
  duration: '24',
  studios: ['Ufotable'],
  popularity: 2,
  source: 'anilist',
  coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
};

export const WithAnimeInfoCard: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">BaseAnimeCard + AnimeInfoCard Integration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Complete integration testing showing expanded content with AnimeInfoCard component
        </p>
        <p className="text-xs text-gray-500">
          Click any card to see the expansion with detailed anime information
        </p>
      </div>
      
      <div className="flex gap-4 overflow-x-auto p-4 max-w-6xl mx-auto">
        <BaseAnimeCard 
          anime={attackOnTitan} 
          groupName="integration-cards" 
          cardIndex={0}
          width="13rem"
          height="23rem"
          expandedWidth="30rem"
        >
          <div className="card-expanded-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-800 pointer-events-none rounded-xl p-4">
            <AnimeInfoCard anime={attackOnTitan} />
          </div>
        </BaseAnimeCard>
        
        <BaseAnimeCard 
          anime={spiritedAway}
          groupName="integration-cards" 
          cardIndex={1}
          width="13rem"
          height="23rem"
          expandedWidth="30rem"
        >
          <div className="card-expanded-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-800 pointer-events-none rounded-xl p-4">
            <AnimeInfoCard anime={spiritedAway} />
          </div>
        </BaseAnimeCard>
        
        <BaseAnimeCard 
          anime={demonSlayer} 
          groupName="integration-cards" 
          cardIndex={2}
          width="13rem"
          height="23rem"
          expandedWidth="30rem"
        >
          <div className="card-expanded-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-800 pointer-events-none rounded-xl p-4">
            <AnimeInfoCard anime={demonSlayer} />
          </div>
        </BaseAnimeCard>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Integration test with AnimeInfoCard - click cards to see expanded content with detailed information
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete integration testing of BaseAnimeCard with AnimeInfoCard component. The AnimeInfoCard appears when cards are expanded, showing detailed anime information including badges, metadata, and synopsis. Features proper opacity transitions and dark background support.',
      },
    },
  },
};
