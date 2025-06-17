import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStatusDropdown } from '../useStatusDropdown';
import { animeStatusService } from '../../services/shared/animeStatusService';
import { useAnimeStore } from '../../store/animeStore';
import { useAnimeAuth } from '../useAuth';

// Mock dependencies
vi.mock('../../services/shared/animeStatusService');
vi.mock('../../store/animeStore');
vi.mock('../useAuth');

const mockAnimeStatusService = vi.mocked(animeStatusService);
const mockUseAnimeStore = vi.mocked(useAnimeStore);
const mockUseAnimeAuth = vi.mocked(useAnimeAuth);

describe('useStatusDropdown', () => {
  const mockUpdateAnimeStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAnimeStore.mockReturnValue({
      updateAnimeStatus: mockUpdateAnimeStatus,
      // Add other store methods as needed
    } as any);

    mockUseAnimeAuth.mockReturnValue({
      isAuthenticated: true,
      // Add other auth methods as needed
    } as any);

    mockAnimeStatusService.updateAnimeStatus = vi.fn().mockResolvedValue(undefined);
  });

  it('should return authentication status from useAnimeAuth', () => {
    mockUseAnimeAuth.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const { result } = renderHook(() => useStatusDropdown({
      animeId: 123,
      source: 'mal',
      currentStatus: 'watching'
    }));

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockUseAnimeAuth).toHaveBeenCalledWith('mal');
  });

  it('should return current status', () => {
    const { result } = renderHook(() => useStatusDropdown({
      animeId: 123,
      source: 'mal',
      currentStatus: 'watching'
    }));

    expect(result.current.currentStatus).toBe('watching');
  });

  it('should return null for undefined current status', () => {
    const { result } = renderHook(() => useStatusDropdown({
      animeId: 123,
      source: 'mal'
    }));

    expect(result.current.currentStatus).toBe(null);
  });

  it('should handle status change successfully', async () => {
    const { result } = renderHook(() => useStatusDropdown({
      animeId: 123,
      source: 'mal',
      currentStatus: 'watching'
    }));

    await act(async () => {
      await result.current.handleStatusChange('completed');
    });

    expect(mockAnimeStatusService.updateAnimeStatus).toHaveBeenCalledWith(
      123,
      'mal',
      { status: 'completed' }
    );
    expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(123, 'mal', 'completed');
  });

  it('should handle status change for AniList source', async () => {
    const { result } = renderHook(() => useStatusDropdown({
      animeId: 456,
      source: 'anilist',
      currentStatus: 'CURRENT'
    }));

    await act(async () => {
      await result.current.handleStatusChange('COMPLETED');
    });

    expect(mockAnimeStatusService.updateAnimeStatus).toHaveBeenCalledWith(
      456,
      'anilist',
      { status: 'COMPLETED' }
    );
    expect(mockUpdateAnimeStatus).toHaveBeenCalledWith(456, 'anilist', 'COMPLETED');
  });

  it('should handle service errors and re-throw them', async () => {
    const serviceError = new Error('Service failed');
    mockAnimeStatusService.updateAnimeStatus = vi.fn().mockRejectedValue(serviceError);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useStatusDropdown({
      animeId: 123,
      source: 'mal',
      currentStatus: 'watching'
    }));

    await expect(act(async () => {
      await result.current.handleStatusChange('completed');
    })).rejects.toThrow('Service failed');

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update anime status:', serviceError);
    expect(mockUpdateAnimeStatus).not.toHaveBeenCalled(); // Should not update store on error

    consoleSpy.mockRestore();
  });

  it('should handle store update errors', async () => {
    const storeError = new Error('Store update failed');
    mockUpdateAnimeStatus.mockImplementation(() => {
      throw storeError;
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useStatusDropdown({
      animeId: 123,
      source: 'mal',
      currentStatus: 'watching'
    }));

    await expect(act(async () => {
      await result.current.handleStatusChange('completed');
    })).rejects.toThrow('Store update failed');

    expect(mockAnimeStatusService.updateAnimeStatus).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to update anime status:', storeError);

    consoleSpy.mockRestore();
  });

  it('should use stable handleStatusChange function reference', () => {
    const { result, rerender } = renderHook(
      (props) => useStatusDropdown(props),
      {
        initialProps: {
          animeId: 123,
          source: 'mal' as const,
          currentStatus: 'watching'
        }
      }
    );

    const firstHandler = result.current.handleStatusChange;

    rerender({
      animeId: 123,
      source: 'mal',
      currentStatus: 'completed' // Changed status
    });

    const secondHandler = result.current.handleStatusChange;

    // Handler should be stable as long as animeId and source don't change
    expect(firstHandler).toBe(secondHandler);
  });

  it('should create new handleStatusChange when animeId changes', () => {
    const { result, rerender } = renderHook(
      (props) => useStatusDropdown(props),
      {
        initialProps: {
          animeId: 123,
          source: 'mal' as const,
          currentStatus: 'watching'
        }
      }
    );

    const firstHandler = result.current.handleStatusChange;

    rerender({
      animeId: 456, // Changed animeId
      source: 'mal',
      currentStatus: 'watching'
    });

    const secondHandler = result.current.handleStatusChange;

    // Handler should be different when dependencies change
    expect(firstHandler).not.toBe(secondHandler);
  });

  it('should create new handleStatusChange when source changes', () => {
    const { result, rerender } = renderHook(
      (props) => useStatusDropdown(props),
      {
        initialProps: {
          animeId: 123,
          source: 'mal' as const,
          currentStatus: 'watching'
        }
      }
    );

    const firstHandler = result.current.handleStatusChange;

    rerender({
      animeId: 123,
      source: 'anilist', // Changed source
      currentStatus: 'CURRENT'
    });

    const secondHandler = result.current.handleStatusChange;

    // Handler should be different when dependencies change
    expect(firstHandler).not.toBe(secondHandler);
  });
});