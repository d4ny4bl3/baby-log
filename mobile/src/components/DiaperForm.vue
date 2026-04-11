<template>
	<div class="diaper-form">
		<div class="form-group">
			<label>Čas</label>
			<input type="time" v-model="localTime" />
		</div>

		<div class="form-group">
			<label>Typ</label>
			<div class="type-pills">
				<button
					v-for="t in DIAPER_TYPES"
					:key="t.key"
					class="type-pill"
					:class="{ 'type-pill--active': localType === t.key }"
					@click="localType = t.key"
				>
					{{ t.label }}
				</button>
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
import { DIAPER_TYPES } from '@/utils/eventTypes'

const props = defineProps({
	initialTs: { type: Number, required: true },
	initialType: { type: String, default: null },
})

const emit = defineEmits(['save', 'cancel'])

const localTime = ref(toTimeString(props.initialTs))
const localType = ref(props.initialType)

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
	emit('save', { changed_at: d.getTime(), type: localType.value })
}
</script>

<style scoped>
.diaper-form {
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
	text-transform: uppercase;
	letter-spacing: 0.05em;
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
