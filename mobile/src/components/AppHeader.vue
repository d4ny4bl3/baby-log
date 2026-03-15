<template>
	<IonHeader>
		<IonToolbar class="header_primary">
			<IonTitle class="ion-text-center">
				<button v-if="children.length > 1" class="child-select-btn" @click="openActionSheet">
					{{ title }}
					<IonIcon :icon="chevronDownOutline" class="child-select-icon" />
				</button>
				<span v-else>{{ title }}</span>
			</IonTitle>
		</IonToolbar>
	</IonHeader>
</template>

<script setup>
import { computed } from "vue";
import { IonHeader, IonToolbar, IonTitle, IonIcon, actionSheetController } from "@ionic/vue";
import { chevronDownOutline } from "ionicons/icons";

const props = defineProps({
	children: {
		type: Array,
		default: () => [],
	},
	activeChildId: {
		type: String,
		default: null,
	},
});

const emit = defineEmits(["change-child"]);

const title = computed(() => {
	if (props.children.length === 1) return props.children[0].name;
	if (props.children.length > 1) {
		const active = props.children.find((child) => child.id === props.activeChildId);
		return active?.name || "Baby Log";
	}
	return "Baby Log";
});

async function openActionSheet() {
	const sheet = await actionSheetController.create({
		buttons: props.children.map((child) => ({
			text: child.name,
			handler: () => emit("change-child", child.id),
		})),
	});
	await sheet.present();
}
</script>

<style scoped>
.child-select-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background: none;
	border: none;
	padding: 0;
	font-size: inherit;
	font-weight: inherit;
	color: inherit;
	cursor: pointer;
}

.child-select-icon {
	font-size: 1rem;
}
</style>
