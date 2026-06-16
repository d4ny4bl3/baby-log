<template>
	<IonPage class="auth-view">
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonButtons slot="start">
					<IonBackButton default-href="/" />
				</IonButtons>
				<IonTitle class="ion-text-center">Přihlášení</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div class="auth-container">
				<div class="form-group">
					<label>E-mail</label>
					<input v-model="email" type="email" inputmode="email" autocomplete="email" />
				</div>

				<div class="form-group">
					<label>Heslo</label>
					<input v-model="password" type="password" autocomplete="current-password" />
				</div>

				<p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

				<IonButton expand="block" class="action-btn primary" :disabled="loading" @click="handleLogin">
					{{ loading ? 'Přihlašuji…' : 'Přihlásit se' }}
				</IonButton>

				<IonButton expand="block" fill="outline" class="secondary-btn" :router-link="{ name: 'Register' }">
					Nemám účet — Vytvořit účet
				</IonButton>
			</div>
		</IonContent>
	</IonPage>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import { useSyncStore } from '@/stores/syncStore.js'
import { hasAnyChild } from '@/database/queries'

defineOptions({ name: 'Login' })

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()
const authStore = useAuthStore()
const syncStore = useSyncStore()

async function handleLogin() {
	errorMessage.value = ''
	if (!email.value.trim() || !password.value) {
		errorMessage.value = 'Vyplňte e-mail a heslo.'
		return
	}
	loading.value = true
	try {
		await authStore.login(email.value.trim(), password.value)
		await syncStore.syncNow()
		const childExists = await hasAnyChild()
		await router.replace(childExists ? { name: 'Home' } : { name: 'ChildInit' })
	} catch (e) {
		errorMessage.value = e.response?.status === 401
			? 'Nesprávný e-mail nebo heslo.'
			: 'Přihlášení se nezdařilo. Zkuste to znovu.'
	} finally {
		loading.value = false
	}
}
</script>
