<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonButtons slot="start" />
				<IonTitle class="ion-text-center">Upravit dítě</IonTitle>
				<IonButtons slot="end" />
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div class="child-edit-container">
				<ChildForm
					v-model:name="name"
					v-model:gender="gender"
					v-model:birth-date="birthDate"
					:error-message="errorMessage"
				/>

				<div class="save-btn-wrapper">
					<IonButton
						expand="block"
						class="action-btn primary"
						:disabled="isSubmitting"
						@click="handleSubmit"
					>
						Uložit
					</IonButton>
				</div>
			</div>
		</IonContent>
	</IonPage>
</template>

<script setup>
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonButtons,
	IonContent,
	IonButton,
	onIonViewWillEnter,
} from "@ionic/vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getChild, updateChild } from "@/database/queries";
import { useSyncStore } from "@/stores/syncStore.js";
import ChildForm from "@/components/ChildForm.vue";
import dayjs from "dayjs";

defineOptions({ name: "ChildEdit" });

const route = useRoute();
const router = useRouter();

const name = ref("");
const gender = ref("");
const birthDate = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const syncStore = useSyncStore();

onIonViewWillEnter(async () => {
	const child = await getChild(route.params.id);
	if (!child) return;
	name.value = child.name;
	gender.value = child.gender ?? "";
	birthDate.value = child.birth_date
		? dayjs(child.birth_date).format("YYYY-MM-DD")
		: "";
});

async function handleSubmit() {
	errorMessage.value = "";

	const trimmedName = name.value.trim();
	if (!trimmedName) {
		errorMessage.value = "Zadejte prosím jméno miminka.";
		return;
	}
	if (!gender.value) {
		errorMessage.value = "Vyberte prosím pohlaví.";
		return;
	}
	if (!birthDate.value) {
		errorMessage.value = "Vyberte prosím datum narození.";
		return;
	}

	isSubmitting.value = true;
	try {
		await updateChild(route.params.id, {
			name: trimmedName,
			gender: gender.value,
			birth_date: new Date(`${birthDate.value}T00:00:00`).getTime(),
		});
		syncStore.retryPending()
		router.back();
	} catch {
		errorMessage.value = "Nepodařilo se uložit změny.";
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<style scoped>
ion-title {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	pointer-events: none;
}

.child-edit-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 0 32px;
}

.save-btn-wrapper {
	padding: 0 16px;
}

.save-btn-wrapper .action-btn {
	--height: 48px;
}
</style>
