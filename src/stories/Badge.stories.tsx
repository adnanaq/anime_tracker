import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../components/ui/Badge";
import { fn } from "@storybook/test";

// Mock icons for stories
const InfoIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const StarIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const UserIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile badge component with multiple variants, sizes, and interactive states. Built with class-variance-authority for consistent styling and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "success",
        "warning",
        "danger",
        "info",
        "neutral",
        "outline",
      ],
      description: "Visual style variant of the badge",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Size of the badge",
    },
    shape: {
      control: "select",
      options: ["rounded", "pill", "square"],
      description: "Shape style of the badge",
    },
    animated: {
      control: "boolean",
      description: "Enable animation effects",
    },
    interactive: {
      control: "boolean",
      description: "Make badge interactive with hover effects",
    },
    icon: {
      control: false,
      description: "Icon element to display before text",
    },
    children: {
      control: "text",
      description: "Badge content",
    },
    onRemove: {
      control: false,
      description: "Callback for remove button",
    },
  },
  args: {
    children: "Badge",
    onRemove: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// === BASIC VARIANTS ===
export const Default: Story = {
  args: {
    children: "Default Badge",
  },
};

// Individual variant stories removed - see AllVariants story for comprehensive showcase

// === SIZE VARIANTS ===
export const AllSizes: Story = {
  render: (args) => {
    const { size, ...otherArgs } = args;
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <Badge {...otherArgs} size="xs">{args.children || "Extra Small"}</Badge>
        <Badge {...otherArgs} size="sm">{args.children || "Small"}</Badge>
        <Badge {...otherArgs} size="md">{args.children || "Medium"}</Badge>
        <Badge {...otherArgs} size="lg">{args.children || "Large"}</Badge>
      </div>
    );
  },
  args: {
    variant: "primary",
    children: "Badge",
  },
  parameters: {
    docs: {
      description: {
        story: "Different size variants from extra small to large. Size is fixed to show all sizes, but you can control variant, shape, children, interactive, animated, and other properties.",
      },
    },
  },
};

// === SHAPE VARIANTS ===
export const AllShapes: Story = {
  render: (args) => {
    const { shape, ...otherArgs } = args;
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <Badge {...otherArgs} shape="rounded">{args.children || "Rounded"}</Badge>
        <Badge {...otherArgs} shape="pill">{args.children || "Pill"}</Badge>
        <Badge {...otherArgs} shape="square">{args.children || "Square"}</Badge>
      </div>
    );
  },
  args: {
    variant: "success",
    children: "Badge",
  },
  parameters: {
    docs: {
      description: {
        story: "Different shape variants: rounded corners, pill-shaped, and square corners. Shape is fixed to show all shapes, but you can control variant, size, children, interactive, animated, and other properties.",
      },
    },
  },
};

// === COLOR SHOWCASE ===
export const AllVariants: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge {...otherArgs} variant="primary">{args.children || "Primary"}</Badge>
        <Badge {...otherArgs} variant="secondary">{args.children || "Secondary"}</Badge>
        <Badge {...otherArgs} variant="success">{args.children || "Success"}</Badge>
        <Badge {...otherArgs} variant="warning">{args.children || "Warning"}</Badge>
        <Badge {...otherArgs} variant="danger">{args.children || "Danger"}</Badge>
        <Badge {...otherArgs} variant="info">{args.children || "Info"}</Badge>
        <Badge {...otherArgs} variant="neutral">{args.children || "Neutral"}</Badge>
        <Badge {...otherArgs} variant="outline">{args.children || "Outline"}</Badge>
      </div>
    );
  },
  args: {
    size: "sm",
    children: "Badge",
  },
  parameters: {
    docs: {
      description: {
        story: "All available color variants displayed together. Variant is fixed to show all variants, but you can control size, shape, children, interactive, animated, and other properties.",
      },
    },
  },
};

// === WITH ICONS ===
export const WithIcons: Story = {
  render: (args) => {
    const { icon, ...otherArgs } = args;
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <Badge {...otherArgs} variant="info" icon={<InfoIcon />}>
          {args.children || "Info"}
        </Badge>
        <Badge {...otherArgs} variant="warning" icon={<StarIcon />}>
          {args.children || "Featured"}
        </Badge>
        <Badge {...otherArgs} variant="success" icon={<UserIcon />}>
          {args.children || "User"}
        </Badge>
        <Badge {...otherArgs} variant="primary" icon={<StarIcon />} size="lg">
          {args.children || "Premium"}
        </Badge>
      </div>
    );
  },
  args: {
    children: "Badge",
  },
  parameters: {
    docs: {
      description: {
        story: "Badges with icons for enhanced visual communication. Icons are fixed to show different icon examples, but you can control size, shape, children, interactive, animated, and other properties.",
      },
    },
  },
};

