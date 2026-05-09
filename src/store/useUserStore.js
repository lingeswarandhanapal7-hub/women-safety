import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setToken: (token) => {
        localStorage.setItem('token', token)
        set({ token, isAuthenticated: true })
      },

      login: async (credentials) => {
        try {
          const { data } = await api.post('/api/auth/login', credentials)
          localStorage.setItem('token', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ user: data.user, token: data.accessToken, isAuthenticated: true })
          return { success: true, data }
        } catch (err) {
          // Fallback: allow entry even without backend (demo mode)
          const user = {
            name: credentials.name || credentials.email?.split('@')[0] || 'Shield User',
            email: credentials.email || '',
            id: 'demo'
          }
          set({ user, isAuthenticated: true })
          return { success: true, demo: true }
        }
      },

      register: async (credentials) => {
        try {
          const { data } = await api.post('/api/auth/register', credentials)
          localStorage.setItem('token', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ user: data.user, token: data.accessToken, isAuthenticated: true })
          return { success: true, data }
        } catch (err) {
          throw err
        }
      },

      logout: async () => {
        try { await api.post('/api/auth/logout') } catch {}
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/api/auth/me')
          set({ user: data.user })
        } catch {}
      },

      updateProfile: async (updates) => {
        const { data } = await api.patch('/api/auth/profile', updates)
        set({ user: data.user })
        return data
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'sheild-user-storage' }
  )
)

export default useUserStore
