import type { Meta, StoryObj } from '@storybook/react'
import { Typography } from '../components/ui/Typography/Typography'

const meta: Meta<typeof Typography> = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Typography Component

A versatile Typography component for all text content in the application. Provides consistent text styling with design tokens, semantic HTML elements, and accessibility features.

## Features

- **12 Text Variants**: Complete hierarchy from H1 headings to captions
- **9 Color Options**: Primary, secondary, semantic colors with dark mode support
- **6 Font Weights**: Light to extrabold with consistent scaling
- **Text Utilities**: Alignment, truncation, line clamping
- **Responsive Design**: Automatic scaling on mobile devices
- **Semantic HTML**: Proper element mapping for accessibility
- **Polymorphic Rendering**: Custom element types with \`as\` prop

## Design System Integration

Uses design tokens for consistent typography across the application:
- Font sizes, weights, and line heights
- Color palette with semantic meanings
- Responsive scaling and dark mode support
- Hardware-accelerated animations
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'bodyLarge', 'bodySmall', 'caption', 'overline', 'label'],
      description: 'Typography variant that determines size, weight, and semantic meaning'
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'inverse', 'muted', 'success', 'warning', 'danger', 'info'],
      description: 'Text color variant from the design system'
    },
    weight: {
      control: 'select',
      options: ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'],
      description: 'Font weight override'
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment'
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis'
    },
    lineClamp: {
      control: 'select',
      options: ['none', '1', '2', '3', '4'],
      description: 'Limit text to specific number of lines'
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'label'],
      description: 'HTML element to render'
    },
    children: {
      control: 'text',
      description: 'Text content to display'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Basic Variants
export const Default: Story = {
  args: {
    children: 'Default body text with normal styling and readable line height.'
  }
}

export const Heading1: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="h1">{args.children || 'Page Title (H1)'}</Typography>
  },
  args: {
    children: 'Page Title (H1)'
  },
  parameters: {
    docs: {
      description: {
        story: 'H1 heading variant. Variant is fixed to h1, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Heading2: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="h2">{args.children || 'Section Title (H2)'}</Typography>
  },
  args: {
    children: 'Section Title (H2)'
  },
  parameters: {
    docs: {
      description: {
        story: 'H2 heading variant. Variant is fixed to h2, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Heading3: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="h3">{args.children || 'Subsection Title (H3)'}</Typography>
  },
  args: {
    children: 'Subsection Title (H3)'
  },
  parameters: {
    docs: {
      description: {
        story: 'H3 heading variant. Variant is fixed to h3, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Heading4: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="h4">{args.children || 'Content Title (H4)'}</Typography>
  },
  args: {
    children: 'Content Title (H4)'
  },
  parameters: {
    docs: {
      description: {
        story: 'H4 heading variant. Variant is fixed to h4, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Heading5: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="h5">{args.children || 'Small Title (H5)'}</Typography>
  },
  args: {
    children: 'Small Title (H5)'
  },
  parameters: {
    docs: {
      description: {
        story: 'H5 heading variant. Variant is fixed to h5, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Heading6: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="h6">{args.children || 'Smallest Title (H6)'}</Typography>
  },
  args: {
    children: 'Smallest Title (H6)'
  },
  parameters: {
    docs: {
      description: {
        story: 'H6 heading variant. Variant is fixed to h6, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Body: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="body">{args.children || 'Regular body text for paragraphs and general content. Provides optimal readability with proper line height and spacing.'}</Typography>
  },
  args: {
    children: 'Regular body text for paragraphs and general content. Provides optimal readability with proper line height and spacing.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Body text variant. Variant is fixed to body, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const BodyLarge: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="bodyLarge">{args.children || 'Large body text for important content, introductions, or emphasis. Slightly larger than regular body text.'}</Typography>
  },
  args: {
    children: 'Large body text for important content, introductions, or emphasis. Slightly larger than regular body text.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Body large variant. Variant is fixed to bodyLarge, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const BodySmall: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="bodySmall">{args.children || 'Small body text for secondary information, disclaimers, or supplementary content.'}</Typography>
  },
  args: {
    children: 'Small body text for secondary information, disclaimers, or supplementary content.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Body small variant. Variant is fixed to bodySmall, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Caption: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="caption">{args.children || 'Caption text for images, captions, or very small supplementary information.'}</Typography>
  },
  args: {
    children: 'Caption text for images, captions, or very small supplementary information.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Caption variant. Variant is fixed to caption, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Overline: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="overline">{args.children || 'Overline text'}</Typography>
  },
  args: {
    children: 'Overline text'
  },
  parameters: {
    docs: {
      description: {
        story: 'Overline variant. Variant is fixed to overline, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

export const Label: Story = {
  render: (args) => {
    const { variant, ...otherArgs } = args
    return <Typography {...otherArgs} variant="label">{args.children || 'Form Label'}</Typography>
  },
  args: {
    children: 'Form Label'
  },
  parameters: {
    docs: {
      description: {
        story: 'Label variant. Variant is fixed to label, but you can control color, weight, align, children, and other properties.'
      }
    }
  }
}

// Color Variants
export const ColorVariants: Story = {
  render: (args) => {
    const { color, children, ...otherArgs } = args
    return (
      <div className="space-y-4">
        <Typography {...otherArgs} color="primary">{children || 'Primary text color for main content'}</Typography>
        <Typography {...otherArgs} color="secondary">{children || 'Secondary text color for supporting content'}</Typography>
        <Typography {...otherArgs} color="tertiary">{children || 'Tertiary text color for subtle information'}</Typography>
        <Typography {...otherArgs} color="muted">{children || 'Muted text color for disabled or inactive content'}</Typography>
        <Typography {...otherArgs} color="success">{children || 'Success text color for positive messages'}</Typography>
        <Typography {...otherArgs} color="warning">{children || 'Warning text color for cautionary messages'}</Typography>
        <Typography {...otherArgs} color="danger">{children || 'Danger text color for error messages'}</Typography>
        <Typography {...otherArgs} color="info">{children || 'Info text color for informational messages'}</Typography>
      </div>
    )
  },
  args: {
    variant: 'body',
    children: 'Sample text content'
  },
  parameters: {
    docs: {
      description: {
        story: 'All available color variants with semantic meanings and proper contrast ratios. Use controls to change variant, weight, children text, or alignment (color is fixed to show all colors).'
      }
    }
  }
}

// Font Weights
export const FontWeights: Story = {
  render: (args) => {
    const { weight, children, ...otherArgs } = args
    return (
      <div className="space-y-4">
        <Typography {...otherArgs} weight="light">{children || 'Light weight text (300)'}</Typography>
        <Typography {...otherArgs} weight="normal">{children || 'Normal weight text (400)'}</Typography>
        <Typography {...otherArgs} weight="medium">{children || 'Medium weight text (500)'}</Typography>
        <Typography {...otherArgs} weight="semibold">{children || 'Semibold weight text (600)'}</Typography>
        <Typography {...otherArgs} weight="bold">{children || 'Bold weight text (700)'}</Typography>
        <Typography {...otherArgs} weight="extrabold">{children || 'Extrabold weight text (800)'}</Typography>
      </div>
    )
  },
  args: {
    variant: 'body',
    color: 'primary',
    children: 'Sample weight text'
  },
  parameters: {
    docs: {
      description: {
        story: 'Font weight options for emphasis and hierarchy. Use controls to change variant, color, children text, or alignment (weight is fixed to show all weights).'
      }
    }
  }
}

// Text Alignment
export const TextAlignment: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <Typography align="left">Left aligned text</Typography>
      <Typography align="center">Center aligned text</Typography>
      <Typography align="right">Right aligned text</Typography>
      <Typography align="justify">Justified text that spreads evenly across the full width of the container with proper spacing between words.</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text alignment options for different layout needs.'
      }
    }
  }
}

// Typography Hierarchy
export const TypographyHierarchy: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <Typography variant="h1">Typography Hierarchy</Typography>
      <Typography variant="h2">Section: Getting Started</Typography>
      <Typography variant="body">
        This is the main body content that provides detailed information about the topic. 
        It uses the standard body variant for optimal readability and proper line spacing.
      </Typography>
      <Typography variant="h3">Subsection: Key Features</Typography>
      <Typography variant="bodyLarge">
        Large body text is used for important introductory content or key points that need emphasis.
      </Typography>
      <Typography variant="h4">Component Details</Typography>
      <Typography variant="body">
        Regular body text continues with the detailed explanation of features and functionality.
      </Typography>
      <Typography variant="bodySmall">
        Small body text is used for additional notes, disclaimers, or supplementary information.
      </Typography>
      <Typography variant="caption">
        Caption text for images, footnotes, or very small supplementary details.
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete typography hierarchy showing proper nesting and visual relationships.'
      }
    }
  }
}

// Text Utilities
export const TextUtilities: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-6">
      <div>
        <Typography variant="overline" color="secondary">Truncated Text</Typography>
        <Typography truncate>
          This is a very long line of text that will be truncated with an ellipsis when it exceeds the container width
        </Typography>
      </div>
      
      <div>
        <Typography variant="overline" color="secondary">Line Clamped (2 lines)</Typography>
        <Typography lineClamp="2">
          This is a longer paragraph of text that will be clamped to exactly two lines. 
          Any additional content beyond the second line will be hidden with an ellipsis. 
          This is useful for previews, cards, or any content that needs consistent height.
        </Typography>
      </div>
      
      <div>
        <Typography variant="overline" color="secondary">Line Clamped (3 lines)</Typography>
        <Typography lineClamp="3">
          This paragraph demonstrates the three-line clamp utility. It will show exactly three lines 
          of text before truncating with an ellipsis. This provides more content than the two-line version 
          while still maintaining a predictable layout. Perfect for article previews, product descriptions, 
          or any content where you want to show a bit more context while keeping the design consistent.
        </Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text utility options for truncation and line clamping.'
      }
    }
  }
}

// Polymorphic Rendering
export const PolymorphicRendering: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h3" as="h1">H3 styling on H1 element</Typography>
      <Typography variant="body" as="span">Body styling on span element</Typography>
      <Typography variant="label" as="div">Label styling on div element</Typography>
      <Typography variant="caption" as="p">Caption styling on paragraph element</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Polymorphic rendering allows using any HTML element while maintaining visual styling.'
      }
    }
  }
}

// Anime-specific Examples
export const AnimeContentExamples: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <Typography variant="h1">Attack on Titan</Typography>
      <Typography variant="overline" color="info">Action • Drama • Fantasy</Typography>
      
      <div className="space-y-2">
        <Typography variant="label" color="secondary">Synopsis</Typography>
        <Typography variant="bodyLarge">
          Humanity fights for survival against giant humanoid Titans that have brought them to the brink of extinction.
        </Typography>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Typography variant="caption" color="tertiary">Rating</Typography>
          <Typography variant="h4" color="success">9.0/10</Typography>
        </div>
        <div>
          <Typography variant="caption" color="tertiary">Episodes</Typography>
          <Typography variant="h4">87</Typography>
        </div>
      </div>
      
      <div>
        <Typography variant="overline" color="warning">Currently Watching</Typography>
        <Typography variant="bodySmall" color="secondary">
          Episode 15 of Season 4 • Last watched 2 days ago
        </Typography>
      </div>
      
      <Typography variant="caption" color="muted">
        Added to your list on March 15, 2024
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example showing Typography used in anime content display.'
      }
    }
  }
}

// Form Labels and Text
export const FormTextExamples: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div>
        <Typography variant="label" as="label" htmlFor="anime-search">
          Search Anime
        </Typography>
        <Typography variant="bodySmall" color="secondary">
          Enter anime title, genre, or studio name
        </Typography>
      </div>
      
      <div>
        <Typography variant="label" as="label" htmlFor="rating">
          Your Rating
        </Typography>
        <Typography variant="caption" color="tertiary">
          Rate from 1-10 stars
        </Typography>
      </div>
      
      <div>
        <Typography variant="overline" color="success">Success</Typography>
        <Typography variant="bodySmall" color="success">
          Anime successfully added to your watchlist
        </Typography>
      </div>
      
      <div>
        <Typography variant="overline" color="danger">Error</Typography>
        <Typography variant="bodySmall" color="danger">
          Please enter a valid anime title
        </Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Typography used in forms with proper labels, descriptions, and messages.'
      }
    }
  }
}

// Responsive Example
export const ResponsiveExample: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <Typography variant="h1">Responsive Typography</Typography>
      <Typography variant="body">
        This heading and text will automatically scale down on mobile devices to maintain readability 
        and proper proportions across all screen sizes.
      </Typography>
      <Typography variant="bodySmall" color="secondary">
        Resize your viewport to see the responsive behavior in action.
      </Typography>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'responsive'
    },
    docs: {
      description: {
        story: 'Typography automatically scales for optimal readability on mobile devices.'
      }
    }
  }
}

// Accessibility Example
export const AccessibilityExample: Story = {
  render: () => (
    <article className="max-w-2xl space-y-4">
      <header>
        <Typography variant="h1" as="h1">Accessible Typography</Typography>
        <Typography variant="bodyLarge" color="secondary">
          Proper semantic HTML with ARIA attributes for screen readers
        </Typography>
      </header>
      
      <section aria-labelledby="features-heading">
        <Typography variant="h2" as="h2" id="features-heading">
          Accessibility Features
        </Typography>
        <ul className="space-y-2 mt-4">
          <li>
            <Typography variant="body" as="span">
              <Typography variant="body" weight="semibold" as="strong">Semantic HTML:</Typography> 
              {" "}Proper heading hierarchy and element usage
            </Typography>
          </li>
          <li>
            <Typography variant="body" as="span">
              <Typography variant="body" weight="semibold" as="strong">Color Contrast:</Typography> 
              {" "}WCAG AA compliant color combinations
            </Typography>
          </li>
          <li>
            <Typography variant="body" as="span">
              <Typography variant="body" weight="semibold" as="strong">Font Scaling:</Typography> 
              {" "}Respects user font size preferences
            </Typography>
          </li>
        </ul>
      </section>
      
      <Typography variant="caption" color="tertiary" role="contentinfo">
        This content is fully accessible to screen readers and keyboard navigation.
      </Typography>
    </article>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Proper semantic HTML structure with accessibility best practices.'
      }
    }
  }
}

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
      <div className="space-y-4">
        <Typography variant="overline" color="secondary">Heading Variants</Typography>
        <Typography variant="h1">Heading 1</Typography>
        <Typography variant="h2">Heading 2</Typography>
        <Typography variant="h3">Heading 3</Typography>
        <Typography variant="h4">Heading 4</Typography>
        <Typography variant="h5">Heading 5</Typography>
        <Typography variant="h6">Heading 6</Typography>
      </div>
      
      <div className="space-y-4">
        <Typography variant="overline" color="secondary">Body & Utility Variants</Typography>
        <Typography variant="bodyLarge">Body Large</Typography>
        <Typography variant="body">Body Regular</Typography>
        <Typography variant="bodySmall">Body Small</Typography>
        <Typography variant="label">Label Text</Typography>
        <Typography variant="caption">Caption Text</Typography>
        <Typography variant="overline">Overline Text</Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all typography variants in the design system.'
      }
    }
  }
}

// === PLAYGROUND ===

export const Playground: Story = {
  args: {
    children: 'Playground Typography',
    variant: 'body',
    color: 'primary',
    weight: 'normal',
    align: 'left',
    truncate: false,
    lineClamp: 'none',
    as: undefined
  },
  parameters: {
    docs: {
      description: {
        story: `
**Full Control Playground**

This story gives you complete control over every Typography property. Perfect for:
- Testing different combinations of properties
- Experimenting with edge cases
- Interactive development and debugging
- Checking behavior with custom configurations

**Available Controls:**
- \`children\`: Text content to display
- \`variant\`: Typography variant (h1, h2, h3, h4, h5, h6, body, bodyLarge, bodySmall, caption, overline, label)
- \`color\`: Text color (primary, secondary, tertiary, inverse, muted, success, warning, danger, info)
- \`weight\`: Font weight (light, normal, medium, semibold, bold, extrabold)
- \`align\`: Text alignment (left, center, right, justify)
- \`truncate\`: Truncate text with ellipsis
- \`lineClamp\`: Limit text to specific number of lines (none, 1, 2, 3, 4)
- \`as\`: HTML element to render (h1, h2, h3, h4, h5, h6, p, span, div, label)

**Usage:** Change any control to see immediate effects. Unlike showcase stories that demonstrate specific features, this playground lets you test any combination of properties.
        `
      }
    }
  }
}