<template>
	<div class="modal-card">
		<IonContent class="ion-padding">
			<div class="modal-header detail-modal-header">
				<img :src="icon" class="detail-modal-icon" alt="">
				<h2 class="modal-title">{{ title }}</h2>
				<p class="modal-subtitle">{{ subtitle }}</p>
			</div>

			<div class="modal-actions">
				<IonButton
					expand="block"
					fill="clear"
					class="action-btn secondary"
					@click="dismiss('cancel')"
				>
					Zrušit
				</IonButton>
				<IonButton
					expand="block"
					class="action-btn detail-modal-delete"
					@click="dismiss('delete')"
				>
					Smazat
				</IonButton>
			</div>
		</IonContent>
	</div>
</template>

<script setup>
import { IonButton, IonContent, modalController } from '@ionic/vue'
import eatIcon from '@/assets/icons/overview-eat.svg'
import sleepIcon from '@/assets/icons/overview-sleep.svg'
import diaperIcon from '@/assets/icons/overview-diaper.svg'
import { computed } from 'vue'

const props = defineProps({
	event: { type: Object, default: null },
})

const icon = computed(() => {
	if (props.event?.type === 'sleep') return sleepIcon
	if (props.event?.type === 'eat') return eatIcon
	return diaperIcon
})

const title = computed(() => {
	if (props.event?.type === 'sleep') return 'Spánek'
	if (props.event?.type === 'eat') return 'Krmení'
	return 'Přebalení'
})

const subtitle = computed(() => props.event?.detail ?? props.event?.timeLabel ?? '')

function dismiss(role) {
	modalController.dismiss(null, role)
}
</script>

<style>
.detail-modal-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding-top: 8px;
}

.detail-modal-icon {
	width: 48px;
	height: 48px;
	margin-bottom: 4px;
}

.detail-modal-delete {
	--background: #e05555;
	--color: #ffffff;
}
</style>
