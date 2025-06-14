import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge Component', () => {
  describe('Basic Functionality', () => {
    it('should render badge with text content', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>)
      const badge = screen.getByText('Badge').closest('.at-badge-base')
      expect(badge).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral', 'outline'] as const

    variants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        const { container } = render(<Badge variant={variant}>{variant} Badge</Badge>)
        const badge = container.querySelector(`.at-badge-${variant}`)
        expect(badge).toBeInTheDocument()
        expect(screen.getByText(`${variant} Badge`)).toBeInTheDocument()
      })
    })

    it('should use neutral as default variant', () => {
      const { container } = render(<Badge>Default Badge</Badge>)
      const badge = container.querySelector('.at-badge-neutral')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const

    sizes.forEach(size => {
      it(`should render ${size} size correctly`, () => {
        const { container } = render(<Badge size={size}>{size} Badge</Badge>)
        const badge = container.querySelector(`.at-badge-${size}`)
        expect(badge).toBeInTheDocument()
        expect(screen.getByText(`${size} Badge`)).toBeInTheDocument()
      })
    })

    it('should use sm as default size', () => {
      const { container } = render(<Badge>Default Badge</Badge>)
      const badge = container.querySelector('.at-badge-sm')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Shapes', () => {
    const shapes = ['rounded', 'pill', 'square'] as const

    shapes.forEach(shape => {
      it(`should render ${shape} shape correctly`, () => {
        const { container } = render(<Badge shape={shape}>{shape} Badge</Badge>)
        const badge = container.querySelector(`.at-badge-${shape}`)
        expect(badge).toBeInTheDocument()
        expect(screen.getByText(`${shape} Badge`)).toBeInTheDocument()
      })
    })

    it('should use rounded as default shape', () => {
      const { container } = render(<Badge>Default Badge</Badge>)
      const badge = container.querySelector('.at-badge-rounded')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
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

    it('should handle click events when interactive', () => {
      const handleClick = vi.fn()
      render(<Badge interactive onClick={handleClick}>Clickable Badge</Badge>)
      
      const badge = screen.getByText('Clickable Badge')
      fireEvent.click(badge)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Icon Support', () => {
    it('should render with icon', () => {
      const icon = <span data-testid="test-icon">★</span>
      render(<Badge icon={icon}>Badge with Icon</Badge>)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('Badge with Icon')).toBeInTheDocument()
    })

    it('should render icon-only badge', () => {
      const icon = <span data-testid="test-icon">★</span>
      render(<Badge icon={icon} />)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })
  })

  describe('Remove Functionality', () => {
    it('should render remove button when onRemove is provided', () => {
      const onRemove = vi.fn()
      render(<Badge onRemove={onRemove}>Removable Badge</Badge>)
      
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    })

    it('should call onRemove when remove button is clicked', () => {
      const onRemove = vi.fn()
      render(<Badge onRemove={onRemove}>Removable Badge</Badge>)
      
      const removeButton = screen.getByRole('button', { name: 'Remove' })
      fireEvent.click(removeButton)
      
      expect(onRemove).toHaveBeenCalledTimes(1)
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

  describe('Accessibility', () => {
    it('should support ARIA attributes', () => {
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

    it('should support keyboard navigation', () => {
      const handleClick = vi.fn()
      render(<Badge interactive onClick={handleClick}>Keyboard Badge</Badge>)
      
      const badge = screen.getByText('Keyboard Badge')
      
      fireEvent.keyDown(badge, { key: 'Enter' })
      fireEvent.keyDown(badge, { key: ' ' })
      
      expect(badge).toBeInTheDocument()
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

  describe('Real-world Usage Scenarios', () => {
    it('should work as anime status badges', () => {
      const statuses = ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch']
      const variants = ['success', 'primary', 'warning', 'danger', 'neutral'] as const
      
      render(
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
      const { container } = render(
        <Badge variant="success" shape="pill">Watching</Badge>
      )
      expect(container.querySelector('.at-badge-pill')).toBeInTheDocument()
    })

    it('should work as user score badges', () => {
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

    it('should work as genre badges', () => {
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

    it('should work as removable tag system', () => {
      const handleRemove = vi.fn()
      const tags = ['Action', 'Adventure', 'Drama']
      
      render(
        <div>
          {tags.map(tag => (
            <Badge key={tag} variant="outline" onRemove={handleRemove}>
              {tag}
            </Badge>
          ))}
        </div>
      )

      const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
      expect(removeButtons).toHaveLength(3)
      
      fireEvent.click(removeButtons[0])
      expect(handleRemove).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(<Badge></Badge>)
      const { container } = render(<Badge />)
      expect(container.querySelector('.at-badge-base')).toBeInTheDocument()
    })

    it('should handle complex children', () => {
      render(
        <Badge>
          <span>Complex</span>
          <strong>Content</strong>
        </Badge>
      )
      
      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle ref forwarding', () => {
      const ref = vi.fn()
      render(<Badge ref={ref}>Ref Badge</Badge>)
      
      expect(ref).toHaveBeenCalled()
    })

    it('should handle multiple prop combinations', () => {
      const { container } = render(
        <Badge 
          variant="success" 
          size="lg" 
          shape="pill"
          animated 
          interactive 
          className="custom-class"
        >
          Multi-prop Badge
        </Badge>
      )
      
      const badge = container.querySelector('.at-badge-base')
      expect(badge).toHaveClass('at-badge-success')
      expect(badge).toHaveClass('at-badge-lg')
      expect(badge).toHaveClass('at-badge-pill')
      expect(badge).toHaveClass('at-badge-animated')
      expect(badge).toHaveClass('at-badge-interactive')
      expect(badge).toHaveClass('custom-class')
    })

    it('should handle both interactive and remove functionality', () => {
      const handleClick = vi.fn()
      const handleRemove = vi.fn()
      
      render(
        <Badge interactive onClick={handleClick} onRemove={handleRemove}>
          Interactive Removable Badge
        </Badge>
      )
      
      const badge = screen.getByText('Interactive Removable Badge')
      const removeButton = screen.getByRole('button', { name: 'Remove' })
      
      fireEvent.click(badge)
      fireEvent.click(removeButton)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
      expect(handleRemove).toHaveBeenCalledTimes(1)
    })
  })
})