<template>
	<Teleport to="body">
		<Transition name="ev-modal">
			<div v-if="isOpen" class="ev-overlay" @click.self="close">
				<div class="ev-sheet">
					<template v-if="mode === 'pick'">
						<div class="ev-title">Přidat záznam</div>
						<div class="ev-subtitle">Vyber typ záznamu</div>
						<div class="ev-type-grid">
							<button class="ev-type-btn" @click="pick('sleep')">
								<img :src="sleepIcon" class="ev-type-icon" alt="">
								<span>Spánek</span>
							</button>
							<button class="ev-type-btn" @click="pick('eat')">
								<img :src="eatIcon" class="ev-type-icon" alt="">
								<span>Krmení</span>
							</button>
							<button class="ev-type-btn" @click="pick('diaper')">
								<img :src="diaperIcon" class="ev-type-icon" alt="">
								<span>Přebalení</span>
							</button>
						</div>
						<div class="ev-actions">
							<button class="ev-btn ev-btn--cancel" @click="close">Zrušit</button>
						</div>
					</template>

					<template v-else-if="mode === 'form' && pickedType === 'sleep'">
						<div class="ev-title ev-title--edit">Nový spánek</div>
						<SleepForm
							:initial-start-ts="defaultTs"
							:initial-end-ts="null"
							@save="onSave"
							@cancel="mode = 'pick'"
						/>
					</template>

					<template v-else-if="mode === 'form' && pickedType === 'eat'">
						<div class="ev-title ev-title--edit">Nové krmení</div>
						<EatForm
							:initial-ts="defaultTs"
							:initial-type="null"
							:initial-amount="null"
							@save="onSave"
							@cancel="mode = 'pick'"
						/>
					</template>

					<template v-else-if="mode === 'form' && pickedType === 'diaper'">
						<div class="ev-title ev-title--edit">Nové přebalení</div>
						<DiaperForm
							:initial-ts="defaultTs"
							:initial-type="null"
							@save="onSave"
							@cancel="mode = 'pick'"
						/>
					</template>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBackButton } from '@ionic/vue'
import SleepForm from '@/components/SleepForm.vue'
import EatForm from '@/components/EatForm.vue'
import DiaperForm from '@/components/DiaperForm.vue'
import eatIcon from '@/assets/icons/overview-eat.svg'
import sleepIcon from '@/assets/icons/overview-sleep.svg'
import diaperIcon from '@/assets/icons/overview-diaper.svg'

const props = defineProps({
	isOpen: Boolean,
	dayStartTs: { type: Number, required: true },
})

const emit = defineEmits(['close', 'add'])

const mode = ref('pick')
const pickedType = ref(null)

const defaultTs = computed(() => {
	const noon = props.dayStartTs + 12 * 60 * 60 * 1000
	return Math.min(noon, Date.now())
})

watch(() => props.isOpen, (val) => {
	if (val) {
		mode.value = 'pick'
		pickedType.value = null
	}
})

useBackButton(10001, (processNextHandler) => {
	if (!props.isOpen) return processNextHandler()
	if (mode.value === 'form') {
		mode.value = 'pick'
	} else {
		close()
	}
})

function pick(type) {
	pickedType.value = type
	mode.value = 'form'
}

function close() {
	emit('close')
}

function onSave(data) {
	emit('add', { type: pickedType.value, data })
	close()
}
</script>
