import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BaseAnimeCard } from '../BaseAnimeCard';
import { AnimeBase } from '../../../../types/anime';

// Mock useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockAnime: AnimeBase = {
  id: 1,
  title: 'Test Anime',
  coverImage: 'https://example.com/test.jpg',
  score: 8.5,
  format: 'TV',
  year: 2023,
  status: 'ONGOING',
  episodes: 12,
  genres: ['Action', 'Drama'],
  description: 'Test description',
  season: 'SPRING',
  userStatus: 'WATCHING',
  source: 'mal'
};

// Helper function to render components with Router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('BaseAnimeCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders with correct normal dimensions', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    expect(card.style.width).toBe('13rem');
    expect(card.style.height).toBe('21rem');
  });

  describe('Title and Metadata Display', () => {
    it('displays anime title in gradient overlay', () => {
      const { getByText } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const title = getByText('Test Anime');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H6');
      expect(title).toHaveClass('text-white', 'text-sm', 'font-semibold', 'mb-1', 'line-clamp-2');
    });

    it('displays year with calendar emoji when year is provided', () => {
      const { getByText } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const year = getByText('📅 2023');
      expect(year).toBeInTheDocument();
      expect(year.parentElement).toHaveClass('flex', 'items-center', 'gap-2', 'text-xs', 'text-white/90');
    });

    it('displays episodes with TV emoji when episodes is provided', () => {
      const { getByText } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const episodes = getByText('📺 12 eps');
      expect(episodes).toBeInTheDocument();
      expect(episodes.parentElement).toHaveClass('flex', 'items-center', 'gap-2', 'text-xs', 'text-white/90');
    });

    it('does not display year when year is null', () => {
      const animeWithoutYear = { ...mockAnime, year: null };
      const { queryByText } = renderWithRouter(<BaseAnimeCard anime={animeWithoutYear} />);
      expect(queryByText(/📅/)).not.toBeInTheDocument();
    });

    it('does not display episodes when episodes is null', () => {
      const animeWithoutEpisodes = { ...mockAnime, episodes: null };
      const { queryByText } = renderWithRouter(<BaseAnimeCard anime={animeWithoutEpisodes} />);
      expect(queryByText(/📺/)).not.toBeInTheDocument();
    });

    it('displays both year and episodes when both are provided', () => {
      const { getByText } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      expect(getByText('📅 2023')).toBeInTheDocument();
      expect(getByText('📺 12 eps')).toBeInTheDocument();
    });

    it('renders gradient overlay with correct classes', () => {
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const gradientOverlay = container.querySelector('.bg-gradient-to-t');
      expect(gradientOverlay).toBeInTheDocument();
      expect(gradientOverlay).toHaveClass(
        'absolute', 'inset-0', 'bg-gradient-to-t', 
        'from-black/70', 'via-transparent', 'to-transparent', 'rounded-xl'
      );
    });

    it('positions bottom info correctly', () => {
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const bottomInfo = container.querySelector('.absolute.bottom-0.left-0.right-0.p-3');
      expect(bottomInfo).toBeInTheDocument();
      expect(bottomInfo).toHaveClass('absolute', 'bottom-0', 'left-0', 'right-0', 'p-3');
    });
  });

  describe('Image Display', () => {
    it('displays image when coverImage is provided', () => {
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/test.jpg');
      expect(image).toHaveAttribute('alt', 'Test Anime');
      expect(image).toHaveClass('w-full', 'h-full', 'object-cover', 'rounded-xl');
      expect(image).toHaveStyle('object-position: top center');
    });

    it('displays fallback when coverImage is null', () => {
      const animeWithoutImage = { ...mockAnime, coverImage: null };
      const { getByText, container } = renderWithRouter(<BaseAnimeCard anime={animeWithoutImage} />);
      const fallback = getByText('No Image');
      expect(fallback).toBeInTheDocument();
      expect(fallback.parentElement).toHaveClass(
        'w-full', 'h-full', 'bg-gray-200', 'dark:bg-gray-700', 
        'flex', 'items-center', 'justify-center', 'rounded-xl'
      );
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('displays fallback when image fails to load', () => {
      const { container, getByText } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const image = container.querySelector('img');
      
      // Simulate image load error
      fireEvent.error(image!);
      
      const fallback = getByText('No Image');
      expect(fallback).toBeInTheDocument();
    });

    it('resets image error state when anime changes', () => {
      const { container, rerender } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const image = container.querySelector('img');
      
      // Simulate image load error
      fireEvent.error(image!);
      
      // Change anime (should reset error state)
      const newAnime = { ...mockAnime, id: 2, coverImage: 'https://example.com/new.jpg' };
      rerender(
        <MemoryRouter>
          <BaseAnimeCard anime={newAnime} />
        </MemoryRouter>
      );
      
      const newImage = container.querySelector('img');
      expect(newImage).toBeInTheDocument();
      expect(newImage).toHaveAttribute('src', 'https://example.com/new.jpg');
    });
  });

  it('starts with radio checked when expanded prop is true', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} expanded />);
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    const card = container.firstChild as HTMLElement;
    expect(radio.checked).toBe(true);
    expect(card.style.height).toBe('21rem');
  });

  it('renders with rounded corners and overflow hidden', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('rounded-xl', 'overflow-hidden');
  });

  it('renders with background and border styles', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('bg-gray-200', 'border', 'border-gray-300');
  });

  it('has base-anime-card class for CSS transitions', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('base-anime-card');
  });

  it('applies custom className', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders children content', () => {
    const { getByText } = renderWithRouter(
      <BaseAnimeCard anime={mockAnime}>
        <div>Custom content</div>
      </BaseAnimeCard>
    );
    expect(getByText('Custom content')).toBeInTheDocument();
  });

  it('defaults to non-expanded state', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    expect(card.style.width).toBe('13rem');
    expect(card.style.getPropertyValue('--expanded-width')).toBe('30rem');
  });

  it('applies interactive styles', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('cursor-pointer');
    expect(container.firstChild).toHaveAttribute('role', 'button');
    expect(container.firstChild).toHaveAttribute('tabIndex', '0');
  });

  it('toggles radio button state when clicked', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    
    // Initially not expanded
    expect(card.style.width).toBe('13rem');
    expect(radio.checked).toBe(false);
    
    // Click to expand
    fireEvent.click(card);
    expect(radio.checked).toBe(true);
    
    // Click again to collapse
    fireEvent.click(card);
    expect(radio.checked).toBe(false);
  });

  it('calls onClick callback when provided', () => {
    const onClickMock = vi.fn();
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} onClick={onClickMock} />);
    const card = container.firstChild as HTMLElement;
    
    fireEvent.click(card);
    expect(onClickMock).toHaveBeenCalledTimes(1);
    
    fireEvent.click(card);
    expect(onClickMock).toHaveBeenCalledTimes(2);
  });

  it('toggles on Enter key press', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    
    expect(radio.checked).toBe(false);
    
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(radio.checked).toBe(true);
    
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(radio.checked).toBe(false);
  });

  it('toggles on Space key press', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    
    expect(radio.checked).toBe(false);
    
    fireEvent.keyDown(card, { key: ' ' });
    expect(radio.checked).toBe(true);
    
    fireEvent.keyDown(card, { key: ' ' });
    expect(radio.checked).toBe(false);
  });

  it('does not toggle on other key presses', () => {
    const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    
    expect(radio.checked).toBe(false);
    
    fireEvent.keyDown(card, { key: 'a' });
    expect(radio.checked).toBe(false);
    
    fireEvent.keyDown(card, { key: 'Escape' });
    expect(radio.checked).toBe(false);
  });


  describe('Group behavior with radio buttons', () => {
    it('only one card can be expanded at a time in radio group', () => {
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard anime={mockAnime} groupName="test-group" cardIndex={0} />
          <BaseAnimeCard anime={{...mockAnime, id: 2}} groupName="test-group" cardIndex={1} />
          <BaseAnimeCard anime={{...mockAnime, id: 3}} groupName="test-group" cardIndex={2} />
        </div>
      );

      const cards = container.querySelectorAll('div[role="button"]');
      const radios = container.querySelectorAll('input[type="radio"]');
      const card1 = cards[0] as HTMLElement;
      const card2 = cards[1] as HTMLElement;
      const card3 = cards[2] as HTMLElement;
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;
      const radio3 = radios[2] as HTMLInputElement;

      // Initially all cards are collapsed
      expect(card1.style.width).toBe('13rem');
      expect(card2.style.width).toBe('13rem');
      expect(card3.style.width).toBe('13rem');
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(false);
      expect(radio3.checked).toBe(false);

      // Click card1 to expand it
      fireEvent.click(card1);
      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);
      expect(radio3.checked).toBe(false);

      // Click card2 - card1 should collapse, card2 should expand
      fireEvent.click(card2);
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(true);
      expect(radio3.checked).toBe(false);

      // Click card3 - card2 should collapse, card3 should expand
      fireEvent.click(card3);
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(false);
      expect(radio3.checked).toBe(true);

      // Click card3 again - it should collapse
      fireEvent.click(card3);
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(false);
      expect(radio3.checked).toBe(false);
    });

    it('uses default group name when none provided', () => {
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard anime={mockAnime} />
          <BaseAnimeCard anime={{...mockAnime, id: 2}} />
        </div>
      );

      const radios = container.querySelectorAll('input[type="radio"]');
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;

      // Both should use default group name
      expect(radio1.name).toBe('base-anime-cards');
      expect(radio2.name).toBe('base-anime-cards');

      // Only one can be expanded at a time due to radio group
      fireEvent.click(radio1.closest('div[role="button"]')!);
      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);

      fireEvent.click(radio2.closest('div[role="button"]')!);
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(true);
    });

    it('allows different groups to work independently', () => {
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard anime={mockAnime} groupName="group1" cardIndex={0} />
          <BaseAnimeCard anime={{...mockAnime, id: 2}} groupName="group2" cardIndex={0} />
        </div>
      );

      const radios = container.querySelectorAll('input[type="radio"]');
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;

      // Different groups can both be expanded
      expect(radio1.name).toBe('group1');
      expect(radio2.name).toBe('group2');

      fireEvent.click(radio1.closest('div[role="button"]')!);
      fireEvent.click(radio2.closest('div[role="button"]')!);

      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(true);
    });

    it('creates radio buttons with correct attributes', () => {
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard anime={mockAnime} groupName="my-group" cardIndex={5} />
          <BaseAnimeCard anime={{...mockAnime, id: 2}} groupName="my-group" cardIndex={10} />
        </div>
      );

      const radios = container.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(2);
      
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;
      
      expect(radio1.name).toBe('my-group');
      expect(radio2.name).toBe('my-group');
      expect(radio1.getAttribute('data-index')).toBe('5');
      expect(radio2.getAttribute('data-index')).toBe('10');
    });
  });

  describe('Non-expandable state', () => {
    it('applies non-expandable styling when expandable prop is false', () => {
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} expandable={false} />);
      expect(container.firstChild).toHaveClass('non-expandable');
    });

    it('does not expand when non-expandable and clicked', () => {
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} expandable={false} />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.click(card);
      expect(radio.checked).toBe(false); // Should not change
    });

    it('still calls onClick callback when non-expandable', () => {
      const onClickMock = vi.fn();
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} expandable={false} onClick={onClickMock} />);
      const card = container.firstChild as HTMLElement;
      
      fireEvent.click(card);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('non-expandable cards stay at 13rem width even when radio is checked', () => {
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} expandable={false} expanded />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      // Radio should be checked due to expanded prop
      expect(radio.checked).toBe(true);
      // But card should have non-expandable class preventing expansion
      expect(card).toHaveClass('non-expandable');
    });

    it('works with keyboard interaction when non-expandable', () => {
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} expandable={false} />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(radio.checked).toBe(false); // Should not change
      
      fireEvent.keyDown(card, { key: ' ' });
      expect(radio.checked).toBe(false); // Should not change
    });
  });

  describe('Custom dimensions', () => {
    it('applies custom width and height', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={300} height={450} />
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card.style.width).toBe('300px');
      expect(card.style.height).toBe('450px');
    });

    it('applies custom expanded width', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={250} expandedWidth={600} />
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card.style.getPropertyValue('--expanded-width')).toBe('600px');
      expect(card.style.getPropertyValue('--original-width')).toBe('250px');
    });

    it('supports string dimensions with units', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width="20rem" height="30rem" expandedWidth="40rem" />
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card.style.width).toBe('20rem');
      expect(card.style.height).toBe('30rem');
      expect(card.style.getPropertyValue('--expanded-width')).toBe('40rem');
    });

    it('uses default dimensions when no custom dimensions provided', () => {
      const { container } = renderWithRouter(<BaseAnimeCard anime={mockAnime} />);
      const card = container.firstChild as HTMLElement;
      
      expect(card.style.width).toBe('13rem');
      expect(card.style.height).toBe('21rem');
      expect(card.style.getPropertyValue('--expanded-width')).toBe('30rem');
    });

    it('applies fixed height regardless of width changes', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={300} height={400} expandedWidth={600} />
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card.style.width).toBe('300px');
      expect(card.style.height).toBe('400px'); // Fixed height
      expect(card.style.getPropertyValue('--expanded-width')).toBe('600px');
    });

    it('works with percentage and viewport units', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width="50%" height="50vh" expandedWidth="80%" />
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card.style.width).toBe('50%');
      expect(card.style.height).toBe('50vh');
      expect(card.style.getPropertyValue('--expanded-width')).toBe('80%');
    });
  });

  describe('Horizontal expansion only', () => {
    it('height remains constant during expansion', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={200} height={300} expandedWidth={400} />
      );
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      // Initial state
      expect(card.style.width).toBe('200px');
      expect(card.style.height).toBe('300px');
      
      // Click to expand - height should not change
      fireEvent.click(card);
      expect(radio.checked).toBe(true);
      expect(card.style.height).toBe('300px'); // Height stays the same
      expect(card.style.getPropertyValue('--expanded-width')).toBe('400px');
      
      // Click to collapse - height should still not change
      fireEvent.click(card);
      expect(radio.checked).toBe(false);
      expect(card.style.height).toBe('300px'); // Height stays the same
    });

    it('height remains constant with different width values', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={200} height={250} expandedWidth={400} />
      );
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      // Initial state
      expect(card.style.width).toBe('200px');
      expect(card.style.height).toBe('250px');
      
      // Click to expand - height should not change
      fireEvent.click(card);
      expect(radio.checked).toBe(true);
      expect(card.style.height).toBe('250px'); // Height stays the same
      expect(card.style.getPropertyValue('--expanded-width')).toBe('400px');
    });

    it('non-expandable cards never change dimensions', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={250} height={350} expandedWidth={500} expandable={false} />
      );
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      // Initial state
      expect(card.style.width).toBe('250px');
      expect(card.style.height).toBe('350px');
      
      // Click should not expand
      fireEvent.click(card);
      expect(radio.checked).toBe(false); // Radio doesn't change
      expect(card.style.width).toBe('250px'); // Width stays the same
      expect(card.style.height).toBe('350px'); // Height stays the same
    });
  });

  describe('Auto-cycling functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Clear any global pause states
      Object.keys(window).forEach(key => {
        if (key.includes('-pause')) {
          delete (window as any)[key];
        }
      });
    });

    afterEach(() => {
      vi.useRealTimers();
      // Clear any global pause states
      Object.keys(window).forEach(key => {
        if (key.includes('-pause')) {
          delete (window as any)[key];
        }
      });
    });

    it('does not auto-cycle when autoLoop is false', () => {
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard anime={mockAnime} groupName="test-group" cardIndex={0} autoLoop={false} />
          <BaseAnimeCard anime={{...mockAnime, id: 2}} groupName="test-group" cardIndex={1} autoLoop={false} />
        </div>
      );

      const radios = container.querySelectorAll('input[type="radio"]');
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;

      // Initially no cards are checked
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(false);

      // Fast-forward time - nothing should change
      vi.advanceTimersByTime(5000);
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(false);
    });

    it('auto-cycles through cards when autoLoop is enabled', () => {
      const onAutoLoopMock = vi.fn();
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard 
            anime={mockAnime} 
            groupName="test-group" 
            cardIndex={0} 
            autoLoop={true} 
            loopInterval={2000}
            onAutoLoop={onAutoLoopMock}
          />
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2}} 
            groupName="test-group" 
            cardIndex={1} 
            autoLoop={true} 
            loopInterval={2000}
            onAutoLoop={onAutoLoopMock}
          />
        </div>
      );

      const radios = container.querySelectorAll('input[type="radio"]');
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;

      // Initially no cards are checked
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(false);

      // After 2 seconds, should cycle to first card (index 0)
      vi.advanceTimersByTime(2000);
      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);
      expect(onAutoLoopMock).toHaveBeenCalledWith(0);

      // After another 2 seconds, should cycle to second card (index 1)
      vi.advanceTimersByTime(2000);
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(true);
      expect(onAutoLoopMock).toHaveBeenCalledWith(1);

      // After another 2 seconds, should loop back to first card
      vi.advanceTimersByTime(2000);
      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);
      expect(onAutoLoopMock).toHaveBeenCalledWith(0);
    });

    it('pauses auto-cycling when user clicks a card', () => {
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard 
            anime={mockAnime} 
            groupName="test-group" 
            cardIndex={0} 
            autoLoop={true} 
            loopInterval={2000}
            pauseOnInteraction={true}
            pauseDuration={5000}
          />
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2}} 
            groupName="test-group" 
            cardIndex={1} 
            autoLoop={true} 
            loopInterval={2000}
            pauseOnInteraction={true}
            pauseDuration={5000}
          />
        </div>
      );

      const cards = container.querySelectorAll('div[role="button"]');
      const radios = container.querySelectorAll('input[type="radio"]');
      const card1 = cards[0] as HTMLElement;
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;

      // Initially no cards are checked
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(false);

      // User clicks card1 - should expand and pause auto-cycling
      fireEvent.click(card1);
      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);

      // Fast-forward past normal loop interval - should stay paused
      vi.advanceTimersByTime(3000);
      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);

      // Fast-forward to just before pause duration ends
      vi.advanceTimersByTime(1900); // Total: 4900ms, still within 5000ms pause
      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);

      // Fast-forward past pause duration and one additional loop interval
      vi.advanceTimersByTime(200); // Total: 5100ms, past 5000ms pause - triggers resume
      vi.advanceTimersByTime(2000); // One full loop interval after resume
      
      // Should have moved to next card after resuming
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(true);
    });

    it('does not pause when pauseOnInteraction is false', () => {
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard 
            anime={mockAnime} 
            groupName="test-group" 
            cardIndex={0} 
            autoLoop={true} 
            loopInterval={2000}
            pauseOnInteraction={false}
          />
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2}} 
            groupName="test-group" 
            cardIndex={1} 
            autoLoop={true} 
            loopInterval={2000}
            pauseOnInteraction={false}
          />
        </div>
      );

      const cards = container.querySelectorAll('div[role="button"]');
      const radios = container.querySelectorAll('input[type="radio"]');
      const card1 = cards[0] as HTMLElement;
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;

      // User clicks card1
      fireEvent.click(card1);
      expect(radio1.checked).toBe(true);

      // Auto-cycling should continue even after click
      vi.advanceTimersByTime(2000);
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(true);
    });

    it('does not auto-cycle when expandable is false', () => {
      const { container } = renderWithRouter(
        <div>
          <BaseAnimeCard 
            anime={mockAnime} 
            groupName="test-group" 
            cardIndex={0} 
            autoLoop={true} 
            expandable={false}
            loopInterval={2000}
          />
          <BaseAnimeCard 
            anime={{...mockAnime, id: 2}} 
            groupName="test-group" 
            cardIndex={1} 
            autoLoop={true} 
            expandable={false}
            loopInterval={2000}
          />
        </div>
      );

      const radios = container.querySelectorAll('input[type="radio"]');
      const radio1 = radios[0] as HTMLInputElement;
      const radio2 = radios[1] as HTMLInputElement;

      // Fast-forward time - nothing should change because cards are not expandable
      vi.advanceTimersByTime(5000);
      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(false);
    });
  });

  describe('Dimension validation', () => {
    it('prevents negative width values', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={-100} />
      );
      const card = container.firstChild as HTMLElement;
      
      // Negative width should be converted to 0px
      expect(card.style.width).toBe('0px');
    });

    it('prevents negative height values', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} height={-200} />
      );
      const card = container.firstChild as HTMLElement;
      
      // Negative height should be converted to 0px
      expect(card.style.height).toBe('0px');
    });

    it('prevents negative expandedWidth values', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={200} expandedWidth={-300} />
      );
      const card = container.firstChild as HTMLElement;
      
      // Negative expandedWidth should be converted to at least width + 1
      expect(card.style.getPropertyValue('--expanded-width')).toBe('201px');
    });

    it('ensures expandedWidth is greater than width', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={200} expandedWidth={200} />
      );
      const card = container.firstChild as HTMLElement;
      
      // expandedWidth equal to width should be increased to width + 1
      expect(card.style.getPropertyValue('--expanded-width')).toBe('201px');
    });

    it('ensures expandedWidth is greater than width when expandedWidth is smaller', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={300} expandedWidth={250} />
      );
      const card = container.firstChild as HTMLElement;
      
      // expandedWidth smaller than width should be increased to width + 1
      expect(card.style.getPropertyValue('--expanded-width')).toBe('301px');
    });

    it('allows valid expandedWidth that is greater than width', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={200} expandedWidth={400} />
      );
      const card = container.firstChild as HTMLElement;
      
      // Valid expandedWidth should remain unchanged
      expect(card.style.getPropertyValue('--expanded-width')).toBe('400px');
    });

    it('handles zero values correctly', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={0} height={0} expandedWidth={0} />
      );
      const card = container.firstChild as HTMLElement;
      
      // Zero width and height should be allowed
      expect(card.style.width).toBe('0px');
      expect(card.style.height).toBe('0px');
      // Zero expandedWidth should be increased to width + 1 = 1px
      expect(card.style.getPropertyValue('--expanded-width')).toBe('1px');
    });

    it('does not validate string dimension values', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          width="10rem" 
          height="15rem" 
          expandedWidth="20rem" 
        />
      );
      const card = container.firstChild as HTMLElement;
      
      // String values should pass through unchanged (assuming they're valid CSS values)
      expect(card.style.width).toBe('10rem');
      expect(card.style.height).toBe('15rem');
      expect(card.style.getPropertyValue('--expanded-width')).toBe('20rem');
    });

    it('handles mixed string and number dimensions', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          width={150} 
          height="20rem" 
          expandedWidth="25rem" 
        />
      );
      const card = container.firstChild as HTMLElement;
      
      // Number width should be validated, strings should pass through
      expect(card.style.width).toBe('150px');
      expect(card.style.height).toBe('20rem');
      expect(card.style.getPropertyValue('--expanded-width')).toBe('25rem');
    });

    it('validates expandedWidth only when both width and expandedWidth are numbers', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          width="10rem" 
          expandedWidth={200} 
        />
      );
      const card = container.firstChild as HTMLElement;
      
      // Since width is string, expandedWidth validation should not apply
      expect(card.style.width).toBe('10rem');
      expect(card.style.getPropertyValue('--expanded-width')).toBe('200px');
    });

    it('handles edge case with very small positive values', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={1} expandedWidth={1} />
      );
      const card = container.firstChild as HTMLElement;
      
      // width=1, expandedWidth=1 should become expandedWidth=2
      expect(card.style.width).toBe('1px');
      expect(card.style.getPropertyValue('--expanded-width')).toBe('2px');
    });

    it('preserves original-width CSS variable correctly', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} width={250} expandedWidth={200} />
      );
      const card = container.firstChild as HTMLElement;
      
      // original-width should match the validated width
      expect(card.style.getPropertyValue('--original-width')).toBe('250px');
      // expandedWidth should be corrected to width + 1
      expect(card.style.getPropertyValue('--expanded-width')).toBe('251px');
    });
  });

  describe('Self-Contained AnimeInfoCard Integration', () => {
    const mockStatusChange = vi.fn();
    
    beforeEach(() => {
      mockStatusChange.mockClear();
    });

    it('should automatically render AnimeInfoCard in expanded state when expandedContent is enabled', () => {
      const { container, getByText } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          expandedContent={true}
          expanded={true}
        />
      );
      
      // Should find AnimeInfoCard container with expected class
      const infoCard = container.querySelector('.anime-info-card');
      expect(infoCard).toBeInTheDocument();
      
      // Should find typical AnimeInfoCard elements
      expect(getByText('Action')).toBeInTheDocument();
      expect(getByText('Drama')).toBeInTheDocument();
    });

    it('should not render AnimeInfoCard when expandedContent is false', () => {
      const { queryByText, container } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          expandedContent={false}
          expanded={true}
        />
      );
      
      // Should not find AnimeInfoCard container
      const infoCard = container.querySelector('.anime-info-card');
      expect(infoCard).not.toBeInTheDocument();
    });

    it('should not render AnimeInfoCard when card is not expanded', () => {
      const { queryByText, container } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          expandedContent={true}
          expanded={false}
        />
      );
      
      // Should not find AnimeInfoCard container when collapsed
      const infoCard = container.querySelector('.anime-info-card');
      expect(infoCard).not.toBeInTheDocument();
    });

    it('should automatically pass statusDropdown props to built-in AnimeInfoCard', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          expandedContent={true}
          expanded={true}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockStatusChange,
            isAuthenticated: true
          }}
        />
      );
      
      // Should find StatusBadgeDropdown in AnimeInfoCard area (expanded content)
      const expandedArea = container.querySelector('.card-expanded-overlay');
      expect(expandedArea).toBeInTheDocument();
      
      // The StatusBadgeDropdown should be automatically included
      const statusBadges = container.querySelectorAll('[data-testid*="status"], .status-badge-dropdown-wrapper');
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it('should default expandedContent to true when statusDropdown is enabled', () => {
      const { getByText } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          expanded={true}
          statusDropdown={{
            enabled: true,
            onStatusChange: mockStatusChange,
            isAuthenticated: true
          }}
          // Not explicitly setting expandedContent
        />
      );
      
      // Should automatically show AnimeInfoCard when statusDropdown is enabled
      expect(getByText('Action')).toBeInTheDocument();
      expect(getByText('Drama')).toBeInTheDocument();
    });

    it('should maintain backward compatibility with manually provided children', () => {
      const { getByText, queryByText, container } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          expandedContent={true}
          expanded={true}
        >
          <div>Custom expanded content</div>
        </BaseAnimeCard>
      );
      
      // Should render custom children instead of built-in AnimeInfoCard
      expect(getByText('Custom expanded content')).toBeInTheDocument();
      
      // Should not find built-in AnimeInfoCard content
      const infoCard = container.querySelector('.anime-info-card');
      expect(infoCard).not.toBeInTheDocument();
    });

    it('should prioritize custom children over built-in expandedContent', () => {
      const { getByText, queryByText, container } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          expandedContent={true}
          expanded={true}
        >
          <div>Override content</div>
        </BaseAnimeCard>
      );
      
      // Custom children should take precedence
      expect(getByText('Override content')).toBeInTheDocument();
      
      // Should not find built-in AnimeInfoCard content
      const infoCard = container.querySelector('.anime-info-card');
      expect(infoCard).not.toBeInTheDocument();
    });
  });

  describe('Title Click Navigation', () => {
    beforeEach(() => {
      mockNavigate.mockClear();
    });

    it('should navigate to anime detail page when title is clicked in non-expandable state', () => {
      const { getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} expandable={false} />
      );
      
      const title = getByText('Test Anime');
      expect(title).toBeInTheDocument();
      
      fireEvent.click(title);
      
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to anime detail page when title is clicked in expandable collapsed state', () => {
      const { getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} expanded={false} />
      );
      
      const title = getByText('Test Anime');
      expect(title).toBeInTheDocument();
      
      fireEvent.click(title);
      
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to anime detail page when title is clicked in expanded state', () => {
      const { getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} expanded={true} />
      );
      
      const title = getByText('Test Anime');
      expect(title).toBeInTheDocument();
      
      fireEvent.click(title);
      
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should stop event propagation when title is clicked to prevent card expansion', () => {
      const mockOnClick = vi.fn();
      const { getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} onClick={mockOnClick} />
      );
      
      const title = getByText('Test Anime');
      fireEvent.click(title);
      
      // Navigation should occur
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
      
      // Card onClick should not be triggered due to stopPropagation
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should navigate with correct route format for different sources', () => {
      const anilistAnime = { ...mockAnime, source: 'anilist', id: 123, title: 'AniList Anime' };
      const jikanAnime = { ...mockAnime, source: 'jikan', id: 456, title: 'Jikan Anime' };
      
      // Test AniList source
      const { getByText: getByTextAnilist } = renderWithRouter(
        <BaseAnimeCard anime={anilistAnime} />
      );
      
      fireEvent.click(getByTextAnilist('AniList Anime'));
      expect(mockNavigate).toHaveBeenCalledWith('/anime/anilist/123');
      
      mockNavigate.mockClear();
      
      // Test Jikan source
      const { getByText: getByTextJikan } = renderWithRouter(
        <BaseAnimeCard anime={jikanAnime} />
      );
      
      fireEvent.click(getByTextJikan('Jikan Anime'));
      expect(mockNavigate).toHaveBeenCalledWith('/anime/jikan/456');
    });

    it('should handle missing source gracefully with fallback', () => {
      const animeWithoutSource = { ...mockAnime };
      delete animeWithoutSource.source;
      
      const { getByText } = renderWithRouter(
        <BaseAnimeCard anime={animeWithoutSource} />
      );
      
      fireEvent.click(getByText('Test Anime'));
      
      // Should default to 'mal' when source is undefined
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
    });

    it('should not interfere with existing card expansion behavior', () => {
      const { container, getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} />
      );
      
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      const title = getByText('Test Anime');
      
      // Initially not expanded
      expect(radio.checked).toBe(false);
      
      // Click title - should navigate but not expand card
      fireEvent.click(title);
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
      expect(radio.checked).toBe(false); // Card should not expand
      
      mockNavigate.mockClear();
      
      // Click card (not title) - should expand
      fireEvent.click(card);
      expect(radio.checked).toBe(true); // Card should expand
      expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate
    });

    it('should work with keyboard navigation on title', () => {
      const { getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} />
      );
      
      const title = getByText('Test Anime');
      
      // Test Enter key
      fireEvent.keyDown(title, { key: 'Enter' });
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
      
      mockNavigate.mockClear();
      
      // Test Space key
      fireEvent.keyDown(title, { key: ' ' });
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
    });

    it('should not navigate on other key presses', () => {
      const { getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} />
      );
      
      const title = getByText('Test Anime');
      
      fireEvent.keyDown(title, { key: 'Tab' });
      fireEvent.keyDown(title, { key: 'Escape' });
      fireEvent.keyDown(title, { key: 'a' });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should be accessible with proper ARIA attributes', () => {
      const { getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} />
      );
      
      const title = getByText('Test Anime');
      
      expect(title).toHaveAttribute('role', 'button');
      expect(title).toHaveAttribute('tabIndex', '0');
      expect(title).toHaveClass('cursor-pointer');
    });

    it('should work correctly when statusDropdown is enabled', () => {
      const mockStatusChange = vi.fn();
      const { getByText } = renderWithRouter(
        <BaseAnimeCard 
          anime={mockAnime} 
          statusDropdown={{
            enabled: true,
            onStatusChange: mockStatusChange,
            isAuthenticated: true
          }}
        />
      );
      
      const title = getByText('Test Anime');
      fireEvent.click(title);
      
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
      expect(mockStatusChange).not.toHaveBeenCalled();
    });

    it('should navigate when title is clicked even in expanded card state', () => {
      const { container, getByText } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} expanded={true} />
      );
      
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      const title = getByText('Test Anime');
      
      // Card should start expanded
      expect(radio.checked).toBe(true);
      
      // Click title - should navigate and NOT toggle card state
      fireEvent.click(title);
      expect(mockNavigate).toHaveBeenCalledWith('/anime/mal/1');
      expect(radio.checked).toBe(true); // Card should remain expanded
      
      mockNavigate.mockClear();
      
      // Click card area (not title) - should collapse
      fireEvent.click(card);
      expect(radio.checked).toBe(false); // Card should collapse
      expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate
    });


    it('should not interfere with card expansion when clicking non-title areas', () => {
      const { container } = renderWithRouter(
        <BaseAnimeCard anime={mockAnime} />
      );
      
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      const imageContainer = container.querySelector('.card-image-container') as HTMLElement;
      
      // Initially not expanded
      expect(radio.checked).toBe(false);
      
      // Click image container (not title) - should expand card
      fireEvent.click(imageContainer);
      expect(radio.checked).toBe(true); // Card should expand
      expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate
      
      // Click again to collapse
      fireEvent.click(imageContainer);
      expect(radio.checked).toBe(false); // Card should collapse
      expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate
    });
  });
});