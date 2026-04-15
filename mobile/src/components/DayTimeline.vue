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
							<div v-if="event.type === 'diaper' && event.rawType" class="timeline-item-detail">
								{{ diaperTypeLabel(event.rawType) }}
							</div>
							<div v-if="event.type === 'eat' && (event.rawType || event.amount)" class="timeline-item-detail">
								{{ eatTypeLabel(event.rawType) }}{{ event.rawType === 'bottle' && event.amount ? ' · ' + event.amount + ' ml' : '' }}
							</div>
						</div>
						<button class="timeline-item-edit" @click.stop="openDetail(event)" aria-label="Upravit">
							<IonIcon :icon="pencilOutline" />
						</button>
					</div>
				</div>
			</div>

			<div v-else class="timeline-empty">
				Žádné záznamy pro tento den
			</div>
		</IonCardContent>
	</IonCard>

	<Teleport to="body">
		<Transition name="ev-modal">
			<div v-if="selectedEvent" class="ev-overlay" @click.self="closeSheet">
				<div class="ev-sheet">
					<template v-if="sheetMode === 'detail'">
						<img :src="iconFor(selectedEvent.type)" class="ev-icon" alt="">
						<div class="ev-title">{{ labelFor(selectedEvent.type) }}</div>
						<div class="ev-subtitle">
						{{ selectedEvent.detail ?? selectedEvent.timeLabel }}
						<span v-if="selectedEvent.type === 'diaper' && selectedEvent.rawType" class="ev-subtitle-type">
							· {{ diaperTypeLabel(selectedEvent.rawType) }}
						</span>
						<span v-if="selectedEvent.type === 'eat' && selectedEvent.rawType" class="ev-subtitle-type">
							· {{ eatTypeLabel(selectedEvent.rawType) }}
						</span>
						<span v-if="selectedEvent.type === 'eat' && selectedEvent.rawType === 'bottle' && selectedEvent.amount" class="ev-subtitle-type">
							· {{ selectedEvent.amount }} ml
						</span>
					</div>

						<div class="ev-actions">
							<button class="ev-btn ev-btn--cancel" @click="closeSheet">Zrušit</button>
							<button v-if="selectedEvent.type === 'diaper' || selectedEvent.type === 'sleep' || selectedEvent.type === 'eat'" class="ev-btn ev-btn--edit" @click="sheetMode = 'edit'">Upravit</button>
							<button class="ev-btn ev-btn--delete" @click="onDelete">Smazat</button>
						</div>
					</template>

					<template v-else-if="sheetMode === 'edit' && selectedEvent.type === 'diaper'">
						<div class="ev-title ev-title--edit">Upravit přebalení</div>
						<DiaperForm
							:initial-ts="selectedEvent.ts"
							:initial-type="selectedEvent.rawType"
							@save="onEdit"
							@cancel="sheetMode = 'detail'"
						/>
					</template>

					<template v-else-if="sheetMode === 'edit' && selectedEvent.type === 'eat'">
						<div class="ev-title ev-title--edit">Upravit krmení</div>
						<EatForm
							:initial-ts="selectedEvent.ts"
							:initial-type="selectedEvent.rawType"
							:initial-amount="selectedEvent.amount"
							@save="onEdit"
							@cancel="sheetMode = 'detail'"
						/>
					</template>

					<template v-else-if="sheetMode === 'edit' && selectedEvent.type === 'sleep'">
						<div class="ev-title ev-title--edit">Upravit spánek</div>
						<SleepForm
							:initial-start-ts="selectedEvent.ts"
							:initial-end-ts="selectedEvent.endedAt"
							@save="onEdit"
							@cancel="sheetMode = 'detail'"
						/>
					</template>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, useBackButton } from '@ionic/vue'
import { pencilOutline } from 'ionicons/icons'
import DiaperForm from '@/components/DiaperForm.vue'
import EatForm from '@/components/EatForm.vue'
import SleepForm from '@/components/SleepForm.vue'
import { diaperTypeLabel, eatTypeLabel } from '@/utils/eventTypes'
import dayjs from 'dayjs'
import 'dayjs/locale/cs'
import eatIcon from '@/assets/icons/overview-eat.svg'
import sleepIcon from '@/assets/icons/overview-sleep.svg'
import diaperIcon from '@/assets/icons/overview-diaper.svg'

const emit = defineEmits(['delete', 'edit'])

const selectedEvent = ref(null)
const sheetMode = ref('detail')

useBackButton(10001, (processNextHandler) => {
	if (selectedEvent.value) {
		if (sheetMode.value === 'edit') {
			sheetMode.value = 'detail'
		} else {
			closeSheet()
		}
	} else {
		processNextHandler()
	}
})

