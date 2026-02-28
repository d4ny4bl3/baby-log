<template>
	<IonPage>
		<AppHeader
			:children="children"
			:active-child-id="activeChildId"
			@change-child="handleChangeChild"
		/>

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
import { createId } from '@/utils/id';
import { getSleepState } from '@/utils/sleepState';
import {
	insertSleep,
	insertEat,
	insertDiaper,
	getLastSleep,
	endLastOpenSleep,
	getLastEatTimestamp,
	getLastDiaperTimestamp,
	getChildren,
	getActiveChildId,
	setActiveChildId,
} from '@/database/queries';
import AppHeader from '@/components/AppHeader.vue';
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
const children = ref([])
const activeChildId = ref(null)

onMounted(async () => {
	await loadChildrenContext()
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
	if (!activeChildId.value) {
		lastSleep.value = null
		return
	}
	lastSleep.value = await getLastSleep(activeChildId.value)
}

const loadLastEvent = async (type) => {
	if (!activeChildId.value) {
		lastEvents.value[type] = null
		return
	}

	if (type === "eat") {
		lastEvents.value.eat = await getLastEatTimestamp(activeChildId.value)
		return
	}

	if (type === "diaper") {
		lastEvents.value.diaper = await getLastDiaperTimestamp(activeChildId.value)
	}
}

const loadChildrenContext = async () => {
	children.value = await getChildren()
	if (children.value.length === 0) {
		activeChildId.value = null
		return
	}

	const storedActiveChildId = await getActiveChildId()
	const exists = children.value.some((child) => child.id === storedActiveChildId)

	if (exists) {
		activeChildId.value = storedActiveChildId
		return
	}

	activeChildId.value = children.value[0].id
	await setActiveChildId(activeChildId.value)
}

const handleChangeChild = async (childId) => {
	if (!childId || childId === activeChildId.value) return
	activeChildId.value = childId
	await setActiveChildId(childId)
	await refreshLastEvents()
	await loadSleep()
}

const refreshLastEvents = async () => {
	await loadLastEvent("diaper")
	await loadLastEvent("eat")
}

async function handleSave(payload) {
	if (!activeChildId.value) {
		showModal.value = false
		return
	}

	switch (payload.type) {
		case "eat":
			await insertEat({
				id: createId(),
				child_id: activeChildId.value,
				started_at: payload.timestamp,
				amount: payload.amount ?? null,
				note: payload.note ?? null,
			})
			await loadLastEvent("eat")
			break

		case "diaper":
			await insertDiaper({
				id: createId(),
				child_id: activeChildId.value,
				changed_at: payload.timestamp,
			})
			await loadLastEvent("diaper")
			break

		case "sleep":
			await insertSleep({
				id: createId(),
				child_id: activeChildId.value,
				started_at: payload.timestamp,
			})
			await loadSleep()
			break

		case "awake":
			await endLastOpenSleep(activeChildId.value, payload.timestamp)
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
