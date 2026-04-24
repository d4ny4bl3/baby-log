import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Preferences } from '@capacitor/preferences'
import api from '@/api/axios.js'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null)
    const user = ref(null)

    const isLoggedIn = computed(() => !!token.value)

    async function loadToken() {
        const { value } = await Preferences.get({ key: 'auth_token' })
        if (value) {
            token.value = value
            api.defaults.headers.common['Authorization'] = `Bearer ${value}`
        }
    }

    async function login(email, password) {
        const { data } = await api.post('/api/v1/auth/token/', { username: email, password })
        token.value = data.access
        user.value = { email }
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
        await Preferences.set({ key: 'auth_token', value: data.access })
        await Preferences.set({ key: 'auth_refresh', value: data.refresh })
    }

    async function logout() {
        const { value: refresh } = await Preferences.get({ key: 'auth_refresh' })
        if (refresh) {
            try { await api.post('/api/v1/auth/logout/', { refresh }) } catch {}
        }
        token.value = null
        user.value = null
        delete api.defaults.headers.common['Authorization']
        await Preferences.remove({ key: 'auth_token' })
        await Preferences.remove({ key: 'auth_refresh' })
    }

    return { token, user, isLoggedIn, loadToken, login, logout }
})
