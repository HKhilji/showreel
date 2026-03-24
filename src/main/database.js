import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

// Store the database in the user's app data folder
const dbPath = path.join(app.getPath('userData'), 'sidequest.db')
const db = new Database(dbPath)

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'plan_to_watch',
      poster_url TEXT,
      rating INTEGER,
      notes TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      watchlist_id INTEGER,
      message TEXT NOT NULL,
      seen INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (watchlist_id) REFERENCES watchlist(id)
    );
  `)

  console.log('Database initialized at:', dbPath)
}

export { db, initDatabase }