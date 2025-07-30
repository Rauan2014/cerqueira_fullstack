'use server'
import { cookies } from 'next/headers'

/**
 * Increment counter and log access
 */
export async function incrementAndLog() {
  const cookieStore = await cookies()

  // Get current count from cookie or start at 0
  let currentCount = parseInt(cookieStore.get('page_views')?.value || '0')

  // Increment count
  currentCount += 1

  // Store updated count in cookie (expires in 1 year)
  cookieStore.set('page_views', currentCount.toString(), {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    path: '/'
  })

  // Log this access in memory (will be lost on restart)
  const accessTime = new Date().toISOString()
  const recentAccessList = JSON.parse(cookieStore.get('recent_access')?.value || '[]')
  recentAccessList.unshift({ accessed_at: accessTime })

  // Keep only the 5 most recent accesses
  while (recentAccessList.length > 5) {
    recentAccessList.pop()
  }

  // Store recent access list in cookie
  cookieStore.set('recent_access', JSON.stringify(recentAccessList), {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    path: '/'
  })

  return {
    count: currentCount,
    recentAccess: recentAccessList
  }
}

/**
 * Get current counter value and recent access logs
 */
export async function getStats() {
  const cookieStore = await cookies()

  // Get current count from cookie or default to 0
  const currentCount = parseInt(cookieStore.get('page_views')?.value || '0')

  // Get recent access list from cookie or default to empty array
  const recentAccessList = JSON.parse(cookieStore.get('recent_access')?.value || '[]')

  return {
    count: currentCount,
    recentAccess: recentAccessList
  }
}