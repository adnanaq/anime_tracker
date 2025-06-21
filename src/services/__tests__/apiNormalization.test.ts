import { describe, it, expect } from 'vitest'
import { normalizeAniListAnime } from '../anilist/api'
import { normalizeJikanAnime } from '../jikan/api'
import { normalizeMALAnime } from '../mal/api'
import type { AniListAnime, MALAnime } from '../../types/anime'
import type { JikanAnime } from '../jikan/api'

describe('API Normalization Functions', () => {
  describe('normalizeAniListAnime', () => {
    const mockAniListAnime: AniListAnime = {
      id: 123,
      title: {
        romaji: 'Attack on Titan',
        english: 'Attack on Titan',
        native: '進撃の巨人'
      },
      description: '<p>A dark fantasy anime</p><br>With HTML tags',
      coverImage: {
        large: 'https://example.com/large.jpg',
        medium: 'https://example.com/medium.jpg'
      },
      averageScore: 85,
      episodes: 25,
      status: 'FINISHED',
      genres: ['Action', 'Drama'],
      startDate: { year: 2013 },
      format: 'TV',
      relations: {
        edges: [
          {
            relationType: 'SEQUEL',
            node: {
              id: 456,
              title: {
                romaji: 'Attack on Titan Season 2',
                english: 'Attack on Titan Season 2',
                native: '進撃の巨人 Season 2'
              },
              coverImage: {
                medium: 'https://example.com/s2-medium.jpg',
                large: 'https://example.com/s2-large.jpg'
              },
              averageScore: 90,
              episodes: 12,
              status: 'FINISHED',
              genres: ['Action'],
              startDate: { year: 2017 },
              format: 'TV'
            }
          }
        ]
      }
    }

    it('should normalize basic AniList anime data', () => {
      const result = normalizeAniListAnime(mockAniListAnime)

      expect(result).toEqual({
        id: 123,
        title: 'Attack on Titan',
        synopsis: 'A dark fantasy animeWith HTML tags',
        image: 'https://example.com/large.jpg',
        coverImage: 'https://example.com/large.jpg',
        score: 8.5,
        userScore: undefined,
        userStatus: undefined,
        userProgress: undefined,
        episodes: 25,
        status: 'FINISHED',
        genres: ['Action', 'Drama'],
        year: 2013,
        format: 'TV',
        source: 'anilist',
        duration: undefined,
        studios: [],
        popularity: undefined
      })
    })

    it('should handle missing coverImage gracefully', () => {
      const animeWithoutImage = { ...mockAniListAnime, coverImage: undefined }
      const result = normalizeAniListAnime(animeWithoutImage)

      expect(result.image).toBe('')
      expect(result.coverImage).toBe('')
      expect(result.image).toBe('')
    })

    it('should use medium image as fallback', () => {
      const animeWithMediumOnly = {
        ...mockAniListAnime,
        coverImage: { medium: 'https://example.com/medium.jpg', large: 'https://example.com/medium.jpg' }
      }
      const result = normalizeAniListAnime(animeWithMediumOnly)

      expect(result.image).toBe('https://example.com/medium.jpg')
      expect(result.coverImage).toBe('https://example.com/medium.jpg')
    })

    it('should handle title fallbacks correctly', () => {
      const animeWithOnlyNative = {
        ...mockAniListAnime,
        title: { romaji: '', native: '進撃の巨人' }
      }
      const result = normalizeAniListAnime(animeWithOnlyNative)
      expect(result.title).toBe('進撃の巨人')

      const animeWithNoTitle = {
        ...mockAniListAnime,
        title: { romaji: '' }
      }
      const resultEmpty = normalizeAniListAnime(animeWithNoTitle)
      expect(resultEmpty.title).toBe('')
    })

    it('should remove HTML tags from description', () => {
      const animeWithHTML = {
        ...mockAniListAnime,
        description: '<strong>Bold text</strong> and <em>italic</em> <br/> with <a href="#">links</a>'
      }
      const result = normalizeAniListAnime(animeWithHTML)
      expect(result.synopsis).toBe('Bold text and italic  with links')
    })

    it('should handle user data from mediaListEntry', () => {
      const animeWithUserData = {
        ...mockAniListAnime,
        mediaListEntry: {
          score: 9,
          status: 'COMPLETED',
          progress: 25
        }
      } as any

      const result = normalizeAniListAnime(animeWithUserData)

      expect(result.userScore).toBe(9)
      expect(result.userStatus).toBe('COMPLETED')
      expect(result.userProgress).toBe(25)
    })

    it('should handle user data directly on anime object', () => {
      const animeWithDirectUserData = {
        ...mockAniListAnime,
        score: 8,
        status: 'CURRENT',
        progress: 15
      } as any

      const result = normalizeAniListAnime(animeWithDirectUserData)

      // User data should only come from mediaListEntry, not directly on anime object
      expect(result.userScore).toBeUndefined()
      expect(result.userStatus).toBeUndefined()
      expect(result.userProgress).toBeUndefined()
      // anime.status should still be preserved
      expect(result.status).toBe('CURRENT')
    })

    it('should include related anime when requested', () => {
      const result = normalizeAniListAnime(mockAniListAnime, true)

      expect(result.relatedAnime).toHaveLength(1)
      expect(result.relatedAnime?.[0]).toEqual({
        id: 456,
        title: 'Attack on Titan Season 2',
        synopsis: undefined,
        image: 'https://example.com/s2-large.jpg',
        coverImage: 'https://example.com/s2-large.jpg',
        score: 9,
        userScore: undefined,
        userStatus: undefined,
        userProgress: undefined,
        episodes: 12,
        status: 'FINISHED',
        genres: ['Action'],
        year: 2017,
        format: 'TV',
        source: 'anilist',
        duration: undefined,
        studios: [],
        popularity: undefined
      })
    })

    it('should not include related anime when not requested', () => {
      const result = normalizeAniListAnime(mockAniListAnime, false)
      expect(result.relatedAnime).toBeUndefined()
    })

    it('should filter out self-references in related anime', () => {
      const animeWithSelfReference = {
        ...mockAniListAnime,
        relations: {
          edges: [
            {
              relationType: 'SEQUEL',
              node: { ...mockAniListAnime, id: 123 } // Same ID as parent
            },
            {
              relationType: 'PREQUEL',
              node: { ...mockAniListAnime, id: 456 } // Different ID
            }
          ]
        }
      }

      const result = normalizeAniListAnime(animeWithSelfReference, true)
      expect(result.relatedAnime).toHaveLength(1)
      expect(result.relatedAnime?.[0].id).toBe(456)
    })

    it('should limit related anime to 10 items', () => {
      const manyRelations = Array.from({ length: 15 }, (_, i) => ({
        relationType: 'SEQUEL',
        node: { ...mockAniListAnime, id: 200 + i }
      }))

      const animeWithManyRelations = {
        ...mockAniListAnime,
        relations: { edges: manyRelations }
      }

      const result = normalizeAniListAnime(animeWithManyRelations, true)
      expect(result.relatedAnime).toHaveLength(10)
    })
  })

  describe('normalizeJikanAnime', () => {
    const mockJikanAnime: JikanAnime = {
      mal_id: 123,
      title: 'One Piece',
      synopsis: 'A pirate adventure anime',
      images: {
        jpg: {
          image_url: 'https://example.com/image.jpg',
          small_image_url: 'https://example.com/small.jpg',
          large_image_url: 'https://example.com/large.jpg'
        },
        webp: {
          image_url: 'https://example.com/image.webp',
          small_image_url: 'https://example.com/small.webp',
          large_image_url: 'https://example.com/large.webp'
        }
      },
      score: 9.2,
      episodes: 1000,
      status: 'Currently Airing',
      genres: [
        { mal_id: 1, name: 'Action' },
        { mal_id: 2, name: 'Adventure' }
      ],
      year: 1999,
      type: 'TV',
      aired: {
        from: '1999-10-20T00:00:00+00:00',
        to: undefined
      },
      relations: [
        {
          relation: 'Sequel',
          entry: [
            {
              mal_id: 456,
              type: 'anime',
              name: 'One Piece: Film Red',
              url: 'https://myanimelist.net/anime/456'
            },
            {
              mal_id: 789,
              type: 'manga',
              name: 'One Piece Manga',
              url: 'https://myanimelist.net/manga/789'
            }
          ]
        }
      ]
    }

    it('should normalize basic Jikan anime data', () => {
      const result = normalizeJikanAnime(mockJikanAnime)

      expect(result).toEqual({
        id: 123,
        title: 'One Piece',
        synopsis: 'A pirate adventure anime',
        image: 'https://example.com/large.jpg',
        coverImage: 'https://example.com/large.jpg',
        score: 9.2,
        episodes: 1000,
        status: 'Currently Airing',
        genres: ['Action', 'Adventure'],
        year: 1999,
        format: 'TV',
        source: 'jikan'
      })
    })

    it('should fallback to regular image when large is not available', () => {
      const animeWithoutLarge = {
        ...mockJikanAnime,
        images: {
          jpg: {
            image_url: 'https://example.com/image.jpg',
            small_image_url: 'https://example.com/small.jpg',
            large_image_url: ''
          },
          webp: {
            image_url: 'https://example.com/image.webp',
            small_image_url: 'https://example.com/small.webp',
            large_image_url: ''
          }
        }
      }

      const result = normalizeJikanAnime(animeWithoutLarge)
      expect(result.image).toBe('https://example.com/image.jpg')
      expect(result.coverImage).toBe('https://example.com/image.jpg')
    })

    it('should extract year from aired date when year is not provided', () => {
      const animeWithoutYear = {
        ...mockJikanAnime,
        year: undefined,
        aired: { from: '2020-04-15T00:00:00+00:00' }
      }

      const result = normalizeJikanAnime(animeWithoutYear)
      expect(result.year).toBe(2020)
    })

    it('should handle missing aired date gracefully', () => {
      const animeWithoutAired = {
        ...mockJikanAnime,
        year: undefined,
        aired: undefined
      }

      const result = normalizeJikanAnime(animeWithoutAired)
      expect(result.year).toBeUndefined()
    })

    it('should handle empty genres array', () => {
      const animeWithoutGenres = {
        ...mockJikanAnime,
        genres: undefined
      }

      const result = normalizeJikanAnime(animeWithoutGenres)
      expect(result.genres).toEqual([])
    })

    it('should include related anime when requested', () => {
      const result = normalizeJikanAnime(mockJikanAnime, true)

      expect(result.relatedAnime).toHaveLength(1)
      expect(result.relatedAnime?.[0]).toEqual({
        id: 456,
        title: 'One Piece: Film Red',
        source: 'jikan'
      })
    })

    it('should filter out non-anime relations', () => {
      const result = normalizeJikanAnime(mockJikanAnime, true)
      
      // Should only include anime type, not manga
      expect(result.relatedAnime).toHaveLength(1)
      expect(result.relatedAnime?.[0].id).toBe(456)
    })

    it('should exclude self-references in related anime', () => {
      const animeWithSelfRef = {
        ...mockJikanAnime,
        relations: [
          {
            relation: 'Sequel',
            entry: [
              {
                mal_id: 123, // Same as parent
                type: 'anime',
                name: 'Self Reference',
                url: 'https://example.com'
              },
              {
                mal_id: 456,
                type: 'anime',
                name: 'Different Anime',
                url: 'https://example.com'
              }
            ]
          }
        ]
      }

      const result = normalizeJikanAnime(animeWithSelfRef, true)
      expect(result.relatedAnime).toHaveLength(1)
      expect(result.relatedAnime?.[0].id).toBe(456)
    })

    it('should limit related anime to 10 items', () => {
      const manyRelations = Array.from({ length: 15 }, (_, i) => ({
        mal_id: 200 + i,
        type: 'anime',
        name: `Related Anime ${i}`,
        url: `https://example.com/${i}`
      }))

      const animeWithManyRelations = {
        ...mockJikanAnime,
        relations: [{ relation: 'Related', entry: manyRelations }]
      }

      const result = normalizeJikanAnime(animeWithManyRelations, true)
      expect(result.relatedAnime).toHaveLength(10)
    })
  })

  describe('normalizeMALAnime', () => {
    const mockMALAnime: MALAnime = {
      id: 123,
      title: 'Naruto',
      synopsis: 'A ninja anime',
      main_picture: {
        medium: 'https://example.com/medium.jpg',
        large: 'https://example.com/large.jpg'
      },
      mean: 8.5,
      num_episodes: 220,
      status: 'finished_airing',
      genres: [
        { id: 1, name: 'Action' },
        { id: 27, name: 'Shounen' }
      ],
      start_date: '2002-10-03',
      media_type: 'tv',
      related_anime: [
        {
          node: {
            id: 456,
            title: 'Naruto: Shippuden',
            main_picture: {
              medium: 'https://example.com/shippuden-medium.jpg',
              large: 'https://example.com/shippuden-large.jpg'
            },
            mean: 8.8,
            num_episodes: 500,
            status: 'finished_airing',
            genres: [{ id: 1, name: 'Action' }],
            start_date: '2007-02-15',
            media_type: 'tv'
          },
          relation_type: 'sequel',
          relation_type_formatted: 'Sequel'
        }
      ]
    }

    it('should normalize basic MAL anime data', () => {
      const result = normalizeMALAnime(mockMALAnime)

      expect(result).toEqual({
        id: 123,
        title: 'Naruto',
        synopsis: 'A ninja anime',
        image: 'https://example.com/large.jpg',
        coverImage: 'https://example.com/large.jpg',
        score: 8.5,
        userScore: undefined,
        userStatus: undefined,
        userProgress: undefined,
        episodes: 220,
        status: 'finished_airing',
        genres: ['Action', 'Shounen'],
        year: 2002,
        format: 'tv',
        source: 'mal',
        duration: undefined,
        studios: [],
        popularity: undefined
      })
    })

    it('should handle missing main_picture gracefully', () => {
      const animeWithoutPicture = {
        ...mockMALAnime,
        main_picture: undefined
      }

      const result = normalizeMALAnime(animeWithoutPicture)
      expect(result.image).toBeUndefined()
      expect(result.coverImage).toBeUndefined()
    })

    it('should fallback to medium image when large is not available', () => {
      const animeWithMediumOnly = {
        ...mockMALAnime,
        main_picture: {
          medium: 'https://example.com/medium.jpg',
          large: 'https://example.com/medium.jpg'
        }
      }

      const result = normalizeMALAnime(animeWithMediumOnly)
      expect(result.image).toBe('https://example.com/medium.jpg')
      expect(result.coverImage).toBe('https://example.com/medium.jpg')
    })

    it('should handle user list status data', () => {
      const animeWithUserData = {
        ...mockMALAnime,
        my_list_status: {
          score: 9,
          status: 'completed',
          num_episodes_watched: 220
        }
      } as any

      const result = normalizeMALAnime(animeWithUserData)

      expect(result.userScore).toBe(9)
      expect(result.userStatus).toBe('completed')
      expect(result.userProgress).toBe(220)
    })

    it('should handle invalid start date', () => {
      const animeWithInvalidDate = {
        ...mockMALAnime,
        start_date: 'invalid-date'
      }

      const result = normalizeMALAnime(animeWithInvalidDate)
      expect(result.year).toBeNaN()
    })

    it('should handle missing start date', () => {
      const animeWithoutDate = {
        ...mockMALAnime,
        start_date: undefined
      }

      const result = normalizeMALAnime(animeWithoutDate)
      expect(result.year).toBeUndefined()
    })

    it('should handle empty genres array', () => {
      const animeWithoutGenres = {
        ...mockMALAnime,
        genres: undefined
      }

      const result = normalizeMALAnime(animeWithoutGenres)
      expect(result.genres).toEqual([])
    })

    it('should include related anime when requested', () => {
      const result = normalizeMALAnime(mockMALAnime, true)

      expect(result.relatedAnime).toHaveLength(1)
      expect(result.relatedAnime?.[0]).toEqual({
        id: 456,
        title: 'Naruto: Shippuden',
        synopsis: undefined,
        image: 'https://example.com/shippuden-large.jpg',
        coverImage: 'https://example.com/shippuden-large.jpg',
        score: 8.8,
        userScore: undefined,
        userStatus: undefined,
        userProgress: undefined,
        episodes: 500,
        status: 'finished_airing',
        genres: ['Action'],
        year: 2007,
        format: 'tv',
        source: 'mal',
        duration: undefined,
        studios: [],
        popularity: undefined
      })
    })

    it('should filter out self-references in related anime', () => {
      const animeWithSelfRef = {
        ...mockMALAnime,
        related_anime: [
          {
            node: { ...mockMALAnime, id: 123 }, // Same ID
            relation_type: 'sequel',
            relation_type_formatted: 'Sequel'
          },
          {
            node: { ...mockMALAnime, id: 456 }, // Different ID
            relation_type: 'prequel',
            relation_type_formatted: 'Prequel'
          }
        ]
      }

      const result = normalizeMALAnime(animeWithSelfRef, true)
      expect(result.relatedAnime).toHaveLength(1)
      expect(result.relatedAnime?.[0].id).toBe(456)
    })

    it('should limit related anime to 10 items', () => {
      const manyRelations = Array.from({ length: 15 }, (_, i) => ({
        node: { ...mockMALAnime, id: 200 + i },
        relation_type: 'related',
        relation_type_formatted: 'Related'
      }))

      const animeWithManyRelations = {
        ...mockMALAnime,
        related_anime: manyRelations
      }

      const result = normalizeMALAnime(animeWithManyRelations, true)
      expect(result.relatedAnime).toHaveLength(10)
    })

    it('should handle missing related anime gracefully', () => {
      const animeWithoutRelations = {
        ...mockMALAnime,
        related_anime: undefined
      }

      const result = normalizeMALAnime(animeWithoutRelations, true)
      expect(result.relatedAnime).toBeUndefined()
    })
  })
})