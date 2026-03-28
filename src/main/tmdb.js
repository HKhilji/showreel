import axios from 'axios'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const API_KEY = process.env.TMDB_API_KEY

export async function searchMedia(query, type = 'multi') {
  const response = await axios.get(`${TMDB_BASE_URL}/search/${type}`, {
    params: {
      api_key: API_KEY,
      query: query,
      include_adult: false
    }
  })
  return response.data.results
}

export async function getDetails(tmdbId, type) {
  const response = await axios.get(`${TMDB_BASE_URL}/${type}/${tmdbId}`, {
    params: {
      api_key: API_KEY,
      append_to_response: 'videos,credits,reviews,external_ids'
    }
  })
  return response.data
}

export async function getRatings(imdbId) {
  if (!imdbId) return null
  const response = await axios.get('https://www.omdbapi.com/', {
    params: {
      apikey: process.env.OMDB_API_KEY,
      i: imdbId
    }
  })
  return response.data
}

export async function getSeasonDetails(tmdbId, seasonNumber) {
  const response = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}`, {
    params: { api_key: API_KEY }
  })
  return response.data
}

export function getPosterUrl(posterPath) {
  if (!posterPath) return null
  return `${TMDB_IMAGE_BASE}${posterPath}`
}