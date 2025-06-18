import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Card } from '../components/ui/Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Card component is a foundational UI element that provides expandable container functionality with radio group behavior.

## Features
- **Expandable/Collapsible**: Can be configured to expand and collapse
- **Radio Group Behavior**: Only one card in a group can be expanded at a time
- **Keyboard Navigation**: Supports Enter and Space key interactions
- **Flexible Content**: Accepts any React children
- **Click Handling**: Supports custom click handlers
- **Non-expandable Mode**: Can be used as a static container

## Usage
\`\`\`tsx
<Card 
  expanded={false}
  expandable={true}
  groupName="my-card-group"
  onClick={() => console.log('Card clicked')}
>
  <div>Card content goes here</div>
</Card>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    expanded: {
      description: 'Whether the card is currently expanded',
      control: 'boolean',
    },
    expandable: {
      description: 'Whether the card can be expanded/collapsed',
      control: 'boolean',
    },
    groupName: {
      description: 'Radio group name for mutual exclusion',
      control: 'text',
    },
    cardIndex: {
      description: 'Index of the card in the group',
      control: { type: 'number', min: 0, max: 10, step: 1 },
    },
    onClick: {
      description: 'Callback fired when card is clicked',
      action: 'clicked',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
    children: {
      description: 'Card content',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic Stories
export const Default: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'default-group',
    cardIndex: 0,
    onClick: action('card-clicked'),
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Default Card</h3>
        <p className="text-gray-600">This is a basic card with default settings. Click to expand/collapse.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic card with default configuration. Click to see expansion behavior.',
      },
    },
  },
};

export const Expanded: Story = {
  args: {
    expanded: true,
    expandable: true,
    groupName: 'expanded-group',
    cardIndex: 0,
    onClick: action('card-clicked'),
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Expanded Card</h3>
        <p className="text-gray-600 mb-4">This card starts in an expanded state.</p>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm">Additional content visible when expanded.</p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card that starts in an expanded state.',
      },
    },
  },
};

export const NonExpandable: Story = {
  args: {
    expanded: false,
    expandable: false,
    onClick: action('card-clicked'),
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Static Card</h3>
        <p className="text-gray-600">This card cannot be expanded or collapsed. It acts as a static container.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Non-expandable card that acts as a static container.',
      },
    },
  },
};

// Radio Group Behavior
export const RadioGroupBehavior: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Cards in the same group exhibit radio button behavior - only one can be expanded at a time.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        <Card
          expanded={false}
          expandable={true}
          groupName="radio-demo"
          cardIndex={0}
          onClick={action('card-1-clicked')}
        >
          <div className="p-4">
            <h4 className="font-semibold mb-2">Card 1</h4>
            <p className="text-sm text-gray-600">Click to expand</p>
          </div>
        </Card>
        
        <Card
          expanded={true}
          expandable={true}
          groupName="radio-demo"
          cardIndex={1}
          onClick={action('card-2-clicked')}
        >
          <div className="p-4">
            <h4 className="font-semibold mb-2">Card 2</h4>
            <p className="text-sm text-gray-600">Initially expanded</p>
            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
              Expanded content
            </div>
          </div>
        </Card>
        
        <Card
          expanded={false}
          expandable={true}
          groupName="radio-demo"
          cardIndex={2}
          onClick={action('card-3-clicked')}
        >
          <div className="p-4">
            <h4 className="font-semibold mb-2">Card 3</h4>
            <p className="text-sm text-gray-600">Click to expand</p>
          </div>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates radio group behavior where only one card in the group can be expanded at a time.',
      },
    },
  },
};

// Different Content Types
export const WithComplexContent: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'complex-content',
    cardIndex: 0,
    onClick: action('card-clicked'),
    children: (
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
            A
          </div>
          <div>
            <h3 className="text-lg font-semibold">Complex Content Card</h3>
            <p className="text-sm text-gray-500">Subtitle or description</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">75%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
              Action 1
            </button>
            <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">
              Action 2
            </button>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with complex content including avatars, progress bars, and action buttons.',
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'image-card',
    cardIndex: 0,
    onClick: action('card-clicked'),
    children: (
      <div>
        <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl">
          Image Area
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Card with Image</h3>
          <p className="text-gray-600 text-sm">This card includes an image area at the top.</p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with an image or media area.',
      },
    },
  },
};

export const MinimalContent: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'minimal',
    cardIndex: 0,
    onClick: action('card-clicked'),
    children: (
      <div className="p-4 text-center">
        <h4 className="font-semibold">Minimal Card</h4>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with minimal content for simple use cases.',
      },
    },
  },
};

// Different Sizes
export const SmallCard: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'size-demo',
    cardIndex: 0,
    onClick: action('card-clicked'),
    className: 'w-48',
    children: (
      <div className="p-3">
        <h4 className="font-semibold text-sm mb-1">Small Card</h4>
        <p className="text-xs text-gray-600">Compact content</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Smaller card variant with compact content.',
      },
    },
  },
};

export const LargeCard: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'size-demo',
    cardIndex: 1,
    onClick: action('card-clicked'),
    className: 'w-96',
    children: (
      <div className="p-8">
        <h3 className="text-xl font-bold mb-4">Large Card</h3>
        <p className="text-gray-600 mb-4">
          This is a larger card with more spacious content. It demonstrates how the card component
          adapts to different content sizes and spacing requirements.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm font-medium">Feature 1</span>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm font-medium">Feature 2</span>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Larger card variant with more spacious content.',
      },
    },
  },
};

// Custom Styling
export const CustomStyling: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'custom-style',
    cardIndex: 0,
    onClick: action('card-clicked'),
    className: 'border-2 border-blue-500 bg-blue-50 hover:border-blue-600',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Custom Styled Card</h3>
        <p className="text-blue-700">This card has custom styling applied via className.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with custom styling applied through className prop.',
      },
    },
  },
};

// Accessibility Demo
export const AccessibilityDemo: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'a11y-demo',
    cardIndex: 0,
    onClick: action('card-clicked'),
    onKeyDown: action('key-pressed'),
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Accessible Card</h3>
        <p className="text-gray-600 mb-4">
          This card supports keyboard navigation. Try using Tab to focus and Enter/Space to interact.
        </p>
        <div className="text-sm text-gray-500">
          <p>• Tab: Focus the card</p>
          <p>• Enter/Space: Expand/collapse</p>
          <p>• Screen reader friendly</p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features including keyboard navigation and screen reader support.',
      },
    },
  },
};

// Interactive Playground
export const Playground: Story = {
  args: {
    expanded: false,
    expandable: true,
    groupName: 'playground',
    cardIndex: 0,
    onClick: action('card-clicked'),
    className: '',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Interactive Playground</h3>
        <p className="text-gray-600">
          Use the controls below to experiment with different card configurations.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different card configurations using the controls panel.',
      },
    },
  },
};