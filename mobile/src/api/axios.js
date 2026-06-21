import axios from 'axios'
import { Preferences } from '@capacitor/preferences'
import { CONFIG } from '@/config.js'

const api = axios.create({
    baseURL: CONFIG.api.baseUrl,
    timeout: 5000,
})

let refreshPromise = null

async function refreshAccessToken() {
    const { value: refresh } = await Preferences.get({ key: 'auth_refresh' })
    if (!refresh) throw new Error()
    const { data } = await axios.post(`${CONFIG.api.baseUrl}/api/v1/auth/token/refresh/`, { refresh })
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
    await Preferences.set({ key: 'auth_token', value: data.access })
    if (data.refresh) await Preferences.set({ key: 'auth_refresh', value: data.refresh })
    return data.access
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            try {
                if (!refreshPromise) {
                    refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null })
                }
                const access = await refreshPromise
                original.headers['Authorization'] = `Bearer ${access}`
                return api(original)
            } catch {
                const { useAuthStore } = await import('@/stores/authStore.js')
                useAuthStore().logout()
            }
        }
        return Promise.reject(error)
    }
)

export default api
