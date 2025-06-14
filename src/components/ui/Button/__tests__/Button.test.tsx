import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  describe('Basic Functionality', () => {
    it('should render button with text content', () => {
      render(<Button>Test Button</Button>)
      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('should render as button element by default', () => {
      render(<Button>Default Button</Button>)
      const element = screen.getByRole('button')
      expect(element.tagName).toBe('BUTTON')
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost', 'outline', 'link'] as const

    variants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Button variant={variant}>{variant} Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass(`at-button-${variant}`)
      })
    })

    it('should use primary as default variant', () => {
      render(<Button>Default Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('at-button-primary')
    })
  })

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

    sizes.forEach(size => {
      it(`should render ${size} size correctly`, () => {
        render(<Button size={size}>{size} Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass(`at-button-${size}`)
      })
    })

    it('should use md as default size', () => {
      render(<Button>Default Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('at-button-md')
    })
  })

  describe('Interactive Features', () => {
    it('should apply animated class when animated prop is true', () => {
      render(<Button animated>Animated Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('at-button-animated')
    })

    it('should apply full width class when fullWidth prop is true', () => {
      render(<Button fullWidth>Full Width Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
    })

    it('should handle click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Clickable Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Icon Support', () => {
    it('should render with left icon', () => {
      const icon = <span data-testid="test-icon">★</span>
      render(<Button leftIcon={icon}>Button with Left Icon</Button>)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('Button with Left Icon')).toBeInTheDocument()
    })

    it('should render with right icon', () => {
      const icon = <span data-testid="test-icon">→</span>
      render(<Button rightIcon={icon}>Button with Right Icon</Button>)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('Button with Right Icon')).toBeInTheDocument()
    })

    it('should render with both left and right icons', () => {
      const leftIcon = <span data-testid="left-icon">←</span>
      const rightIcon = <span data-testid="right-icon">→</span>
      
      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Button with Both Icons
        </Button>
      )
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('Button with Both Icons')).toBeInTheDocument()
    })

    it('should render icon-only button with proper accessibility', () => {
      const icon = <span data-testid="test-icon">★</span>
      render(<Button leftIcon={icon} aria-label="Star button" />)
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Star button' })).toBeInTheDocument()
    })

    it('should apply icon-only class for proper centering', () => {
      const icon = <span data-testid="test-icon">★</span>
      render(<Button leftIcon={icon} aria-label="Star button" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('at-button-icon-only')
    })

    it('should not apply icon-only class when button has content', () => {
      const icon = <span data-testid="test-icon">★</span>
      render(<Button leftIcon={icon}>Button with Icon</Button>)
      
      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('at-button-icon-only')
    })
  })

  describe('Loading State', () => {
    it('should be disabled when loading', () => {
      render(<Button loading>Loading Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show loading spinner container when loading', () => {
      render(<Button loading>Loading Button</Button>)
      const button = screen.getByRole('button')
      expect(button.querySelector('.at-button-spinner')).toBeInTheDocument()
    })

    it('should hide icons when loading', () => {
      const leftIcon = <span data-testid="left-icon">←</span>
      const rightIcon = <span data-testid="right-icon">→</span>
      
      render(
        <Button loading leftIcon={leftIcon} rightIcon={rightIcon}>
          Loading with Icons
        </Button>
      )
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })

    it('should make content transparent when loading', () => {
      render(<Button loading>Loading Content</Button>)
      const contentSpan = screen.getByText('Loading Content')
      expect(contentSpan).toHaveClass('opacity-0')
    })

    it('should not trigger click when loading', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} loading>Loading Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not trigger click when disabled', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should be disabled when both disabled and loading are true', () => {
      render(<Button disabled loading>Disabled Loading Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Polymorphic Behavior', () => {
    it('should render as anchor tag when as="a" prop is provided', () => {
      render(<Button as="a" href="/test">Link Button</Button>)
      
      const element = screen.getByRole('link')
      expect(element.tagName).toBe('A')
      expect(element).toHaveAttribute('href', '/test')
    })

    it('should render as div when as="div" prop is provided', () => {
      render(<Button as="div">Div Button</Button>)
      
      const element = screen.getByText('Div Button').closest('div')
      expect(element?.tagName).toBe('DIV')
    })

    it('should pass through additional props', () => {
      render(<Button data-testid="test-button" title="Test title">Button</Button>)
      
      const button = screen.getByTestId('test-button')
      expect(button).toHaveAttribute('title', 'Test title')
    })
  })

  describe('Form Integration', () => {
    it('should support form button types', () => {
      render(
        <form>
          <Button type="submit">Save</Button>
          <Button type="button">Cancel</Button>
          <Button type="reset">Reset</Button>
        </form>
      )

      expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit')
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button')
      expect(screen.getByRole('button', { name: 'Reset' })).toHaveAttribute('type', 'reset')
    })

    it('should not have type attribute when no type specified', () => {
      render(<Button>Default Type</Button>)
      const button = screen.getByRole('button')
      expect(button).not.toHaveAttribute('type')
    })
  })

  describe('Accessibility', () => {
    it('should support ARIA attributes', () => {
      render(
        <Button 
          aria-label="Accessible button"
          aria-describedby="help-text"
          role="button"
        >
          Accessible Button
        </Button>
      )

      const button = screen.getByRole('button', { name: 'Accessible button' })
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('should support keyboard navigation', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Keyboard Button</Button>)
      
      const button = screen.getByRole('button')
      
      // Simulate keyboard events
      fireEvent.keyDown(button, { key: 'Enter' })
      fireEvent.keyDown(button, { key: ' ' })
      
      expect(button).toBeInTheDocument()
    })

    it('should support focus management', () => {
      render(<Button>Focusable Button</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      expect(document.activeElement).toBe(button)
    })

    it('should support tabIndex', () => {
      render(<Button tabIndex={0}>Tab Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Real-world Usage Scenarios', () => {
    it('should work as anime action buttons', () => {
      const handleAddToList = vi.fn()
      const handleRate = vi.fn()
      const handleFavorite = vi.fn()
      
      render(
        <div>
          <Button variant="primary" onClick={handleAddToList}>
            Add to List
          </Button>
          <Button variant="success" onClick={handleRate}>
            Rate Anime
          </Button>
          <Button variant="outline" onClick={handleFavorite}>
            Add to Favorites
          </Button>
        </div>
      )
      
      expect(screen.getByText('Add to List')).toBeInTheDocument()
      expect(screen.getByText('Rate Anime')).toBeInTheDocument()
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Add to List'))
      fireEvent.click(screen.getByText('Rate Anime'))
      fireEvent.click(screen.getByText('Add to Favorites'))
      
      expect(handleAddToList).toHaveBeenCalledTimes(1)
      expect(handleRate).toHaveBeenCalledTimes(1)
      expect(handleFavorite).toHaveBeenCalledTimes(1)
    })

    it('should work as status buttons', () => {
      const statuses = ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch']
      const variants = ['success', 'primary', 'warning', 'danger', 'outline'] as const
      
      render(
        <div>
          {statuses.map((status, index) => (
            <Button key={status} variant={variants[index]} size="xs">
              {status}
            </Button>
          ))}
        </div>
      )

      statuses.forEach(status => {
        expect(screen.getByText(status)).toBeInTheDocument()
      })
    })

    it('should work with loading states for async operations', () => {
      const { rerender } = render(<Button>Save Changes</Button>)
      
      // Initially not loading
      expect(screen.getByRole('button')).not.toBeDisabled()
      
      // Switch to loading state
      rerender(<Button loading>Save Changes</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
      
      // Back to normal state
      rerender(<Button>Save Changes</Button>)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('should work as navigation links', () => {
      render(
        <div>
          <Button as="a" href="/anime/123" variant="primary">
            View Anime
          </Button>
          <Button as="a" href="/search" variant="outline">
            Advanced Search
          </Button>
        </div>
      )

      const viewLink = screen.getByRole('link', { name: 'View Anime' })
      const searchLink = screen.getByRole('link', { name: 'Advanced Search' })
      
      expect(viewLink).toHaveAttribute('href', '/anime/123')
      expect(searchLink).toHaveAttribute('href', '/search')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(<Button></Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle complex children', () => {
      render(
        <Button>
          <span>Complex</span>
          <strong>Content</strong>
        </Button>
      )
      
      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle ref forwarding', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Ref Button</Button>)
      
      expect(ref).toHaveBeenCalled()
    })

    it('should handle multiple class combinations', () => {
      render(
        <Button 
          variant="primary" 
          size="lg" 
          animated 
          fullWidth 
          className="custom-class"
        >
          Multi-class Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('at-button-primary')
      expect(button).toHaveClass('at-button-lg')
      expect(button).toHaveClass('at-button-animated')
      expect(button).toHaveClass('w-full')
      expect(button).toHaveClass('custom-class')
    })
  })
})