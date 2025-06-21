import { Temporal } from "@js-temporal/polyfill";

export const getCurrentWeek = (): { week: number; year: number } => {
  const today = Temporal.Now.plainDateISO();

  return {
    week: today.weekOfYear ?? 1,
    year: today.year,
  };
};

export const getWeeksInYear = (year: number): number => {
  const date = Temporal.PlainDate.from(`${year}-12-28`);
  return date.weekOfYear!;
};

export const getCurrentDay = (): string => {
  const today = Temporal.Now.plainDateISO().dayOfWeek; // 1 (Monday) to 7 (Sunday)
  const dayNames = [
    "monday",
    "tuesday", 
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  // Convert Temporal's 1–7 to 0–6 for array index
  const dayIndex = (today - 1) % 7;
  return dayNames[dayIndex];
};

export const getTimezoneOffset = (tz: string): string => {
  return Temporal.Now.zonedDateTimeISO(tz).offset;
};

export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return "UTC";
  }
};

export const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];