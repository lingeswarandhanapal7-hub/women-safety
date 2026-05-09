import { create } from 'zustand'
import api from '../api'

const useAlertStore = create((set, get) => ({
  activeAlert: null,
  alertLevel: null,
  history: [],
  isTriggering: false,
  autoEscalateAt: null,

  triggerAlert: async (level, triggerType, location) => {
    set({ isTriggering: true })
    try {
      const { data } = await api.post('/api/alerts/trigger', {
        level,
        triggerType,
        lat: location?.lat,
        lng: location?.lng,
        address: location?.address
      })
      set({
        activeAlert: data.alert,
        alertLevel: level,
        autoEscalateAt: data.alert?.autoEscalateAt,
        isTriggering: false
      })
      return data
    } catch (err) {
      // Offline/demo fallback
      const fakeAlert = { _id: `demo-${Date.now()}`, level, triggerType, status: 'active' }
      set({ activeAlert: fakeAlert, alertLevel: level, isTriggering: false })
      return { alert: fakeAlert, notifiedCount: 0 }
    }
  },

  escalate: async () => {
    const { activeAlert } = get()
    if (!activeAlert) return
    try {
      const { data } = await api.post(`/api/alerts/escalate/${activeAlert._id}`)
      set({
        activeAlert: data.alert,
        alertLevel: data.alert.level,
        autoEscalateAt: data.alert.autoEscalateAt
      })
      return data
    } catch {
      const newLevel = Math.min(3, (get().alertLevel || 1) + 1)
      set({ alertLevel: newLevel })
    }
  },

  resolve: async () => {
    const { activeAlert } = get()
    if (!activeAlert) return
    try {
      await api.patch(`/api/alerts/resolve/${activeAlert._id}`)
    } catch {}
    set({ activeAlert: null, alertLevel: null, autoEscalateAt: null })
  },

  fetchActive: async () => {
    try {
      const { data } = await api.get('/api/alerts/active')
      if (data.alert) {
        set({ activeAlert: data.alert, alertLevel: data.alert.level, autoEscalateAt: data.alert.autoEscalateAt })
      }
    } catch {}
  },

  loadHistory: async () => {
    try {
      const { data } = await api.get('/api/alerts/history')
      set({ history: data.alerts || [] })
    } catch {}
  },

  addHistory: (event) => set(state => ({ history: [event, ...state.history] }))
}))

export default useAlertStore
