import React, { useState, useEffect } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { Typography, Badge } from "../ui";

interface AiringCountdownProps {
  episodeDate: string;
  airingStatus: "aired" | "airing" | "delayed" | "skipped" | "tba";
  timezone: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  hasAired: boolean;
}

const calculateTimeRemaining = (
  episodeDate: string,
  timezone: string
): TimeRemaining => {
  try {
    const now = Temporal.Now.zonedDateTimeISO(timezone);
    const airTime = Temporal.Instant.from(episodeDate).toZonedDateTimeISO(timezone);
    
    // Check if episode has already aired
    if (Temporal.ZonedDateTime.compare(now, airTime) >= 0) {
      const timeSinceAired = now.since(airTime, { largestUnit: "hours" });
      const hoursSinceAired = timeSinceAired.total("hours");
      
      // Consider "live" if within 30 minutes of air time
      const isLive = hoursSinceAired <= 0.5;
      
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isLive,
        hasAired: !isLive,
      };
    }

    // Calculate time until airing
    const duration = airTime.since(now, {
      largestUnit: "days",
    });

    return {
      days: Math.floor(duration.total("days")),
      hours: Math.floor(duration.total("hours") % 24),
      minutes: Math.floor(duration.total("minutes") % 60),
      seconds: Math.floor(duration.total("seconds") % 60),
      isLive: false,
      hasAired: false,
    };
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: false,
      hasAired: false,
    };
  }
};

export const AiringCountdown: React.FC<AiringCountdownProps> = ({
  episodeDate,
  airingStatus,
  timezone,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(episodeDate, timezone)
  );

  useEffect(() => {
    // Don't update if already aired and not live
    if (timeRemaining.hasAired && !timeRemaining.isLive) {
      return;
    }

    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(episodeDate, timezone);
      setTimeRemaining(newTimeRemaining);
      
      // Stop updating once it has fully aired
      if (newTimeRemaining.hasAired && !newTimeRemaining.isLive) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [episodeDate, timezone, timeRemaining.hasAired, timeRemaining.isLive]);

  // Don't show countdown for certain statuses that are already shown in the main badge
  if (airingStatus === "skipped" || airingStatus === "tba" || airingStatus === "aired" || airingStatus === "airing") {
    return null;
  }

  // Don't show anything if already aired or currently live (status is shown in main badge)
  if (timeRemaining.hasAired || timeRemaining.isLive) {
    return null;
  }

  // Show countdown for future episodes
  const formatCountdown = () => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else if (timeRemaining.minutes > 0) {
      return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
    } else {
      return `${timeRemaining.seconds}s`;
    }
  };

  if (airingStatus === "delayed") {
    return (
      <Badge variant="warning" size="xs" shape="rounded">
        Delayed • {formatCountdown()}
      </Badge>
    );
  }

  const getCountdownVariant = () => {
    if (timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes < 30) {
      return "danger"; // Soon to air
    } else if (timeRemaining.days === 0 && timeRemaining.hours < 2) {
      return "warning"; // Airing today
    } else {
      return "info"; // Normal countdown
    }
  };

  return (
    <Badge variant={getCountdownVariant()} size="xs" shape="rounded">
      Airs in {formatCountdown()}
    </Badge>
  );
};