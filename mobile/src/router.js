import { createRouter, createWebHistory } from '@ionic/vue-router'
import { hasAnyChild } from '@/database/queries'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Home from '@/views/Home.vue'
import OverView from '@/views/OverView.vue'
import ChildInitView from '@/views/ChildInitView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ChildrenSettingsView from '@/views/ChildrenSettingsView.vue'
import ChildAddView from '@/views/ChildAddView.vue'


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
				},
			{
				path: "settings",
				component: SettingsView,
				name: "Settings",
			},
			{
				path: "settings/children",
				component: ChildrenSettingsView,
				name: "ChildrenSettings",
			},
			{
				path: "settings/children/add",
				component: ChildAddView,
				name: "ChildAdd",
			},
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
	let childExists = false
	try {
		childExists = await hasAnyChild()
	} catch (err) {
		console.error('[router] hasAnyChild failed:', err)
		return { name: "ChildInit" }
	}

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
