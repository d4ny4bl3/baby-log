<template>
	<IonPage class="settings-view">
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Nastavení</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent class="ion-padding">
			<div class="settings-section-label">Aplikace</div>

			<div class="settings-card">
				<div v-for="(row, i) in rows" :key="row.title" class="settings-row"
					:class="{ last: i === rows.length - 1 }" @click="router.push({ name: row.route })">
					<div class="settings-row-icon" :class="row.tone">
						<IonIcon :icon="row.icon" />
					</div>
					<div class="settings-row-text">
						<div class="settings-row-title">{{ row.title }}</div>
						<div class="settings-row-subtitle">{{ row.subtitle }}</div>
					</div>
					<div v-if="row.value" class="settings-row-value">{{ row.value }}</div>
					<IonIcon :icon="chevronForwardOutline" class="settings-row-chevron" />
				</div>
			</div>
		</IonContent>
	</IonPage>
</template>

<script setup>
import {
	IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
} from '@ionic/vue'
import {
	peopleOutline, syncOutline, heartOutline, chevronForwardOutline,
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { App } from '@capacitor/app'
import { useAuthStore } from '@/stores/authStore.js'

defineOptions({ name: 'Settings' })

const router = useRouter()
const authStore = useAuthStore()
const version = ref('…')

const rows = computed(() => [
	{ title: 'Děti', subtitle: 'Profily miminek', icon: peopleOutline, tone: 'lavender', route: 'ChildrenList' },
	{ title: 'Účet', subtitle: 'Záloha a synchronizace', icon: syncOutline, tone: 'mint', value: authStore.isLoggedIn ? 'Přihlášen' : 'Nepřihlášen', route: 'Account' },
	{ title: 'O aplikaci', subtitle: `Verze ${version.value}`, icon: heartOutline, tone: 'peach', route: 'About' },
])

onMounted(async () => {
	const info = await App.getInfo()
	version.value = info.version
})
</script>

<style scoped>
.settings-section-label {
	font-size: 0.82rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: #7b68b0;
	padding: 4px 6px 0;
	margin-top: 10px;
}

.settings-card {
	margin-top: 14px;
	border-radius: 18px;
	overflow: hidden;
	background: #fff;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.settings-row {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 14px 16px;
	border-bottom: 1px solid #f1eef7;
	cursor: pointer;
}

.settings-row:active {
	background: #faf8ff;
}

.settings-row.last {
	border-bottom: none;
}

.settings-row-icon {
	width: 42px;
	height: 42px;
	border-radius: 13px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22px;
}

.settings-row-icon.lavender {
	background: #f1ebfa;
	color: #8f7ac6;
}

.settings-row-icon.mint {
	background: #eaf6ea;
	color: #5f7f66;
}

.settings-row-icon.peach {
	background: #fcf6f0;
	color: #b17e31;
}

.settings-row-text {
	flex: 1;
	min-width: 0;
}

.settings-row-title {
	font-size: 1.05rem;
	font-weight: 700;
	color: #3a3a3a;
}

.settings-row-subtitle {
	font-size: 0.85rem;
	color: #666;
	margin-top: 1px;
}

.settings-row-value {
	font-size: 0.9rem;
	font-weight: 600;
	color: #888;
}

.settings-row-chevron {
	font-size: 18px;
	color: #c9bff0;
	margin-left: 2px;
}
</style>
