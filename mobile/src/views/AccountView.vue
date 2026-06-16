<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Účet</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent class="ion-padding">

			<!-- Nepřihlášený stav -->
			<div v-if="!authStore.isLoggedIn" class="account-guest">
				<div class="account-guest-icon">☁️</div>
				<h2 class="account-guest-title">Synchronizace dat</h2>
				<p class="account-guest-text">
					Aplikace funguje plně offline. Pokud chcete svá data zálohovat nebo
					sdílet s partnerem, vytvořte si účet.
				</p>
				<IonButton expand="block" class="account-guest-btn" :router-link="{ name: 'Login' }">
					Přihlásit se
				</IonButton>
				<IonButton expand="block" fill="outline" :router-link="{ name: 'Register' }">
					Vytvořit účet
				</IonButton>
			</div>

			<!-- Přihlášený stav -->
			<template v-else>
				<IonList inset class="account-list">
					<IonItem v-if="authStore.user?.name && authStore.user.name !== authStore.user.email">
						<IonLabel>
							<p class="account-item-label">Jméno</p>
							<p class="account-item-value">{{ authStore.user.name }}</p>
						</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel>
							<p class="account-item-label">E-mail</p>
							<p class="account-item-value">{{ authStore.user?.email }}</p>
						</IonLabel>
					</IonItem>
				</IonList>

				<IonList inset class="account-list">
					<IonItem>
						<IonLabel>
							<p class="account-item-label">Stav synchronizace</p>
							<p class="account-item-value">{{ syncStatusLabel }}</p>
						</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel>
							<p class="account-item-label">Poslední synchronizace</p>
							<p class="account-item-value">{{ lastSyncLabel }}</p>
						</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel>
							<p class="account-item-label">Čekající záznamy</p>
							<p class="account-item-value">{{ syncStore.pendingCount }}</p>
						</IonLabel>
					</IonItem>
				</IonList>

				<IonButton expand="block" class="account-sync-btn" :disabled="syncStore.isSyncing" @click="syncStore.syncNow()">
					{{ syncStore.isSyncing ? 'Synchronizuji…' : 'Synchronizovat nyní' }}
				</IonButton>
				<p v-if="syncStore.syncError" class="account-sync-error">{{ syncStore.syncError }}</p>

				<IonButton expand="block" fill="outline" color="danger" class="account-logout-btn" @click="authStore.logout()">
					Odhlásit se
				</IonButton>
			</template>

		</IonContent>
	</IonPage>
</template>

<script setup>
import {
	IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
	IonList, IonItem, IonLabel, IonButton,
} from '@ionic/vue'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import { useSyncStore } from '@/stores/syncStore.js'

defineOptions({ name: 'Account' })

const authStore = useAuthStore()
const syncStore = useSyncStore()

const lastSyncLabel = computed(() => {
	if (!syncStore.lastSyncAt) return 'Nikdy'
	return new Date(syncStore.lastSyncAt).toLocaleString('cs-CZ', {
		day: '2-digit', month: '2-digit', year: 'numeric',
		hour: '2-digit', minute: '2-digit',
	})
})

const syncStatusLabel = computed(() =>
	syncStore.pendingCount > 0
		? `${syncStore.pendingCount} záznamů čeká na odeslání`
		: 'Vše synchronizováno'
)

onMounted(() => syncStore.refreshPendingCount())
</script>

<style scoped>
.account-guest {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40px 8px 0;
	text-align: center;
}

.account-guest-icon {
	font-size: 56px;
	margin-bottom: 16px;
}

.account-guest-title {
	font-size: 1.4rem;
	font-weight: 700;
	margin: 0 0 12px;
}

.account-guest-text {
	font-size: 0.95rem;
	color: #555;
	line-height: 1.6;
	margin-bottom: 28px;
}

.account-guest-btn {
	margin-bottom: 12px;
}

.account-list {
	margin-top: 24px;
}

.account-item-label {
	font-size: 0.8rem;
	color: #888;
	margin-bottom: 2px;
}

.account-item-value {
	font-size: 1rem;
	font-weight: 500;
	color: #1a1a1a;
}

.account-sync-btn {
	margin: 24px 16px 12px;
}

.account-sync-error {
	text-align: center;
	font-size: 0.85rem;
	color: var(--ion-color-danger);
	margin: 0 16px 8px;
}

.account-logout-btn {
	margin: 0 16px;
}
</style>
