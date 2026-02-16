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

const props = defineProps({
	isOpen: Boolean,
	type: String
})

const emit = defineEmits(["close", "save"])

const time = ref("")
const amount = ref(150)

watch(() => props.isOpen, (val) => {
	if (val) {
		const now = new Date()
		time.value = now.toTimeString().slice(0, 5)
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
	d.setHours(h, m, 0, 0)
	return d.getTime()
}

const submit = () => {
  const ts = parseTime(time.value)

  emit("save", {
    type: props.type,
    start_ts: ts,
    amount: props.type === "eat" ? Number(amount.value) : undefined
  })

  close()
}

const close = () => {
	emit("close")
}
</script>