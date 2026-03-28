import { db } from './database'

export function addToWatchlist(item) {
  const stmt = db.prepare(`
    INSERT INTO watchlist (tmdb_id, title, type, status, poster_url)
    VALUES (@tmdb_id, @title, @type, @status, @poster_url)
    `)
  return stmt.run(item)
}

export function getWatchlist() {
  return db.prepare('SELECT * FROM watchlist ORDER BY added_at DESC').all()
}

export function updateStatus(id, status) {
  return db.prepare('UPDATE WATCHLIST SET status = ? WHERE id = ?').run(status, id)
}

export function deleteFromWatchlist(id) {
  return db.prepare('DELETE FROM watchlist WHERE id = ?').run(id)
}

export function checkInWatchlist(tmdbId) {
  return db.prepare('SELECT id FROM watchlist WHERE tmdb_id = ?').get(tmdbId)
}