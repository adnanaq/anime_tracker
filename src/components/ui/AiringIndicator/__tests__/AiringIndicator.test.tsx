import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AiringIndicator } from '../AiringIndicator';

// Mock animations to avoid timing issues in tests
vi.mock('../../../utils/animations', () => ({
  fadeIn: vi.fn(),
}));

describe('AiringIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility based on airing status', () => {
    it('should render when anime status is RELEASING', () => {
      render(<AiringIndicator status="RELEASING" />);
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should render when anime status is currently_airing', () => {
      render(<AiringIndicator status="currently_airing" />);
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should render when airingStatus is airing', () => {
      render(<AiringIndicator airingStatus="airing" />);
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should not render when anime is not airing', () => {
      render(<AiringIndicator status="FINISHED" />);
      const indicator = screen.queryByTestId('airing-indicator');
      expect(indicator).not.toBeInTheDocument();
    });

    it('should not render when no status provided', () => {
      render(<AiringIndicator />);
      const indicator = screen.queryByTestId('airing-indicator');
      expect(indicator).not.toBeInTheDocument();
    });

    it('should prioritize airingStatus over general status', () => {
      render(<AiringIndicator status="FINISHED" airingStatus="airing" />);
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('ripple animation structure', () => {
    it('should render multiple ripple waves when fullCardRipple is disabled', () => {
      render(<AiringIndicator status="RELEASING" fullCardRipple={false} />);
      
      const waves = screen.getAllByTestId(/ripple-wave-/);
      expect(waves).toHaveLength(3); // Three concentric ripple waves
    });

    it('should render single pulsing dot when fullCardRipple is enabled', () => {
      render(<AiringIndicator status="RELEASING" fullCardRipple={true} />);
      
      const waves = screen.queryAllByTestId(/ripple-wave-/);
      expect(waves).toHaveLength(0); // No concentric waves
      
      const indicator = screen.getByTestId('airing-indicator');
      const pulsingDot = indicator.querySelector('div');
      expect(pulsingDot).toHaveClass('animate-pulse');
    });

    it('should render card ripple overlay when fullCardRipple is enabled', () => {
      render(<AiringIndicator status="RELEASING" fullCardRipple={true} />);
      
      const cardRipple = screen.getByTestId('card-ripple-overlay');
      expect(cardRipple).toBeInTheDocument();
      expect(cardRipple).toHaveClass('card-ripple-overlay');
    });

    it('should not render card ripple overlay when fullCardRipple is disabled', () => {
      render(<AiringIndicator status="RELEASING" fullCardRipple={false} />);
      
      const cardRipple = screen.queryByTestId('card-ripple-overlay');
      expect(cardRipple).not.toBeInTheDocument();
    });

    it('should have correct CSS classes for positioning', () => {
      render(<AiringIndicator status="RELEASING" />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveClass('absolute', 'top-3', 'right-3');
    });

    it('should include accessibility attributes', () => {
      render(<AiringIndicator status="RELEASING" />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveAttribute('aria-label', 'Currently airing');
      expect(indicator).toHaveAttribute('title', 'This anime is currently airing new episodes');
    });
  });

  describe('custom positioning and styling', () => {
    it('should apply custom className', () => {
      render(<AiringIndicator status="RELEASING" className="custom-class" />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveClass('custom-class');
    });

    it('should support custom position override', () => {
      render(<AiringIndicator status="RELEASING" position="bottom-left" />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveClass('bottom-3', 'left-3');
      expect(indicator).not.toHaveClass('top-3', 'right-3');
    });

    it('should support size variants', () => {
      render(<AiringIndicator status="RELEASING" size="sm" />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveClass('w-4', 'h-4');
    });

    it('should support large size variant', () => {
      render(<AiringIndicator status="RELEASING" size="lg" />);
      
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toHaveClass('w-8', 'h-8');
    });
  });

  describe('animation behavior', () => {
    it('should have continuous ripple animation when fullCardRipple is disabled', () => {
      render(<AiringIndicator status="RELEASING" fullCardRipple={false} />);
      
      const waves = screen.getAllByTestId(/ripple-wave-/);
      waves.forEach((wave, index) => {
        expect(wave).toHaveStyle({
          animationName: 'ripple',
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationDelay: `${index * 0.5}s`,
        });
      });
    });

    it('should have proper wave scaling and opacity when fullCardRipple is disabled', () => {
      render(<AiringIndicator status="RELEASING" fullCardRipple={false} />);
      
      const waves = screen.getAllByTestId(/ripple-wave-/);
      waves.forEach((wave) => {
        expect(wave).toHaveClass('animate-pulse', 'opacity-30');
      });
    });

    it('should have pulsing animation when fullCardRipple is enabled', () => {
      render(<AiringIndicator status="RELEASING" fullCardRipple={true} />);
      
      const indicator = screen.getByTestId('airing-indicator');
      const pulsingDot = indicator.querySelector('div');
      expect(pulsingDot).toHaveStyle({
        animationDuration: '2s',
        animationIterationCount: 'infinite',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle mixed case status values', () => {
      render(<AiringIndicator status="releasing" />);
      const indicator = screen.getByTestId('airing-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<AiringIndicator status="RELEASING" disabled />);
      const indicator = screen.queryByTestId('airing-indicator');
      expect(indicator).not.toBeInTheDocument();
    });

    it('should support custom ripple color', () => {
      render(<AiringIndicator status="RELEASING" color="blue" fullCardRipple={false} />);
      
      const waves = screen.getAllByTestId(/ripple-wave-/);
      waves.forEach((wave) => {
        expect(wave).toHaveClass('bg-blue-500');
      });
    });

    it('should call onRippleRender callback when fullCardRipple is enabled', () => {
      const mockCallback = vi.fn();
      render(
        <AiringIndicator 
          status="RELEASING" 
          fullCardRipple={true} 
          position="top-right"
          onRippleRender={mockCallback}
        />
      );
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        'top-right'
      );
    });
  });
});