// === INTERACTIVE BADGES ===
export const Interactive: Story = {
  render: (args) => {
    const { interactive, ...otherArgs } = args;
    return <Badge {...otherArgs} interactive={true} onClick={fn()}>{args.children || "Click me"}</Badge>;
  },
  args: {
    variant: "primary",
    children: "Click me",
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive badge with hover effects and click handler. Interactive is fixed to true, but you can control variant, size, shape, children, animated, and other properties.",
      },
    },
  },
};

export const InteractiveVariants: Story = {
  render: (args) => {
    const { interactive, ...otherArgs } = args;
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <Badge {...otherArgs} variant="primary" interactive={true} onClick={fn()}>
          {args.children || "Primary"}
        </Badge>
        <Badge {...otherArgs} variant="success" interactive={true} onClick={fn()}>
          {args.children || "Success"}
        </Badge>
        <Badge {...otherArgs} variant="warning" interactive={true} onClick={fn()}>
          {args.children || "Warning"}
        </Badge>
        <Badge {...otherArgs} variant="outline" interactive={true} onClick={fn()}>
          {args.children || "Outline"}
        </Badge>
      </div>
    );
  },
  args: {
    children: "Badge",
  },
  parameters: {
    docs: {
      description: {
        story: "Multiple interactive badge variants with hover effects. Interactive is fixed to true, but you can control size, shape, children, animated, and other properties.",
      },
    },
  },
};

// === ANIMATED BADGES ===
export const Animated: Story = {
  render: (args) => {
    const { animated, ...otherArgs } = args;
    return <Badge {...otherArgs} animated={true}>{args.children || "Animated Badge"}</Badge>;
  },
  args: {
    variant: "success",
    children: "Animated Badge",
  },
  parameters: {
    docs: {
      description: {
        story: "Badge with animation effects. Animated is fixed to true, but you can control variant, size, shape, children, interactive, and other properties. Hover to see the shimmer effect.",
      },
    },
  },
};

export const AnimatedVariants: Story = {
  render: (args) => {
    const { animated, ...otherArgs } = args;
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <Badge {...otherArgs} variant="success" animated={true}>
          {args.children || "Success"}
        </Badge>
        <Badge {...otherArgs} variant="warning" animated={true}>
          {args.children || "Warning"}
        </Badge>
        <Badge {...otherArgs} variant="danger" animated={true}>
          {args.children || "Danger"}
        </Badge>
        <Badge {...otherArgs} variant="primary" animated={true} interactive onClick={fn()}>
          {args.children || "Interactive + Animated"}
        </Badge>
      </div>
    );
  },
  args: {
    children: "Badge",
  },
  parameters: {
    docs: {
      description: {
        story: "Status badges with pulse animations and combined interactive + animated effects. Animated is fixed to true, but you can control variant, size, shape, children, interactive, and other properties.",
      },
    },
  },
};

// === REMOVABLE BADGES ===
export const Removable: Story = {
  args: {
    variant: "primary",
    children: "Removable Badge",
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Badge with remove functionality. Click the X button to trigger remove callback.",
      },
    },
  },
};

export const RemovableVariants: Story = {
  render: (args) => {
    const { onRemove, ...otherArgs } = args;
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <Badge {...otherArgs} variant="primary" onRemove={fn()}>
          {args.children || "Primary"}
        </Badge>
        <Badge {...otherArgs} variant="success" onRemove={fn()}>
          {args.children || "Success"}
        </Badge>
        <Badge {...otherArgs} variant="warning" onRemove={fn()}>
          {args.children || "Warning"}
        </Badge>
        <Badge {...otherArgs} variant="outline" onRemove={fn()}>
          {args.children || "Outline"}
        </Badge>
      </div>
    );
  },
  args: {
    children: "Badge",
  },
  parameters: {
    docs: {
      description: {
        story: "Multiple removable badge variants with remove buttons. onRemove is fixed to show remove functionality, but you can control variant, size, shape, children, interactive, animated, and other properties.",
      },
    },
  },
};

// === COMPLEX COMBINATIONS ===
export const WithIconAndRemove: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Badge variant="success" icon={<StarIcon />} onRemove={fn()} size="md">
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
        story:
          "Complex badges combining icons, remove functionality, and various features.",
      },
    },
  },
};

