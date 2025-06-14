import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { composeStories } from '@storybook/react'
import * as BadgeStories from '../../../../stories/Badge.stories'

// Compose all stories for testing
const {
  Default,
  Primary,
  Secondary,
  Success,
  Warning,
  Danger,
  Info,
  Neutral,
  Outline,
  AllSizes,
  AllShapes,
  AllVariants,
  WithIcons,
  Interactive,
  InteractiveVariants,
  Animated,
  AnimatedVariants,
  Removable,
  RemovableVariants,
  WithIconAndRemove,
  AnimeStatus,
  UserScores,
  Genres,
  ResponsiveExample,
  AccessibilityDemo
} = composeStories(BadgeStories)

describe('Badge Stories', () => {
  describe('Basic Variants', () => {
    it('should render Default story', () => {
      render(<Default />)
      expect(screen.getByText('Default Badge')).toBeInTheDocument()
    })

    it('should render Primary story with correct variant', () => {
      render(<Primary />)
      const badge = screen.getByText('Primary').closest('.at-badge-base')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('at-badge-primary')
    })

    it('should render Secondary story with correct variant', () => {
      render(<Secondary />)
      const badge = screen.getByText('Secondary').closest('.at-badge-base')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('at-badge-secondary')
    })

    it('should render Success story with correct variant', () => {
      render(<Success />)
      const badge = screen.getByText('Success')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('at-badge-success')
    })

    it('should render Warning story with correct variant', () => {
      render(<Warning />)
      const badge = screen.getByText('Warning')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('at-badge-warning')
    })

    it('should render Danger story with correct variant', () => {
      render(<Danger />)
      const badge = screen.getByText('Danger')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('at-badge-danger')
    })

    it('should render Info story with correct variant', () => {
      render(<Info />)
      const badge = screen.getByText('Info')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('at-badge-info')
    })

    it('should render Neutral story with correct variant', () => {
      render(<Neutral />)
      const badge = screen.getByText('Neutral')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('at-badge-neutral')
    })

    it('should render Outline story with correct variant', () => {
      render(<Outline />)
      const badge = screen.getByText('Outline')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('at-badge-outline')
    })
  })

  describe('Size and Shape Variants', () => {
    it('should render AllSizes story with different size classes', () => {
      render(<AllSizes />)
      
      const extraSmall = screen.getByText('Extra Small')
      const small = screen.getByText('Small')
      const medium = screen.getByText('Medium')
      const large = screen.getByText('Large')
      
      expect(extraSmall).toHaveClass('at-badge-xs')
      expect(small).toHaveClass('at-badge-sm')
      expect(medium).toHaveClass('at-badge-md')
      expect(large).toHaveClass('at-badge-lg')
    })

    it('should render AllShapes story with different shape classes', () => {
      render(<AllShapes />)
      
      const rounded = screen.getByText('Rounded')
      const pill = screen.getByText('Pill')
      const square = screen.getByText('Square')
      
      expect(rounded).toHaveClass('at-badge-rounded')
      expect(pill).toHaveClass('at-badge-pill')
      expect(square).toHaveClass('at-badge-square')
    })

    it('should render AllVariants story with all color variants', () => {
      render(<AllVariants />)
      
      expect(screen.getByText('Primary')).toHaveClass('at-badge-primary')
      expect(screen.getByText('Secondary')).toHaveClass('at-badge-secondary')
      expect(screen.getByText('Success')).toHaveClass('at-badge-success')
      expect(screen.getByText('Warning')).toHaveClass('at-badge-warning')
      expect(screen.getByText('Danger')).toHaveClass('at-badge-danger')
      expect(screen.getByText('Info')).toHaveClass('at-badge-info')
      expect(screen.getByText('Neutral')).toHaveClass('at-badge-neutral')
      expect(screen.getByText('Outline')).toHaveClass('at-badge-outline')
    })
  })

  describe('Interactive Features', () => {
    it('should render WithIcons story with icon elements', () => {
      render(<WithIcons />)
      
      expect(screen.getByText('Info')).toBeInTheDocument()
      expect(screen.getByText('Featured')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
      
      // Check for SVG icons (at least one for each badge)
      const svgElements = screen.getAllByRole('img', { hidden: true })
      expect(svgElements.length).toBeGreaterThan(0)
    })

    it('should render Interactive story with interactive class', () => {
      render(<Interactive />)
      const badge = screen.getByText('Click me')
      expect(badge).toHaveClass('at-badge-interactive')
    })

    it('should render InteractiveVariants with multiple interactive badges', () => {
      render(<InteractiveVariants />)
      
      const primaryBadge = screen.getByText('Primary')
      const successBadge = screen.getByText('Success')
      const warningBadge = screen.getByText('Warning')
      const outlineBadge = screen.getByText('Outline')
      
      expect(primaryBadge).toHaveClass('at-badge-interactive')
      expect(successBadge).toHaveClass('at-badge-interactive')
      expect(warningBadge).toHaveClass('at-badge-interactive')
      expect(outlineBadge).toHaveClass('at-badge-interactive')
    })

    it('should render Animated story with animation class', () => {
      render(<Animated />)
      const badge = screen.getByText('Animated Badge')
      expect(badge).toHaveClass('at-badge-animated')
    })

    it('should render AnimatedVariants with animation classes', () => {
      render(<AnimatedVariants />)
      
      const successBadge = screen.getByText('Success')
      const warningBadge = screen.getByText('Warning')
      const dangerBadge = screen.getByText('Danger')
      const interactiveBadge = screen.getByText('Interactive + Animated')
      
      expect(successBadge).toHaveClass('at-badge-animated')
      expect(warningBadge).toHaveClass('at-badge-animated')
      expect(dangerBadge).toHaveClass('at-badge-animated')
      expect(interactiveBadge).toHaveClass('at-badge-animated', 'at-badge-interactive')
    })
  })

  describe('Removable Functionality', () => {
    it('should render Removable story with remove button', () => {
      render(<Removable />)
      
      expect(screen.getByText('Removable Badge')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    })

    it('should render RemovableVariants with multiple remove buttons', () => {
      render(<RemovableVariants />)
      
      const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
      expect(removeButtons).toHaveLength(4) // Four badges with remove buttons
    })

    it('should render WithIconAndRemove with complex badge combinations', () => {
      render(<WithIconAndRemove />)
      
      expect(screen.getByText('Premium User')).toBeInTheDocument()
      expect(screen.getByText('Important')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      
      const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
      expect(removeButtons).toHaveLength(3)
    })
  })

  describe('Real-world Examples', () => {
    it('should render AnimeStatus story with anime status badges', () => {
      render(<AnimeStatus />)
      
      expect(screen.getByText('Watching')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('On Hold')).toBeInTheDocument()
      expect(screen.getByText('Dropped')).toBeInTheDocument()
      expect(screen.getByText('Plan to Watch')).toBeInTheDocument()
    })

    it('should render UserScores story with score badges', () => {
      render(<UserScores />)
      
      expect(screen.getByText('3.2')).toBeInTheDocument()
      expect(screen.getByText('5.8')).toBeInTheDocument()
      expect(screen.getByText('7.1')).toBeInTheDocument()
      expect(screen.getByText('8.9')).toBeInTheDocument()
      expect(screen.getByText('9.5')).toBeInTheDocument()
    })

    it('should render Genres story with genre badges', () => {
      render(<Genres />)
      
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Adventure')).toBeInTheDocument()
      expect(screen.getByText('Drama')).toBeInTheDocument()
      expect(screen.getByText('Romance')).toBeInTheDocument()
      expect(screen.getByText('Comedy')).toBeInTheDocument()
      expect(screen.getByText('Supernatural')).toBeInTheDocument()
      expect(screen.getByText('School')).toBeInTheDocument()
    })
  })

  describe('Accessibility and Responsive', () => {
    it('should render ResponsiveExample story', () => {
      render(<ResponsiveExample />)
      
      expect(screen.getByText('Small Screen')).toBeInTheDocument()
      expect(screen.getByText('Medium Screen')).toBeInTheDocument()
      expect(screen.getByText('Large Screen')).toBeInTheDocument()
      
      const responsiveBadges = screen.getAllByText('Responsive Badge')
      expect(responsiveBadges).toHaveLength(3)
    })

    it('should render AccessibilityDemo story with proper accessibility features', () => {
      render(<AccessibilityDemo />)
      
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Clickable Badge')).toBeInTheDocument()
      
      // Check for accessibility attributes
      const clickableBadge = screen.getByRole('button', { name: 'Interactive badge button' })
      expect(clickableBadge).toBeInTheDocument()
      expect(clickableBadge).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Interaction Testing', () => {
    it('should handle click events on interactive badges', () => {
      render(<Interactive />)
      const badge = screen.getByText('Click me')
      
      fireEvent.click(badge)
      // Note: We're just testing that the click doesn't crash
      // In a real test environment, you'd mock the onClick function
    })

    it('should handle remove button clicks', () => {
      render(<Removable />)
      const removeButton = screen.getByRole('button', { name: 'Remove' })
      
      fireEvent.click(removeButton)
      // Note: We're just testing that the click doesn't crash
      // In a real test environment, you'd mock the onRemove function
    })

    it('should handle keyboard navigation on accessible badges', () => {
      render(<AccessibilityDemo />)
      const clickableBadge = screen.getByRole('button', { name: 'Interactive badge button' })
      
      fireEvent.keyDown(clickableBadge, { key: 'Enter' })
      fireEvent.keyDown(clickableBadge, { key: 'Space' })
      // Note: We're just testing that keyboard events don't crash
    })
  })
})