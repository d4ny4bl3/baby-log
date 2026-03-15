<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonButtons slot="start">
					<IonBackButton default-href="/app/settings/children" text="" />
				</IonButtons>
				<IonTitle class="ion-text-center">Přidat dítě</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div class="child-add-container ion-padding">
				<div class="form-group">
					<label>Jméno miminka</label>
					<input v-model="name" type="text" />
				</div>

				<div class="form-group">
					<label>Pohlaví</label>
					<select v-model="gender">
						<option value="">Vyberte pohlaví</option>
						<option value="girl">Holčička</option>
						<option value="boy">Chlapeček</option>
					</select>
				</div>

				<div class="form-group">
					<label>Datum narození</label>
					<input v-model="birthDate" type="date" />
				</div>

				<p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

				<IonButton
					expand="block"
					class="action-btn primary"
					:disabled="isSubmitting"
					@click="handleSubmit"
				>
					Uložit
				</IonButton>
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
	IonBackButton,
	IonContent,
	IonButton,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { insertChild } from "@/database/queries";
import { createId } from "@/utils/id";

defineOptions({ name: "ChildAdd" });

const name = ref("");
const gender = ref("");
const birthDate = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const router = useRouter();

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
		router.back();
	} catch {
		errorMessage.value = "Nepodařilo se uložit profil miminka.";
	} finally {
		isSubmitting.value = false;
	}
}
</script>
