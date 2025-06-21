import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { vi } from 'vitest';
import { ThemeToggle } from '../components/ThemeToggle';

// Mock theme context
const mockThemeContext = {
  isDark: false,
  toggleTheme: fn(),
};

const mockUseTheme = () => mockThemeContext;

// Replace the actual hook with our mock
vi.mock('../context/ThemeContext', () => ({
  useTheme: mockUseTheme,
}));

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The ThemeToggle component provides a visual toggle for switching between light and dark themes.

## Features
- **Animated Icons**: Smooth transitions between sun and moon icons
- **Visual Feedback**: Clear indication of current theme state
- **Accessibility**: Proper ARIA labels and keyboard support
- **Responsive Design**: Works well at different sizes
- **Theme Integration**: Connected to the app's theme context

## Usage
\`\`\`tsx
<ThemeToggle />
\`\`\`

Note: This component requires the ThemeContext to be available in the component tree.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 flex items-center justify-center min-h-[200px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

// Basic Stories
export const LightTheme: Story = {
  beforeEach: () => {
    mockThemeContext.isDark = false;
  },
  parameters: {
    docs: {
      description: {
        story: 'ThemeToggle in light theme mode showing the sun icon.',
      },
    },
  },
};

export const DarkTheme: Story = {
  beforeEach: () => {
    mockThemeContext.isDark = true;
  },
  decorators: [
    (Story) => (
      <div className="p-8 flex items-center justify-center min-h-[200px] bg-gray-900">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'ThemeToggle in dark theme mode showing the moon icon.',
      },
    },
  },
};

// Interactive Demo
export const InteractiveDemo: Story = {
  render: () => {
    const [isDark, setIsDark] = useState(false);
    
    // Override the mock for this story
    mockThemeContext.isDark = isDark;
    (mockThemeContext as any).toggleTheme = () => {
      setIsDark(!isDark);
      fn()();
    };

    return (
      <div className={`p-8 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center space-y-6">
          <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Current Theme: {isDark ? 'Dark' : 'Light'}
          </div>
          
          <ThemeToggle />
          
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Click the toggle to switch themes and see the animation
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo that actually toggles between themes with visual feedback.',
      },
    },
  },
};

// Usage in Different Contexts
export const InNavbar: Story = {
  beforeEach: () => {
    mockThemeContext.isDark = false;
  },
  render: () => (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">AnimeTracker</h1>
          <nav className="hidden md:flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Browse</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">My List</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="text-gray-600 hover:text-gray-900">
            Profile
          </button>
        </div>
      </div>
    </nav>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'ThemeToggle integrated into a navigation bar.',
      },
    },
  },
};

export const InSidebar: Story = {
  beforeEach: () => {
    mockThemeContext.isDark = true;
  },
  render: () => (
    <div className="flex min-h-screen bg-gray-900">
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Notifications</span>
              <button className="w-6 h-6 bg-gray-600 rounded border border-gray-500"></button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Auto-play</span>
              <button className="w-6 h-6 bg-gray-600 rounded border border-gray-500"></button>
            </div>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 p-8">
        <div className="text-white">
          <h1 className="text-2xl font-bold mb-4">Main Content</h1>
          <p className="text-gray-300">Theme toggle in sidebar settings.</p>
        </div>
      </main>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'ThemeToggle as part of a settings sidebar.',
      },
    },
  },
};

export const InSettingsCard: Story = {
  beforeEach: () => {
    mockThemeContext.isDark = false;
  },
  render: () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Dark Mode</h4>
            <p className="text-sm text-gray-500">Switch between light and dark themes</p>
          </div>
          <ThemeToggle />
        </div>
        
        <hr className="border-gray-200" />
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Language</h4>
            <p className="text-sm text-gray-500">Choose your preferred language</p>
          </div>
          <select className="text-sm border border-gray-300 rounded px-2 py-1">
            <option>English</option>
            <option>Japanese</option>
          </select>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ThemeToggle within a settings card with descriptive labels.',
      },
    },
  },
};

// Size Variations
export const LargeSize: Story = {
  beforeEach: () => {
    mockThemeContext.isDark = false;
  },
  render: () => (
    <div className="p-8">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold">Large Theme Toggle</h3>
        <div className="transform scale-150">
          <ThemeToggle />
        </div>
        <p className="text-sm text-gray-600">Scaled up for better visibility</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ThemeToggle scaled up to show how it appears at larger sizes.',
      },
    },
  },
};

export const SmallSize: Story = {
  beforeEach: () => {
    mockThemeContext.isDark = false;
  },
  render: () => (
    <div className="p-8">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold">Small Theme Toggle</h3>
        <div className="transform scale-75">
          <ThemeToggle />
        </div>
        <p className="text-sm text-gray-600">Scaled down for compact layouts</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ThemeToggle scaled down for compact layouts.',
      },
    },
  },
};

// Animation States
export const AnimationShowcase: Story = {
  render: () => {
    const [currentTheme, setCurrentTheme] = useState(0);
    const themes = ['light', 'dark'];
    
    // Cycle through themes automatically
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTheme(prev => (prev + 1) % themes.length);
      }, 2000);
      
      return () => clearInterval(interval);
    }, []);

    mockThemeContext.isDark = currentTheme === 1;

    return (
      <div className={`p-8 transition-all duration-500 ${currentTheme === 1 ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center space-y-6">
          <div className={`text-lg font-semibold ${currentTheme === 1 ? 'text-white' : 'text-gray-900'}`}>
            Auto-cycling Animation Demo
          </div>
          
          <ThemeToggle />
          
          <div className={`text-sm ${currentTheme === 1 ? 'text-gray-300' : 'text-gray-600'}`}>
            <p>Current: {themes[currentTheme]} theme</p>
            <p>Watch the smooth transition between sun and moon icons</p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Automatically cycles between themes to showcase the animation transitions.',
      },
    },
  },
};

// Accessibility Demo
export const AccessibilityDemo: Story = {
  beforeEach: () => {
    mockThemeContext.isDark = false;
  },
  render: () => (
    <div className="p-8 space-y-6 max-w-md">
      <div>
        <h3 className="text-lg font-semibold mb-4">Accessibility Features</h3>
        <ThemeToggle />
      </div>
      
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Accessibility Features:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper ARIA label: "Toggle theme"</li>
          <li>Keyboard accessible (Tab to focus, Enter/Space to toggle)</li>
          <li>Focus ring indicator for keyboard navigation</li>
          <li>High contrast icons for visibility</li>
          <li>Smooth animations respect prefers-reduced-motion</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the accessibility features of the ThemeToggle component.',
      },
    },
  },
};

// Error Handling
export const WithoutThemeContext: Story = {
  render: () => {
    // Simulate missing theme context
    const BrokenThemeToggle = () => {
      try {
        return <ThemeToggle />;
      } catch (error) {
        return (
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
            <p className="text-red-800 text-sm">
              Error: ThemeContext not found. Make sure ThemeProvider wraps this component.
            </p>
          </div>
        );
      }
    };

    return <BrokenThemeToggle />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error handling when ThemeContext is not available.',
      },
    },
  },
};