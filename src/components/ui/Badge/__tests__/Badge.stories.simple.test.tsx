import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge Component Stories Testing', () => {
  describe('Basic Functionality', () => {
    it('should render badge with text content', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('should apply variant classes correctly', () => {
      const { container } = render(<Badge variant="primary">Primary Badge</Badge>)
      const badge = container.querySelector('.at-badge-primary')
      expect(badge).toBeInTheDocument()
    })

    it('should apply size classes correctly', () => {
      const { container } = render(<Badge size="lg">Large Badge</Badge>)
      const badge = container.querySelector('.at-badge-lg')
      expect(badge).toBeInTheDocument()
    })

    it('should apply shape classes correctly', () => {
      const { container } = render(<Badge shape="pill">Pill Badge</Badge>)
      const badge = container.querySelector('.at-badge-pill')
      expect(badge).toBeInTheDocument()
    })

    it('should apply animated class when animated prop is true', () => {
      const { container } = render(<Badge animated>Animated Badge</Badge>)
      const badge = container.querySelector('.at-badge-animated')
      expect(badge).toBeInTheDocument()
    })

    it('should apply interactive class when interactive prop is true', () => {
      const { container } = render(<Badge interactive>Interactive Badge</Badge>)
      const badge = container.querySelector('.at-badge-interactive')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Icon Support', () => {
    it('should render with icon', () => {
      const icon = <span data-testid="test-icon">★</span>
      render(<Badge icon={icon}>Badge with Icon</Badge>)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('Badge with Icon')).toBeInTheDocument()
    })
  })

  describe('Remove Functionality', () => {
    it('should render remove button when onRemove is provided', () => {
      const onRemove = vi.fn()
      render(<Badge onRemove={onRemove}>Removable Badge</Badge>)
      
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    })

    it('should render both icon and remove button', () => {
      const icon = <span data-testid="test-icon">★</span>
      const onRemove = vi.fn()
      
      render(
        <Badge icon={icon} onRemove={onRemove}>
          Complex Badge
        </Badge>
      )
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('Complex Badge')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    })
  })

  describe('All Variants Coverage', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral', 'outline'] as const

    variants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        const { container } = render(<Badge variant={variant}>{variant} Badge</Badge>)
        const badge = container.querySelector(`.at-badge-${variant}`)
        expect(badge).toBeInTheDocument()
        expect(screen.getByText(`${variant} Badge`)).toBeInTheDocument()
      })
    })
  })

  describe('All Sizes Coverage', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const

    sizes.forEach(size => {
      it(`should render ${size} size correctly`, () => {
        const { container } = render(<Badge size={size}>{size} Badge</Badge>)
        const badge = container.querySelector(`.at-badge-${size}`)
        expect(badge).toBeInTheDocument()
        expect(screen.getByText(`${size} Badge`)).toBeInTheDocument()
      })
    })
  })

  describe('All Shapes Coverage', () => {
    const shapes = ['rounded', 'pill', 'square'] as const

    shapes.forEach(shape => {
      it(`should render ${shape} shape correctly`, () => {
        const { container } = render(<Badge shape={shape}>{shape} Badge</Badge>)
        const badge = container.querySelector(`.at-badge-${shape}`)
        expect(badge).toBeInTheDocument()
        expect(screen.getByText(`${shape} Badge`)).toBeInTheDocument()
      })
    })
  })

  describe('Real-world Examples', () => {
    it('should render anime status badges', () => {
      const statuses = ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch']
      const variants = ['success', 'primary', 'warning', 'danger', 'neutral'] as const
      
      const { container } = render(
        <div>
          {statuses.map((status, index) => (
            <Badge key={status} variant={variants[index]} shape="pill">
              {status}
            </Badge>
          ))}
        </div>
      )

      statuses.forEach(status => {
        expect(screen.getByText(status)).toBeInTheDocument()
      })
      
      // Check that pill shape is applied
      expect(container.querySelectorAll('.at-badge-pill')).toHaveLength(statuses.length)
    })

    it('should render user score badges', () => {
      const scores = ['3.2', '5.8', '7.1', '8.9', '9.5']
      const variants = ['danger', 'warning', 'info', 'success', 'primary'] as const
      
      render(
        <div>
          {scores.map((score, index) => (
            <Badge 
              key={score} 
              variant={variants[index]} 
              icon={<span>★</span>} 
              size="sm"
            >
              {score}
            </Badge>
          ))}
        </div>
      )

      scores.forEach(score => {
        expect(screen.getByText(score)).toBeInTheDocument()
      })
    })

    it('should render genre badges', () => {
      const genres = ['Action', 'Adventure', 'Drama', 'Romance', 'Comedy', 'Supernatural', 'School']
      
      render(
        <div>
          {genres.map(genre => (
            <Badge key={genre} variant="outline" size="xs">
              {genre}
            </Badge>
          ))}
        </div>
      )

      genres.forEach(genre => {
        expect(screen.getByText(genre)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', () => {
      render(
        <Badge 
          interactive 
          onClick={vi.fn()}
          aria-label="Interactive badge button"
          tabIndex={0}
          role="button"
        >
          Accessible Badge
        </Badge>
      )

      const badge = screen.getByRole('button', { name: 'Interactive badge button' })
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('tabIndex', '0')
    })

    it('should handle remove button accessibility', () => {
      render(
        <Badge 
          onRemove={vi.fn()} 
          aria-label="Remove error notification"
        >
          Error
        </Badge>
      )

      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    })
  })
})