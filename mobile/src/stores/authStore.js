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
            const { value: userData } = await Preferences.get({ key: 'auth_user' })
            if (userData) user.value = JSON.parse(userData)
            else await fetchAndStoreUser()
        }
    }

    async function fetchAndStoreUser(fallbackEmail = null) {
        try {
            const { data } = await api.get('/api/v1/auth/user/')
            user.value = data
            await Preferences.set({ key: 'auth_user', value: JSON.stringify(data) })
        } catch {
            if (fallbackEmail) {
                user.value = { email: fallbackEmail }
                await Preferences.set({ key: 'auth_user', value: JSON.stringify({ email: fallbackEmail }) })
            }
        }
    }

    async function setTokens(access, refresh, email) {
        token.value = access
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`
        await Preferences.set({ key: 'auth_token', value: access })
        await Preferences.set({ key: 'auth_refresh', value: refresh })
        await fetchAndStoreUser(email)
    }

    async function login(email, password) {
        const { data } = await api.post('/api/v1/auth/token/', { username: email, password })
        await setTokens(data.access, data.refresh, email)
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
        await Preferences.remove({ key: 'auth_user' })
    }

    return { token, user, isLoggedIn, loadToken, setTokens, login, logout }
})
