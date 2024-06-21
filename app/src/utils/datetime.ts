/**
 * Extracts and formats the hours and minutes from a given date-time string.
 *
 * This function expects an ISO 8601 date-time string (e.g., "2024-04-12T02:12:02.016Z"). It extracts the hours and minutes,
 * determines whether the time is AM or PM, and returns the formatted string.
 *
 * @param dateString - The ISO 8601 date-time string. For example, "2024-04-12T02:12:02.016Z".
 * @returns The formatted time string with AM/PM notation. Returns '-' if the input format is invalid.
 */
export const formatHours = (dateString: string | Date): string => {
  const date = typeof dateString == 'string' ? new Date(dateString) : dateString
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })
  return formattedTime.toLowerCase()
}

/**
 * Formats a given date string to a more human-readable format.
 *
 * This function expects a date string (e.g., "2024-04-12"). It converts the date to a more readable format
 * including the day of the week, month, day, and year.
 *
 * @param dateString - The date string in "YYYY-MM-DD" format. For example, "2024-04-12".
 * @returns The formatted date string. For example, "Friday Apr 12, 2024".
 */
export function formatDate(dateString: string | Date): string {
  const dateFrom = typeof dateString == 'string' ? new Date(dateString) : dateString
  const weekday = dateFrom.toLocaleDateString('en-US', { weekday: 'long' })
  const month = dateFrom.toLocaleDateString('en-US', { month: 'short' })
  const day = dateFrom.toLocaleDateString('en-US', { day: 'numeric' })
  const year = dateFrom.toLocaleDateString('en-US', { year: 'numeric' })
  return `${weekday} ${month} ${day}, ${year}`
}
