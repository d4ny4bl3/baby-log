<template>
	<IonHeader>
		<IonToolbar class="header_primary">
			<IonTitle class="ion-text-center">{{ title }}</IonTitle>
			<IonSelect
				v-if="children.length > 1"
				slot="end"
				:model-value="activeChildId"
				interface="popover"
				placeholder="Dítě"
				class="header-child-select"
				@ionChange="onChangeChild"
			>
				<IonSelectOption v-for="child in children" :key="child.id" :value="child.id">
					{{ child.name }}
				</IonSelectOption>
			</IonSelect>
		</IonToolbar>
	</IonHeader>
</template>

<script setup>
import { computed } from "vue";
import { IonHeader, IonToolbar, IonTitle, IonSelect, IonSelectOption } from "@ionic/vue";

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

function onChangeChild(event) {
	emit("change-child", event.detail.value);
}
</script>
