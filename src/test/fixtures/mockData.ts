export const mockAnime = {
  basic: {
    id: 1,
    title: {
      romaji: 'Test Anime',
      english: 'Test Anime English',
      native: 'テストアニメ'
    },
    coverImage: {
      large: '/test-image.jpg',
      medium: '/test-image-medium.jpg'
    },
  },
  
  complete: {
    id: 1,
    title: {
      romaji: 'Attack on Titan',
      english: 'Attack on Titan',
      native: '進撃の巨人'
    },
    coverImage: {
      large: 'https://example.com/image-large.jpg',
      medium: 'https://example.com/image-medium.jpg'
    },
    averageScore: 90,
    format: 'TV',
    status: 'FINISHED',
    episodes: 25,
    genres: ['Action', 'Drama', 'Fantasy'],
    studios: {
      nodes: [{ name: 'MAPPA' }]
    },
    startDate: {
      year: 2013,
      month: 4,
      day: 7
    },
    description: 'Humanity fights for survival against giant humanoid Titans.',
  },

  minimal: {
    id: 2,
    title: {
      romaji: 'Minimal Anime'
    }
  }
}

export const mockAnimeList = [
  mockAnime.complete,
  {
    ...mockAnime.complete,
    id: 2,
    title: { romaji: 'Second Anime' },
    averageScore: 75
  },
  {
    ...mockAnime.complete,
    id: 3,
    title: { romaji: 'Third Anime' },
    averageScore: 95
  }
]

export const mockStoreState = {
  trendingAnime: [],
  currentSeasonAnime: [],
  searchResults: [],
  isLoading: {
    trending: false,
    currentSeason: false,
    search: false,
  },
  error: null,
  currentSource: 'anilist' as const,
  authTokens: {
    anilist: null,
    mal: null,
  },
}