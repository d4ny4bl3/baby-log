<template>
	<IonCard class="card-day-timeline">
		<IonCardHeader>
			<IonCardTitle>Dnešní průběh</IonCardTitle>
		</IonCardHeader>

		<IonCardContent>
			<!-- Horizontal time bar — 3 separate rows -->
			<div class="timeline-bar-wrap">
				<!-- Grid lines behind all rows -->
				<div class="timeline-grid" aria-hidden="true">
					<div
						v-for="label in barLabels"
						:key="label.h"
						class="timeline-grid-line"
						:style="{ left: label.pct + '%' }"
					/>
				</div>

				<!-- Eat row -->
				<div class="timeline-bar-row">
					<div class="timeline-bar timeline-bar--pins">
						<div
							v-for="(eat, i) in eats"
							:key="'e' + i"
							class="timeline-bar-pin"
							:style="{ left: toPct(eat.started_at) + '%' }"
						>
							<img :src="eatIcon" class="timeline-bar-pin-icon" alt="">
						</div>
					</div>
				</div>

				<!-- Diaper row -->
				<div class="timeline-bar-row">
					<div class="timeline-bar timeline-bar--pins">
						<div
							v-for="(diaper, i) in diapers"
							:key="'d' + i"
							class="timeline-bar-pin"
							:style="{ left: toPct(diaper.changed_at) + '%' }"
						>
							<img :src="diaperIcon" class="timeline-bar-pin-icon" alt="">
						</div>
					</div>
				</div>

				<!-- Sleep row -->
				<div class="timeline-bar-row">
					<div class="timeline-bar timeline-bar--track">
						<div
							v-for="(sleep, i) in sleeps"
							:key="'s' + i"
							class="timeline-bar-block timeline-bar-block--sleep"
							:style="blockStyle(sleep.started_at, sleep.ended_at ?? now)"
						/>
					</div>
				</div>

				<!-- Time labels at bottom -->
				<div class="timeline-bar-labels">
					<span
						v-for="label in barLabels"
						:key="label.h"
						:style="{ left: label.pct + '%' }"
						class="timeline-bar-label"
					>
						{{ label.text }}
					</span>
				</div>
			</div>

			<!-- Vertical event list — newest first -->
			<div v-if="events.length > 0" class="timeline-list">
				<div
					v-for="(event, i) in events"
					:key="i"
					class="timeline-item"
					:class="`timeline-item--${event.type}`"
				>
					<div class="timeline-item-time">{{ event.timeLabel }}</div>
					<div class="timeline-item-dot" :class="`timeline-item-dot--${event.type}`" />
					<div class="timeline-item-line" v-if="i < events.length - 1" />

					<div class="timeline-item-body" :class="{ 'timeline-item-body--sleep': event.type === 'sleep' }">
						<img :src="iconFor(event.type)" class="timeline-item-icon" alt="">
						<div class="timeline-item-info">
							<div class="timeline-item-title">{{ labelFor(event.type) }}</div>
							<div v-if="event.type === 'sleep'" class="timeline-item-detail">
								{{ event.detail }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-else class="timeline-empty">
				Žádné záznamy pro tento den
			</div>
		</IonCardContent>
	</IonCard>
</template>

<script setup>
import { computed } from 'vue'
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue'
import dayjs from 'dayjs'
import 'dayjs/locale/cs'
import eatIcon from '@/assets/icons/overview-eat.svg'
import sleepIcon from '@/assets/icons/overview-sleep.svg'
import diaperIcon from '@/assets/icons/overview-diaper.svg'

const props = defineProps({
	sleeps: { type: Array, default: () => [] },
	eats: { type: Array, default: () => [] },
	diapers: { type: Array, default: () => [] },
	dayStartTs: { type: Number, required: true },
	now: { type: Number, required: true },
})

const DAY_MS = 24 * 60 * 60 * 1000

const barLabels = [0, 6, 12, 18, 24].map(h => ({
	h,
	text: `${h}:00`,
	pct: (h / 24) * 100,
}))

function toPct(ts) {
	const offsetMs = ts - props.dayStartTs
	return Math.min(100, Math.max(0, (offsetMs / DAY_MS) * 100))
}

function blockStyle(startTs, endTs) {
	const left = toPct(startTs)
	const right = toPct(endTs)
	return {
		left: left + '%',
		width: (right - left) + '%',
	}
}

function formatTime(ts) {
	return dayjs(ts).locale('cs').format('H:mm')
}

function formatDuration(ms) {
	const totalMin = Math.floor(ms / 60_000)
	const h = Math.floor(totalMin / 60)
	const min = totalMin % 60
	if (h === 0) return `${min} min`
	if (min === 0) return `${h} h`
	return `${h} h ${min} min`
}

function iconFor(type) {
	if (type === 'sleep') return sleepIcon
	if (type === 'eat') return eatIcon
	return diaperIcon
}

function labelFor(type) {
	if (type === 'sleep') return 'Spánek'
	if (type === 'eat') return 'Krmení'
	return 'Přebalení'
}

const events = computed(() => {
	const list = []

	for (const s of props.sleeps) {
		const isOngoing = !s.ended_at
		const endTs = s.ended_at ?? props.now
		const durationMs = endTs - s.started_at
		const endLabel = isOngoing ? 'právě spí' : formatTime(s.ended_at)
		list.push({
			type: 'sleep',
			ts: s.started_at,
			timeLabel: formatTime(s.started_at),
			detail: `${formatTime(s.started_at)} – ${endLabel} · ${formatDuration(durationMs)}`,
		})
	}

	for (const e of props.eats) {
		list.push({
			type: 'eat',
			ts: e.started_at,
			timeLabel: formatTime(e.started_at),
			detail: null,
		})
	}

	for (const d of props.diapers) {
		list.push({
			type: 'diaper',
			ts: d.changed_at,
			timeLabel: formatTime(d.changed_at),
			detail: null,
		})
	}

	list.sort((a, b) => b.ts - a.ts)
	return list
})
</script>

<style scoped>
.card-day-timeline {
	margin: 0;
}

.card-day-timeline ion-card-header {
	padding-bottom: 6px;
}

.card-day-timeline ion-card-title {
	font-size: 1.02rem;
}

.card-day-timeline ion-card-content {
	--padding-top: 4px;
	--padding-bottom: 12px;
	--padding-start: 12px;
	--padding-end: 12px;
}

/* ── Horizontal bar ── */
.timeline-bar-wrap {
	position: relative;
	margin-bottom: 20px;
}

/* Grid lines */
.timeline-grid {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 20px; /* stop above labels */
	pointer-events: none;
}

.timeline-grid-line {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 1px;
	background: rgba(155, 144, 176, 0.2);
	transform: translateX(-50%);
}

.timeline-grid-line:first-child { transform: none; }
.timeline-grid-line:last-child  { transform: translateX(-100%); }

.timeline-bar-row {
	position: relative;
	display: flex;
	align-items: center;
	margin-bottom: 4px;
}

.timeline-bar {
	position: relative;
	flex: 1;
	height: 22px;
	border-radius: 999px;
	overflow: visible;
}

.timeline-bar--track {
	background: #ede8f7;
}

.timeline-bar--pins {
	background: transparent;
}

.timeline-bar--pins::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 0;
	right: 0;
	height: 1px;
	background: rgba(155, 144, 176, 0.25);
	pointer-events: none;
}

