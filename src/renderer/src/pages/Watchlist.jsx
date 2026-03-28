import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BorderGlow from '../components/BorderGlow/BorderGlow'

const POSTER_BASE = "https://image.tmdb.org/t/p/w200"

const STATUS_ROWS = [
  { key: 'watching', label: 'Watching' },
  { key: 'plan_to_watch', label: 'Plan to Watch' },
  { key: 'completed', label: 'Completed' },
  { key: 'dropped', label: 'Dropped' }
]

import { useRef } from 'react'

function MediaRow({ label, items, onStatusChange, onDelete, onNavigate }) {
  const scrollRef = useRef(null)

  if (items.length === 0) return null

  function scrollLeft() {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
  }

  function scrollRight() {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div className="section-label" style={{ margin: 0 }}>{label}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="scroll-btn" onClick={scrollLeft}>←</button>
          <button className="scroll-btn" onClick={scrollRight}>→</button>
        </div>
      </div>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '12px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ flexShrink: 0, width: '130px', position: 'relative' }}
          >
            <BorderGlow
              borderRadius={10}
              backgroundColor="#151518"
              glowColor="40 60 80"
              colors={['#a855f7', '#f5a623', '#6366f1']}
              glowRadius={20}
              glowIntensity={0.8}
            >
              <button
                className="delete-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  zIndex: 10,
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px'
                }}
              >✕</button>
              <div style={{ cursor: 'pointer' }} onClick={() => onNavigate(item)}>
                {item.poster_url
                  ? <img
                      src={`${POSTER_BASE}${item.poster_url}`}
                      alt={item.title}
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', borderRadius: '10px 10px 0 0' }}
                    />
                  : <div style={{ width: '100%', aspectRatio: '2/3', background: '#1a1a1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '11px' }}>No image</div>
                }
              </div>
              <div style={{ padding: '10px' }}>
                <div className="card-title">{item.title}</div>
                <select
                  className="status-select"
                  value={item.status}
                  onChange={(e) => onStatusChange(item.id, e.target.value)}
                >
                  <option value="plan_to_watch">Plan to Watch</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </BorderGlow>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


function Watchlist() {
  const [items, setItems] = useState([])
  const navigate = useNavigate()

  async function loadWatchlist() {
    const data = await window.api.getWatchlist()
    setItems(data)
  }

  useEffect(() => {
    loadWatchlist()
  }, [])

  async function handleDelete(id) {
    await window.api.deleteFromWatchlist(id)
    loadWatchlist()
  }

  async function handleStatusChange(id, status) {
    await window.api.updateStatus(id, status)
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, status } : item
    ))
  }

  function handleNavigate(item) {
    navigate(`/details/${item.type}/${item.tmdb_id}`)
  }

  const watching = items.filter(item => item.status === 'watching')
  const planToWatch = items.filter(item => item.status === 'plan_to_watch')
  const completed = items.filter(item => item.status === 'completed')
  const dropped = items.filter(item => item.status === 'dropped')

  return (
    <>
      <div className="page-header">
        <div className="page-title">My Watchlist</div>
      </div>
      <div className="page-body">
        {items.length === 0 && (
          <div className="empty-state">Nothing here yet. Search for something to add.</div>
        )}
        {STATUS_ROWS.map(({ key, label }) => (
          <MediaRow
            key={key}
            label={label}
            items={key === 'watching' ? watching : key === 'plan_to_watch' ? planToWatch : key === 'completed' ? completed : dropped}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </>
  )
}

export default Watchlist