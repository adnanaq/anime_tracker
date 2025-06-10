/**
 * Common GraphQL fragments for AniList API
 * Eliminates duplication across different query types
 */

export const ANIME_FIELDS_FRAGMENT = `
  fragment AnimeFields on Media {
    id
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      large
      medium
    }
    averageScore
    episodes
    status
    genres
    startDate {
      year
    }
    format
  }
`

export const ANIME_WITH_RELATIONS_FRAGMENT = `
  fragment AnimeWithRelations on Media {
    ...AnimeFields
    relations {
      edges {
        relationType
        node {
          ...AnimeFields
        }
      }
    }
  }
  ${ANIME_FIELDS_FRAGMENT}
`

export const USER_MEDIA_LIST_ENTRY_FRAGMENT = `
  fragment UserMediaListEntry on MediaListEntry {
    id
    score
    status
    progress
    media {
      ...AnimeFields
    }
  }
  ${ANIME_FIELDS_FRAGMENT}
`

/**
 * Utility functions to build common queries
 */
export const buildPageQuery = (sort: string, perPage: number = 6, page: number = 1) => `
  query {
    Page(page: ${page}, perPage: ${perPage}) {
      media(type: ANIME, sort: ${sort}) {
        ...AnimeFields
      }
    }
  }
  ${ANIME_FIELDS_FRAGMENT}
`

export const buildSearchQuery = (perPage: number = 6) => `
  query($search: String) {
    Page(page: 1, perPage: ${perPage}) {
      media(type: ANIME, search: $search) {
        ...AnimeFields
      }
    }
  }
  ${ANIME_FIELDS_FRAGMENT}
`

export const buildSeasonQuery = (perPage: number = 6) => `
  query($season: MediaSeason, $year: Int) {
    Page(page: 1, perPage: ${perPage}) {
      media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) {
        ...AnimeFields
      }
    }
  }
  ${ANIME_FIELDS_FRAGMENT}
`

export const buildAnimeDetailsQuery = () => `
  query($id: Int) {
    Media(id: $id, type: ANIME) {
      ...AnimeWithRelations
    }
  }
  ${ANIME_WITH_RELATIONS_FRAGMENT}
`

export const buildUserMediaListQuery = (userId: number, status?: string) => `
  query {
    MediaListCollection(userId: ${userId}, type: ANIME${status ? `, status: ${status}` : ''}) {
      lists {
        entries {
          ...UserMediaListEntry
        }
      }
    }
  }
  ${USER_MEDIA_LIST_ENTRY_FRAGMENT}
`