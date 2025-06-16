import { renderHook } from '@testing-library/react';
import { useDimensions } from '../useDimensions';

describe('useDimensions', () => {
  describe('Default behavior', () => {
    it('returns default dimensions when no props provided', () => {
      const { result } = renderHook(() => useDimensions({}));
      
      expect(result.current.validatedWidth).toBe('13rem');
      expect(result.current.validatedHeight).toBe('23.125rem');
      expect(result.current.validatedExpandedWidth).toBe('30rem');
      expect(result.current.cardStyles.width).toBe('13rem');
      expect(result.current.cardStyles.height).toBe('23.125rem');
      expect(result.current.cardStyles['--expanded-width']).toBe('30rem');
      expect(result.current.cardStyles['--original-width']).toBe('13rem');
    });

    it('uses fallback values for undefined dimensions', () => {
      const { result } = renderHook(() => useDimensions({
        width: undefined,
        height: undefined,
        expandedWidth: undefined,
      }));
      
      expect(result.current.validatedWidth).toBe('13rem');
      expect(result.current.validatedHeight).toBe('23.125rem');
      expect(result.current.validatedExpandedWidth).toBe('30rem');
    });
  });

  describe('Numeric dimension validation', () => {
    it('prevents negative width values', () => {
      const { result } = renderHook(() => useDimensions({
        width: -100,
        height: 300,
        expandedWidth: 400,
      }));
      
      expect(result.current.validatedWidth).toBe(0);
      expect(result.current.cardStyles.width).toBe('0px');
    });

    it('prevents negative height values', () => {
      const { result } = renderHook(() => useDimensions({
        width: 200,
        height: -200,
        expandedWidth: 400,
      }));
      
      expect(result.current.validatedHeight).toBe(0);
      expect(result.current.cardStyles.height).toBe('0px');
    });

    it('prevents negative expandedWidth values', () => {
      const { result } = renderHook(() => useDimensions({
        width: 200,
        height: 370,
        expandedWidth: -300,
      }));
      
      // expandedWidth should be corrected to width + 1 when negative
      expect(result.current.validatedExpandedWidth).toBe(201);
      expect(result.current.cardStyles['--expanded-width']).toBe('201px');
    });

    it('ensures expandedWidth is greater than width', () => {
      const { result } = renderHook(() => useDimensions({
        width: 200,
        height: 370,
        expandedWidth: 200, // Equal to width
      }));
      
      // expandedWidth should be increased to width + 1
      expect(result.current.validatedExpandedWidth).toBe(201);
      expect(result.current.cardStyles['--expanded-width']).toBe('201px');
    });

    it('ensures expandedWidth is greater than width when expandedWidth is smaller', () => {
      const { result } = renderHook(() => useDimensions({
        width: 300,
        height: 370,
        expandedWidth: 250, // Smaller than width
      }));
      
      // expandedWidth should be increased to width + 1
      expect(result.current.validatedExpandedWidth).toBe(301);
      expect(result.current.cardStyles['--expanded-width']).toBe('301px');
    });

    it('allows valid expandedWidth that is greater than width', () => {
      const { result } = renderHook(() => useDimensions({
        width: 200,
        height: 370,
        expandedWidth: 400,
      }));
      
      // Valid expandedWidth should remain unchanged
      expect(result.current.validatedExpandedWidth).toBe(400);
      expect(result.current.cardStyles['--expanded-width']).toBe('400px');
    });

    it('handles zero values correctly', () => {
      const { result } = renderHook(() => useDimensions({
        width: 0,
        height: 0,
        expandedWidth: 0,
      }));
      
      // Zero width and height should be allowed
      expect(result.current.validatedWidth).toBe(0);
      expect(result.current.validatedHeight).toBe(0);
      expect(result.current.cardStyles.width).toBe('0px');
      expect(result.current.cardStyles.height).toBe('0px');
      // Zero expandedWidth should be increased to width + 1 = 1px
      expect(result.current.validatedExpandedWidth).toBe(1);
      expect(result.current.cardStyles['--expanded-width']).toBe('1px');
    });

    it('handles edge case with very small positive values', () => {
      const { result } = renderHook(() => useDimensions({
        width: 1,
        height: 1,
        expandedWidth: 1,
      }));
      
      // width=1, expandedWidth=1 should become expandedWidth=2
      expect(result.current.validatedWidth).toBe(1);
      expect(result.current.validatedExpandedWidth).toBe(2);
      expect(result.current.cardStyles.width).toBe('1px');
      expect(result.current.cardStyles['--expanded-width']).toBe('2px');
    });
  });

  describe('String dimension handling', () => {
    it('does not validate string dimension values', () => {
      const { result } = renderHook(() => useDimensions({
        width: '10rem',
        height: '15rem',
        expandedWidth: '20rem',
      }));
      
      // String values should pass through unchanged
      expect(result.current.validatedWidth).toBe('10rem');
      expect(result.current.validatedHeight).toBe('15rem');
      expect(result.current.validatedExpandedWidth).toBe('20rem');
      expect(result.current.cardStyles.width).toBe('10rem');
      expect(result.current.cardStyles.height).toBe('15rem');
      expect(result.current.cardStyles['--expanded-width']).toBe('20rem');
    });

    it('handles mixed string and number dimensions', () => {
      const { result } = renderHook(() => useDimensions({
        width: 150,
        height: '20rem',
        expandedWidth: '25rem',
      }));
      
      // Number width should be validated, strings should pass through
      expect(result.current.validatedWidth).toBe(150);
      expect(result.current.validatedHeight).toBe('20rem');
      expect(result.current.validatedExpandedWidth).toBe('25rem');
      expect(result.current.cardStyles.width).toBe('150px');
      expect(result.current.cardStyles.height).toBe('20rem');
      expect(result.current.cardStyles['--expanded-width']).toBe('25rem');
    });

    it('validates expandedWidth only when both width and expandedWidth are numbers', () => {
      const { result } = renderHook(() => useDimensions({
        width: '10rem',
        height: 370,
        expandedWidth: 200,
      }));
      
      // Since width is string, expandedWidth validation should not apply
      expect(result.current.validatedWidth).toBe('10rem');
      expect(result.current.validatedExpandedWidth).toBe(200);
      expect(result.current.cardStyles.width).toBe('10rem');
      expect(result.current.cardStyles['--expanded-width']).toBe('200px');
    });

    it('supports percentage and viewport units', () => {
      const { result } = renderHook(() => useDimensions({
        width: '50%',
        height: '50vh',
        expandedWidth: '80%',
      }));
      
      expect(result.current.cardStyles.width).toBe('50%');
      expect(result.current.cardStyles.height).toBe('50vh');
      expect(result.current.cardStyles['--expanded-width']).toBe('80%');
    });
  });

  describe('CSS custom properties', () => {
    it('sets correct CSS custom properties', () => {
      const { result } = renderHook(() => useDimensions({
        width: 250,
        height: 400,
        expandedWidth: 500,
      }));
      
      expect(result.current.cardStyles).toEqual({
        width: '250px',
        height: '400px',
        '--expanded-width': '500px',
        '--original-width': '250px',
      });
    });

    it('preserves original-width CSS variable correctly', () => {
      const { result } = renderHook(() => useDimensions({
        width: 250,
        height: 400,
        expandedWidth: 200, // Smaller than width
      }));
      
      // original-width should match the validated width
      expect(result.current.cardStyles['--original-width']).toBe('250px');
      // expandedWidth should be corrected to width + 1
      expect(result.current.cardStyles['--expanded-width']).toBe('251px');
    });
  });

  describe('Memoization', () => {
    it('returns same reference when inputs do not change', () => {
      const { result, rerender } = renderHook(
        ({ width, height, expandedWidth }) => useDimensions({ width, height, expandedWidth }),
        {
          initialProps: { width: 200, height: 370, expandedWidth: 480 }
        }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ width: 200, height: 370, expandedWidth: 480 });
      
      // Should return the same reference due to useMemo
      expect(result.current).toBe(firstResult);
    });

    it('returns new reference when inputs change', () => {
      const { result, rerender } = renderHook(
        ({ width, height, expandedWidth }) => useDimensions({ width, height, expandedWidth }),
        {
          initialProps: { width: 200, height: 370, expandedWidth: 480 }
        }
      );

      const firstResult = result.current;

      // Rerender with different props
      rerender({ width: 300, height: 370, expandedWidth: 480 });
      
      // Should return a new reference
      expect(result.current).not.toBe(firstResult);
      expect(result.current.validatedWidth).toBe(300);
    });
  });
});