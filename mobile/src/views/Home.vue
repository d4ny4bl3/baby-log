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
import { createId } from '@/utils/id';
import { getSleepState } from '@/utils/sleepState';
import { getDb } from '@/database/connection';
import { insertSleep, insertEat, insertDiaper } from '@/database/queries';
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
const DEFAULT_CHILD_ID = "default-child"

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
	const db = await getDb()
	const result = await db.query(`
		SELECT started_at, ended_at
		FROM sleep
		WHERE deleted_at IS NULL
		ORDER BY started_at DESC
		LIMIT 1;
	`)

	lastSleep.value = result.values?.[0] ?? null
}

const loadLastEvent = async (type) => {
	const db = await getDb()

	if (type === "eat") {
		const result = await db.query(`
			SELECT started_at AS ts
			FROM eat
			WHERE deleted_at IS NULL
			ORDER BY started_at DESC
			LIMIT 1;
		`)
		lastEvents.value.eat = result.values?.[0]?.ts ?? null
		return
	}

	if (type === "diaper") {
		const result = await db.query(`
			SELECT changed_at AS ts
			FROM diaper
			WHERE deleted_at IS NULL
			ORDER BY changed_at DESC
			LIMIT 1;
		`)
		lastEvents.value.diaper = result.values?.[0]?.ts ?? null
	}
}

const refreshLastEvents = async () => {
	await loadLastEvent("diaper")
	await loadLastEvent("eat")
}

async function handleSave(payload) {
	switch (payload.type) {
		case "eat":
			await insertEat({
				id: createId(),
				child_id: DEFAULT_CHILD_ID,
				started_at: payload.timestamp,
				amount: payload.amount ?? null,
				note: payload.note ?? null,
			})
			await loadLastEvent("eat")
			break

		case "diaper":
			await insertDiaper({
				id: createId(),
				child_id: DEFAULT_CHILD_ID,
				changed_at: payload.timestamp,
			})
			await loadLastEvent("diaper")
			break

		case "sleep":
			await insertSleep({
				id: createId(),
				child_id: DEFAULT_CHILD_ID,
				started_at: payload.timestamp,
			})
			await loadSleep()
			break

		case "awake":
			{
				const db = await getDb()
				const nowTs = Date.now()
				await db.execute(`
					UPDATE sleep
					SET ended_at = ${payload.timestamp}, updated_at = ${nowTs}
					WHERE id = (
						SELECT id
						FROM sleep
						WHERE ended_at IS NULL AND deleted_at IS NULL
						ORDER BY started_at DESC
						LIMIT 1
					);
				`)
			}
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
