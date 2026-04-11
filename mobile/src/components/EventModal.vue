<template>
	<IonModal
		:is-open="isOpen"
		@didDismiss="close"
		class="event-modal"
	>
		<div class="modal-card">
			<IonContent class="ion-padding">
				<div class="modal-header">
					<h2 class="modal-title">{{ header }}</h2>
					<p class="modal-subtitle">{{ subtitle }}</p>
				</div>

				<div class="form-group">
					<label>Čas</label>
					<input type="time" v-model="time" />
				</div>

				<div v-if="type === 'eat'" class="form-group">
					<label>Množství (ml)</label>
					<input type="number" v-model="amount" />
				</div>

				<div v-if="type === 'diaper'" class="form-group">
					<label>Typ</label>
					<div class="type-pills">
						<button
							v-for="t in DIAPER_TYPES"
							:key="t.key"
							class="type-pill"
							:class="{ 'type-pill--active': diaperType === t.key }"
							@click="diaperType = t.key"
						>
							{{ t.label }}
						</button>
					</div>
				</div>

				<div class="form-group form-group--toggle">
					<span class="toggle-label">Včerejší den</span>
					<label class="toggle-switch">
						<input type="checkbox" v-model="isYesterday" />
						<span class="toggle-track">
							<span class="toggle-thumb" />
						</span>
					</label>
				</div>

				<p v-if="error" class="modal-error">{{ error }}</p>

			<div class="modal-actions">
					<IonButton
						expand="block"
						fill="clear"
						class="action-btn secondary"
						@click="close"
					>
						Zrušit
					</IonButton>

					<IonButton
						expand="block"
						class="action-btn primary"
						@click="submit"
					>
						OK
					</IonButton>
				</div>

			</IonContent>
		</div>
	</IonModal>
</template>

<script setup>
import {
	IonModal,
	IonButton,
} from '@ionic/vue';
import { ref, watch, computed } from 'vue';
import { DIAPER_TYPES } from '@/utils/eventTypes';

const props = defineProps({
	isOpen: Boolean,
	type: String,
	sleepStart: { type: Number, default: null },
})

const emit = defineEmits(["close", "save"])

const time = ref("")
const amount = ref(150)
const diaperType = ref(null)
const isYesterday = ref(false)
const error = ref("")

watch(() => props.isOpen, (val) => {
	if (val) {
		const now = new Date()
		time.value = now.toTimeString().slice(0, 5)
		diaperType.value = null
		isYesterday.value = false
	}
})

const header = computed(() => {
	switch (props.type) {
		case "sleep": return "Usnutí"
		case "awake": return "Vstávání"
		case "eat": return "Krmení"
		case "diaper": return "Přebalení"
		default: return ""
	}
})

const subtitle = computed(() => {
	switch (props.type) {
		case "sleep": return "Zadejte čas usnutí"
		case "awake": return "Zadejte čas probuzení"
		case "eat": return "Zadejte čas krmení"
		case "diaper": return "Zadejte čas přebalení"
		default: return ""
	}
})

const parseTime = (time) => {
	const [h, m] = time.split(":").map(Number)
	const d = new Date()
	if (isYesterday.value) {
		d.setDate(d.getDate() - 1)
	}
	d.setHours(h, m, 0, 0)
	return d.getTime()
}

const submit = () => {
	const ts = parseTime(time.value)

	if (props.type === "awake" && props.sleepStart !== null && ts <= props.sleepStart) {
		error.value = "Čas vstávání musí být po čase usnutí."
		return
	}

	error.value = ""
	emit("save", {
		type: props.type,
		timestamp: ts,
		amount: props.type === "eat" ? Number(amount.value) : undefined,
		diaperType: props.type === "diaper" ? diaperType.value : undefined,
	})

	close()
}

const close = () => {
	error.value = ""
	emit("close")
}
</script>