.timeline-bar-block {
	position: absolute;
	top: 0;
	height: 100%;
	border-radius: 999px;
}

.timeline-bar-block--sleep {
	background: linear-gradient(135deg, #c9bff0, #b8c5f5);
	opacity: 0.9;
}

.timeline-bar-pin {
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.timeline-bar-pin-icon {
	width: 20px;
	height: 20px;
}


.timeline-bar-labels {
	position: relative;
	height: 18px;
	margin-top: 4px;
}

.timeline-bar-label {
	position: absolute;
	transform: translateX(-50%);
	font-size: 0.7rem;
	color: #9b90b0;
	white-space: nowrap;
}

.timeline-bar-label:first-child { transform: none; }
.timeline-bar-label:last-child  { transform: translateX(-100%); }

/* ── Vertical list ── */
.timeline-list {
	display: flex;
	flex-direction: column;
}

.timeline-item {
	display: grid;
	grid-template-columns: 44px 20px 1fr;
	grid-template-rows: auto 1fr;
	column-gap: 8px;
	position: relative;
}

.timeline-item-time {
	grid-column: 1;
	grid-row: 1;
	font-size: 0.78rem;
	color: #9b90b0;
	text-align: right;
	padding-top: 10px;
	white-space: nowrap;
}

.timeline-item-dot {
	grid-column: 2;
	grid-row: 1;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	margin: 0 auto;
	margin-top: 13px;
	z-index: 1;
	flex-shrink: 0;
}

.timeline-item-dot--sleep  { background: #9b87c6; }
.timeline-item-dot--eat    { background: #e8946a; }
.timeline-item-dot--diaper { background: #e8946a; }

.timeline-item-line {
	grid-column: 2;
	grid-row: 2;
	width: 2px;
	background: #e4ddf5;
	margin: 0 auto;
	min-height: 8px;
}

.timeline-item-body {
	grid-column: 3;
	grid-row: 1 / 3;
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 6px 0 12px;
}

.timeline-item-body--sleep {
	background: linear-gradient(135deg, #ede9fe, #e0e7ff);
	border-radius: 10px;
	padding: 8px 10px;
	margin-bottom: 4px;
}

.timeline-item-icon {
	width: 28px;
	height: 28px;
	flex-shrink: 0;
}

.timeline-item-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.timeline-item-title {
	font-size: 0.95rem;
	font-weight: 600;
	color: #3d3050;
}

.timeline-item-body--sleep .timeline-item-title {
	color: #534877;
}

.timeline-item-detail {
	font-size: 0.78rem;
	color: #7a6a96;
}

.timeline-empty {
	text-align: center;
	color: #9b90b0;
	font-size: 0.88rem;
	padding: 16px 0;
}
</style>
