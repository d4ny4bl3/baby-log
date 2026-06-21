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
				<div class="account-guest-icon">
					<IonIcon :icon="syncOutline" />
				</div>
				<h2 class="account-guest-title">Synchronizace dat</h2>
				<p class="account-guest-text">
					Aplikace funguje plně offline. Když si vytvoříte účet, můžete data
					zálohovat a sdílet s partnerem.
				</p>

				<div class="account-features">
					<div v-for="f in features" :key="f.title" class="account-feature">
						<div class="account-feature-icon">
							<IonIcon :icon="f.icon" />
						</div>
						<div>
							<div class="account-feature-title">{{ f.title }}</div>
							<div class="account-feature-text">{{ f.text }}</div>
						</div>
					</div>
				</div>

				<IonButton expand="block" class="account-btn primary" :router-link="{ name: 'Login' }">
					Přihlásit se
				</IonButton>
				<IonButton expand="block" class="account-btn soft" :router-link="{ name: 'Register' }">
					Vytvořit účet
				</IonButton>

				<p class="account-guest-note">
					Bez účtu aplikace funguje normálně — účet slouží jen k záloze a sdílení.
				</p>
			</div>

			<!-- Přihlášený stav -->
			<template v-else>
				<div class="account-profile">
					<div class="account-avatar">{{ initials }}</div>
					<div class="account-profile-info">
						<div class="account-profile-name">{{ displayName }}</div>
						<div class="account-profile-email">{{ authStore.user?.email }}</div>
					</div>
				</div>

				<div class="account-hero" :class="hero.tone">
					<div class="account-hero-label">Stav synchronizace</div>
					<div class="account-hero-icon" :class="{ spin: hero.tone === 'busy' }">
						<IonIcon :icon="hero.icon" />
					</div>
					<div class="account-hero-title">{{ hero.title }}</div>
					<div class="account-hero-sub">{{ hero.sub }}</div>
				</div>

				<IonButton expand="block" class="account-btn primary" :disabled="syncStore.isSyncing" @click="syncStore.syncNow()">
					{{ syncStore.isSyncing ? 'Synchronizuji…' : 'Synchronizovat nyní' }}
				</IonButton>
				<p v-if="syncStore.syncError" class="account-sync-error">{{ syncStore.syncError }}</p>

				<div class="account-rows">
					<div class="account-row">
						<IonIcon :icon="mailOutline" class="account-row-icon" />
						<div class="account-row-label">E-mail</div>
						<div class="account-row-value">{{ authStore.user?.email }}</div>
					</div>
					<div class="account-row">
						<IonIcon :icon="cloudUploadOutline" class="account-row-icon" />
						<div class="account-row-label">Čekající záznamy</div>
						<div class="account-row-value">{{ syncStore.pendingCount }}</div>
					</div>
					<div class="account-row">
						<IonIcon :icon="syncOutline" class="account-row-icon" />
						<div class="account-row-label">Poslední synchronizace</div>
						<div class="account-row-value">{{ lastSyncLabel }}</div>
					</div>
				</div>

				<IonButton expand="block" fill="outline" color="danger" class="account-logout-btn" @click="authStore.logout()">
					<IonIcon :icon="logOutOutline" slot="start" />
					Odhlásit se
				</IonButton>
			</template>

		</IonContent>
	</IonPage>
</template>

<script setup>
import {
	IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
	IonButton, IonIcon,
} from '@ionic/vue'
import {
	syncOutline, cloudUploadOutline, shieldCheckmarkOutline,
	mailOutline, logOutOutline, checkmarkOutline,
} from 'ionicons/icons'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import { useSyncStore } from '@/stores/syncStore.js'

defineOptions({ name: 'Account' })

const authStore = useAuthStore()
const syncStore = useSyncStore()

const features = [
	{ icon: shieldCheckmarkOutline, title: 'Soukromě', text: 'Data zůstávají u vás, dokud je nezálohujete.' },
	{ icon: cloudUploadOutline, title: 'Záloha v bezpečí', text: 'Při výměně telefonu o nic nepřijdete.' },
]

const displayName = computed(() => {
	const name = authStore.user?.name
	return name && name !== authStore.user?.email ? name : authStore.user?.email
})

const initials = computed(() => {
	const source = displayName.value ?? ''
	const parts = source.trim().split(/\s+/).filter(Boolean)
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
	return source.slice(0, 2).toUpperCase()
})

const lastSyncLabel = computed(() => {
	if (!syncStore.lastSyncAt) return 'Nikdy'
	return new Date(syncStore.lastSyncAt).toLocaleString('cs-CZ', {
		day: '2-digit', month: '2-digit', year: 'numeric',
		hour: '2-digit', minute: '2-digit',
	})
})

function pluralRecords(n) {
	if (n === 1) return '1 záznam čeká'
	if (n >= 2 && n <= 4) return `${n} záznamy čekají`
	return `${n} záznamů čeká`
}

const hero = computed(() => {
	if (syncStore.isSyncing) {
		return { tone: 'busy', icon: syncOutline, title: 'Synchronizuji…', sub: 'Odesílám záznamy' }
	}
	if (syncStore.pendingCount > 0) {
		return {
			tone: 'pending', icon: cloudUploadOutline,
			title: pluralRecords(syncStore.pendingCount),
			sub: 'Odešle se při příští synchronizaci',
		}
	}
	return {
		tone: 'ok', icon: checkmarkOutline, title: 'Vše synchronizováno',
		sub: `Naposledy ${lastSyncLabel.value}`,
	}
})

