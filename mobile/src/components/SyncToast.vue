<template>
	<Teleport to="body">
		<Transition name="toast">
			<div v-if="isOpen" class="toast">
				<span>{{ message }}</span>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
	isOpen: Boolean,
	message: { type: String, default: '' },
	duration: { type: Number, default: 3000 },
})

const emit = defineEmits(['dismiss'])

watch(() => props.isOpen, (val) => {
	if (val) setTimeout(() => emit('dismiss'), props.duration)
})
</script>
