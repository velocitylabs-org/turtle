export default function formatUSD(
  amount: number | undefined,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
) {
  if (amount === undefined || amount === null) return ''
  
  // Handle very small numbers
  if (amount > 0 && amount < 0.1) {
    // Find the first non-zero digit position
    const str = amount.toString()
    const match = str.match(/0\.0*([1-9])/)
    if (match) {
      const zerosCount = match[0].length - match[1].length - 2 // subtract '0.' and the non-zero digit
      const precision = zerosCount + 2 // show at least 2 significant digits
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })
    }
  }
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }
  const formatOptions = { ...defaultOptions, ...options }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: formatOptions.minimumFractionDigits,
    maximumFractionDigits: formatOptions.maximumFractionDigits,
  })
}
