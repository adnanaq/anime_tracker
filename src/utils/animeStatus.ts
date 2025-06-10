import { AnimeSource } from '../types/anime'

/**
 * Status configuration for different anime sources
 */
export const MAL_STATUS_OPTIONS = [
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'plan_to_watch', label: 'Plan to Watch' },
]

export const ANILIST_STATUS_OPTIONS = [
  { value: 'CURRENT', label: 'Watching' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PAUSED', label: 'On Hold' },
  { value: 'DROPPED', label: 'Dropped' },
  { value: 'PLANNING', label: 'Plan to Watch' },
  { value: 'REPEATING', label: 'Rewatching' },
]

/**
 * Get status options for the given anime source
 */
export const getStatusOptions = (source: AnimeSource) => {
  return source === 'mal' ? MAL_STATUS_OPTIONS : ANILIST_STATUS_OPTIONS
}

/**
 * Get human-readable label for an anime status
 */
export const getStatusLabel = (status: string | null): string => {
  if (!status) return 'Add to List'
  
  switch (status) {
    case 'watching': case 'CURRENT': return 'Watching'
    case 'completed': case 'COMPLETED': return 'Completed'
    case 'plan_to_watch': case 'PLANNING': return 'Plan to Watch'
    case 'on_hold': case 'PAUSED': return 'On Hold'
    case 'dropped': case 'DROPPED': return 'Dropped'
    case 'REPEATING': return 'Rewatching'
    default: return 'Unknown Status'
  }
}

/**
 * Get CSS color classes for an anime status
 */
export const getStatusColor = (status: string | null): string => {
  if (!status) return 'bg-green-500 hover:bg-green-600'
  
  switch (status) {
    case 'watching': case 'CURRENT': return 'bg-blue-500 hover:bg-blue-600'
    case 'completed': case 'COMPLETED': return 'bg-green-500 hover:bg-green-600'
    case 'plan_to_watch': case 'PLANNING': return 'bg-yellow-500 hover:bg-yellow-600'
    case 'on_hold': case 'PAUSED': return 'bg-orange-500 hover:bg-orange-600'
    case 'dropped': case 'DROPPED': return 'bg-red-500 hover:bg-red-600'
    case 'REPEATING': return 'bg-purple-500 hover:bg-purple-600'
    default: return 'bg-gray-500 hover:bg-gray-600'
  }
}

/**
 * Get icon emoji for an anime status
 */
export const getStatusIcon = (status: string | null): string => {
  if (!status) return '➕'
  
  switch (status) {
    case 'watching': case 'CURRENT': return '👁️'
    case 'completed': case 'COMPLETED': return '✅'
    case 'plan_to_watch': case 'PLANNING': return '📋'
    case 'on_hold': case 'PAUSED': return '⏸️'
    case 'dropped': case 'DROPPED': return '❌'
    case 'REPEATING': return '🔁'
    default: return '📺'
  }
}

/**
 * Convert status between MAL and AniList formats
 */
export const convertStatusBetweenSources = (
  status: string, 
  fromSource: AnimeSource, 
  toSource: AnimeSource
): string => {
  if (fromSource === toSource) return status
  
  // Normalize to common format first
  let normalizedStatus: string
  
  if (fromSource === 'mal') {
    switch (status) {
      case 'watching': normalizedStatus = 'watching'; break
      case 'completed': normalizedStatus = 'completed'; break
      case 'on_hold': normalizedStatus = 'on_hold'; break
      case 'dropped': normalizedStatus = 'dropped'; break
      case 'plan_to_watch': normalizedStatus = 'plan_to_watch'; break
      default: normalizedStatus = status
    }
  } else {
    switch (status) {
      case 'CURRENT': normalizedStatus = 'watching'; break
      case 'COMPLETED': normalizedStatus = 'completed'; break
      case 'PAUSED': normalizedStatus = 'on_hold'; break
      case 'DROPPED': normalizedStatus = 'dropped'; break
      case 'PLANNING': normalizedStatus = 'plan_to_watch'; break
      case 'REPEATING': normalizedStatus = 'watching'; break
      default: normalizedStatus = status
    }
  }
  
  // Convert to target format
  if (toSource === 'mal') {
    return normalizedStatus
  } else {
    switch (normalizedStatus) {
      case 'watching': return 'CURRENT'
      case 'completed': return 'COMPLETED'
      case 'on_hold': return 'PAUSED'
      case 'dropped': return 'DROPPED'
      case 'plan_to_watch': return 'PLANNING'
      default: return status
    }
  }
}

/**
 * Get all possible status values for a source
 */
export const getAllStatusValues = (source: AnimeSource): string[] => {
  return getStatusOptions(source).map(option => option.value)
}

/**
 * Check if a status is valid for the given source
 */
export const isValidStatus = (status: string, source: AnimeSource): boolean => {
  return getAllStatusValues(source).includes(status)
}