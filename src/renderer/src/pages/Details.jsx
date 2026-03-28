import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function SeasonRow({ season, tmdbId }) {
  const [expanded, setExpanded] = useState(false)
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleExpand() {
    if (expanded) { setExpanded(false); return }
    if (episodes.length === 0) {
      setLoading(true)
      const data = await window.api.getSeason(tmdbId, season.season_number)
      setEpisodes(data.episodes || [])
      setLoading(false)
    }
    setExpanded(true)
  }

  return (
    <div style={{ marginBottom: '8px', border: '0.5px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        onClick={handleExpand}
        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)' }}
      >
        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
          {season.name}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {season.episode_count} episodes {expanded ? '▲' : '▼'}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {loading && <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</div>}
            {episodes.map(ep => (
              <div key={ep.id} style={{ padding: '10px 16px', borderTop: '0.5px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '32px', paddingTop: '2px' }}>
                  E{String(ep.episode_number).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' }}>{ep.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ep.air_date} · {ep.runtime ? `${ep.runtime}m` : 'N/A'}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Details() {
  const { type, id } = useParams()
  const [details, setDetails] = useState(null)
  const [ratings, setRatings] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadDetails()
  }, [])

  async function loadDetails() {
    const data = await window.api.getDetails(id, type)
    setDetails(data)
    const imdbId = data.imdb_id || data.external_ids?.imdb_id
    if (imdbId) {
      window.api.getRatings(imdbId).then(r => setRatings(r))
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="page-body">
      <div className="loading">Loading...</div>
    </div>
  )

  if (!details) return (
    <div className="page-body">
      <div className="loading">Something went wrong.</div>
    </div>
  )

  const imdbRating = ratings?.imdbRating
  const rtRating = ratings?.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value
  const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
  const cast = details.credits?.cast?.slice(0, 12) || []
  const director = details.credits?.crew?.find(c => c.job === 'Director')
  const creators = details.created_by || []
  const seasons = details.seasons?.filter(s => s.season_number > 0) || []

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Backdrop */}
      {details.backdrop_path && (
        <div style={{ position: 'relative', height: '220px', flexShrink: 0, overflow: 'hidden' }}>
          <img
            src={`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(14,14,17,0.3), rgba(14,14,17,1))' }} />
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            style={{ position: 'absolute', top: '16px', left: '24px' }}
          >
            ← Back
          </button>
        </div>
      )}

      <div className="page-body" style={{ paddingTop: details.backdrop_path ? '0' : '24px' }}>
        {!details.backdrop_path && (
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        )}

        {/* Hero */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', marginTop: details.backdrop_path ? '-80px' : '0', position: 'relative' }}>
          {details.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w300${details.poster_path}`}
              alt={details.title || details.name}
              style={{ width: '120px', borderRadius: '10px', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            />
          )}
          <div style={{ flex: 1, paddingTop: details.backdrop_path ? '90px' : '0' }}>
            <div style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.2 }}>
              {details.title || details.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              {(details.release_date || details.first_air_date)?.slice(0, 4)}
              {details.runtime ? ` · ${details.runtime}m` : ''}
              {details.episode_run_time?.[0] ? ` · ${details.episode_run_time[0]}m / ep` : ''}
              {details.genres?.map(g => ` · ${g.name}`).join('')}
            </div>

            {/* Ratings */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {imdbRating && (
                <div style={{ background: 'rgba(245,166,35,0.12)', border: '0.5px solid rgba(245,166,35,0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: 'var(--accent)' }}>
                  ⭐ IMDB {imdbRating}
                </div>
              )}
              {rtRating && (
                <div style={{ background: 'rgba(255,80,80,0.1)', border: '0.5px solid rgba(255,80,80,0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#ff6b6b' }}>
                  🍅 RT {rtRating}
                </div>
              )}
              {details.status && (
                <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border-light)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {details.status}
                </div>
              )}
            </div>

            {trailer && (
              <a
                className="trailer-link"
                href={`https://youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noreferrer"
              >
                ▶ Watch Trailer
              </a>
            )}
          </div>
        </div>

        {/* Overview */}
        {details.overview && (
          <>
            <div className="section-title">Synopsis</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              {details.overview}
            </p>
          </>
        )}

        {/* Director / Creator */}
        {(director || creators.length > 0) && (
          <>
            <div className="section-title">{type === 'movie' ? 'Director' : 'Created By'}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {type === 'movie' ? director?.name : creators.map(c => c.name).join(', ')}
            </p>
          </>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <>
            <div className="section-title">Cast</div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px', scrollbarWidth: 'none' }}>
              {cast.map(person => (
                <div key={person.id} style={{ flexShrink: 0, width: '70px', textAlign: 'center' }}>
                  {person.profile_path
                    ? <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} alt={person.name}
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '6px' }} />
                    : <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-elevated)', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
                  }
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{person.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3 }}>{person.character}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Episodes */}
        {seasons.length > 0 && (
          <>
            <div className="section-title">Episodes</div>
            {seasons.map(season => (
              <SeasonRow key={season.id} season={season} tmdbId={id} />
            ))}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default Details