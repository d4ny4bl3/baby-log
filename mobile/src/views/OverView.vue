<template>
	<IonPage class="overview-view">
		<AppHeader
			:children="children"
			:active-child-id="activeChildId"
			@change-child="handleChangeChild"
		/>

		<IonContent class="ion-padding ion-padding-top">
			<IonGrid class="overview-grid">
				<IonRow>
					<IonCol size="12">
						<div class="overview-date-wrap">
							<div class="overview-date-controls">
								<IonButton
									fill="clear"
									class="overview-date-nav"
									@click="goToPreviousDay"
								>
									&#8249;
								</IonButton>

								<IonButton
									fill="solid"
									class="overview-date-current"
									@click="goToToday"
								>
									{{ selectedDateLabel }}
								</IonButton>

								<IonButton
									fill="clear"
									class="overview-date-nav"
									:disabled="isSelectedToday"
									@click="goToNextDay"
								>
									&#8250;
								</IonButton>
							</div>
						</div>
					</IonCol>
				</IonRow>

				<IonRow class="overview-summary-row">
					<IonCol size="4">
						<IonCard class="card-overview-summary">
							<IonCardHeader>
								<div class="overview-summary-icon-wrap">
									<img
										:src="eatIcon"
										class="overview-summary-icon"
										alt=""
										aria-hidden="true"
									>
								</div>
								<IonCardTitle>Krmení</IonCardTitle>
								<hr class="overview-summary-divider">
							</IonCardHeader>
							<IonCardContent>
								<div class="overview-summary-value">
									{{ dailySummary.eatCount }}x
								</div>
								<div class="overview-summary-sub">{{ selectedDateSubLabel }}</div>
							</IonCardContent>
						</IonCard>
					</IonCol>

					<IonCol size="4">
						<IonCard class="card-overview-summary">
							<IonCardHeader>
								<div class="overview-summary-icon-wrap">
									<img
										:src="sleepIcon"
										class="overview-summary-icon"
										alt=""
										aria-hidden="true"
									>
								</div>
								<IonCardTitle>Spánek</IonCardTitle>
								<hr class="overview-summary-divider">
							</IonCardHeader>
							<IonCardContent>
								<div class="overview-summary-value">
									{{ formattedSleepDuration }}
								</div>
								<div class="overview-summary-sub">Celkem</div>
							</IonCardContent>
						</IonCard>
					</IonCol>

					<IonCol size="4">
						<IonCard class="card-overview-summary">
							<IonCardHeader>
								<div class="overview-summary-icon-wrap">
									<img
										:src="diaperIcon"
										class="overview-summary-icon"
										alt=""
										aria-hidden="true"
									>
								</div>
								<IonCardTitle>Přebalení</IonCardTitle>
								<hr class="overview-summary-divider">
							</IonCardHeader>
							<IonCardContent>
								<div class="overview-summary-value">
									{{ dailySummary.diaperCount }}x
								</div>
								<div class="overview-summary-sub">{{ selectedDateSubLabel }}</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>
			</IonGrid>
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
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import eatIcon from "@/assets/icons/overview-eat.svg";
import sleepIcon from "@/assets/icons/overview-sleep.svg";
import diaperIcon from "@/assets/icons/overview-diaper.svg";

import AppHeader from "@/components/AppHeader.vue";
import {
	getActiveChildId,
	getChildren,
	setActiveChildId,
	getEatCountInRange,
	getDiaperCountInRange,
	getSleepDurationInRange,
} from "@/database/queries";

defineOptions({
	name: "Overview",
});

const children = ref([]);
const activeChildId = ref(null);
const selectedDayStartTs = ref(dayjs().startOf("day").valueOf());
const dailySummary = ref({
	eatCount: 0,
	diaperCount: 0,
	sleepMs: 0,
});

const todayStartTs = computed(() => dayjs().startOf("day").valueOf());
const isSelectedToday = computed(() => selectedDayStartTs.value >= todayStartTs.value);

const selectedDateLabel = computed(() => {
	const selected = dayjs(selectedDayStartTs.value).locale("cs");
	if (selected.isSame(dayjs(), "day")) return "Dnes";
	return selected.format("D. M.");
});

const selectedDateSubLabel = computed(() => {
	return isSelectedToday.value ? "Dnes" : dayjs(selectedDayStartTs.value).locale("cs").format("D. M.");
});

const formattedSleepDuration = computed(() => formatDuration(dailySummary.value.sleepMs));

onMounted(async () => {
	await loadChildrenContext();
	await loadDailySummary();
});

function goToPreviousDay() {
	selectedDayStartTs.value = dayjs(selectedDayStartTs.value).subtract(1, "day").startOf("day").valueOf();
	loadDailySummary();
}

function goToNextDay() {
	if (isSelectedToday.value) return;
	selectedDayStartTs.value = dayjs(selectedDayStartTs.value).add(1, "day").startOf("day").valueOf();
	loadDailySummary();
}

function goToToday() {
	selectedDayStartTs.value = todayStartTs.value;
	loadDailySummary();
}

async function loadChildrenContext() {
	children.value = await getChildren();
	if (children.value.length === 0) {
		activeChildId.value = null;
		return;
	}

	const storedActiveChildId = await getActiveChildId();
	const exists = children.value.some((child) => child.id === storedActiveChildId);

	if (exists) {
		activeChildId.value = storedActiveChildId;
		return;
	}

	activeChildId.value = children.value[0].id;
	await setActiveChildId(activeChildId.value);
}

async function handleChangeChild(childId) {
	if (!childId || childId === activeChildId.value) return;
	activeChildId.value = childId;
	await setActiveChildId(childId);
	await loadDailySummary();
}

async function loadDailySummary() {
	if (!activeChildId.value) {
		dailySummary.value = {
			eatCount: 0,
			diaperCount: 0,
			sleepMs: 0,
		};
		return;
	}

	const rangeStartTs = selectedDayStartTs.value;
	const rangeEndTs = dayjs(rangeStartTs).add(1, "day").valueOf();

	const [eatCount, diaperCount, sleepMs] = await Promise.all([
		getEatCountInRange(activeChildId.value, rangeStartTs, rangeEndTs),
		getDiaperCountInRange(activeChildId.value, rangeStartTs, rangeEndTs),
		getSleepDurationInRange(activeChildId.value, rangeStartTs, rangeEndTs),
	]);

	dailySummary.value = {
		eatCount: Number(eatCount) || 0,
		diaperCount: Number(diaperCount) || 0,
		sleepMs: Number(sleepMs) || 0,
	};
}

function formatDuration(durationMs) {
	const totalMinutes = Math.floor((Number(durationMs) || 0) / 60_000);
	if (totalMinutes <= 0) return "0 min";

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours === 0) return `${minutes} min`;
	if (minutes === 0) return `${hours} h`;
	return `${hours} h ${minutes} min`;
}
</script>
