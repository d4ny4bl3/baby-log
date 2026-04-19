<template>
	<IonPage class="child-init-view">
		<IonContent>
			<div class="onboarding-container">
				<div class="onboarding-box">

				<h1>Vítejte v aplikaci Baby Log</h1>
				<p class="subtitle">
					Pojďme nastavit profil vašeho miminka a začít sledovat jeho dny.
				</p>

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
					@click="handleCreateChild"
				>
					Vytvořit profil miminka
				</IonButton>

				</div>
			</div>
		</IonContent>
	</IonPage>
</template>

<script setup>
import {
	IonPage,
	IonContent,
	IonButton,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { insertChild, insertAppMetadata } from "@/database/queries";
import { createId } from "@/utils/id";

defineOptions({
	name: "ChildInit",
});

const name = ref("");
const gender = ref("");
const birthDate = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const router = useRouter();

async function handleCreateChild() {
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
		const childId = createId();
		const now = Date.now();

		await insertChild({
			id: childId,
			name: trimmedName,
			gender: gender.value,
			birth_date: new Date(`${birthDate.value}T00:00:00`).getTime(),
			created_at: now,
			updated_at: now,
		});

		await insertAppMetadata({
			key: "active_child_id",
			value: childId,
		});

		await router.replace("/app/home");
	} catch (error) {
		errorMessage.value = "Nepodařilo se uložit profil miminka.";
	} finally {
		isSubmitting.value = false;
	}
}
</script>
