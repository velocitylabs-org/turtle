/**
 * Truncate a blockchain address by showing the beginning and end parts.
 *
 * @param str - The address string to be truncated.
 * @param start - Number of characters to show from the start. Default is 4.
 * @param end - Number of characters to show from the end. Default is 4.
 * @returns The truncated address or an empty string if the input string is empty.
 */
export const truncateAddress = (str: string, start: number = 4, end: number = 4) => {
  if (!str || str.length === 0) return ''
  if (str.length <= start + end) return str

  const startStr = str.substring(0, start)
  const endStr = end > 0 ? str.substring(str.length - end) : ''

  return `${startStr}...${endStr}`.toLowerCase()
}
