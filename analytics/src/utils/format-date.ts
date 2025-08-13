import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInYears,
} from 'date-fns'

export function formatDate(date: string) {
  return `${new Date(date).toISOString().replace('T', ' ').substring(0, 16)} (UTC)`
}

export function formatDateAgo(date: string) {
  // Both dates will be compared in UTC time
  const now = new Date()
  const past = new Date(date)

  const years = differenceInYears(now, past)
  const months = differenceInMonths(now, past)
  const days = differenceInDays(now, past)
  const hours = differenceInHours(now, past)
  const minutes = differenceInMinutes(now, past)
  const seconds = differenceInSeconds(now, past)

  // Years with months
  if (years > 0) {
    const remainingMonths = months - years * 12
    if (remainingMonths > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} ago`
    }
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  }

  // Months with days
  if (months > 0) {
    // Calculate the date X months ago and then find remaining days
    const monthsAgo = new Date(now)
    monthsAgo.setMonth(monthsAgo.getMonth() - months)
    const remainingDays = differenceInDays(monthsAgo, past)
    if (remainingDays > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} ago`
    }
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  }

  // Days with hours
  if (days > 0) {
    const remainingHours = hours - days * 24
    if (remainingHours > 0 && days < 30) {
      return `${days} ${days === 1 ? 'day' : 'days'} ${remainingHours} ${remainingHours === 1 ? 'hr' : 'hrs'} ago`
    }
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }

  // Hours with minutes
  if (hours > 0) {
    const remainingMinutes = minutes - hours * 60
    if (remainingMinutes > 0) {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${remainingMinutes} ${remainingMinutes === 1 ? 'min' : 'mins'} ago`
    }
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`
  }

  // Minutes
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`
  }

  // Seconds
  if (seconds > 0) {
    return `${seconds} ${seconds === 1 ? 'sec' : 'secs'} ago`
  }

  return 'just now'
}
