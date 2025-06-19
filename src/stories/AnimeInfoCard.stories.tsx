import type { Meta, StoryObj } from '@storybook/react';
import { AnimeInfoCard } from '../components/ui/AnimeInfoCard';
import { AnimeBase } from '../types/anime';
import '../components/ui/AnimeInfoCard/AnimeInfoCard.css';

const meta: Meta<typeof AnimeInfoCard> = {
  title: 'UI/AnimeInfoCard',
  component: AnimeInfoCard,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a1a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900" style={{ width: '30rem', height: '21rem' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    anime: {
      description: 'Anime data object with metadata',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample anime data for stories
const attackOnTitan: AnimeBase = {
  id: 16498,
  title: 'Attack on Titan',
  synopsis: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction. When the Titans breach Wall Maria, Eren Yeager vows to exterminate every last Titan to avenge his mother and reclaim humanity\'s territory. With his childhood friends Mikasa and Armin, Eren joins the Survey Corps, an elite group of soldiers who fight Titans outside the walls.',
  score: 9.0,
  userScore: 10,
  episodes: 25,
  year: 2013,
  season: 'SPRING',
  status: 'FINISHED',
  format: 'TV',
  genres: ['Action', 'Drama', 'Fantasy', 'Military', 'Shounen', 'Super Power'],
  duration: '24',
  studios: ['Madhouse', 'Studio Pierrot'],
  popularity: 1,
  source: 'anilist',
};

const demonSlayer: AnimeBase = {
  id: 101922,
  title: 'Demon Slayer: Kimetsu no Yaiba',
  synopsis: 'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself. Though devastated by this grim reality, Tanjiro resolves to become a demon slayer so that he can turn his sister back into a human and kill the demon that massacred his family.',
  score: 8.7,
  userScore: 9,
  episodes: 26,
  year: 2019,
  season: 'SPRING',
  status: 'FINISHED',
  format: 'TV',
  genres: ['Action', 'Supernatural', 'Historical', 'Shounen'],
  duration: '24',
  studios: ['Ufotable'],
  popularity: 2,
  source: 'anilist',
};

const spiritedAway: AnimeBase = {
  id: 199,
  title: 'Spirited Away',
  synopsis: 'Stubborn, spoiled, and naïve, 10-year-old Chihiro Ogino is less than pleased when she and her parents are moving to a new home. While driving to their new house, Chihiro\'s father makes a wrong turn and drives down a lonely one-lane road which dead-ends in front of a tunnel. Her parents decide to stop the car and explore the area. They go through the tunnel and find an abandoned amusement park on the other side, with its own little town.',
  score: 9.3,
  userScore: 10,
  episodes: 1,
  year: 2001,
  season: 'SUMMER',
  status: 'FINISHED',
  format: 'MOVIE',
  genres: ['Adventure', 'Family', 'Supernatural', 'Drama'],
  duration: '125',
  studios: ['Studio Ghibli'],
  popularity: 15,
  source: 'mal',
};

const onePiece: AnimeBase = {
  id: 21,
  title: 'One Piece',
  synopsis: 'Gol D. Roger was known as the Pirate King, the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought a change throughout the world. His last words before his death revealed the location of the greatest treasure in the world, One Piece. It was this revelation that brought about the Grand Age of Pirates, men who dreamed of finding One Piece (which promises an unlimited amount of riches and fame), and quite possibly the most coveted of titles for the person who found it, the title of the Pirate King.',
  score: 9.0,
  episodes: 1000,
  year: 1999,
  season: 'FALL',
  status: 'RELEASING',
  format: 'TV',
  genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Shounen'],
  duration: '24',
  studios: ['Toei Animation'],
  popularity: 3,
  source: 'mal',
};

const minimalAnime: AnimeBase = {
  id: 1,
  title: 'Minimal Anime Data',
  source: 'mal',
};

const longSynopsisAnime: AnimeBase = {
  id: 2,
  title: 'Long Synopsis Anime',
  synopsis: 'This is an extremely long synopsis that will definitely trigger the scrolling animation feature. '.repeat(15) + 'It contains enough text to demonstrate the auto-scrolling functionality that activates when the synopsis exceeds 150 characters. The scrolling animation provides a smooth way to display lengthy plot descriptions without taking up too much vertical space in the expanded card view.',
  score: 8.5,
  episodes: 12,
  year: 2023,
  status: 'FINISHED',
  format: 'TV',
  genres: ['Drama', 'Slice of Life'],
  source: 'anilist',
};

export const Default: Story = {
  args: {
    anime: attackOnTitan,
  },
};

export const ActionAnime: Story = {
  args: {
    anime: attackOnTitan,
  },
  parameters: {
    docs: {
      description: {
        story: 'Popular action anime with comprehensive metadata including user score, genres, and studio information.',
      },
    },
  },
};

export const SupernaturalAnime: Story = {
  args: {
    anime: demonSlayer,
  },
  parameters: {
    docs: {
      description: {
        story: 'Supernatural anime showcasing different genre badges and metadata display.',
      },
    },
  },
};

export const MovieFormat: Story = {
  args: {
    anime: spiritedAway,
  },
  parameters: {
    docs: {
      description: {
        story: 'Movie format anime with different badge styling and longer duration display.',
      },
    },
  },
};

export const OngoingSeries: Story = {
  args: {
    anime: onePiece,
  },
  parameters: {
    docs: {
      description: {
        story: 'Long-running ongoing series with RELEASING status and high episode count.',
      },
    },
  },
};

export const MinimalData: Story = {
  args: {
    anime: minimalAnime,
  },
  parameters: {
    docs: {
      description: {
        story: 'Anime with minimal data to test graceful handling of missing information.',
      },
    },
  },
};

export const LongSynopsis: Story = {
  args: {
    anime: longSynopsisAnime,
  },
  parameters: {
    docs: {
      description: {
        story: 'Anime with very long synopsis to demonstrate auto-scrolling animation feature.',
      },
    },
  },
};

export const WithCustomClassName: Story = {
  args: {
    anime: attackOnTitan,
    className: 'border border-gray-600 rounded-lg p-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'AnimeInfoCard with custom styling applied via className prop.',
      },
    },
  },
};

export const NoUserScore: Story = {
  args: {
    anime: {
      ...attackOnTitan,
      userScore: undefined,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Anime info card without user score to show conditional rendering.',
      },
    },
  },
};

export const NoGenres: Story = {
  args: {
    anime: {
      ...attackOnTitan,
      genres: undefined,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Anime info card without genres to test layout adaptation.',
      },
    },
  },
};

export const NoSynopsis: Story = {
  args: {
    anime: {
      ...attackOnTitan,
      synopsis: undefined,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Anime info card without synopsis to show condensed layout.',
      },
    },
  },
};


// Interactive stories for testing different states
export const InteractivePlayground: Story = {
  args: {
    anime: attackOnTitan,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different anime data combinations.',
      },
    },
  },
};

export const DarkBackground: Story = {
  args: {
    anime: attackOnTitan,
  },
  decorators: [
    (Story) => (
      <div 
        className="p-4 rounded-lg" 
        style={{ 
          width: '30rem', 
          height: '21rem',
          background: 'linear-gradient(to right, rgba(0,0,0,0.95), rgba(0,0,0,0.8), rgba(0,0,0,0.6))'
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'AnimeInfoCard displayed on a dark gradient background matching the expanded card overlay in ExpandableGrid.',
      },
    },
  },
};