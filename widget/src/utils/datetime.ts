/**
 * Extracts and formats the hours and minutes from a given date-time string.
 *
 * @param dateString - The ISO 8601 date-time string. For example, "2024-04-12T02:12:02.016Z".
 * @returns The formatted time string with AM/PM notation. Returns '-' if the input format is invalid.
 */

// TODO: unused for now but keeping it as exported
export const formatHours = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
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
 * @param dateString - The date string in "YYYY-MM-DD" format. For example, "2024-04-12".
 * @returns The formatted date string. For example, "Friday Apr 12, 2024".
 */
export function formatCompletedTransferDate(dateString: string | Date): string {
  const dateFrom = typeof dateString === 'string' ? new Date(dateString) : dateString
  const weekday = dateFrom.toLocaleDateString('en-US', { weekday: 'long' })
  const month = dateFrom.toLocaleDateString('en-US', { month: 'short' })
  const day = dateFrom.toLocaleDateString('en-US', { day: 'numeric' })
  const year = dateFrom.toLocaleDateString('en-US', { year: 'numeric' })
  return `${weekday} ${month} ${day}, ${year}`
}

/**
 * Formats a given date string or Date object to a more detailed human-readable format.
 *
 * @param date - The date string in "YYYY-MM-DDTHH:MM:SS" format or a Date object. For example, "2024-04-12T14:20:00" or a Date object.
 * @returns The formatted date string. For example, "Apr 12, 2:20:00 PM".
 */
export const formatOngoingTransferDate = (date: string | Date): string => {
  const dateFrom = typeof date === 'string' ? new Date(date) : date
  return dateFrom.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
