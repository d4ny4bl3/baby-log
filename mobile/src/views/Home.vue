<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Baby Log</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent class="ion-padding-top">
			<IonGrid class="status_grid">
				<IonRow>
					<IonCol size="6">
						<IonCard class="status_card">
							<IonCardHeader>
								<IonCardTitle>Usnutí:</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="format_time">
									{{ formatTime(lastEvents.sleep) }}
								</div>
								<div class="format_relative_time">
									{{ formatRelativeTime(lastEvents.sleep) }}
								</div>
							</IonCardContent>
						</IonCard>
					</IonCol>

					<IonCol size="6">
						<IonCard class="status_card">
							<IonCardHeader>
								<IonCardTitle>Vstávání:</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="format_time">
									{{ formatTime(lastEvents.awake) }}
								</div>
								<div class="format_relative_time">
									{{ formatRelativeTime(lastEvents.awake) }}
								</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>

				<IonRow>
					<IonCol size="6">
						<IonCard class="status_card">
							<IonCardHeader>
								<IonCardTitle>Krmení:</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="format_time">
									{{ formatTime(lastEvents.eat) }}
								</div>
								<div class="format_relative_time">
									{{ formatRelativeTime(lastEvents.eat) }}
								</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
					<IonCol size="6">
						<IonCard class="status_card">
							<IonCardHeader>
								<IonCardTitle>Přebalení:</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="format_time">
									{{ formatTime(lastEvents.diaper) }}
								</div>
								<div class="format_relative_time">
									{{ formatRelativeTime(lastEvents.diaper) }}
								</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>
			</IonGrid>

			<!-- Buttons -->
			 <IonGrid class="button_grid">
				<IonRow>
					<IonCol size="6">
						<IonButton
							expand="block"
							class="action_btn sleep"
							@click="openAlert('sleep')"
						>
							Usnutí
						</IonButton>
					</IonCol>

					<IonCol size="6">
						<IonButton
							expand="block"
							class="action_btn awake"
							@click="openAlert('awake')"
						>
							Vstávání
						</IonButton>
					</IonCol>
				</IonRow>

				<IonRow>
					<IonCol size="6">
						<IonButton
							expand="block"
							class="action_btn eat"
							@click="openAlert('eat')"
						>
							Krmení
						</IonButton>
					</IonCol>

					<IonCol size="6">
						<IonButton
							expand="block"
							class="action_btn diaper"
							@click="openAlert('diaper')"
						>
							Přebalení
						</IonButton>
					</IonCol>
				</IonRow>
			 </IonGrid>

			 <pre style="font-size: 12px; white-space: pre-wrap;">
				{{ JSON.stringify(allEvents, null, 2) }}
			</pre>

			 <IonAlert
			 	:key="alertType"
			 	:is-open="showAlert"
				:header="alertHeader"
				:inputs="alertInputs"
				:buttons="alertButtons"
				@didDismiss="showAlert = false"
			/>

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
	IonGrid,
	IonRow,
	IonCol,
	IonCard,
	IonCardHeader,
	IonCardTitle,
	IonCardContent,
	IonButton,
	IonAlert,
} from '@ionic/vue'

import { ref, computed, onMounted, onUnmounted } from 'vue';

import { initSQLite } from '@/db/sqlite';
import { addEvent, getLastEventByType, getAllEvents } from '@/db/events';
import { formatTime, formatRelativeTime } from '@/utils/time';

defineOptions({
	name: "Home"
})

const showAlert = ref(false)
const alertType = ref(null)
const allEvents = ref([])
let refreshInterval = null
const lastEvents = ref({
	diaper: null,
	awake: null,
	sleep: null,
	eat: null,
})

onMounted(async () => {
	await initSQLite()
	await loadAllEvents()
	await refreshLastEvents()

	refreshInterval = setInterval(() => {
		refreshLastEvents()
	}, 60_000)
})

onUnmounted(() => {
	if (refreshInterval) {
		clearInterval(refreshInterval)
		refreshInterval = null
	}
})

const loadAllEvents = async () => {
	allEvents.value = await getAllEvents()
}

const loadLastEvent = async (type) => {
	lastEvents.value[type] = await getLastEventByType(type)
}

const refreshLastEvents = async () => {
	await loadLastEvent("diaper")
	await loadLastEvent("awake")
	await loadLastEvent("sleep")
	await loadLastEvent("eat")
}

const alertHeader = computed(() => {
	switch (alertType.value) {
		case "sleep": return "Usnutí"
		case "awake": return "Vstávání"
		case "eat": return "Krmení (ml)"
		case "diaper": return "Přebalení"
		default: return ""
	}
})

const alertInputs = computed(() => {
	const now = new Date().toLocaleTimeString("cs-CZ", {
		hour: "2-digit",
		minute: "2-digit"
	})


	switch (alertType.value) {
		case "sleep":
		case "awake":
			return [
				{ name: "time", type: "time", value: now }
			]

		case "eat":
			return [
				{ name: "time", type: "time", value: now },
				{ name: "amount", type: "number", value: 150, placeholder: "ml", min: 0 }
			]

		case "diaper":
			return [
				{ name: "time", type: "time", value: now }
			]

		default:
			return []
	}
})

const alertButtons = computed(() => [
	{ text: "Zrušit", role: "cancel" },
	{
		text: "OK",
		handler: async (data) => {
			switch (alertType.value) {
				case "eat":
					await addEvent({
						type: "eat",
						start_ts: parseTime(data.time),
						amount: Number(data.amount)
					})
					await loadLastEvent("eat")
					break

				case "awake":
					await addEvent({
						type: "awake",
						start_ts: parseTime(data.time)
					})
					await loadLastEvent("awake")
					break

				case "sleep":
					await addEvent({
						type: "sleep",
						start_ts: parseTime(data.time)
					})
					await loadLastEvent("sleep")
					break

				case "diaper":
					await addEvent({
						type: "diaper",
						start_ts: parseTime(data.time)
					})
					await loadLastEvent("diaper")
					break
			}

			showAlert.value = false
		}
	}
])

const openAlert = (type) => {
	alertType.value = type
	showAlert.value = true
}

const parseTime = (time) => {
	const [h, m] = time.split(":").map(Number)
	const d = new Date()
	d.setHours(h, m, 0, 0)
	return d.getTime()
}
</script>