import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BaseAnimeCard } from '../BaseAnimeCard';
import { AnimeBase } from '../../../../types/anime';

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
  userStatus: 'WATCHING'
};

describe('BaseAnimeCard', () => {
  it('renders with correct normal dimensions', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('w-[200px]', 'h-[370px]');
  });

  it('starts with radio checked when expanded prop is true', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} expanded />);
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio.checked).toBe(true);
    expect(container.firstChild).toHaveClass('h-[370px]');
  });

  it('renders with rounded corners and overflow hidden', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('rounded-xl', 'overflow-hidden');
  });

  it('renders with background and border styles', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('bg-gray-200', 'border', 'border-gray-300');
  });

  it('has base-anime-card class for CSS transitions', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('base-anime-card');
  });

  it('applies custom className', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders children content', () => {
    const { getByText } = render(
      <BaseAnimeCard anime={mockAnime}>
        <div>Custom content</div>
      </BaseAnimeCard>
    );
    expect(getByText('Custom content')).toBeInTheDocument();
  });

  it('defaults to non-expanded state', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('w-[200px]');
    expect(container.firstChild).not.toHaveClass('w-[480px]');
  });

  it('applies interactive styles', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    expect(container.firstChild).toHaveClass('cursor-pointer');
    expect(container.firstChild).toHaveAttribute('role', 'button');
    expect(container.firstChild).toHaveAttribute('tabIndex', '0');
  });

  it('toggles radio button state when clicked', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    
    // Initially not expanded
    expect(card).toHaveClass('w-[200px]');
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
    const { container } = render(<BaseAnimeCard anime={mockAnime} onClick={onClickMock} />);
    const card = container.firstChild as HTMLElement;
    
    fireEvent.click(card);
    expect(onClickMock).toHaveBeenCalledTimes(1);
    
    fireEvent.click(card);
    expect(onClickMock).toHaveBeenCalledTimes(2);
  });

  it('toggles on Enter key press', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    
    expect(radio.checked).toBe(false);
    
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(radio.checked).toBe(true);
    
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(radio.checked).toBe(false);
  });

  it('toggles on Space key press', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
    const card = container.firstChild as HTMLElement;
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    
    expect(radio.checked).toBe(false);
    
    fireEvent.keyDown(card, { key: ' ' });
    expect(radio.checked).toBe(true);
    
    fireEvent.keyDown(card, { key: ' ' });
    expect(radio.checked).toBe(false);
  });

  it('does not toggle on other key presses', () => {
    const { container } = render(<BaseAnimeCard anime={mockAnime} />);
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
      const { container } = render(
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
      expect(card1).toHaveClass('w-[200px]');
      expect(card2).toHaveClass('w-[200px]');
      expect(card3).toHaveClass('w-[200px]');
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
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(<BaseAnimeCard anime={mockAnime} expandable={false} />);
      expect(container.firstChild).toHaveClass('non-expandable');
    });

    it('does not expand when non-expandable and clicked', () => {
      const { container } = render(<BaseAnimeCard anime={mockAnime} expandable={false} />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.click(card);
      expect(radio.checked).toBe(false); // Should not change
    });

    it('still calls onClick callback when non-expandable', () => {
      const onClickMock = vi.fn();
      const { container } = render(<BaseAnimeCard anime={mockAnime} expandable={false} onClick={onClickMock} />);
      const card = container.firstChild as HTMLElement;
      
      fireEvent.click(card);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('non-expandable cards stay at 200px width even when radio is checked', () => {
      const { container } = render(<BaseAnimeCard anime={mockAnime} expandable={false} expanded />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      // Radio should be checked due to expanded prop
      expect(radio.checked).toBe(true);
      // But card should have non-expandable class preventing expansion
      expect(card).toHaveClass('non-expandable');
    });

    it('works with keyboard interaction when non-expandable', () => {
      const { container } = render(<BaseAnimeCard anime={mockAnime} expandable={false} />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(radio.checked).toBe(false); // Should not change
      
      fireEvent.keyDown(card, { key: ' ' });
      expect(radio.checked).toBe(false); // Should not change
    });
  });
});