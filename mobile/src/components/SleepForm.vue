<template>
	<div class="sleep-form">
		<div class="form-group">
			<label>Začátek</label>
			<input type="time" v-model="localStart" />
		</div>

		<div class="form-group">
			<label>Konec</label>
			<input type="time" v-model="localEnd" :placeholder="isOngoing ? 'právě spí' : ''" />
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
	const ended_at = localEnd.value
		? applyTime(props.initialEndTs ?? props.initialStartTs, localEnd.value)
		: null
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
