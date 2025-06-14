import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Typography } from '../Typography'

describe('Typography Component', () => {
  describe('Basic Functionality', () => {
    it('should render typography with text content', () => {
      render(<Typography>Test Typography</Typography>)
      expect(screen.getByText('Test Typography')).toBeInTheDocument()
    })

    it('should render as paragraph element by default', () => {
      render(<Typography>Default Typography</Typography>)
      const element = screen.getByText('Default Typography')
      expect(element.tagName).toBe('P')
    })

    it('should apply custom className', () => {
      render(<Typography className="custom-class">Typography</Typography>)
      const element = screen.getByText('Typography')
      expect(element).toHaveClass('custom-class')
    })

    it('should apply base typography class', () => {
      render(<Typography>Typography</Typography>)
      const element = screen.getByText('Typography')
      expect(element).toHaveClass('at-typography-base')
    })
  })

  describe('Variants', () => {
    const headingVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
    const bodyVariants = ['body', 'bodyLarge', 'bodySmall'] as const
    const utilityVariants = ['caption', 'overline', 'label'] as const

    headingVariants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Typography variant={variant}>{variant} Text</Typography>)
        const element = screen.getByText(`${variant} Text`)
        expect(element).toHaveClass(`at-typography-${variant}`)
        expect(element.tagName).toBe(variant.toUpperCase())
      })
    })

    bodyVariants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Typography variant={variant}>{variant} Text</Typography>)
        const element = screen.getByText(`${variant} Text`)
        const expectedClass = variant === 'bodyLarge' ? 'at-typography-body-large' : 
                             variant === 'bodySmall' ? 'at-typography-body-small' : 
                             `at-typography-${variant}`
        expect(element).toHaveClass(expectedClass)
        expect(element.tagName).toBe('P')
      })
    })

    utilityVariants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Typography variant={variant}>{variant} Text</Typography>)
        const element = screen.getByText(`${variant} Text`)
        expect(element).toHaveClass(`at-typography-${variant}`)
      })
    })

    it('should use body as default variant', () => {
      render(<Typography>Default Text</Typography>)
      const element = screen.getByText('Default Text')
      expect(element).toHaveClass('at-typography-body')
    })
  })

  describe('Color Variants', () => {
    const colors = ['primary', 'secondary', 'tertiary', 'inverse', 'muted', 'success', 'warning', 'danger', 'info'] as const

    colors.forEach(color => {
      it(`should render ${color} color correctly`, () => {
        render(<Typography color={color}>{color} Text</Typography>)
        const element = screen.getByText(`${color} Text`)
        
        if (['success', 'warning', 'danger', 'info'].includes(color)) {
          // Semantic colors use Tailwind classes
          expect(element).toHaveClass(`text-${color === 'danger' ? 'red' : color === 'warning' ? 'yellow' : color === 'info' ? 'blue' : 'green'}-600`)
        } else {
          // Design token colors
          expect(element).toHaveClass(`at-text-${color}`)
        }
      })
    })

    it('should use primary as default color', () => {
      render(<Typography>Default Color</Typography>)
      const element = screen.getByText('Default Color')
      expect(element).toHaveClass('at-text-primary')
    })
  })

  describe('Font Weights', () => {
    const weights = ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'] as const

    weights.forEach(weight => {
      it(`should render ${weight} font weight correctly`, () => {
        render(<Typography weight={weight}>{weight} Weight</Typography>)
        const element = screen.getByText(`${weight} Weight`)
        expect(element).toHaveClass(`font-${weight}`)
      })
    })

    it('should use normal as default weight', () => {
      render(<Typography>Default Weight</Typography>)
      const element = screen.getByText('Default Weight')
      expect(element).toHaveClass('font-normal')
    })
  })

  describe('Text Alignment', () => {
    const alignments = ['left', 'center', 'right', 'justify'] as const

    alignments.forEach(align => {
      it(`should render ${align} alignment correctly`, () => {
        render(<Typography align={align}>{align} Aligned</Typography>)
        const element = screen.getByText(`${align} Aligned`)
        expect(element).toHaveClass(`text-${align}`)
      })
    })

    it('should use left as default alignment', () => {
      render(<Typography>Default Alignment</Typography>)
      const element = screen.getByText('Default Alignment')
      expect(element).toHaveClass('text-left')
    })
  })

  describe('Text Utilities', () => {
    it('should apply truncate class when truncate prop is true', () => {
      render(<Typography truncate>Truncated Text</Typography>)
      const element = screen.getByText('Truncated Text')
      expect(element).toHaveClass('truncate')
    })

    it('should not apply truncate class when truncate prop is false', () => {
      render(<Typography truncate={false}>Normal Text</Typography>)
      const element = screen.getByText('Normal Text')
      expect(element).not.toHaveClass('truncate')
    })

    const lineClamps = ['1', '2', '3', '4'] as const

    lineClamps.forEach(clamp => {
      it(`should apply line-clamp-${clamp} class when lineClamp is ${clamp}`, () => {
        render(<Typography lineClamp={clamp}>Line Clamped Text</Typography>)
        const element = screen.getByText('Line Clamped Text')
        expect(element).toHaveClass(`line-clamp-${clamp}`)
      })
    })

    it('should not apply line clamp class when lineClamp is none', () => {
      render(<Typography lineClamp="none">No Line Clamp</Typography>)
      const element = screen.getByText('No Line Clamp')
      expect(element).not.toHaveClass('line-clamp-1')
      expect(element).not.toHaveClass('line-clamp-2')
      expect(element).not.toHaveClass('line-clamp-3')
      expect(element).not.toHaveClass('line-clamp-4')
    })
  })

  describe('Polymorphic Behavior', () => {
    it('should render as custom element when as prop is provided', () => {
      render(<Typography as="span">Span Typography</Typography>)
      const element = screen.getByText('Span Typography')
      expect(element.tagName).toBe('SPAN')
    })

    it('should render h3 variant as h1 element when as="h1"', () => {
      render(<Typography variant="h3" as="h1">Custom Element</Typography>)
      const element = screen.getByText('Custom Element')
      expect(element.tagName).toBe('H1')
      expect(element).toHaveClass('at-typography-h3')
    })

    it('should render body variant as div element when as="div"', () => {
      render(<Typography variant="body" as="div">Div Typography</Typography>)
      const element = screen.getByText('Div Typography')
      expect(element.tagName).toBe('DIV')
      expect(element).toHaveClass('at-typography-body')
    })

    it('should pass through additional props', () => {
      render(<Typography data-testid="test-typography" title="Test title">Typography</Typography>)
      const element = screen.getByTestId('test-typography')
      expect(element).toHaveAttribute('title', 'Test title')
    })
  })

  describe('Semantic HTML Mapping', () => {
    it('should map heading variants to proper HTML elements', () => {
      const headings = [
        { variant: 'h1', expectedTag: 'H1' },
        { variant: 'h2', expectedTag: 'H2' },
        { variant: 'h3', expectedTag: 'H3' },
        { variant: 'h4', expectedTag: 'H4' },
        { variant: 'h5', expectedTag: 'H5' },
        { variant: 'h6', expectedTag: 'H6' }
      ] as const

      headings.forEach(({ variant, expectedTag }) => {
        render(<Typography variant={variant}>{variant} text</Typography>)
        const element = screen.getByText(`${variant} text`)
        expect(element.tagName).toBe(expectedTag)
      })
    })

    it('should map body variants to paragraph elements', () => {
      const bodyVariants = ['body', 'bodyLarge', 'bodySmall'] as const

      bodyVariants.forEach(variant => {
        render(<Typography variant={variant}>{variant} text</Typography>)
        const element = screen.getByText(`${variant} text`)
        expect(element.tagName).toBe('P')
      })
    })

    it('should map caption and overline to span elements', () => {
      render(<Typography variant="caption">Caption text</Typography>)
      render(<Typography variant="overline">Overline text</Typography>)

      expect(screen.getByText('Caption text').tagName).toBe('SPAN')
      expect(screen.getByText('Overline text').tagName).toBe('SPAN')
    })

    it('should map label to label element', () => {
      render(<Typography variant="label">Label text</Typography>)
      const element = screen.getByText('Label text')
      expect(element.tagName).toBe('LABEL')
    })
  })

  describe('Accessibility', () => {
    it('should support ARIA attributes', () => {
      render(
        <Typography 
          aria-label="Accessible typography"
          aria-describedby="help-text"
          role="heading"
        >
          Accessible Typography
        </Typography>
      )

      const element = screen.getByText('Accessible Typography')
      expect(element).toHaveAttribute('aria-label', 'Accessible typography')
      expect(element).toHaveAttribute('aria-describedby', 'help-text')
      expect(element).toHaveAttribute('role', 'heading')
    })

    it('should support id attribute for label association', () => {
      render(<Typography variant="label" id="label-id">Form Label</Typography>)
      const element = screen.getByText('Form Label')
      expect(element).toHaveAttribute('id', 'label-id')
    })

    it('should maintain semantic meaning with proper heading hierarchy', () => {
      render(
        <div>
          <Typography variant="h1">Main Title</Typography>
          <Typography variant="h2">Section Title</Typography>
          <Typography variant="h3">Subsection Title</Typography>
        </div>
      )

      const h1 = screen.getByRole('heading', { level: 1 })
      const h2 = screen.getByRole('heading', { level: 2 })
      const h3 = screen.getByRole('heading', { level: 3 })

      expect(h1).toHaveTextContent('Main Title')
      expect(h2).toHaveTextContent('Section Title')
      expect(h3).toHaveTextContent('Subsection Title')
    })
  })

  describe('Form Integration', () => {
    it('should work as form labels with proper association', () => {
      render(
        <div>
          <Typography variant="label" as="label">
            Test Label
          </Typography>
          <input id="test-input" type="text" />
        </div>
      )

      const label = screen.getByText('Test Label')
      expect(label.tagName).toBe('LABEL')
    })

    it('should support form field descriptions', () => {
      render(
        <div>
          <Typography variant="label">Username</Typography>
          <Typography variant="bodySmall" color="secondary" id="username-help">
            Enter your username or email address
          </Typography>
          <input aria-describedby="username-help" type="text" />
        </div>
      )

      const description = screen.getByText('Enter your username or email address')
      expect(description).toHaveAttribute('id', 'username-help')
    })
  })

  describe('Real-world Usage Scenarios', () => {
    it('should work in anime content display', () => {
      render(
        <div>
          <Typography variant="h1">Attack on Titan</Typography>
          <Typography variant="overline" color="info">Action • Drama • Fantasy</Typography>
          <Typography variant="bodyLarge">
            Humanity fights for survival against giant humanoid Titans
          </Typography>
          <Typography variant="caption" color="muted">
            Added to your list on March 15, 2024
          </Typography>
        </div>
      )

      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
      expect(screen.getByText('Action • Drama • Fantasy')).toBeInTheDocument()
      expect(screen.getByText('Humanity fights for survival against giant humanoid Titans')).toBeInTheDocument()
      expect(screen.getByText('Added to your list on March 15, 2024')).toBeInTheDocument()
    })

    it('should work with status and rating displays', () => {
      render(
        <div>
          <Typography variant="caption" color="tertiary">Rating</Typography>
          <Typography variant="h4" color="success">9.0/10</Typography>
          <Typography variant="overline" color="warning">Currently Watching</Typography>
          <Typography variant="bodySmall" color="secondary">
            Episode 15 of Season 4 • Last watched 2 days ago
          </Typography>
        </div>
      )

      expect(screen.getByText('Rating')).toBeInTheDocument()
      expect(screen.getByText('9.0/10')).toBeInTheDocument()
      expect(screen.getByText('Currently Watching')).toBeInTheDocument()
      expect(screen.getByText('Episode 15 of Season 4 • Last watched 2 days ago')).toBeInTheDocument()
    })

    it('should work in form contexts with messages', () => {
      render(
        <div>
          <Typography variant="label">Search Anime</Typography>
          <Typography variant="bodySmall" color="secondary">
            Enter anime title, genre, or studio name
          </Typography>
          <Typography variant="bodySmall" color="success">
            Anime successfully added to your watchlist
          </Typography>
          <Typography variant="bodySmall" color="danger">
            Please enter a valid anime title
          </Typography>
        </div>
      )

      expect(screen.getByText('Search Anime')).toBeInTheDocument()
      expect(screen.getByText('Enter anime title, genre, or studio name')).toBeInTheDocument()
      expect(screen.getByText('Anime successfully added to your watchlist')).toBeInTheDocument()
      expect(screen.getByText('Please enter a valid anime title')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(<Typography></Typography>)
      const element = screen.getByRole('generic') || document.querySelector('.at-typography-base')
      expect(element).toBeInTheDocument()
    })

    it('should handle complex children', () => {
      render(
        <Typography>
          <span>Complex</span>
          <strong>Content</strong>
        </Typography>
      )

      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle ref forwarding', () => {
      const ref = { current: null }
      render(<Typography ref={ref}>Ref Typography</Typography>)
      expect(ref.current).toBeTruthy()
    })

    it('should handle multiple class combinations', () => {
      render(
        <Typography 
          variant="h2" 
          color="success" 
          weight="bold" 
          align="center" 
          truncate 
          className="custom-class"
        >
          Multi-class Typography
        </Typography>
      )

      const element = screen.getByText('Multi-class Typography')
      expect(element).toHaveClass('at-typography-h2')
      expect(element).toHaveClass('text-green-600')
      expect(element).toHaveClass('font-bold')
      expect(element).toHaveClass('text-center')
      expect(element).toHaveClass('truncate')
      expect(element).toHaveClass('custom-class')
    })

    it('should handle invalid variant gracefully', () => {
      // @ts-expect-error - Testing invalid variant
      render(<Typography variant="invalid">Invalid Variant</Typography>)
      const element = screen.getByText('Invalid Variant')
      expect(element).toBeInTheDocument()
      expect(element.tagName).toBe('P') // Should fallback to default
    })
  })
})