onMounted(() => syncStore.refreshPendingCount())
</script>

<style scoped>
/* Guest */
.account-guest {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 18px 8px 0;
	text-align: center;
}

.account-guest-icon {
	width: 104px;
	height: 104px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ede9fe, #e0e7ff);
	color: #7b68b0;
	font-size: 46px;
	box-shadow: inset 0 0 0 1px rgba(155, 135, 198, 0.25);
}

.account-guest-title {
	font-size: 1.4rem;
	font-weight: 700;
	color: #3d3050;
	margin: 22px 0 10px;
}

.account-guest-text {
	font-size: 1rem;
	line-height: 1.6;
	color: #666;
	max-width: 300px;
	margin: 0 0 22px;
}

.account-features {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 24px;
}

.account-feature {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 14px;
	border-radius: 14px;
	text-align: left;
	background: #faf8ff;
	border: 1px solid #ede9fe;
}

.account-feature-icon {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	color: #8f7ac6;
	font-size: 22px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.account-feature-title {
	font-size: 0.98rem;
	font-weight: 700;
	color: #3d3050;
}

.account-feature-text {
	font-size: 0.85rem;
	line-height: 1.45;
	color: #666;
}

.account-guest-note {
	font-size: 0.82rem;
	line-height: 1.5;
	color: #888;
	max-width: 280px;
	margin: 20px 0 0;
}

/* Profile */
.account-profile {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 16px;
	border-radius: 18px;
	background: #fff;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.account-avatar {
	width: 54px;
	height: 54px;
	border-radius: 50%;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #9fd3b6, #67b18c);
	color: #fff;
	font-weight: 700;
	font-size: 1.25rem;
	box-shadow: 0 4px 16px rgba(103, 177, 140, 0.4);
}

.account-profile-info {
	flex: 1;
	min-width: 0;
}

.account-profile-name {
	font-size: 1.15rem;
	font-weight: 700;
	color: #3d3050;
}

.account-profile-email {
	font-size: 0.9rem;
	color: #666;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* Sync hero */
.account-hero {
	margin-top: 14px;
	padding: 18px 16px;
	border-radius: 18px;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.account-hero.ok {
	background: linear-gradient(135deg, #eaf6ea, #d7ecd7);
}

.account-hero.busy,
.account-hero.pending {
	background: linear-gradient(135deg, #ede9fe, #e0e7ff);
}

.account-hero-label {
	font-size: 0.78rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	margin-bottom: 10px;
	color: #7b68b0;
}

.account-hero.ok .account-hero-label {
	color: #4a7c62;
}

.account-hero-icon {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	font-size: 30px;
	color: #7b68b0;
	box-shadow: inset 0 0 0 1px #e4ddf5;
}

.account-hero.ok .account-hero-icon {
	color: #5f7f66;
	box-shadow: inset 0 0 0 1px #cfe7d6;
}

.account-hero-icon.spin {
	animation: account-spin 1.1s linear infinite;
}

@keyframes account-spin {
	to {
		transform: rotate(360deg);
	}
}

.account-hero-title {
	font-size: 1.4rem;
	font-weight: 700;
	margin-top: 12px;
	color: #5d4a7f;
}

.account-hero.ok .account-hero-title {
	color: #5f7f66;
}

.account-hero-sub {
	font-size: 0.9rem;
	margin-top: 2px;
	opacity: 0.85;
	color: #7b68b0;
}

.account-hero.ok .account-hero-sub {
	color: #4a7c62;
}

/* Detail rows */
.account-rows {
	margin-top: 14px;
	border-radius: 18px;
	overflow: hidden;
	background: #fff;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.account-row {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 14px 16px;
	border-bottom: 1px solid #f1eef7;
}

.account-row:last-child {
	border-bottom: none;
}

.account-row-icon {
	font-size: 19px;
	color: #9b87c6;
}

.account-row-label {
	flex: 1;
	font-size: 0.98rem;
	font-weight: 500;
	color: #3a3a3a;
}

.account-row-value {
	font-size: 0.95rem;
	font-weight: 700;
	color: #5d4a7f;
}

/* Buttons */
.account-btn {
	margin-top: 12px;
	--border-radius: 32px;
	height: 56px;
	font-weight: 600;
	letter-spacing: 0.03em;
}

.account-btn.primary {
	--background: linear-gradient(135deg, #9fd3b6, #67b18c);
	--background-activated: linear-gradient(135deg, #9fd3b6, #67b18c);
	--color: #fff;
	--box-shadow: 0 4px 16px rgba(103, 177, 140, 0.4);
}

.account-btn.soft {
	--background: #f1ebfa;
	--background-activated: #e4ddf5;
	--color: #5d4a7f;
	--box-shadow: none;
}

.account-sync-error {
	text-align: center;
	font-size: 0.85rem;
	color: var(--ion-color-danger);
	margin: 8px 16px 0;
}

.account-logout-btn {
	margin-top: 16px;
}
</style>
