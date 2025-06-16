import { useMemo } from "react";

export interface DimensionInput {
  width?: number | string;
  height?: number | string;
  expandedWidth?: number | string;
}

export interface DimensionOutput {
  validatedWidth: number | string;
  validatedHeight: number | string;
  validatedExpandedWidth: number | string;
  cardStyles: React.CSSProperties;
}

/**
 * Custom hook for validating and formatting card dimensions
 * Handles validation logic ensuring no negative values and expandedWidth > width
 */
export const useDimensions = ({
  width = 200,
  height = 370,
  expandedWidth = 480,
}: DimensionInput): DimensionOutput => {
  return useMemo(() => {
    // Helper function to validate and format dimension values
    const validateAndFormatDimension = (
      value: number | string,
      fallback: number
    ): string => {
      if (typeof value === "number") {
        // Ensure no negative values
        const validValue = Math.max(0, value);
        return `${validValue}px`;
      }
      return value; // Allow string values (e.g., "10rem", "50%") - assume they're valid
    };

    // Validate dimensions
    const validatedWidth =
      typeof width === "number" ? Math.max(0, width) : width;
    const validatedHeight =
      typeof height === "number" ? Math.max(0, height) : height;
    const validatedExpandedWidth =
      typeof expandedWidth === "number"
        ? Math.max(0, expandedWidth)
        : expandedWidth;

    // Ensure expandedWidth is greater than width (only for numeric values)
    const finalExpandedWidth = (() => {
      if (
        typeof validatedWidth === "number" &&
        typeof validatedExpandedWidth === "number"
      ) {
        return Math.max(validatedExpandedWidth, validatedWidth + 1); // At least 1px bigger than width
      }
      return validatedExpandedWidth;
    })();

    // Calculate dynamic styles - height is always fixed for horizontal-only expansion
    const cardStyles: React.CSSProperties = {
      width: validateAndFormatDimension(validatedWidth, 200),
      height: validateAndFormatDimension(validatedHeight, 370),
      "--expanded-width": validateAndFormatDimension(finalExpandedWidth, 480),
      "--original-width": validateAndFormatDimension(validatedWidth, 200),
    } as React.CSSProperties;

    return {
      validatedWidth,
      validatedHeight,
      validatedExpandedWidth: finalExpandedWidth,
      cardStyles,
    };
  }, [width, height, expandedWidth]);
};
