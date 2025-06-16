import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Card } from '../Card';

describe('Card', () => {
  describe('Basic rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('card');
      expect(card).toHaveClass('rounded-xl', 'overflow-hidden', 'bg-gray-200');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('renders children content', () => {
      const { getByText } = render(
        <Card>
          <div>Custom content</div>
        </Card>
      );
      expect(getByText('Custom content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red', width: '300px' };
      const { container } = render(<Card style={customStyle} />);
      const card = container.firstChild as HTMLElement;
      
      expect(card.style.backgroundColor).toBe('red');
      expect(card.style.width).toBe('300px');
    });
  });

  describe('Radio button functionality', () => {
    it('creates radio button with correct attributes', () => {
      const { container } = render(
        <Card groupName="test-group" cardIndex={5} />
      );
      
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio).toBeInTheDocument();
      expect(radio.name).toBe('test-group');
      expect(radio.getAttribute('data-index')).toBe('5');
      expect(radio).toHaveClass('absolute', 'opacity-0', 'pointer-events-none');
    });

    it('starts with radio checked when expanded prop is true', () => {
      const { container } = render(<Card expanded />);
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it('uses default group name when none provided', () => {
      const { container } = render(<Card />);
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio.name).toBe('default-card-group');
    });

    it('uses default card index when none provided', () => {
      const { container } = render(<Card />);
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio.getAttribute('data-index')).toBe('0');
    });
  });

  describe('Click interactions', () => {
    it('toggles radio button state when clicked', () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      // Initially not expanded
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
      const { container } = render(<Card onClick={onClickMock} />);
      const card = container.firstChild as HTMLElement;
      
      fireEvent.click(card);
      expect(onClickMock).toHaveBeenCalledTimes(1);
      
      fireEvent.click(card);
      expect(onClickMock).toHaveBeenCalledTimes(2);
    });

    it('does not toggle radio when expandable is false', () => {
      const { container } = render(<Card expandable={false} />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.click(card);
      expect(radio.checked).toBe(false); // Should not change
    });

    it('still calls onClick callback when expandable is false', () => {
      const onClickMock = vi.fn();
      const { container } = render(<Card expandable={false} onClick={onClickMock} />);
      const card = container.firstChild as HTMLElement;
      
      fireEvent.click(card);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('applies non-expandable class when expandable is false', () => {
      const { container } = render(<Card expandable={false} />);
      expect(container.firstChild).toHaveClass('non-expandable');
    });
  });

  describe('Keyboard interactions', () => {
    it('toggles on Enter key press', () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(radio.checked).toBe(true);
      
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(radio.checked).toBe(false);
    });

    it('toggles on Space key press', () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.keyDown(card, { key: ' ' });
      expect(radio.checked).toBe(true);
      
      fireEvent.keyDown(card, { key: ' ' });
      expect(radio.checked).toBe(false);
    });

    it('does not toggle on other key presses', () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.keyDown(card, { key: 'a' });
      expect(radio.checked).toBe(false);
      
      fireEvent.keyDown(card, { key: 'Escape' });
      expect(radio.checked).toBe(false);
    });

    it('calls custom onKeyDown callback when provided', () => {
      const onKeyDownMock = vi.fn();
      const { container } = render(<Card onKeyDown={onKeyDownMock} />);
      const card = container.firstChild as HTMLElement;
      
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onKeyDownMock).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(card, { key: 'a' });
      expect(onKeyDownMock).toHaveBeenCalledTimes(2);
    });


    it('does not toggle when expandable is false on keyboard interaction', () => {
      const { container } = render(<Card expandable={false} />);
      const card = container.firstChild as HTMLElement;
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      
      expect(radio.checked).toBe(false);
      
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(radio.checked).toBe(false); // Should not change
      
      fireEvent.keyDown(card, { key: ' ' });
      expect(radio.checked).toBe(false); // Should not change
    });
  });

  describe('Group behavior', () => {
    it('supports mutual exclusion within same group', () => {
      const { container } = render(
        <div>
          <Card groupName="test-group" cardIndex={0} />
          <Card groupName="test-group" cardIndex={1} />
          <Card groupName="test-group" cardIndex={2} />
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

    it('allows different groups to work independently', () => {
      const { container } = render(
        <div>
          <Card groupName="group1" cardIndex={0} />
          <Card groupName="group2" cardIndex={0} />
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
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('is keyboard accessible', () => {
      const onClickMock = vi.fn();
      const { container } = render(<Card onClick={onClickMock} />);
      const card = container.firstChild as HTMLElement;
      
      // Should be focusable and clickable via keyboard
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onClickMock).toHaveBeenCalled();
    });
  });
});