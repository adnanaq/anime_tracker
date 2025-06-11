import { gql } from '@apollo/client'

// Basic anime search query
export const SEARCH_ANIME_QUERY = gql`
  query SearchAnime($search: String!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
        perPage
      }
      media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        averageScore
        episodes
        status
        genres
        season
        seasonYear
        format
        startDate {
          year
          month
          day
        }
        studios {
          nodes {
            name
          }
        }
      }
    }
  }
`

// Get anime details by ID
export const GET_ANIME_DETAILS_QUERY = gql`
  query GetAnimeDetails($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        medium
      }
      bannerImage
      averageScore
      meanScore
      episodes
      duration
      status
      genres
      season
      seasonYear
      format
      source
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      studios {
        nodes {
          id
          name
        }
      }
      staff {
        nodes {
          id
          name {
            full
          }
          primaryOccupations
        }
      }
      characters {
        nodes {
          id
          name {
            full
          }
          image {
            medium
          }
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            title {
              romaji
              english
            }
            coverImage {
              medium
            }
            type
            format
          }
        }
      }
      recommendations {
        nodes {
          rating
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              medium
            }
            averageScore
          }
        }
      }
      reviews {
        nodes {
          id
          summary
          rating
          score
          user {
            name
          }
        }
      }
      stats {
        scoreDistribution {
          score
          amount
        }
        statusDistribution {
          status
          amount
        }
      }
      trailer {
        id
        site
        thumbnail
      }
      tags {
        id
        name
        description
        rank
        isMediaSpoiler
      }
    }
  }
`

// Get trending anime
export const GET_TRENDING_ANIME_QUERY = gql`
  query GetTrendingAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
        perPage
      }
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        averageScore
        episodes
        status
        genres
        season
        seasonYear
        format
        startDate {
          year
          month
          day
        }
      }
    }
  }
`

// Get popular anime
export const GET_POPULAR_ANIME_QUERY = gql`
  query GetPopularAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
        perPage
      }
      media(sort: POPULARITY_DESC, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        averageScore
        episodes
        status
        genres
        season
        seasonYear
        format
        startDate {
          year
          month
          day
        }
      }
    }
  }
`

// Get current season anime
export const GET_CURRENT_SEASON_ANIME_QUERY = gql`
  query GetCurrentSeasonAnime($season: MediaSeason!, $year: Int!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
        perPage
      }
      media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        averageScore
        episodes
        status
        genres
        season
        seasonYear
        format
        startDate {
          year
          month
          day
        }
      }
    }
  }
`

// Get top rated anime
export const GET_TOP_RATED_ANIME_QUERY = gql`
  query GetTopRatedAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
        perPage
      }
      media(sort: SCORE_DESC, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        averageScore
        episodes
        status
        genres
        season
        seasonYear
        format
        startDate {
          year
          month
          day
        }
      }
    }
  }
`

// User's anime list query
export const GET_USER_ANIME_LIST_QUERY = gql`
  query GetUserAnimeList($userId: Int!, $status: MediaListStatus, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
        perPage
      }
      mediaList(userId: $userId, status: $status, type: ANIME) {
        id
        status
        score
        progress
        startedAt {
          year
          month
          day
        }
        completedAt {
          year
          month
          day
        }
        updatedAt
        media {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
            medium
          }
          averageScore
          episodes
          status
          genres
          season
          seasonYear
          format
        }
      }
    }
  }
`

// Current user query
export const GET_CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    Viewer {
      id
      name
      avatar {
        large
        medium
      }
      bannerImage
      about
      options {
        titleLanguage
        displayAdultContent
        airingNotifications
      }
      mediaListOptions {
        scoreFormat
        rowOrder
        animeList {
          sectionOrder
          splitCompletedSectionByFormat
          customLists
          advancedScoring
          advancedScoringEnabled
        }
      }
      statistics {
        anime {
          count
          meanScore
          standardDeviation
          minutesWatched
          episodesWatched
          genrePreview: genres(limit: 10, sort: COUNT_DESC) {
            genre
            count
            meanScore
            minutesWatched
          }
        }
      }
    }
  }
`