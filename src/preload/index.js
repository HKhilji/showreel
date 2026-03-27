import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  searchMedia: (query) => ipcRenderer.invoke('search-media', query),
  getDetails: (tmdbId, type) => ipcRenderer.invoke('get-details', tmdbId, type),
  addToWatchlist: (item) => ipcRenderer.invoke('add-to-watchlist', item),
  getWatchlist: () => ipcRenderer.invoke('get-watchlist'),
  updateStatus: (id, status) => ipcRenderer.invoke('update-status', id, status),
  deleteFromWatchlist: (id) => ipcRenderer.invoke('delete-from-watchlist', id),
})