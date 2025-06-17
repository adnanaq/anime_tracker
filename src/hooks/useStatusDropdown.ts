import { useCallback } from 'react';
import { AnimeSource } from '../types/anime';
import { animeStatusService } from '../services/shared/animeStatusService';
import { useAnimeStore } from '../store/animeStore';
import { useAnimeAuth } from './useAuth';

export interface UseStatusDropdownProps {
  animeId: number;
  source: AnimeSource;
  currentStatus?: string | null;
}

export interface UseStatusDropdownReturn {
  isAuthenticated: boolean;
  handleStatusChange: (newStatus: string) => Promise<void>;
  currentStatus: string | null;
}

/**
 * Hook that provides all the necessary props and handlers for StatusBadgeDropdown
 * Manages authentication, status updates, and store synchronization
 */
export const useStatusDropdown = ({ 
  animeId, 
  source, 
  currentStatus 
}: UseStatusDropdownProps): UseStatusDropdownReturn => {
  const { isAuthenticated } = useAnimeAuth(source);
  const { updateAnimeStatus } = useAnimeStore();

  const handleStatusChange = useCallback(async (newStatus: string) => {
    try {
      // Update via service
      await animeStatusService.updateAnimeStatus(animeId, source, { status: newStatus });
      
      // Update local store
      updateAnimeStatus(animeId, source, newStatus);
    } catch (error) {
      console.error('Failed to update anime status:', error);
      throw error; // Re-throw to let StatusBadgeDropdown handle UI feedback
    }
  }, [animeId, source, updateAnimeStatus]);

  return {
    isAuthenticated,
    handleStatusChange,
    currentStatus: currentStatus || null
  };
};