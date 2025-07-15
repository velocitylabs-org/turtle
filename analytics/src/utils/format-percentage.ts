export default function formatPercentage(num: number) {
  // For whole numbers or numbers with no significant decimal places
  if (num % 1 === 0 || num >= 10) {
    return Math.round(num)
  }

  // For small numbers (less than 0.01), show up to 4 decimal places
  if (Math.abs(num) < 0.01) {
    // Round to 4 decimal places and remove trailing zeros
    return parseFloat(num.toFixed(4))
  }

  // For numbers with decimals, show 1 decimal place
  return parseFloat(num.toFixed(1))
}
