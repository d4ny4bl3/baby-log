<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Přidat dítě</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div class="child-add-container">
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
	IonContent,
	IonButton,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { insertChild } from "@/database/queries";
import { createId } from "@/utils/id";
import { useSyncStore } from "@/stores/syncStore.js";
import ChildForm from "@/components/ChildForm.vue";

defineOptions({ name: "ChildAdd" });

const name = ref("");
const gender = ref("");
const birthDate = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const router = useRouter();
const syncStore = useSyncStore();

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
		const now = Date.now();
		await insertChild({
			id: createId(),
			name: trimmedName,
			gender: gender.value,
			birth_date: new Date(`${birthDate.value}T00:00:00`).getTime(),
			created_at: now,
			updated_at: now,
		});
		syncStore.retryPending()
		router.back();
	} catch {
		errorMessage.value = "Nepodařilo se uložit profil miminka.";
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<style scoped>
.child-add-container {
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
