<template>
	<div class="eat-form">
		<div class="form-group">
			<label>Čas</label>
			<input type="time" v-model="localTime" />
		</div>

		<div class="form-group">
			<label>Typ</label>
			<div class="type-pills">
				<button
					v-for="t in EAT_TYPES"
					:key="t.key"
					class="type-pill"
					:class="{ 'type-pill--active': localType === t.key }"
					@click="localType = t.key"
				>
					{{ t.label }}
				</button>
			</div>
		</div>

		<div v-if="localType === 'bottle'" class="form-group">
			<label>Množství (ml)</label>
			<input type="number" v-model="localAmount" />
		</div>

		<div class="ev-actions">
			<button class="ev-btn ev-btn--cancel" @click="$emit('cancel')">Zrušit</button>
			<button class="ev-btn ev-btn--save" @click="onSave">Uložit</button>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { EAT_TYPES } from '@/utils/eventTypes'

const props = defineProps({
	initialTs: { type: Number, required: true },
	initialType: { type: String, default: null },
	initialAmount: { type: Number, default: null },
})

const emit = defineEmits(['save', 'cancel'])

const localTime = ref(toTimeString(props.initialTs))
const localType = ref(props.initialType)
const localAmount = ref(props.initialAmount)

function toTimeString(ts) {
	const d = new Date(ts)
	const h = String(d.getHours()).padStart(2, '0')
	const m = String(d.getMinutes()).padStart(2, '0')
	return `${h}:${m}`
}

function onSave() {
	const [h, m] = localTime.value.split(':').map(Number)
	const d = new Date(props.initialTs)
	d.setHours(h, m, 0, 0)
	emit('save', { started_at: d.getTime(), type: localType.value, amount: localType.value === 'bottle' ? Number(localAmount.value) : null })
}
</script>

<style scoped>
.eat-form {
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

.form-group input[type="time"]:focus,
.form-group input[type="number"]:focus {
	border-color: #9b87c6;
}

.form-group input[type="number"] {
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

.type-pills {
	display: flex;
	gap: 8px;
}

.type-pill {
	flex: 1;
	padding: 10px 0;
	border: 1.5px solid #e4ddf5;
	border-radius: 12px;
	background: #faf8ff;
	color: #7a6a96;
	font-size: 0.95rem;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.type-pill--active {
	background: #ede9fe;
	border-color: #9b87c6;
	color: #3d3050;
	font-weight: 700;
}
</style>
