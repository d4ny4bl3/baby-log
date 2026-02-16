<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Baby Log</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent class="ion-padding-top">
			<IonRefresher slot="fixed" @ionRefresh="handleRefresh">
				<IonRefresherContent />
			</IonRefresher>

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
									class="action-btn primary"
									@click="handleSleepAction"
								>
									{{ actionButtonLabel }}
								</IonButton>

								<IonRow class="secondary-actions">
									<IonCol size="6">
										<IonButton
											expand="block"
											class="action-btn eat"
											@click="openModal('eat')"
										>
											Krmení
										</IonButton>
									</IonCol>

									<IonCol size="6">
										<IonButton
											expand="block"
											class="action-btn diaper"
											@click="openModal('diaper')"
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

			<EventModal
			 	:is-open="showModal"
				:type="modalType"
			 	@close="showModal = false"
				@save="handleSave"
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
	IonRefresher,
	IonRefresherContent,
} from '@ionic/vue'

import { ref, computed, onMounted, onUnmounted } from 'vue';

import { formatTime, formatRelativeTime } from '@/utils/time';
import { getSleepState } from '@/utils/sleepState';
import {
	addEvent,
	getLastEventByType,
	startSleep,
	endSleep,
	getLastSleep
} from '@/db/events';
import EventModal from '@/components/EventModal.vue';

defineOptions({
	name: "Home"
})

const showModal = ref(false)
const modalType = ref(null)
let refreshInterval = null
const lastEvents = ref({
	diaper: null,
	eat: null,
})
const lastSleep = ref(null)
const now = ref(Date.now())

onMounted(async () => {
	await refreshLastEvents()
	await loadSleep()

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

function handleSleepAction() {
  if (sleepState.value.status === "sleeping") {
    openModal("awake");
  } else {
    openModal("sleep");
  }
}

const openModal = (type) => {
	modalType.value = type
	showModal.value = true
}

const loadSleep = async () => {
	lastSleep.value = await getLastSleep()
}

const loadLastEvent = async (type) => {
	lastEvents.value[type] = await getLastEventByType(type)
}

const refreshLastEvents = async () => {
	await loadLastEvent("diaper")
	await loadLastEvent("eat")
}

async function handleSave(payload) {
	switch (payload.type) {
		case "eat":
			await addEvent({
				type: "eat",
				start_ts: payload.start_ts,
				amount: payload.amount
			})
			await loadLastEvent("eat")
			break

		case "diaper":
			await addEvent({
				type: "diaper",
				start_ts: payload.start_ts
			})
			await loadLastEvent("diaper")
			break

		case "sleep":
			await startSleep(payload.start_ts)
			await loadSleep()
			break

		case "awake":
			await endSleep(payload.start_ts)
			await loadSleep()
			break
	}

	showModal.value = false
}

const handleRefresh = async (event) => {
  await refreshLastEvents()
  await loadSleep()

  setTimeout(() => {
    event.target.complete()
  }, 750)
}

</script>