import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAutoCycling } from '../useAutoCycling';

// Mock DOM methods
const mockRadios = [
  { checked: false, getAttribute: vi.fn(() => '0') },
  { checked: false, getAttribute: vi.fn(() => '1') },
  { checked: false, getAttribute: vi.fn(() => '2') }
] as any[];

Object.defineProperty(document, 'querySelectorAll', {
  value: vi.fn(() => mockRadios),
  writable: true
});

describe('useAutoCycling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear any global pause states
    Object.keys(window).forEach(key => {
      if (key.includes('-pause')) {
        delete (window as any)[key];
      }
    });
    // Reset mock radios
    mockRadios.forEach((radio, index) => {
      radio.checked = false;
      radio.getAttribute.mockReturnValue(index.toString());
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clear any global pause states
    Object.keys(window).forEach(key => {
      if (key.includes('-pause')) {
        delete (window as any)[key];
      }
    });
  });

  describe('Default behavior', () => {
    it('returns default state when autoLoop is false', () => {
      const { result } = renderHook(() => useAutoCycling({
        autoLoop: false,
        groupName: 'test-group',
        cardIndex: 0,
      }));
      
      expect(result.current.isPaused).toBe(false);
      expect(typeof result.current.triggerPause).toBe('function');
      expect(typeof result.current.handleInteraction).toBe('function');
    });

    it('initializes global pause state for group', () => {
      renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'test-group',
        cardIndex: 0,
      }));
      
      expect((window as any)['test-group-pause']).toBeDefined();
      expect((window as any)['test-group-pause'].isPaused).toBe(false);
      expect((window as any)['test-group-pause'].subscribers).toBeInstanceOf(Set);
    });

    it('subscribes to existing global pause state', () => {
      // Pre-existing global state
      (window as any)['existing-group-pause'] = {
        isPaused: true,
        subscribers: new Set()
      };

      const { result } = renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'existing-group',
        cardIndex: 0,
      }));
      
      expect(result.current.isPaused).toBe(true);
    });
  });

  describe('Auto-cycling functionality', () => {
    it('does not start auto-cycling when autoLoop is false', () => {
      const onAutoLoopMock = vi.fn();
      
      renderHook(() => useAutoCycling({
        autoLoop: false,
        groupName: 'test-group',
        cardIndex: 0,
        onAutoLoop: onAutoLoopMock,
      }));

      // Fast-forward time
      vi.advanceTimersByTime(5000);
      
      expect(onAutoLoopMock).not.toHaveBeenCalled();
      expect(mockRadios.every(radio => !radio.checked)).toBe(true);
    });

    it('does not start auto-cycling when expandable is false', () => {
      const onAutoLoopMock = vi.fn();
      
      renderHook(() => useAutoCycling({
        autoLoop: true,
        expandable: false,
        groupName: 'test-group',
        cardIndex: 0,
        onAutoLoop: onAutoLoopMock,
      }));

      // Fast-forward time
      vi.advanceTimersByTime(5000);
      
      expect(onAutoLoopMock).not.toHaveBeenCalled();
    });

    it('only starts auto-cycling for card index 0', () => {
      const onAutoLoopMock = vi.fn();
      
      // Card index 1 should not start auto-cycling
      renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'test-group',
        cardIndex: 1,
        onAutoLoop: onAutoLoopMock,
      }));

      vi.advanceTimersByTime(5000);
      expect(onAutoLoopMock).not.toHaveBeenCalled();

      // Card index 0 should start auto-cycling
      renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'test-group',
        cardIndex: 0,
        onAutoLoop: onAutoLoopMock,
      }));

      vi.advanceTimersByTime(4000);
      expect(onAutoLoopMock).toHaveBeenCalled();
    });

    it('cycles through cards with default interval', () => {
      const onAutoLoopMock = vi.fn();
      
      renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'test-group',
        cardIndex: 0,
        onAutoLoop: onAutoLoopMock,
      }));

      // No cards checked initially
      expect(mockRadios.every(radio => !radio.checked)).toBe(true);

      // After first interval, should select first card
      vi.advanceTimersByTime(4000);
      expect(mockRadios[0].checked).toBe(true);
      expect(mockRadios[1].checked).toBe(false);
      expect(mockRadios[2].checked).toBe(false);
      expect(onAutoLoopMock).toHaveBeenCalledWith(0);

      // After second interval, should select second card
      vi.advanceTimersByTime(4000);
      expect(mockRadios[0].checked).toBe(false);
      expect(mockRadios[1].checked).toBe(true);
      expect(mockRadios[2].checked).toBe(false);
      expect(onAutoLoopMock).toHaveBeenCalledWith(1);
    });

    it('uses custom loop interval', () => {
      const onAutoLoopMock = vi.fn();
      
      renderHook(() => useAutoCycling({
        autoLoop: true,
        loopInterval: 2000,
        groupName: 'test-group',
        cardIndex: 0,
        onAutoLoop: onAutoLoopMock,
      }));

      // Should cycle every 2 seconds instead of default 4
      vi.advanceTimersByTime(2000);
      expect(onAutoLoopMock).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(2000);
      expect(onAutoLoopMock).toHaveBeenCalledTimes(2);
    });

    it('loops back to first card after reaching the end', () => {
      const onAutoLoopMock = vi.fn();
      mockRadios[2].checked = true; // Start with last card selected
      
      renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'test-group',
        cardIndex: 0,
        onAutoLoop: onAutoLoopMock,
      }));

      // Should cycle from last card back to first
      vi.advanceTimersByTime(4000);
      expect(mockRadios[0].checked).toBe(true);
      expect(mockRadios[2].checked).toBe(false);
      expect(onAutoLoopMock).toHaveBeenCalledWith(0);
    });
  });

  describe('Pause functionality', () => {
    it('respects global pause state during cycling', () => {
      const onAutoLoopMock = vi.fn();
      
      const { result } = renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'test-group',
        cardIndex: 0,
        onAutoLoop: onAutoLoopMock,
      }));

      // Trigger pause
      act(() => {
        result.current.triggerPause();
      });
      expect(result.current.isPaused).toBe(true);

      // Fast-forward past normal cycle time - should not cycle while paused
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onAutoLoopMock).not.toHaveBeenCalled();
      expect(mockRadios.every(radio => !radio.checked)).toBe(true);
    });

    it('resumes auto-cycling after pause duration', () => {
      const onAutoLoopMock = vi.fn();
      
      const { result } = renderHook(() => useAutoCycling({
        autoLoop: true,
        pauseDuration: 3000,
        groupName: 'test-group',
        cardIndex: 0,
        onAutoLoop: onAutoLoopMock,
      }));

      // Trigger pause
      act(() => {
        result.current.triggerPause();
      });
      expect(result.current.isPaused).toBe(true);

      // Fast-forward to just before pause duration ends
      act(() => {
        vi.advanceTimersByTime(2900);
      });
      expect(result.current.isPaused).toBe(true);

      // Fast-forward past pause duration
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.isPaused).toBe(false);

      // Should resume cycling
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(onAutoLoopMock).toHaveBeenCalled();
    });

    it('does not trigger pause when pauseOnInteraction is false', () => {
      const { result } = renderHook(() => useAutoCycling({
        autoLoop: true,
        pauseOnInteraction: false,
        groupName: 'test-group',
        cardIndex: 0,
      }));

      result.current.triggerPause();
      expect(result.current.isPaused).toBe(false);
    });

    it('handleInteraction calls triggerPause when appropriate', () => {
      const { result } = renderHook(() => useAutoCycling({
        autoLoop: true,
        pauseOnInteraction: true,
        groupName: 'test-group',
        cardIndex: 0,
      }));

      expect(result.current.isPaused).toBe(false);
      
      act(() => {
        result.current.handleInteraction();
      });
      expect(result.current.isPaused).toBe(true);
    });

    it('handleInteraction does not pause when autoLoop is false', () => {
      const { result } = renderHook(() => useAutoCycling({
        autoLoop: false,
        pauseOnInteraction: true,
        groupName: 'test-group',
        cardIndex: 0,
      }));

      result.current.handleInteraction();
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('Global state management', () => {
    it('shares pause state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'shared-group',
        cardIndex: 0,
      }));

      const { result: result2 } = renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'shared-group',
        cardIndex: 1,
      }));

      expect(result1.current.isPaused).toBe(false);
      expect(result2.current.isPaused).toBe(false);

      // Trigger pause from first instance
      act(() => {
        result1.current.triggerPause();
      });

      expect(result1.current.isPaused).toBe(true);
      expect(result2.current.isPaused).toBe(true);
    });

    it('maintains separate pause states for different groups', () => {
      const { result: result1 } = renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'group-1',
        cardIndex: 0,
      }));

      const { result: result2 } = renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'group-2',
        cardIndex: 0,
      }));

      act(() => {
        result1.current.triggerPause();
      });

      expect(result1.current.isPaused).toBe(true);
      expect(result2.current.isPaused).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('cleans up subscriber on unmount', () => {
      const { unmount } = renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'cleanup-group',
        cardIndex: 0,
      }));

      const globalState = (window as any)['cleanup-group-pause'];
      expect(globalState.subscribers.size).toBe(1);

      unmount();
      expect(globalState.subscribers.size).toBe(0);
    });

    it('cleans up timers on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      const { result, unmount } = renderHook(() => useAutoCycling({
        autoLoop: true,
        groupName: 'timer-group',
        cardIndex: 0,
      }));

      result.current.triggerPause();
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});