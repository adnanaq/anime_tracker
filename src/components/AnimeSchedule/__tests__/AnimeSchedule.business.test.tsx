import { describe, it, expect, vi, beforeEach } from 'vitest';
import { animeScheduleService } from '../../../services/animeSchedule';
import type { AnimeScheduleEntry } from '../../../services/animeSchedule/api';

// ==========================================
// SECTION 1: DELAY BUSINESS LOGIC TESTS
// ==========================================

// Mock fetch globally for API tests
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

describe('AnimeSchedule - Business Logic', () => {
  describe('Delay Processing Logic', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should correctly handle real kusuriya episode 23 delay data', async () => {
      // This is the actual data structure we found for kusuriya episode 23
      const realKusuriyaDelayData: AnimeScheduleEntry = {
        title: 'Kusuriya no Hitorigoto Mini Anime 2nd Season',
        route: 'maomao-no-hitorigoto-2nd-season',
        romaji: 'Kusuriya no Hitorigoto Mini Anime 2nd Season',
        english: 'The Apothecary Diaries Mini Anime 2nd Season',
        native: '猫猫のひとりごと 第2期',
        delayedText: 'Delayed',
        delayedFrom: '2025-06-23T00:00:00Z',
        delayedUntil: '2025-06-27T00:00:00Z', // Real delayed time (shows as Jun 26 8PM EDT)
        status: 'Ongoing',
        episodeDate: '2025-06-23T00:00:00Z',
        episodeNumber: 23,
        lengthMin: 2,
        donghua: false,
        airType: 'raw',
        streams: { 
          youtube: 'www.youtube.com/playlist?list=PLtdSPZNWT1AtlB6oZ-OLqZKXwMdMnIDiC' 
        },
        airingStatus: 'unaired', // Note: API returns "unaired" not "delayed"
        malId: 60084
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [realKusuriyaDelayData]
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Verify the delay was correctly calculated (4 days = 5760 minutes)
      expect(normalizedEntry.episodeDelay).toBe(5760);
      
      // Verify airingStatus was corrected to "delayed" due to delayedText presence
      expect(normalizedEntry.airingStatus).toBe('delayed');
      
      // Verify delay information is preserved
      expect(normalizedEntry.delayedFrom).toBe('2025-06-23T00:00:00Z');
      expect(normalizedEntry.delayedUntil).toBe('2025-06-27T00:00:00Z');
      
      // Verify basic episode information
      expect(normalizedEntry.title).toBe('The Apothecary Diaries Mini Anime 2nd Season');
      expect(normalizedEntry.episodeNumber).toBe(23);
      expect(normalizedEntry.lengthMin).toBe(2);
      expect(normalizedEntry.malId).toBe(60084);
      
      // Verify ID handling
      expect(normalizedEntry.hasValidId).toBe(true);
      expect(normalizedEntry.id).toBe(60084); // Should use MAL ID as main ID
    });

    it('should handle kusuriya episode without specific delay data (normal case)', async () => {
      const normalKusuriyaData: AnimeScheduleEntry = {
        title: 'Kusuriya no Hitorigoto Mini Anime 2nd Season',
        route: 'maomao-no-hitorigoto-2nd-season',
        romaji: 'Kusuriya no Hitorigoto Mini Anime 2nd Season',
        english: 'The Apothecary Diaries Mini Anime 2nd Season',
        native: '猫猫のひとりごと 第2期',
        status: 'Ongoing',
        episodeDate: '2025-06-16T00:00:00Z',
        episodeNumber: 22,
        lengthMin: 2,
        donghua: false,
        airType: 'raw',
        streams: { 
          youtube: 'www.youtube.com/playlist?list=PLtdSPZNWT1AtlB6oZ-OLqZKXwMdMnIDiC' 
        },
        airingStatus: 'aired',
        malId: 60084
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [normalKusuriyaData]
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 24,
        year: 2025,
        timezone: 'UTC'
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should not have delay information for normal episode
      expect(normalizedEntry.episodeDelay).toBeUndefined();
      expect(normalizedEntry.delayedFrom).toBeUndefined();
      expect(normalizedEntry.delayedUntil).toBeUndefined();
      
      // Should preserve original airing status
      expect(normalizedEntry.airingStatus).toBe('aired');
      
      // Basic episode information should be correct
      expect(normalizedEntry.title).toBe('The Apothecary Diaries Mini Anime 2nd Season');
      expect(normalizedEntry.episodeNumber).toBe(22);
    });

    it('should handle edge case where API provides episodeDelay directly', async () => {
      // Some APIs might provide episodeDelay directly instead of date ranges
      const kusuriyaWithDirectDelay: AnimeScheduleEntry = {
        title: 'Kusuriya no Hitorigoto Mini Anime 2nd Season',
        route: 'maomao-no-hitorigoto-2nd-season',
        english: 'The Apothecary Diaries Mini Anime 2nd Season',
        delayedText: 'Delayed',
        episodeDelay: 480, // 8 hours provided directly
        status: 'Ongoing',
        episodeDate: '2025-06-23T08:00:00Z',
        episodeNumber: 23,
        lengthMin: 2,
        donghua: false,
        airType: 'raw',
        streams: {},
        airingStatus: 'delayed',
        malId: 60084
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [kusuriyaWithDirectDelay]
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should preserve API-provided episodeDelay
      expect(normalizedEntry.episodeDelay).toBe(480);
      
      // Should preserve delayed status
      expect(normalizedEntry.airingStatus).toBe('delayed');
      
      expect(normalizedEntry.title).toBe('The Apothecary Diaries Mini Anime 2nd Season');
      expect(normalizedEntry.episodeNumber).toBe(23);
    });

    it('should handle episode with delayedText but no date range', async () => {
      const delayedWithoutDates: AnimeScheduleEntry = {
        title: 'Test Anime',
        route: 'test-anime',
        english: 'Test Anime',
        delayedText: 'Delayed',
        // No delayedFrom/delayedUntil dates
        status: 'Ongoing',
        episodeDate: '2025-06-20T12:00:00Z',
        episodeNumber: 1,
        lengthMin: 24,
        donghua: false,
        airType: 'sub',
        streams: {},
        airingStatus: 'unaired',
        malId: 12345
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [delayedWithoutDates]
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should set status to delayed due to delayedText
      expect(normalizedEntry.airingStatus).toBe('delayed');
      
      // Should not have calculated delay duration without dates
      expect(normalizedEntry.episodeDelay).toBeUndefined();
    });

    it('should handle invalid delay dates gracefully', async () => {
      const invalidDelayDates: AnimeScheduleEntry = {
        title: 'Test Anime',
        route: 'test-anime',
        english: 'Test Anime',
        delayedText: 'Delayed',
        delayedFrom: 'invalid-date',
        delayedUntil: 'also-invalid',
        status: 'Ongoing',
        episodeDate: '2025-06-20T12:00:00Z',
        episodeNumber: 1,
        lengthMin: 24,
        donghua: false,
        airType: 'sub',
        streams: {},
        airingStatus: 'unaired',
        malId: 12345
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [invalidDelayDates]
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should set status to delayed due to delayedText
      expect(normalizedEntry.airingStatus).toBe('delayed');
      
      // Should not have calculated delay duration with invalid dates
      expect(normalizedEntry.episodeDelay).toBeUndefined();
      
      // Should preserve the invalid dates (for debugging)
      expect(normalizedEntry.delayedFrom).toBe('invalid-date');
      expect(normalizedEntry.delayedUntil).toBe('also-invalid');
    });
  });

  // ==========================================
  // SECTION 2: DATA NORMALIZATION TESTS
  // ==========================================

  describe('Data Normalization Logic', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should prioritize English title over romaji and original', async () => {
      const animeWithMultipleTitles: AnimeScheduleEntry = {
        title: 'Original Title',
        route: 'test-anime',
        romaji: 'Romaji Title',
        english: 'English Title',
        status: 'Ongoing',
        episodeDate: '2025-06-20T12:00:00Z',
        episodeNumber: 1,
        lengthMin: 24,
        donghua: false,
        airType: 'sub',
        streams: {},
        airingStatus: 'aired',
        malId: 12345
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [animeWithMultipleTitles]
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      expect(result[0].title).toBe('English Title');
    });

    it('should fallback to romaji when no english title', async () => {
      const animeWithRomajiOnly: AnimeScheduleEntry = {
        title: 'Original Title',
        route: 'test-anime',
        romaji: 'Romaji Title',
        // No english title
        status: 'Ongoing',
        episodeDate: '2025-06-20T12:00:00Z',
        episodeNumber: 1,
        lengthMin: 24,
        donghua: false,
        airType: 'sub',
        streams: {},
        airingStatus: 'aired',
        malId: 12345
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [animeWithRomajiOnly]
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      expect(result[0].title).toBe('Romaji Title');
    });

    it('should handle anime without MAL ID by generating random ID', async () => {
      const animeWithoutMalId: AnimeScheduleEntry = {
        title: 'Test Anime',
        route: 'test-anime',
        english: 'Test Anime',
        status: 'Ongoing',
        episodeDate: '2025-06-20T12:00:00Z',
        episodeNumber: 1,
        lengthMin: 24,
        donghua: false,
        airType: 'sub',
        streams: {},
        airingStatus: 'aired'
        // No malId
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [animeWithoutMalId]
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      expect(result[0].hasValidId).toBe(false);
      expect(result[0].id).toBeGreaterThan(0);
      expect(result[0].malId).toBeUndefined();
    });

    it('should convert airing status to standard format', async () => {
      const testCases = [
        { input: 'aired', expected: 'finished_airing' },
        { input: 'airing', expected: 'currently_airing' },
        { input: 'delayed', expected: 'not_yet_aired' },
        { input: 'unaired', expected: 'not_yet_aired' }
      ];

      for (const testCase of testCases) {
        const animeData: AnimeScheduleEntry = {
          title: 'Test Anime',
          route: 'test-anime',
          english: 'Test Anime',
          status: 'Ongoing',
          episodeDate: '2025-06-20T12:00:00Z',
          episodeNumber: 1,
          lengthMin: 24,
          donghua: false,
          airType: 'sub',
          streams: {},
          airingStatus: testCase.input as any,
          malId: 12345
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => [animeData]
        } as Response);

        const result = await animeScheduleService.getTimetables({
          week: 25,
          year: 2025,
          timezone: 'UTC'
        });

        expect(result[0].status).toBe(testCase.expected);
        
        vi.clearAllMocks();
      }
    });
  });

  // ==========================================
  // SECTION 3: TIME FORMATTING BUSINESS LOGIC
  // ==========================================

  describe('Time Formatting Logic', () => {
    it('should format delayed time correctly for Toronto timezone', () => {
      // Test the time formatting that would be used in the component
      const delayedUntil = '2025-06-27T00:00:00Z'; // UTC midnight
      
      const delayedUntilDate = new Date(delayedUntil);
      const formattedTime = delayedUntilDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Toronto',
        timeZoneName: 'short'
      });
      const formattedDate = delayedUntilDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Toronto'
      });

      expect(formattedTime).toBe('08:00 PM EDT');
      expect(formattedDate).toBe('Jun 26');
    });

    it('should format delayed time correctly for different timezones', () => {
      const delayedUntil = '2025-06-27T00:00:00Z';
      const delayedUntilDate = new Date(delayedUntil);

      const timezones = [
        { tz: 'UTC', expectedTime: '12:00 AM UTC', expectedDate: 'Jun 27' },
        { tz: 'America/New_York', expectedTime: '08:00 PM EDT', expectedDate: 'Jun 26' },
        { tz: 'Asia/Tokyo', expectedTime: '09:00 AM GMT+9', expectedDate: 'Jun 27' },
        { tz: 'Europe/London', expectedTime: '01:00 AM GMT+1', expectedDate: 'Jun 27' }
      ];

      timezones.forEach(({ tz, expectedTime, expectedDate }) => {
        const formattedTime = delayedUntilDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: tz,
          timeZoneName: 'short'
        });
        const formattedDate = delayedUntilDate.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          timeZone: tz
        });

        expect(formattedTime).toBe(expectedTime);
        expect(formattedDate).toBe(expectedDate);
      });
    });
  });

  // ==========================================
  // SECTION 4: ERROR HANDLING BUSINESS LOGIC
  // ==========================================

  describe('Error Handling Logic', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      // Should return empty array on error
      expect(result).toEqual([]);
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      // Should return empty array on error
      expect(result).toEqual([]);
    });

    it('should handle malformed JSON gracefully', async () => {
      mockFetch.mockResolvedValueOnce(new Response('invalid json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));

      const result = await animeScheduleService.getTimetables({
        week: 25,
        year: 2025,
        timezone: 'UTC'
      });

      // Should return empty array on JSON parsing error
      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // SECTION 5: COMPONENT BUSINESS LOGIC
  // ==========================================

  describe('Component Business Logic', () => {
    it('should determine when to show delayed badge', () => {
      // Test the logic that components use to determine badge display
      const testCases = [
        { airingStatus: 'delayed', expected: true },
        { airingStatus: 'aired', expected: false },
        { airingStatus: 'airing', expected: false },
        { airingStatus: 'tba', expected: false },
        { airingStatus: 'skipped', expected: false }
      ];

      testCases.forEach(({ airingStatus, expected }) => {
        const shouldShowDelayedBadge = airingStatus === 'delayed';
        expect(shouldShowDelayedBadge).toBe(expected);
      });
    });

    it('should determine when to show new air time', () => {
      const testCases = [
        { airingStatus: 'delayed', delayedUntil: '2025-06-27T00:00:00Z', expected: true },
        { airingStatus: 'delayed', delayedUntil: undefined, expected: false },
        { airingStatus: 'aired', delayedUntil: '2025-06-27T00:00:00Z', expected: false },
        { airingStatus: 'airing', delayedUntil: undefined, expected: false }
      ];

      testCases.forEach(({ airingStatus, delayedUntil, expected }) => {
        const shouldShowNewAirTime = !!(airingStatus === 'delayed' && delayedUntil);
        expect(shouldShowNewAirTime).toBe(expected);
      });
    });

    it('should calculate delay duration correctly', () => {
      const delayedFrom = '2025-06-23T00:00:00Z';
      const delayedUntil = '2025-06-27T00:00:00Z';
      
      const delayedFromDate = new Date(delayedFrom);
      const delayedUntilDate = new Date(delayedUntil);
      
      const delayDurationMs = delayedUntilDate.getTime() - delayedFromDate.getTime();
      const delayDurationMinutes = Math.round(delayDurationMs / (1000 * 60));
      
      // 4 days = 4 * 24 * 60 = 5760 minutes
      expect(delayDurationMinutes).toBe(5760);
    });
  });
});