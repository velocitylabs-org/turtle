export function formatDate(date: string) {
  return `${new Date(date).toISOString().replace('T', ' ').substring(0, 16)} (UTC)`
}

export function formatDateAgo(date: string) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    const remainingHours = diffHours % 24
    if (remainingHours > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ${remainingHours} ${remainingHours === 1 ? 'hr' : 'hrs'} ago`
    }
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  if (diffHours > 0) {
    const remainingMins = diffMins % 60
    if (remainingMins > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ${remainingMins} ${remainingMins === 1 ? 'min' : 'mins'} ago`
    }
    return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`
  }

  if (diffMins > 0) {
    return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`
  }

  if (diffSecs > 0) {
    return `${diffSecs} ${diffSecs === 1 ? 'sec' : 'secs'} ago`
  }

  return 'just now'
}