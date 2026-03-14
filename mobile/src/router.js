import { createRouter, createWebHistory } from '@ionic/vue-router'
import { hasAnyChild } from '@/database/queries'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Home from '@/views/Home.vue'
import OverView from '@/views/OverView.vue'
import ChildInitView from '@/views/ChildInitView.vue'


const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			redirect: "/app/home",
		},
		{
			path: "/app",
			component: AppLayout,
			children: [
				{ path: "", redirect: { name: "Home" }},
				{
					path: "home",
					component: Home,
					name: "Home",
					meta: {
						title: "Přehled",
						requiresChild: true,
					}
				},
				{
					path: "overview",
					component: OverView,
					name: "Overview",
					meta: {
						title: "Denní přehled",
						requiresChild: true,
					}
				}
			]
		},
		{
			path: "/auth",
			component: AuthLayout,
			children: [
				{
					path: "",
					redirect: { name: "ChildInit" },
				},
				{
					path: "child-init",
					component: ChildInitView,
					name: "ChildInit",
					meta: {
						title: "Nastavení dítěte",
					}
				}
			]
		}
	],
})

router.beforeEach(async (to) => {
	const childExists = await hasAnyChild()
	const isAuthRoute = to.path.startsWith("/auth")
	const requiresChild = Boolean(to.meta?.requiresChild)

	if (!childExists && requiresChild) {
		return { name: "ChildInit" }
	}

	if (childExists && isAuthRoute) {
		return { name: "Home" }
	}

	return true
})

export default router
