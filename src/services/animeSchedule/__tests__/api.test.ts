import { describe, it, expect, vi, beforeEach } from "vitest";
import { animeScheduleService } from "../api";
import type { AnimeScheduleEntry } from "../api";

// Mock fetch globally
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

describe("AnimeSchedule API - Delay Information Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeAnimeScheduleEntry with delay information", () => {
    it("should handle delayed episode with delayedText and time range", async () => {
      const mockDelayedEntry: AnimeScheduleEntry = {
        title: "Kusuriya no Hitorigoto Mini Anime 2nd Season",
        route: "maomao-no-hitorigoto-2nd-season",
        romaji: "Kusuriya no Hitorigoto Mini Anime 2nd Season",
        english: "The Apothecary Diaries Mini Anime 2nd Season",
        native: "猫猫のひとりごと 第2期",
        delayedText: "Delayed",
        delayedFrom: "2025-06-23T00:00:00Z",
        delayedUntil: "2025-06-30T00:00:00Z",
        status: "Ongoing",
        episodeDate: "2025-06-23T00:00:00Z",
        episodeNumber: 23,
        lengthMin: 2,
        donghua: false,
        airType: "raw",
        streams: { youtube: "https://youtube.com/playlist" },
        airingStatus: "unaired",
        malId: 12345,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockDelayedEntry],
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 26,
        year: 2025,
        timezone: "UTC",
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should correctly calculate delay duration (7 days = 10080 minutes)
      expect(normalizedEntry.episodeDelay).toBe(10080);

      // Should set airingStatus to "delayed" when delayedText is present
      expect(normalizedEntry.airingStatus).toBe("delayed");

      // Should preserve other delay information
      expect(normalizedEntry.delayedFrom).toBe("2025-06-23T00:00:00Z");
      expect(normalizedEntry.delayedUntil).toBe("2025-06-30T00:00:00Z");

      // Should preserve episode information
      expect(normalizedEntry.episodeNumber).toBe(23);
      expect(normalizedEntry.title).toBe(
        "The Apothecary Diaries Mini Anime 2nd Season"
      );
    });

    it("should handle episode with no delay information", async () => {
      const mockNormalEntry: AnimeScheduleEntry = {
        title: "Normal Anime Episode",
        route: "normal-anime",
        episodeDate: "2025-06-23T00:00:00Z",
        episodeNumber: 5,
        lengthMin: 24,
        donghua: false,
        airType: "raw",
        streams: {},
        airingStatus: "aired",
        malId: 67890,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockNormalEntry],
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 26,
        year: 2025,
        timezone: "UTC",
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should not have delay information
      expect(normalizedEntry.episodeDelay).toBeUndefined();
      expect(normalizedEntry.delayedFrom).toBeUndefined();
      expect(normalizedEntry.delayedUntil).toBeUndefined();

      // Should preserve original airing status
      expect(normalizedEntry.airingStatus).toBe("aired");

      // Should preserve episode information
      expect(normalizedEntry.episodeNumber).toBe(5);
      expect(normalizedEntry.title).toBe("Normal Anime Episode");
    });

    it("should handle episode with different delay durations", async () => {
      const mockShortDelayEntry: AnimeScheduleEntry = {
        title: "Short Delay Episode",
        route: "short-delay",
        delayedText: "Delayed",
        delayedFrom: "2025-06-23T14:00:00Z",
        delayedUntil: "2025-06-23T16:30:00Z", // 2.5 hours = 150 minutes
        episodeDate: "2025-06-23T16:30:00Z",
        episodeNumber: 10,
        lengthMin: 24,
        donghua: false,
        airType: "raw",
        streams: {},
        airingStatus: "unaired",
        malId: 11111,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockShortDelayEntry],
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 26,
        year: 2025,
        timezone: "UTC",
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should calculate correct delay duration (2.5 hours = 150 minutes)
      expect(normalizedEntry.episodeDelay).toBe(150);
      expect(normalizedEntry.airingStatus).toBe("delayed");
    });

    it("should handle episode with invalid delay dates gracefully", async () => {
      const mockInvalidDelayEntry: AnimeScheduleEntry = {
        title: "Invalid Delay Episode",
        route: "invalid-delay",
        delayedText: "Delayed",
        delayedFrom: "invalid-date",
        delayedUntil: "also-invalid",
        episodeDate: "2025-06-23T00:00:00Z",
        episodeNumber: 8,
        lengthMin: 24,
        donghua: false,
        airType: "raw",
        streams: {},
        airingStatus: "unaired",
        malId: 22222,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockInvalidDelayEntry],
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 26,
        year: 2025,
        timezone: "UTC",
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should still set airingStatus to delayed when delayedText is present
      expect(normalizedEntry.airingStatus).toBe("delayed");

      // Should not set episodeDelay for invalid dates
      expect(normalizedEntry.episodeDelay).toBeUndefined();

      // Should preserve the invalid delay data
      expect(normalizedEntry.delayedFrom).toBe("invalid-date");
      expect(normalizedEntry.delayedUntil).toBe("also-invalid");
    });

    it("should handle episode with delayedText but no date range", async () => {
      const mockTextOnlyDelayEntry: AnimeScheduleEntry = {
        title: "Text Only Delay Episode",
        route: "text-only-delay",
        delayedText: "Delayed",
        episodeDate: "2025-06-23T00:00:00Z",
        episodeNumber: 12,
        lengthMin: 24,
        donghua: false,
        airType: "raw",
        streams: {},
        airingStatus: "unaired",
        malId: 33333,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTextOnlyDelayEntry],
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 26,
        year: 2025,
        timezone: "UTC",
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should set airingStatus to delayed when delayedText is present
      expect(normalizedEntry.airingStatus).toBe("delayed");

      // Should not set episodeDelay without valid date range
      expect(normalizedEntry.episodeDelay).toBeUndefined();
    });

    it("should preserve existing episodeDelay if provided by API", async () => {
      const mockExistingDelayEntry: AnimeScheduleEntry = {
        title: "Existing Delay Episode",
        route: "existing-delay",
        episodeDelay: 45, // Provided by API
        delayedText: "Delayed",
        delayedFrom: "2025-06-23T14:00:00Z",
        delayedUntil: "2025-06-23T16:30:00Z", // Would calculate to 150 minutes
        episodeDate: "2025-06-23T16:30:00Z",
        episodeNumber: 15,
        lengthMin: 24,
        donghua: false,
        airType: "raw",
        streams: {},
        airingStatus: "delayed",
        malId: 44444,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockExistingDelayEntry],
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 26,
        year: 2025,
        timezone: "UTC",
      });

      expect(result).toHaveLength(1);
      const normalizedEntry = result[0];

      // Should preserve API-provided episodeDelay over calculated value
      expect(normalizedEntry.episodeDelay).toBe(45);
      expect(normalizedEntry.airingStatus).toBe("delayed");
    });
  });

  describe("API error handling", () => {
    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response);

      const result = await animeScheduleService.getTimetables({
        week: 26,
        year: 2025,
        timezone: "UTC",
      });

      // Should return empty array on error
      expect(result).toEqual([]);
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await animeScheduleService.getTimetables({
        week: 26,
        year: 2025,
        timezone: "UTC",
      });

      // Should return empty array on error
      expect(result).toEqual([]);
    });
  });
});
