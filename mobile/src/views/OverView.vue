<template>
	<IonPage class="overview-view">
		<AppHeader
			:children="children"
			:active-child-id="activeChildId"
			@change-child="handleChangeChild"
		/>

		<IonContent class="ion-padding ion-padding-top">
			<IonRefresher slot="fixed" @ionRefresh="handleRefresh">
				<IonRefresherContent />
			</IonRefresher>

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
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>

				<IonRow class="overview-chart-row">
					<IonCol size="12">
						<IonCard class="card-overview-chart">
							<IonCardHeader>
								<IonCardTitle>Spánek / 7 dní</IonCardTitle>
							</IonCardHeader>
							<IonCardContent>
								<OverviewLineChart
									:values="weeklySleepHours"
									:categories="rollingDayLabels"
									series-name="Spánek"
									:y-formatter="(v) => `${Math.round(v)} h`"
								/>
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
	IonRefresher,
	IonRefresherContent,
	onIonViewWillEnter,
} from "@ionic/vue";
import { computed, ref } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import eatIcon from "@/assets/icons/overview-eat.svg";
import sleepIcon from "@/assets/icons/overview-sleep.svg";
import diaperIcon from "@/assets/icons/overview-diaper.svg";

import AppHeader from "@/components/AppHeader.vue";
import OverviewLineChart from "@/components/OverviewLineChart.vue";
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
const weeklySleepHours = ref(Array(7).fill(0));

const todayStartTs = computed(() => dayjs().startOf("day").valueOf());
const isSelectedToday = computed(() => selectedDayStartTs.value >= todayStartTs.value);
const rollingRangeStartTs = computed(() => {
	return dayjs(selectedDayStartTs.value).subtract(6, "day").startOf("day").valueOf();
});
const rollingDayStartTs = computed(() => {
	return Array.from({ length: 7 }, (_, index) =>
		dayjs(rollingRangeStartTs.value).add(index, "day").valueOf(),
	);
});
const rollingDayLabels = computed(() => {
	return rollingDayStartTs.value.map((ts) => dayjs(ts).locale("cs").format("D.M."));
});

const selectedDateLabel = computed(() => {
	const selected = dayjs(selectedDayStartTs.value).locale("cs");
	if (selected.isSame(dayjs(), "day")) return "Dnes";
	return selected.format("D. M.");
});

const formattedSleepDuration = computed(() => formatDuration(dailySummary.value.sleepMs));

onIonViewWillEnter(async () => {
	await ensureOverviewDataLoaded();
});

function goToPreviousDay() {
	selectedDayStartTs.value = dayjs(selectedDayStartTs.value).subtract(1, "day").startOf("day").valueOf();
	loadOverviewData();
}

function goToNextDay() {
	if (isSelectedToday.value) return;
	selectedDayStartTs.value = dayjs(selectedDayStartTs.value).add(1, "day").startOf("day").valueOf();
	loadOverviewData();
}

function goToToday() {
	selectedDayStartTs.value = todayStartTs.value;
	loadOverviewData();
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
	await loadOverviewData();
}

async function handleRefresh(event) {
	await ensureOverviewDataLoaded();
	event.target.complete();
}

async function ensureOverviewDataLoaded() {
	await loadChildrenContext();
	await loadOverviewData();
}

async function loadOverviewData() {
	await Promise.all([loadDailySummary(), loadWeeklySleep()]);
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

async function loadWeeklySleep() {
	if (!activeChildId.value) {
		weeklySleepHours.value = Array(7).fill(0);
		return;
	}

	const ranges = rollingDayStartTs.value.map((dayStartTs) => {
		const dayEndTs = dayjs(dayStartTs).add(1, "day").valueOf();
		return [dayStartTs, dayEndTs];
	});

	const durations = await Promise.all(
		ranges.map(([rangeStartTs, rangeEndTs]) =>
			getSleepDurationInRange(activeChildId.value, rangeStartTs, rangeEndTs),
		),
	);

	weeklySleepHours.value = durations.map((value) => (Number(value) || 0) / 3_600_000);
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
