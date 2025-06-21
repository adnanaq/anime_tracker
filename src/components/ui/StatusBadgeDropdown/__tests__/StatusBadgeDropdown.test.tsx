import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatusBadgeDropdown } from "../StatusBadgeDropdown";

// Mock the Badge component
vi.mock("../../Badge", () => ({
  Badge: ({
    children,
    icon,
    variant,
    size,
    shape,
    interactive,
    className,
    ...props
  }: any) => (
    <span
      data-testid="badge"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-interactive={interactive}
      className={className}
      {...props}
    >
      {icon && <span data-testid="badge-icon">{icon}</span>}
      {children}
    </span>
  ),
}));

describe("StatusBadgeDropdown", () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    mockOnStatusChange.mockClear();
  });

  describe("Basic Rendering", () => {
    it("renders with current status", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByText("Watching")).toBeInTheDocument();
    });

    it("displays correct badge variant for status", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="completed"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-variant", "success");
    });

    it("renders as interactive button when authenticated", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isAuthenticated={true}
        />
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("uses pill shape for badges", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isAuthenticated={true}
        />
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-shape", "pill");
    });
  });

  describe("Authentication States", () => {
    it("renders as non-interactive badge when not authenticated", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="completed"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isAuthenticated={false}
        />
      );

      // Should render badge but not as a button
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders as interactive button when authenticated", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="completed"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isAuthenticated={true}
        />
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("shows loading animation when isLoading is true", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="currently_watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isLoading={true}
        />
      );

      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("status-loading");
    });

    it("disables button when isLoading is true", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="currently_watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
          isLoading={true}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Disabled State", () => {
    it("disables button when disabled prop is true", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="completed"
          source="mal"
          onStatusChange={mockOnStatusChange}
          disabled={true}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Dropdown Functionality", () => {
    it("opens dropdown when trigger is clicked", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText("Watching")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("On Hold")).toBeInTheDocument();
      expect(screen.getByText("Dropped")).toBeInTheDocument();
      expect(screen.getByText("Plan to Watch")).toBeInTheDocument();
    });

    it("does not show current status in dropdown options", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="completed"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const dropdown = screen.getByRole("listbox");
      expect(dropdown).toBeInTheDocument();

      // Current status should not appear in dropdown (fixed filtering)
      expect(
        screen.queryByRole("option", { name: /completed/i })
      ).not.toBeInTheDocument();

      // Other statuses should appear
      expect(
        screen.getByRole("option", { name: /plan to watch/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /watching/i })
      ).toBeInTheDocument();
    });

    it("closes dropdown when clicking outside", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <StatusBadgeDropdown
            currentStatus="plan_to_watch"
            source="mal"
            onStatusChange={mockOnStatusChange}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      // Open dropdown
      const trigger = screen.getByRole("button");
      await user.click(trigger);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      // Click outside
      const outside = screen.getByTestId("outside");
      await user.click(outside);

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("closes dropdown when pressing Escape key", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      // Open dropdown
      const trigger = screen.getByRole("button");
      await user.click(trigger);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      // Press Escape
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Status Selection", () => {
    it("calls onStatusChange when status option is selected", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      // Open dropdown
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Click a status option
      const completedOption = screen.getByRole("option", {
        name: /completed/i,
      });
      await user.click(completedOption);

      expect(mockOnStatusChange).toHaveBeenCalledWith("completed");
    });

    it("shows updating state when status is being changed", async () => {
      const user = userEvent.setup();
      let resolveStatusChange: (value: void) => void;
      const pendingStatusChange = new Promise<void>((resolve) => {
        resolveStatusChange = resolve;
      });

      mockOnStatusChange.mockReturnValue(pendingStatusChange);

      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      // Open dropdown and select option
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const completedOption = screen.getByRole("option", {
        name: /completed/i,
      });
      await user.click(completedOption);

      // Should show updating state with loading animation
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("status-loading");

      // Resolve the promise
      resolveStatusChange();

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("keeps dropdown open when status change fails", async () => {
      const user = userEvent.setup();
      mockOnStatusChange.mockRejectedValue(new Error("Failed to update"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      // Open dropdown and select option
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const completedOption = screen.getByRole("option", {
        name: /completed/i,
      });
      await user.click(completedOption);

      await waitFor(() => {
        // Dropdown should still be open for retry
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to update status:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Custom Configuration", () => {
    it("respects custom availableStatuses prop", async () => {
      const user = userEvent.setup();
      const customStatuses: AnimeStatus[] = ["plan_to_watch", "completed"];

      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          availableStatuses={customStatuses}
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Should only show completed option (current status filtered out)
      expect(
        screen.getByRole("option", { name: /completed/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: /currently watching/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: /on hold/i })
      ).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="completed"
          source="mal"
          onStatusChange={mockOnStatusChange}
          className="custom-class"
        />
      );

      const container = screen.getByRole("button").parentElement;
      expect(container).toHaveClass("custom-class");
    });

    it("respects custom size prop", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="completed"
          source="mal"
          onStatusChange={mockOnStatusChange}
          size="md"
        />
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-size", "md");
    });
  });

  describe("Remove from List Functionality", () => {
    it("shows Remove from List option when anime has a status", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(
        screen.getByRole("option", { name: /remove from list/i })
      ).toBeInTheDocument();
    });

    it("does not show Remove from List option when anime has no status", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus={null}
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(
        screen.queryByRole("option", { name: /remove from list/i })
      ).not.toBeInTheDocument();
    });

    it("calls onStatusChange with empty string when Remove from List is selected", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="completed"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const removeOption = screen.getByRole("option", {
        name: /remove from list/i,
      });
      await user.click(removeOption);

      expect(mockOnStatusChange).toHaveBeenCalledWith("");
    });

    it("shows Remove from List option for AniList source", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="CURRENT"
          source="anilist"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(
        screen.getByRole("option", { name: /remove from list/i })
      ).toBeInTheDocument();
    });

    it("shows Remove from List option last in the dropdown list", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const options = screen.getAllByRole("option");
      const lastOption = options[options.length - 1];

      expect(lastOption).toHaveTextContent(/remove from list/i);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(
        <StatusBadgeDropdown
          currentStatus="watching"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute(
        "aria-label",
        "Current status: Watching. Click to change."
      );
    });

    it("updates aria-expanded when dropdown opens", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("has proper focus management", async () => {
      const user = userEvent.setup();

      render(
        <StatusBadgeDropdown
          currentStatus="plan_to_watch"
          source="mal"
          onStatusChange={mockOnStatusChange}
        />
      );

      const trigger = screen.getByRole("button");

      // Focus trigger
      trigger.focus();
      expect(trigger).toHaveFocus();

      // Open dropdown with Enter
      await user.keyboard("{Enter}");

      // Close with Escape and focus should return to trigger
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });
});
