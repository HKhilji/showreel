import cron from 'node-cron'
import { Notification } from 'electron'
import { db } from './database'
import { getDetails } from './tmdb'

export function startNotificationScheduler() {
  // Run once immediately on startup, then every 6 hours
  checkForNewEpisodes()
  cron.schedule('0 */6 * * *', checkForNewEpisodes, {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}


async function checkForNewEpisodes() {
  console.log('Checking for new episodes..')

  const items = db.prepare(`
    SELECT * FROM watchlist
    WHERE type = 'tv'
    AND (status = 'watching' OR status = 'plan-to-watch')
  `).all()

  for (const item of items) {
    try {
      const details = await getDetails(item.tdmb_id, 'tv')
      const nextEpisode = details.next_episode_to_air  
    
      if (!nextEpisode) continue

      const airDate = new Date(nextEpisode.air_date)
      const today = new Date()

      // Check if the air date is today
      const isToday = 
        airDate.getDate() === today.getDate() &&
        airDate.getMonth() === today.getMonth() &&
        airDate.getFullYear() === today.getFullYear()

      if (isToday) {
        fireNotification(item.title, nextEpisode)
        saveNotification(item.id, item.title, nextEpisode)
      }
    } catch (error) {
      console.error(`Failed to check ${item.title}:`, error)
    }
  }
}

function fireNotification(title, episode) {
  new Notification({
    title: `New episode of ${title}!`,
    body: `S${episode.season_number}E${episode.episode_number} - ${episode.name} is out today!`
  }).show()
}

function saveNotification(watchlistId, title, episode) {
  // Check if we already notified for this episode
  const existing = db.prepare(`
    SELECT id FROM notifications
    WHERE watchlist_id = ? and message LIKE ?
  `).get(watchlistId, `%S${episode.season_number}E${episode.episode_number}%`)

  if (existing) return

  db.prepare(`
    INSERT INTO notifications (watchlist_id, message)
    VALUES (?, ?)
  `).run(
    watchlistId, `S${episode.season_number}E${episode.episode_number} - ${episode.name} is out today`
  )
}

