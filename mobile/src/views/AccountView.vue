<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Účet</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent class="ion-padding">

			<!-- Nepřihlášený stav -->
			<div v-if="!isLoggedIn" class="account-guest">
				<div class="account-guest-icon">☁️</div>
				<h2 class="account-guest-title">Synchronizace dat</h2>
				<p class="account-guest-text">
					Aplikace funguje plně offline. Pokud chcete svá data zálohovat nebo
					sdílet s partnerem, vytvořte si účet.
				</p>
				<IonButton expand="block" class="account-guest-btn" :router-link="{ name: 'AccountLogin' }">
					Přihlásit se
				</IonButton>
				<IonButton expand="block" fill="outline" :router-link="{ name: 'AccountRegister' }">
					Vytvořit účet
				</IonButton>
			</div>

			<!-- Přihlášený stav -->
			<template v-else>
				<IonList inset class="account-list">
					<IonItem>
						<IonLabel>
							<p class="account-item-label">E-mail</p>
							<p class="account-item-value">{{ user.email }}</p>
						</IonLabel>
					</IonItem>
					<IonItem>
						<IonLabel>
							<p class="account-item-label">Účet vytvořen</p>
							<p class="account-item-value">{{ user.createdAt }}</p>
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
							<p class="account-item-value">{{ pendingCount }}</p>
						</IonLabel>
					</IonItem>
				</IonList>

				<IonButton expand="block" class="account-sync-btn" :disabled="syncing" @click="syncNow">
					{{ syncing ? 'Synchronizuji…' : 'Synchronizovat nyní' }}
				</IonButton>

				<IonButton expand="block" fill="outline" color="danger" class="account-logout-btn" @click="logout">
					Odhlásit se
				</IonButton>
			</template>

		</IonContent>
	</IonPage>
</template>

<script setup>
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonList,
	IonItem,
	IonLabel,
	IonButton,
} from "@ionic/vue";
import { ref, computed, onMounted } from "vue";
import { getAppMetadataValue } from "@/database/queries/appMetadata";

defineOptions({ name: "Account" });

const isLoggedIn = ref(false);
const syncing = ref(false);
const user = ref({ email: "", createdAt: "" });
const lastSyncAt = ref(null);
const pendingCount = ref(0);

const lastSyncLabel = computed(() => {
	if (!lastSyncAt.value) return "Nikdy";
	const d = new Date(Number(lastSyncAt.value));
	return d.toLocaleString("cs-CZ", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
});

const syncStatusLabel = computed(() => {
	if (pendingCount.value > 0) return `${pendingCount.value} záznamů čeká na odeslání`;
	return "Vše synchronizováno";
});

onMounted(async () => {
	const token = await getAppMetadataValue("auth_token");
	const email = await getAppMetadataValue("auth_email");
	const createdAt = await getAppMetadataValue("auth_created_at");
	const lastSync = await getAppMetadataValue("last_sync_at");

	if (token) {
		isLoggedIn.value = true;
		user.value = { email: email ?? "", createdAt: createdAt ?? "" };
		lastSyncAt.value = lastSync;
	}
	// pendingCount se doplní až bude sync service
});

async function syncNow() {
	syncing.value = true;
	// TODO: zavolat sync service
	syncing.value = false;
}

async function logout() {
	// TODO: vymazat token z app_metadata, reset stavu
	isLoggedIn.value = false;
}
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

.account-logout-btn {
	margin: 0 16px;
}
</style>
