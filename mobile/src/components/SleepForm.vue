<template>
	<div class="sleep-form">
		<div class="form-group">
			<label>Začátek</label>
			<input type="time" v-model="localStart" />
		</div>

		<div class="form-group">
			<label>Konec</label>
			<div class="end-row">
				<input type="time" v-model="localEnd" :placeholder="isOngoing ? 'právě spí' : ''" />
				<div class="form-group--toggle">
					<span class="toggle-label">Násl. den</span>
					<label class="toggle-switch">
						<input type="checkbox" v-model="endNextDay" />
						<span class="toggle-track">
							<span class="toggle-thumb" />
						</span>
					</label>
				</div>
			</div>
		</div>

		<div class="ev-actions">
			<button class="ev-btn ev-btn--cancel" @click="$emit('cancel')">Zrušit</button>
			<button class="ev-btn ev-btn--save" @click="onSave">Uložit</button>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
	initialStartTs: { type: Number, required: true },
	initialEndTs: { type: Number, default: null },
})

const emit = defineEmits(['save', 'cancel'])

const isOngoing = props.initialEndTs === null

const localStart = ref(toTimeString(props.initialStartTs))
const localEnd = ref(props.initialEndTs ? toTimeString(props.initialEndTs) : '')

const startDay = new Date(props.initialStartTs).getDate()
const endDay = props.initialEndTs ? new Date(props.initialEndTs).getDate() : startDay
const endNextDay = ref(endDay !== startDay)

function toTimeString(ts) {
	const d = new Date(ts)
	const h = String(d.getHours()).padStart(2, '0')
	const m = String(d.getMinutes()).padStart(2, '0')
	return `${h}:${m}`
}

function applyTime(baseTs, timeStr) {
	const [h, m] = timeStr.split(':').map(Number)
	const d = new Date(baseTs)
	d.setHours(h, m, 0, 0)
	return d.getTime()
}

function onSave() {
	const started_at = applyTime(props.initialStartTs, localStart.value)
	let ended_at = null
	if (localEnd.value) {
		const baseTs = (props.initialEndTs ?? props.initialStartTs)
		const adjustedBase = endNextDay.value ? baseTs + 24 * 60 * 60 * 1000 : baseTs
		ended_at = applyTime(adjustedBase, localEnd.value)
	}
	emit('save', { started_at, ended_at })
}
</script>

<style scoped>
.sleep-form {
	width: 100%;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 20px;
}

.end-row {
	display: flex;
	align-items: center;
	gap: 12px;
}

.end-row .form-group--toggle {
	margin-top: 0;
}

.end-row input[type="time"] {
	flex: 1;
}

.form-group label {
	font-size: 0.85rem;
	font-weight: 600;
	color: #7a6a96;
}

.form-group input[type="time"] {
	width: 100%;
	padding: 10px 14px;
	border: 1.5px solid #e4ddf5;
	border-radius: 12px;
	font-size: 1rem;
	color: #3d3050;
	background: #faf8ff;
	outline: none;
	box-sizing: border-box;
}

.form-group input[type="time"]:focus {
	border-color: #9b87c6;
}
</style>
