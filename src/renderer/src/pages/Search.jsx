import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BorderGlow from '../components/BorderGlow/BorderGlow'

const POSTER_BASE = 'https://image.tmdb.org/t/p/w200'

function AddModal({ item, onConfirm, onCancel }) {
  const [status, setStatus] = useState('plan_to_watch')

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <motion.div
        className="modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <div className="modal-title">Add to Showreel</div>
        <div className="modal-subtitle">{item.title || item.name}</div>
        <select
          className="modal-select"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="plan_to_watch">Plan to Watch</option>
          <option value="watching">Watching</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-confirm" onClick={() => onConfirm(status)}>Add</button>
        </div>
      </motion.div>
    </div>
  )
}

function SearchRow({ label, items, onAdd, onNavigate }) {
  const scrollRef = useRef(null)

  if (items.length === 0) return null

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div className="section-label" style={{ margin: 0 }}>{label}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="scroll-btn" onClick={() => scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}>←</button>
          <button className="scroll-btn" onClick={() => scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })}>→</button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{ display: 'flex', gap: '14px', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '12px', scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{ flexShrink: 0, width: '130px' }}
          >
            <BorderGlow
              borderRadius={10}
              backgroundColor="#151518"
              glowColor="40 60 80"
              colors={['#a855f7', '#f5a623', '#6366f1']}
              glowRadius={20}
              glowIntensity={0.8}
            >
              <div style={{ cursor: 'pointer' }} onClick={() => onNavigate(item)}>
                {item.poster_path
                  ? <img src={`${POSTER_BASE}${item.poster_path}`} alt={item.title || item.name}
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', borderRadius: '10px 10px 0 0' }} />
                  : <div style={{ width: '100%', aspectRatio: '2/3', background: '#1a1a1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '11px' }}>No image</div>
                }
              </div>
              <div style={{ padding: '10px' }}>
                <div className="card-title">{item.title || item.name}</div>
                <button className="card-add-btn" onClick={() => onAdd(item)}>+ Add</button>
              </div>
            </BorderGlow>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const data = await window.api.searchMedia(query)
    setResults(data.filter(item => item.media_type !== 'person'))
    setLoading(false)
    inputRef.current?.focus()
  }

  async function handleConfirmAdd(status) {
    const item = selectedItem
    const existing = await window.api.checkInWatchlist(item.id)
    if (existing) {
      showToast(`${item.title || item.name} is already in your list`)
      setSelectedItem(null)
      return
    }
    await window.api.addToWatchlist({
      tmdb_id: item.id,
      title: item.title || item.name,
      type: item.media_type,
      status,
      poster_url: item.poster_path
    })
    setSelectedItem(null)
    showToast(`✓ ${item.title || item.name} added`)
    inputRef.current?.focus()
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const movies = results.filter(i => i.media_type === 'movie')
  const shows = results.filter(i => i.media_type === 'tv')

  return (
    <>
      <div className="page-header">
        <div className="page-title">Search</div>
      </div>
      <div className="page-body">
        <form onSubmit={handleSearch} className="search-row">
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search movies, shows, anime..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="search-btn" type="submit">Search</button>
        </form>

        {loading && <div className="loading">Searching...</div>}

        <SearchRow
          label="Movies"
          items={movies}
          onAdd={setSelectedItem}
          onNavigate={item => navigate(`/details/${item.media_type}/${item.id}`)}
        />
        <SearchRow
          label="TV Shows"
          items={shows}
          onAdd={setSelectedItem}
          onNavigate={item => navigate(`/details/${item.media_type}/${item.id}`)}
        />

        <AnimatePresence>
          {selectedItem && (
            <AddModal
              item={selectedItem}
              onConfirm={handleConfirmAdd}
              onCancel={() => setSelectedItem(null)}
            />
          )}
        </AnimatePresence>

        {toast && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            background: '#1a1a1e', border: '0.5px solid var(--accent)',
            color: 'var(--accent)', padding: '10px 18px',
            borderRadius: '8px', fontSize: '13px', zIndex: 300
          }}>
            {toast}
          </div>
        )}
      </div>
    </>
  )
}

export default Search