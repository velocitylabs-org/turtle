export default function formatUSD(
  amount: number | undefined,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
) {
  if (amount === undefined || amount === null) return ''
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
