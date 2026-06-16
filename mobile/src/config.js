const config = {
    api: {
        baseUrl: 'https://babylog.cz',
    },
}

if (import.meta.env.VITE_API_URL) {
    config.api.baseUrl = import.meta.env.VITE_API_URL
}

export const CONFIG = config
