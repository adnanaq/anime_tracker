import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SeasonalAnime } from "../SeasonalAnime";

// Mock MAL service
vi.mock("../../../services/mal", () => ({
  malService: {
    getSeasonalAnime: vi.fn(),
    getUpcomingAnime: vi.fn(),
  },
}));

// Mock BaseAnimeCard component
vi.mock("../../ui/BaseAnimeCard", () => ({
  BaseAnimeCard: ({ anime }: { anime: any }) => (
    <div data-testid="base-anime-card" data-anime-id={anime.id}>
      {anime.title}
    </div>
  ),
}));

// Mock UI components
vi.mock("../../ui", () => ({
  Typography: ({ children, variant, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, variant, disabled, ...props }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  AnimeGridSkeleton: ({ count }: { count: number }) => (
    <div data-testid="anime-grid-skeleton">Loading {count} items...</div>
  ),
}));

const mockSeasonalAnime = [
  {
    id: 1,
    title: "Winter Anime 1",
    source: "mal",
    image: "https://example.com/anime1.jpg",
    coverImage: "https://example.com/anime1.jpg",
    score: 8.5,
    episodes: 12,
    year: 2024,
    genres: ["Action", "Adventure"],
  },
  {
    id: 2,
    title: "Winter Anime 2",
    source: "mal",
    image: "https://example.com/anime2.jpg",
    coverImage: "https://example.com/anime2.jpg",
    score: 7.8,
    episodes: 24,
    year: 2024,
    genres: ["Romance", "Drama"],
  },
];

const mockUpcomingAnime = [
  {
    id: 3,
    title: "Upcoming Anime 1",
    source: "mal",
    image: "https://example.com/anime3.jpg",
    coverImage: "https://example.com/anime3.jpg",
    score: 9.0,
    episodes: 12,
    year: 2024,
    genres: ["Sci-Fi", "Thriller"],
  },
];

describe("SeasonalAnime Component", () => {
  const mockGetSeasonalAnime = vi.fn();
  const mockGetUpcomingAnime = vi.fn();

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockGetSeasonalAnime.mockResolvedValue(mockSeasonalAnime);
    mockGetUpcomingAnime.mockResolvedValue(mockUpcomingAnime);
    
    const malService = await import("../../../services/mal");
    vi.mocked(malService.malService.getSeasonalAnime).mockImplementation(mockGetSeasonalAnime);
    vi.mocked(malService.malService.getUpcomingAnime).mockImplementation(mockGetUpcomingAnime);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the component with header and navigation", () => {
      render(<SeasonalAnime />);

      expect(screen.getByText("🗓️ Seasonal Anime")).toBeInTheDocument();
      expect(screen.getByText("Powered by Jikan")).toBeInTheDocument();
      
      // Check tab buttons
      expect(screen.getByText(/Current Season/)).toBeInTheDocument();
      expect(screen.getByText(/Browse Seasons/)).toBeInTheDocument();
      expect(screen.getByText(/Upcoming/)).toBeInTheDocument();
    });

    it("renders current season tab by default", () => {
      render(<SeasonalAnime />);
      
      // Current season button should have primary variant
      const currentSeasonButton = screen.getByText(/Current Season/).closest('button');
      expect(currentSeasonButton).toHaveAttribute('data-variant', 'primary');
    });

    it("renders season and year selectors when seasonal tab is active", async () => {
      render(<SeasonalAnime />);
      
      // Click on Browse Seasons tab
      fireEvent.click(screen.getByText(/Browse Seasons/));
      
      // Should show year and season selectors
      expect(screen.getByText("Year")).toBeInTheDocument();
      expect(screen.getByText("Season")).toBeInTheDocument();
      expect(screen.getByDisplayValue(new Date().getFullYear())).toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("switches between tabs correctly", async () => {
      render(<SeasonalAnime />);

      // Click on Browse Seasons tab
      fireEvent.click(screen.getByText(/Browse Seasons/));
      
      const browseButton = screen.getByText(/Browse Seasons/).closest('button');
      expect(browseButton).toHaveAttribute('data-variant', 'warning');

      // Click on Upcoming tab
      fireEvent.click(screen.getByText(/Upcoming/));
      
      const upcomingButton = screen.getByText(/Upcoming/).closest('button');
      expect(upcomingButton).toHaveAttribute('data-variant', 'secondary');
    });

    it("loads seasonal anime when current season tab is active", async () => {
      render(<SeasonalAnime />);

      await waitFor(() => {
        expect(mockGetSeasonalAnime).toHaveBeenCalledWith(
          expect.any(String), // current season
          expect.any(Number)   // current year
        );
      });
    });

    it("loads upcoming anime when upcoming tab is clicked", async () => {
      render(<SeasonalAnime />);

      fireEvent.click(screen.getByText(/Upcoming/));

      await waitFor(() => {
        expect(mockGetUpcomingAnime).toHaveBeenCalled();
      });
    });
  });

  describe("Data Loading and Display", () => {
    it("shows loading skeleton while fetching data", async () => {
      // Make the promise never resolve to test loading state
      mockGetSeasonalAnime.mockImplementation(() => new Promise(() => {}));
      
      render(<SeasonalAnime />);

      expect(screen.getByTestId("anime-grid-skeleton")).toBeInTheDocument();
    });

    it("displays anime cards when data is loaded", async () => {
      render(<SeasonalAnime />);

      await waitFor(() => {
        expect(screen.getByText("Winter Anime 1")).toBeInTheDocument();
        expect(screen.getByText("Winter Anime 2")).toBeInTheDocument();
      });

      // Should render BaseAnimeCard components
      expect(screen.getAllByTestId("base-anime-card")).toHaveLength(2);
    });

    it("displays upcoming anime when upcoming tab is selected", async () => {
      render(<SeasonalAnime />);

      fireEvent.click(screen.getByText(/Upcoming/));

      await waitFor(() => {
        expect(screen.getByText("Upcoming Anime 1")).toBeInTheDocument();
      });

      expect(screen.getAllByTestId("base-anime-card")).toHaveLength(1);
    });

    it("shows empty state when no anime data is available", async () => {
      mockGetSeasonalAnime.mockResolvedValue([]);
      
      render(<SeasonalAnime />);

      await waitFor(() => {
        expect(screen.getByText("No Current Season Data")).toBeInTheDocument();
        expect(screen.getByText("Unable to load current season anime at this time.")).toBeInTheDocument();
      });
    });

    it("displays error message when API call fails", async () => {
      mockGetSeasonalAnime.mockRejectedValue(new Error("API Error"));
      
      render(<SeasonalAnime />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
      });
    });
  });

  describe("Season and Year Selection", () => {
    it("updates data when year is changed", async () => {
      // Get current season like the component does
      const getCurrentSeason = () => {
        const month = new Date().getMonth() + 1
        if (month >= 1 && month <= 3) return 'winter'
        if (month >= 4 && month <= 6) return 'spring'
        if (month >= 7 && month <= 9) return 'summer'
        return 'fall'
      }
      const currentSeason = getCurrentSeason();

      render(<SeasonalAnime />);

      // Switch to Browse Seasons tab
      fireEvent.click(screen.getByText(/Browse Seasons/));

      // Clear previous calls
      mockGetSeasonalAnime.mockClear();

      // Change year
      const yearSelect = screen.getByDisplayValue(new Date().getFullYear());
      fireEvent.change(yearSelect, { target: { value: '2023' } });

      await waitFor(() => {
        expect(mockGetSeasonalAnime).toHaveBeenCalledWith(currentSeason, 2023);
      });
    });

    it("updates data when season is changed", async () => {
      // Get current season to pick a different one for the test
      const getCurrentSeason = () => {
        const month = new Date().getMonth() + 1
        if (month >= 1 && month <= 3) return 'winter'
        if (month >= 4 && month <= 6) return 'spring'
        if (month >= 7 && month <= 9) return 'summer'
        return 'fall'
      }
      const currentSeason = getCurrentSeason();
      const testSeason = currentSeason === 'spring' ? 'winter' : 'spring';

      render(<SeasonalAnime />);

      // Switch to Browse Seasons tab
      fireEvent.click(screen.getByText(/Browse Seasons/));

      // Clear previous calls
      mockGetSeasonalAnime.mockClear();

      // Find the season select element and change to a different season
      const seasonSelects = screen.getAllByRole('combobox');
      const seasonSelect = seasonSelects.find(select => 
        select.innerHTML.includes('Winter') || select.innerHTML.includes('Spring') || 
        select.innerHTML.includes('Summer') || select.innerHTML.includes('Fall')
      );
      
      fireEvent.change(seasonSelect!, { target: { value: testSeason } });

      await waitFor(() => {
        expect(mockGetSeasonalAnime).toHaveBeenCalledWith(testSeason, expect.any(Number));
      });
    });
  });

  describe("Grid Layout", () => {
    it("renders anime cards in responsive grid layout", async () => {
      render(<SeasonalAnime />);

      await waitFor(() => {
        const grid = screen.getByText("Winter Anime 1").closest('.grid');
        expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-6');
      });
    });

    it("passes correct props to BaseAnimeCard components", async () => {
      render(<SeasonalAnime />);

      await waitFor(() => {
        const animeCards = screen.getAllByTestId("base-anime-card");
        animeCards.forEach((card) => {
          expect(card).toHaveAttribute('data-anime-id');
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("has accessible tab navigation", () => {
      render(<SeasonalAnime />);

      const tabButtons = screen.getAllByTestId("button");
      const tabNavigationButtons = tabButtons.filter(button => 
        button.textContent?.includes('Current Season') ||
        button.textContent?.includes('Browse Seasons') ||
        button.textContent?.includes('Upcoming')
      );
      
      expect(tabNavigationButtons).toHaveLength(3);
    });

    it("provides meaningful labels for form controls", async () => {
      render(<SeasonalAnime />);

      // Switch to Browse Seasons tab to see form controls
      fireEvent.click(screen.getByText(/Browse Seasons/));

      expect(screen.getByText("Year")).toBeInTheDocument();
      expect(screen.getByText("Season")).toBeInTheDocument();
    });
  });
});