import { createRouter, createWebHistory } from '@ionic/vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import Home from '@/views/Home.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			component: AppLayout,
			children: [
				{ path: "", redirect: { name: "Home" }},
				{
					path: "home",
					component: Home,
					name: "Home",
					meta: {
						title: "Přehled",
					}
				}
			]
		}
	],
})

export default router
