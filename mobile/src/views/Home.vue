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
					<IonCol size="12">
						<IonCard
							class="card-sleep"
							:class="`card-sleep--${sleepState.status}`"
						>
							<IonCardHeader>
								<IonCardTitle>{{ sleepTitle }}</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<template v-if="sleepState.status === 'empty'">
									Žádný záznam
								</template>

								<template v-else-if="sleepState.status === 'sleeping'">
									<div class="format_relative_time">
										{{ formatRelativeTime(sleepState.at) }}
									</div>
									<div class="format_time">
										usnutí v {{ formatTime(sleepState.at) }}
									</div>
								</template>

								<template v-else>
									<div class="format_relative_time">
										{{ formatRelativeTime(sleepState.at) }}
									</div>
									<div class="format_time">
										vstávání v {{ formatTime(sleepState.at) }}
									</div>
								</template>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>

				<IonRow>
					<IonCol size="6">
						<IonCard class="card-summary">
							<IonCardHeader>
								<IonCardTitle>Krmení</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="format_time">
									{{ formatTime(lastEvents.eat) }}
								</div>
								<div class="format_relative_time">
									před <span class="time-strong">
										{{ formatRelativeTime(lastEvents.eat, now) }}
									</span>
								</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
					<IonCol size="6">
						<IonCard class="card-summary">
							<IonCardHeader>
								<IonCardTitle>Přebalení</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="format_time">
									{{ formatTime(lastEvents.diaper) }}
								</div>
								<div class="format_relative_time">
									před <span class="time-strong">
										{{ formatRelativeTime(lastEvents.diaper, now) }}
									</span>
								</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>
			</IonGrid>

			<!-- Buttons -->
			 <IonGrid>
				<IonRow>
					<IonCol size="12">
						<IonCard class="card-actions">
							<IonCardContent>
								<IonButton
									expand="block"
									class="action-btn"
									:class="actionButtonClass"
									@click="handleSleepAction"
								>
									{{ actionButtonLabel }}
								</IonButton>

								<IonRow class="secondary-actions">
									<IonCol size="6">
										<IonButton
											expand="block"
											class="action-btn eat"
											@click="openAlert('eat')"
										>
											Krmení
										</IonButton>
									</IonCol>

									<IonCol size="6">
										<IonButton
											expand="block"
											class="action-btn diaper"
											@click="openAlert('diaper')"
										>
											Přebalení
										</IonButton>
									</IonCol>
								</IonRow>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>
			 </IonGrid>

			 <!-- <pre style="font-size: 12px; white-space: pre-wrap;">
				{{ JSON.stringify(allEvents, null, 2) }}
			</pre> -->

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
import { createTables } from '@/db/schema';
import { formatTime, formatRelativeTime } from '@/utils/time';
import { getSleepState } from '@/utils/sleepState';
import {
	addEvent,
	clearEvents,
	getLastEventByType,
	getAllEvents,
	startSleep,
	endSleep,
	getLastSleep
} from '@/db/events';

defineOptions({
	name: "Home"
})

const showAlert = ref(false)
const alertType = ref(null)
const allEvents = ref([])
let refreshInterval = null
const lastEvents = ref({
	diaper: null,
	eat: null,
})
const lastSleep = ref(null)
const now = ref(Date.now())

onMounted(async () => {
	await initSQLite()
	await createTables()
	await loadAllEvents()
	await refreshLastEvents()
	await loadSleep()
	// await clearEvents()

	refreshInterval = setInterval(() => {
		now.value = Date.now()
		loadSleep()
	}, 60_000)
})

onUnmounted(() => {
	if (refreshInterval) {
		clearInterval(refreshInterval)
		refreshInterval = null
	}
})

const sleepState = computed(() => {
	return getSleepState(lastSleep.value)
})

const sleepTitle = computed(() => {
	switch (sleepState.value.status) {
		case "sleeping":
			return "SPÍ"
		case "awake":
			return "VZHŮRU"
		default:
			return "SPÁNEK"
	}
})

const actionButtonLabel = computed(() => {
  return sleepState.value.status === "sleeping"
    ? "Vstávání"
    : "Usínání";
});

const actionButtonClass = computed(() => {
  return sleepState.value.status === "sleeping"
    ? "awake"
    : "sleep";
});

function handleSleepAction() {
  if (sleepState.value.status === "sleeping") {
    openAlert("awake");
  } else {
    openAlert("sleep");
  }
}

const loadSleep = async () => {
	lastSleep.value = await getLastSleep()
}

const loadAllEvents = async () => {
	allEvents.value = await getAllEvents()
}

const loadLastEvent = async (type) => {
	lastEvents.value[type] = await getLastEventByType(type)
}

const refreshLastEvents = async () => {
	await loadLastEvent("diaper")
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
			const ts = parseTime(data.time)

			switch (alertType.value) {
				case "eat":
					await addEvent({
						type: "eat",
						start_ts: ts,
						amount: Number(data.amount)
					})
					await loadLastEvent("eat")
					break

				case "awake":
					await endSleep(ts)
					await loadSleep()
					break

				case "sleep":
					await startSleep(ts)
					await loadSleep()
					break

				case "diaper":
					await addEvent({
						type: "diaper",
						start_ts: ts
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