import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { SearchBar } from '../components/SearchBar';

// Mock the anime store
const mockAnimeStore = {
  searchAnime: action('searchAnime'),
  clearSearch: action('clearSearch'),
  loading: { search: false },
  searchResults: [],
};

// Mock the store hook
const mockUseAnimeStore = () => mockAnimeStore;

// Replace the actual hook with our mock
vi.mock('../store/animeStore', () => ({
  useAnimeStore: mockUseAnimeStore,
}));

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The SearchBar component provides anime search functionality with real-time input handling and loading states.

## Features
- **Real-time Search**: Automatically clears search when input is empty
- **Form Submission**: Supports Enter key to search
- **Loading States**: Shows loading indicator during search
- **Clear Functionality**: Quick clear button to reset search
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Accessible**: Full keyboard navigation support

## Usage
\`\`\`tsx
<SearchBar />
\`\`\`

Note: This component is connected to the anime store and will trigger actual search actions.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

// Basic Stories
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default SearchBar with normal state. Try typing to see the search functionality.',
      },
    },
  },
};

export const Loading: Story = {
  beforeEach: () => {
    mockAnimeStore.loading.search = true;
  },
  parameters: {
    docs: {
      description: {
        story: 'SearchBar in loading state. The input is disabled and shows a loading spinner.',
      },
    },
  },
};

export const WithMockResults: Story = {
  beforeEach: () => {
    mockAnimeStore.loading.search = false;
    mockAnimeStore.searchResults = [
      { id: 1, title: 'Attack on Titan', score: 8.9 },
      { id: 2, title: 'Death Note', score: 8.7 },
      { id: 3, title: 'Demon Slayer', score: 8.6 },
    ];
  },
  parameters: {
    docs: {
      description: {
        story: 'SearchBar with mock search results in the store.',
      },
    },
  },
};

// Interactive Examples
export const InteractiveDemo: Story = {
  render: () => {
    return (
      <div className="space-y-6 max-w-md">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Search Anime</h3>
          <SearchBar />
        </div>
        
        <div className="text-sm text-gray-300 space-y-2">
          <p><strong>Try these interactions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Type to search anime titles</li>
            <li>Press Enter to submit search</li>
            <li>Clear input to reset search</li>
            <li>Click the X button to clear</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing the SearchBar with usage instructions.',
      },
    },
  },
};

// Different States
export const EmptyState: Story = {
  beforeEach: () => {
    mockAnimeStore.loading.search = false;
    mockAnimeStore.searchResults = [];
  },
  parameters: {
    docs: {
      description: {
        story: 'SearchBar in empty state with no search results.',
      },
    },
  },
};

export const ErrorState: Story = {
  beforeEach: () => {
    mockAnimeStore.loading.search = false;
    mockAnimeStore.searchAnime = action('searchAnime-error');
  },
  parameters: {
    docs: {
      description: {
        story: 'SearchBar handling error state (simulated through mock actions).',
      },
    },
  },
};

// Responsive Design
export const MobileView: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-900 p-4" style={{ maxWidth: '375px' }}>
        <div className="flex flex-col space-y-4">
          <h2 className="text-white text-lg font-semibold">Mobile Search</h2>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'SearchBar in mobile viewport to test responsive behavior.',
      },
    },
  },
};

export const TabletView: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-900 p-8" style={{ maxWidth: '768px' }}>
        <div className="flex flex-col space-y-6">
          <h2 className="text-white text-xl font-semibold">Tablet Search</h2>
          <div className="flex justify-center">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'SearchBar in tablet viewport.',
      },
    },
  },
};

// Usage Examples
export const InHeader: Story = {
  render: () => (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">AnimeTracker</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <SearchBar />
          <button className="text-gray-300 hover:text-white">
            Profile
          </button>
        </div>
      </div>
    </header>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'SearchBar integrated into a header navigation layout.',
      },
    },
  },
};

export const InSidebar: Story = {
  render: () => (
    <div className="flex min-h-screen bg-gray-900">
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Anime
            </label>
            <SearchBar />
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="block text-gray-300 hover:text-white">Dashboard</a>
            <a href="#" className="block text-gray-300 hover:text-white">My List</a>
            <a href="#" className="block text-gray-300 hover:text-white">Trending</a>
          </nav>
        </div>
      </aside>
      
      <main className="flex-1 p-8">
        <div className="text-white">
          <h1 className="text-2xl font-bold mb-4">Main Content</h1>
          <p className="text-gray-300">Search functionality integrated in sidebar.</p>
        </div>
      </main>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'SearchBar integrated into a sidebar layout.',
      },
    },
  },
};

// Accessibility Demo
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Accessible Search</h3>
        <SearchBar />
      </div>
      
      <div className="text-sm text-gray-300 space-y-2">
        <p><strong>Accessibility Features:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper form semantics with submit handling</li>
          <li>Keyboard navigation support</li>
          <li>Screen reader friendly placeholder text</li>
          <li>Focus management and visual indicators</li>
          <li>ARIA attributes for loading states</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features of the SearchBar component.',
      },
    },
  },
};

// Testing Different Input Scenarios
export const LongQuery: Story = {
  render: () => {
    const [longQuery] = useState('This is a very long search query that tests how the input handles extensive text content and potential overflow issues');
    
    return (
      <div className="space-y-4 max-w-md">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Long Query Test</h3>
          <SearchBar />
        </div>
        <div className="text-sm text-gray-300">
          <p><strong>Test query:</strong> {longQuery}</p>
          <p>Tests input handling with long text content.</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests SearchBar with very long query text to verify proper handling.',
      },
    },
  },
};

export const SpecialCharacters: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Special Characters Test</h3>
        <SearchBar />
      </div>
      <div className="text-sm text-gray-300">
        <p><strong>Try searching:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Japanese: アニメ</li>
          <li>Symbols: @#$%</li>
          <li>Numbers: 2023</li>
          <li>Mixed: Anime! 123</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tests SearchBar with special characters and international text.',
      },
    },
  },
};