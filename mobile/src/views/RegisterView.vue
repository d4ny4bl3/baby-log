<template>
	<IonPage class="auth-view">
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Vytvořit účet</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div class="auth-container">
				<div class="form-group">
					<label>Jméno <span class="label-optional">(nepovinné)</span></label>
					<input v-model="name" type="text" autocomplete="name" />
				</div>

				<div class="form-group">
					<label>E-mail</label>
					<input v-model="email" type="email" inputmode="email" autocomplete="email" />
				</div>

				<div class="form-group">
					<label>Heslo</label>
					<input v-model="password" type="password" autocomplete="new-password" />
				</div>

				<div class="form-group">
					<label>Heslo znovu</label>
					<input v-model="passwordConfirm" type="password" autocomplete="new-password" />
				</div>

				<p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

				<IonButton expand="block" class="action-btn primary" :disabled="loading" @click="handleRegister">
					{{ loading ? 'Vytvářím účet…' : 'Vytvořit účet' }}
				</IonButton>

				<IonButton expand="block" fill="outline" class="secondary-btn" :router-link="{ name: 'Login' }">
					Mám účet — Přihlásit se
				</IonButton>
			</div>
		</IonContent>
	</IonPage>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import { useSyncStore } from '@/stores/syncStore.js'
import { hasAnyChild } from '@/database/queries'
import api from '@/api/axios.js'

defineOptions({ name: 'Register' })

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()
const authStore = useAuthStore()
const syncStore = useSyncStore()

async function handleRegister() {
	errorMessage.value = ''
	if (!email.value.trim() || !password.value || !passwordConfirm.value) {
		errorMessage.value = 'Vyplňte všechna pole.'
		return
	}
	if (password.value !== passwordConfirm.value) {
		errorMessage.value = 'Hesla se neshodují.'
		return
	}
	loading.value = true
	try {
		const nameParts = name.value.trim().split(' ')
		const { data } = await api.post('/api/v1/auth/register/', {
			email: email.value.trim(),
			password: password.value,
			first_name: nameParts[0] ?? '',
			last_name: nameParts.slice(1).join(' '),
		})
		await authStore.setTokens(data.access, data.refresh, email.value.trim())
		const childExists = await hasAnyChild()
		await router.replace(childExists ? { name: 'Home' } : { name: 'ChildInit' })
		syncStore.syncNow()
	} catch (e) {
		errorMessage.value = e.response?.data?.error ?? 'Registrace se nezdařila. Zkuste to znovu.'
	} finally {
		loading.value = false
	}
}
</script>
