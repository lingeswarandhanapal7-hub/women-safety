import { create } from 'zustand'

const useLocationStore = create((set, get) => ({
  location: null,
  history: [],
  isTracking: false,
  watchId: null,
  error: null,

  startTracking: () => {
    if (!navigator.geolocation) {
      set({ error: 'Geolocation not supported' })
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now()
        }
        set(state => ({
          location: loc,
          history: [...state.history.slice(-49), loc],
          error: null
        }))
      },
      (err) => set({ error: err.message }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
    set({ isTracking: true, watchId })
  },

  stopTracking: () => {
    const { watchId } = get()
    if (watchId) navigator.geolocation.clearWatch(watchId)
    set({ isTracking: false, watchId: null })
  },

  setLocation: (location) => set({ location }),
}))

export default useLocationStore
