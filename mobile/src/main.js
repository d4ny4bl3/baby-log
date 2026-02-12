import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'

import { initDatabase } from '@/db'

import App from './App.vue'
import router from './router'
// import './style.css'
import "@/assets/scss/main.scss";

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

async function bootstrap() {
    await initDatabase()

    const app = createApp(App)

    app.use(IonicVue)
    app.use(createPinia())
    app.use(router)

    await router.isReady()
    app.mount("#app")
}

bootstrap()