// === REAL-WORLD EXAMPLES ===
export const AnimeStatus: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="success" shape="pill">
        Watching
      </Badge>
      <Badge variant="primary" shape="pill">
        Completed
      </Badge>
      <Badge variant="warning" shape="pill">
        On Hold
      </Badge>
      <Badge variant="danger" shape="pill">
        Dropped
      </Badge>
      <Badge variant="neutral" shape="pill">
        Plan to Watch
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Real-world example: Anime watching status badges as used in the AnimeTrackr application.",
      },
    },
  },
};

export const UserScores: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="danger" icon={<StarIcon />} size="sm">
        3.2
      </Badge>
      <Badge variant="warning" icon={<StarIcon />} size="sm">
        5.8
      </Badge>
      <Badge variant="info" icon={<StarIcon />} size="sm">
        7.1
      </Badge>
      <Badge variant="success" icon={<StarIcon />} size="sm">
        8.9
      </Badge>
      <Badge variant="primary" icon={<StarIcon />} size="sm" animated>
        9.5
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Real-world example: User rating badges with star icons and color-coded scores.",
      },
    },
  },
};

export const Genres: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap max-w-md">
      <Badge variant="outline" size="xs">
        Action
      </Badge>
      <Badge variant="outline" size="xs">
        Adventure
      </Badge>
      <Badge variant="outline" size="xs">
        Drama
      </Badge>
      <Badge variant="outline" size="xs">
        Romance
      </Badge>
      <Badge variant="outline" size="xs">
        Comedy
      </Badge>
      <Badge variant="outline" size="xs">
        Supernatural
      </Badge>
      <Badge variant="outline" size="xs">
        School
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Real-world example: Genre tags for anime as used in search and filtering.",
      },
    },
  },
};

// === PLAYGROUND ===

export const Playground: Story = {
  args: {
    children: "Playground Badge",
    variant: "primary",
    size: "sm",
    shape: "rounded",
    interactive: false,
    animated: false,
    icon: undefined,
    onRemove: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Full Control Playground**

This story gives you complete control over every Badge property. Perfect for:
- Testing different combinations of properties
- Experimenting with edge cases
- Interactive development and debugging
- Checking behavior with custom configurations

**Available Controls:**
- \`children\`: Badge text content
- \`variant\`: Color variant (primary, secondary, success, warning, danger, info, neutral, outline)
- \`size\`: Size variant (xs, sm, md, lg)
- \`shape\`: Shape variant (rounded, pill, square)
- \`interactive\`: Enable hover/click effects
- \`animated\`: Enable animation effects
- \`icon\`: Add an icon (Note: Use Badge stories with icons for icon examples)
- \`onRemove\`: Add remove functionality (set to any function to enable)

**Usage:** Change any control to see immediate effects. Unlike showcase stories that demonstrate specific features, this playground lets you test any combination of properties.
        `,
      },
    },
  },
};

// === RESPONSIVE SHOWCASE ===
export const ResponsiveExample: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
      <div className="flex flex-col gap-2 items-center">
        <h4 className="text-sm font-medium text-gray-600">Small Screen</h4>
        <Badge variant="primary" size="sm">
          Responsive Badge
        </Badge>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <h4 className="text-sm font-medium text-gray-600">Medium Screen</h4>
        <Badge variant="success" size="md">
          Responsive Badge
        </Badge>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <h4 className="text-sm font-medium text-gray-600">Large Screen</h4>
        <Badge variant="info" size="lg">
          Responsive Badge
        </Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Responsive behavior example showing different sizes across screen sizes.",
      },
    },
  },
};

// === ACCESSIBILITY EXAMPLE ===
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Semantic Usage
        </h4>
        <p className="text-sm text-gray-500 mb-2">
          Status: <Badge variant="success">Active</Badge> | Priority:{" "}
          <Badge variant="warning">High</Badge>
        </p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          With Proper Labels
        </h4>
        <Badge
          variant="danger"
          onRemove={fn()}
          aria-label="Remove error notification"
        >
          Error
        </Badge>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Keyboard Navigation
        </h4>
        <Badge
          variant="primary"
          interactive
          onClick={fn()}
          onKeyDown={(e) => e.key === "Enter" && fn()}
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
        story:
          "Accessibility best practices including proper ARIA labels, keyboard navigation, and semantic usage.",
      },
    },
  },
};