function openDetail(event) {
	selectedEvent.value = event
	sheetMode.value = 'detail'
}

function closeSheet() {
	selectedEvent.value = null
	sheetMode.value = 'detail'
}

function onDelete() {
	emit('delete', { type: selectedEvent.value.type, id: selectedEvent.value.id })
	closeSheet()
}

function onEdit(data) {
	emit('edit', { type: selectedEvent.value.type, id: selectedEvent.value.id, data })
	closeSheet()
}

const props = defineProps({
	sleeps: { type: Array, default: () => [] },
	eats: { type: Array, default: () => [] },
	diapers: { type: Array, default: () => [] },
	dayStartTs: { type: Number, required: true },
	now: { type: Number, required: true },
})

const dayEndTs = computed(() => dayjs(props.dayStartTs).add(1, 'day').valueOf())
const actualDayMs = computed(() => dayEndTs.value - props.dayStartTs)

function toPct(ts) {
	const offsetMs = ts - props.dayStartTs
	return Math.min(100, Math.max(0, (offsetMs / actualDayMs.value) * 100))
}

const barLabels = computed(() => [0, 6, 12, 18, 24].map(h => {
	const ts = h < 24 ? dayjs(props.dayStartTs).hour(h).valueOf() : dayEndTs.value
	return { h, text: `${h}:00`, pct: toPct(ts) }
}))

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
			id: s.id,
			ts: s.started_at,
			endedAt: s.ended_at ?? null,
			timeLabel: formatTime(s.started_at),
			detail: `${formatTime(s.started_at)} – ${endLabel} · ${formatDuration(durationMs)}`,
		})
	}

	for (const e of props.eats) {
		list.push({
			type: 'eat',
			id: e.id,
			ts: e.started_at,
			timeLabel: formatTime(e.started_at),
			detail: null,
			rawType: e.type ?? null,
			amount: e.amount ?? null,
		})
	}

	for (const d of props.diapers) {
		list.push({
			type: 'diaper',
			id: d.id,
			ts: d.changed_at,
			timeLabel: formatTime(d.changed_at),
			detail: null,
			rawType: d.type ?? null,
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
	overflow: hidden;
	border-radius: 8px;
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
	border-radius: 8px;
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
	padding: 6px 10px 12px 0;
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

.timeline-item-edit {
	margin-left: auto;
	flex-shrink: 0;
	align-self: center;
	background: none;
	border: none;
	padding: 4px 6px;
	font-size: 1rem;
	color: #c0b4d8;
	cursor: pointer;
	line-height: 1;
	display: flex;
	align-items: center;
}

.timeline-item-edit:active {
	color: #7b68b0;
}


.timeline-empty {
	text-align: center;
	color: #9b90b0;
	font-size: 0.88rem;
	padding: 16px 0;
}
</style>

<style>
.ev-overlay {
	position: fixed;
	inset: 0;
	z-index: 9999;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(6px);
	display: flex;
	align-items: flex-end;
	justify-content: center;
}

.ev-sheet {
	width: 100%;
	max-width: 480px;
	background: #fff;
	border-radius: 20px 20px 0 0;
	padding: 28px 24px calc(40px + env(safe-area-inset-bottom));
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}

.ev-icon {
	width: 52px;
	height: 52px;
	margin-bottom: 4px;
}

.ev-title {
	font-size: 1.3rem;
	font-weight: 700;
	color: #3d3050;
}

.ev-subtitle {
	font-size: 0.95rem;
	color: #7a6a96;
	margin-bottom: 16px;
	text-align: center;
}

.ev-actions {
	display: flex;
	gap: 12px;
	width: 100%;
}

.ev-btn {
	flex: 1;
	height: 48px;
	border: none;
	border-radius: 24px;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
}

.ev-btn--cancel {
	background: #ececf0;
	color: #3d3050;
}

.ev-btn--edit {
	background: #ede9fe;
	color: #5d4a7f;
}

.ev-btn--save {
	background: #9b87c6;
	color: #fff;
}

.ev-btn--delete {
	background: #e05555;
	color: #fff;
}

.ev-title--edit {
	margin-bottom: 16px;
}

.ev-subtitle-type {
	color: #9b90b0;
}

/* Transition */
.ev-modal-enter-active,
.ev-modal-leave-active {
	transition: opacity 0.2s ease;
}
.ev-modal-enter-active .ev-sheet,
.ev-modal-leave-active .ev-sheet {
	transition: transform 0.2s ease;
}
.ev-modal-enter-from,
.ev-modal-leave-to {
	opacity: 0;
}
.ev-modal-enter-from .ev-sheet,
.ev-modal-leave-to .ev-sheet {
	transform: translateY(100%);
}
</style>
