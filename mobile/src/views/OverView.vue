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
								<OverviewChart
									:values="weeklySleepHours"
									:categories="rollingDayLabels"
									series-name="Spánek"
									:y-formatter="(v) => `${Math.round(v)} h`"
								/>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>

				<IonRow class="overview-chart-row">
					<IonCol size="12">
						<IonCard class="card-overview-chart">
							<IonCardHeader>
								<IonCardTitle>Krmení / 7 dní</IonCardTitle>
							</IonCardHeader>
							<IonCardContent>
								<OverviewChart
									type="bar"
									:values="weeklyEatCounts"
									:categories="rollingDayLabels"
									series-name="Krmení"
									:y-min="4"
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
import OverviewChart from "@/components/OverviewChart.vue";
import {
	getEatCountInRange,
	getDiaperCountInRange,
	getSleepDurationInRange,
} from "@/database/queries";
import { useActiveChild } from "@/composables/useActiveChild";

defineOptions({
	name: "Overview",
});

const { children, activeChildId, loadChildrenContext, changeActiveChild } = useActiveChild();
const selectedDayStartTs = ref(dayjs().startOf("day").valueOf());
const dailySummary = ref({
	eatCount: 0,
	diaperCount: 0,
	sleepMs: 0,
});
const weeklySleepHours = ref(Array(7).fill(0));
const weeklyEatCounts = ref(Array(7).fill(0));

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

async function handleChangeChild(childId) {
	await changeActiveChild(childId);
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
	await Promise.all([loadDailySummary(), loadWeeklySleep(), loadWeeklyEat()]);
}

async function loadDailySummary() {
	if (!activeChildId.value) {
		dailySummary.value = { eatCount: 0, diaperCount: 0, sleepMs: 0 };
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

async function loadWeeklyRollingData(queryFn, transform = (v) => Number(v) || 0) {
	if (!activeChildId.value) return Array(7).fill(0);

	const results = await Promise.all(
		rollingDayStartTs.value.map((dayStartTs) => {
			const dayEndTs = dayjs(dayStartTs).add(1, "day").valueOf();
			return queryFn(activeChildId.value, dayStartTs, dayEndTs);
		}),
	);

	return results.map(transform);
}

async function loadWeeklySleep() {
	weeklySleepHours.value = await loadWeeklyRollingData(
		getSleepDurationInRange,
		(v) => (Number(v) || 0) / 3_600_000,
	);
}

async function loadWeeklyEat() {
	weeklyEatCounts.value = await loadWeeklyRollingData(getEatCountInRange);
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

<style scoped>
.overview-grid {
	padding-left: 0;
	padding-right: 0;
}

.overview-grid ion-row {
	margin: 0;
}

.overview-grid ion-col {
	padding: 4px;
}

.overview-date-wrap {
	padding-top: 2px;
	padding-bottom: 10px;
}

.overview-date-controls {
	display: grid;
	grid-template-columns: 48px 1fr 48px;
	align-items: center;
	gap: 8px;
	width: 100%;
	max-width: 100%;
	margin: 0 auto;
	padding: 4px;
	background: #f1ebfa;
	border-radius: 999px;
}

.overview-date-nav,
.overview-date-current {
	margin: 0;
	height: 36px;
	min-height: 36px;
	text-transform: none;
	--box-shadow: none;
	--border-radius: 999px;
}

.overview-date-nav {
	--color: #8f7ac6;
	font-size: 1.35rem;
	font-weight: 700;
}

.overview-date-current {
	--background: #ffffff;
	--color: #5d4a7f;
	font-size: 1rem;
	font-weight: 700;
	letter-spacing: 0.02em;
}

.overview-date-nav[disabled] {
	opacity: 0.35;
}

.overview-grid ion-row.overview-summary-row {
	margin-top: 2px;
}

.card-overview-summary {
	height: 130px;
	display: flex;
	flex-direction: column;
	padding-top: 6px;
	padding-bottom: 0;
	margin: 0;
}

.card-overview-summary ion-card-header {
	padding-top: 0;
	padding-bottom: 0;
	--padding-bottom: 0;
}

.overview-summary-icon-wrap {
	display: flex;
	justify-content: center;
	margin-bottom: 0;
}

.overview-summary-icon {
	width: 44px;
	height: 44px;
	display: block;
}

.overview-summary-divider {
	margin: 8px auto 6px;
	border: 0;
	height: 1px;
	width: 90%;
	background: rgba(58, 58, 58, 0.15);
}

.card-overview-summary ion-card-content {
	--padding-top: 2px;
	--padding-bottom: 0;
	--padding-start: 12px;
	--padding-end: 12px;

	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	gap: 1px;
	padding-bottom: 0;
}

.card-overview-summary ion-card-title {
	font-size: 0.98rem;
	white-space: nowrap;
}

.overview-summary-value {
	font-size: 1.25rem;
	font-weight: 700;
	line-height: 1.2;
	color: #56456f;
	white-space: nowrap;
}

.overview-grid ion-row.overview-chart-row {
	margin-top: 20px;
}

.card-overview-chart {
	margin: 0;
}

.card-overview-chart ion-card-header {
	padding-bottom: 6px;
}

.card-overview-chart ion-card-title {
	font-size: 1.02rem;
}

.card-overview-chart ion-card-content {
	--padding-top: 0;
	--padding-bottom: 6px;
	--padding-start: 8px;
	--padding-end: 6px;
}
</style>
