import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

const useSettingsStore = create(
  persist(
    (set, get) => ({
      contacts: [],
      biometricsEnabled: false,
      gpsLogging: true,
      demoMode: false,

      addContact: async (contact) => {
        const newContact = { ...contact, id: Date.now().toString(), notifyOnLevel: 1 }
        const updatedContacts = [...get().contacts, newContact]
        set({ contacts: updatedContacts })
        // Sync to backend if authenticated
        try {
          await api.patch('/api/auth/profile', { trustedContacts: updatedContacts })
        } catch {}
      },

      removeContact: async (id) => {
        const updatedContacts = get().contacts.filter(c => c.id !== id)
        set({ contacts: updatedContacts })
        try {
          await api.patch('/api/auth/profile', { trustedContacts: updatedContacts })
        } catch {}
      },

      setBiometrics: (val) => set({ biometricsEnabled: val }),
      setGpsLogging: (val) => set({ gpsLogging: val }),
      setDemoMode: (val) => set({ demoMode: val }),

      syncFromBackend: async () => {
        try {
          const { data } = await api.get('/api/auth/me')
          if (data.user?.trustedContacts) {
            set({ contacts: data.user.trustedContacts.map((c, i) => ({ ...c, id: c._id || String(i) })) })
          }
        } catch {}
      }
    }),
    { name: 'sheild-settings-storage' }
  )
)

export default useSettingsStore
