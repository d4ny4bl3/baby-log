import { createRouter, createWebHistory } from '@ionic/vue-router'
import { hasAnyChild } from '@/database/queries'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Home from '@/views/Home.vue'
import OverView from '@/views/OverView.vue'

import SettingsView from '@/views/SettingsView.vue'
import ChildrenListView from '@/views/ChildrenListView.vue'
import ChildDetailView from '@/views/ChildDetailView.vue'
import ChildAddView from '@/views/ChildAddView.vue'
import ChildEditView from '@/views/ChildEditView.vue'
import AboutView from '@/views/AboutView.vue'
import AccountView from '@/views/AccountView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'


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
				component: ChildrenListView,
				name: "ChildrenList",
			},
			{
				path: "settings/children/:id",
			component: ChildDetailView,
			name: "ChildDetail",
		},
		{
			path: "settings/children/add",
			component: ChildAddView,
			name: "ChildAdd",
		},
		{
			path: "settings/children/:id/edit",
			component: ChildEditView,
			name: "ChildEdit",
		},
			{
				path: "settings/about",
				component: AboutView,
				name: "About",
			},
			{
				path: "settings/account",
				component: AccountView,
				name: "Account",
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
					component: OnboardingView,
					name: "ChildInit",
					meta: { title: "Nastavení dítěte" }
				},
				{
					path: "login",
					component: LoginView,
					name: "Login",
				},
				{
					path: "register",
					component: RegisterView,
					name: "Register",
				},
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

	const isLoginOrRegister = to.name === 'Login' || to.name === 'Register'

	if (childExists && isAuthRoute && !isLoginOrRegister) {
		return { name: "Home" }
	}

	return true
})

export default router
