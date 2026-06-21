<template>
	<IonPage class="auth-view">
		<IonHeader>
			<IonToolbar class="header_primary">
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

		<Teleport to="body">
			<Transition name="sync-overlay">
				<div v-if="loading" class="sync-overlay">
					<div class="sync-overlay__card">
						<IonSpinner name="crescent" class="sync-overlay__spinner" />
						<p class="sync-overlay__title">Váš účet se synchronizuje</p>
						<p class="sync-overlay__subtitle">Chvíli strpení, načítáme vaše data</p>
					</div>
				</div>
			</Transition>
		</Teleport>
	</IonPage>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner } from '@ionic/vue'
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

<style scoped>
.sync-overlay {
	position: fixed;
	inset: 0;
	z-index: 99999;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(15, 23, 42, 0.45);
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(4px);
}

.sync-overlay__card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 14px;
	max-width: 280px;
	padding: 32px 28px;
	border-radius: 20px;
	text-align: center;
	background: var(--ion-background-color, #fff);
	box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
}

.sync-overlay__spinner {
	width: 46px;
	height: 46px;
	margin-bottom: 4px;
	--color: var(--ion-color-primary);
}

.sync-overlay__title {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--ion-text-color, #1a1a1a);
}

.sync-overlay__subtitle {
	margin: 0;
	font-size: 13.5px;
	line-height: 1.4;
	color: var(--ion-color-medium, #6b7280);
}

.sync-overlay-enter-active,
.sync-overlay-leave-active {
	transition: opacity 0.25s ease;
}

.sync-overlay-enter-from,
.sync-overlay-leave-to {
	opacity: 0;
}

.sync-overlay-enter-active .sync-overlay__card {
	animation: sync-overlay-pop 0.28s ease;
}

@keyframes sync-overlay-pop {
	from {
		transform: scale(0.92);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}
</style>
