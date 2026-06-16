<template>
	<IonPage class="onboarding-view">
		<IonContent>
			<div class="onboarding-wrap">
				<Swiper
					:slides-per-view="1"
					:allow-touch-move="false"
					:pagination="{ clickable: false }"
					:modules="modules"
					class="onboarding-swiper"
					@swiper="onSwiper"
				>
					<!-- Slide 1 – Uvítání -->
					<SwiperSlide>
						<div class="slide">
							<img src="/logo.png" class="slide-logo" alt="Baby Log" />
							<h1>Vítejte v aplikaci Baby Log</h1>
							<p class="slide-text">Jednoduchý deník pro každodenní péči o miminko. Zaznamenejte krmení, spánek a přebalení snadno a rychle.</p>
							<IonButton expand="block" class="action-btn primary slide-btn" @click="next">Začít</IonButton>
						</div>
					</SwiperSlide>

					<!-- Slide 2 – Účet -->
					<SwiperSlide>
						<div class="slide">
							<div class="slide-icon">☁️</div>
							<h2>Synchronizace dat</h2>
							<p class="slide-text">Přihlaste se nebo si vytvořte účet pro zálohování dat a sdílení s partnerem. Appka funguje i bez účtu.</p>
							<IonButton expand="block" class="action-btn primary slide-btn" @click="handleLogin">
								Přihlásit se
							</IonButton>
							<IonButton expand="block" class="action-btn primary slide-btn" @click="handleRegister">
								Vytvořit účet
							</IonButton>
							<IonButton expand="block" fill="outline" class="slide-btn-skip" @click="next">
								Přeskočit
							</IonButton>
						</div>
					</SwiperSlide>

					<!-- Slide 3 – Profil miminka -->
					<SwiperSlide>
						<div class="slide">
							<h2>Profil miminka</h2>
							<p class="slide-text">Pojďme nastavit profil vašeho miminka.</p>

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

							<IonButton expand="block" class="action-btn primary slide-btn" :disabled="isSubmitting" @click="handleCreateChild">
								Hotovo
							</IonButton>
						</div>
					</SwiperSlide>
				</Swiper>
			</div>
		</IonContent>
	</IonPage>
</template>

<script setup>
import { IonPage, IonContent, IonButton, useBackButton } from "@ionic/vue";
import { App as CapacitorApp } from "@capacitor/app";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { insertChild, insertAppMetadata } from "@/database/queries";
import { createId } from "@/utils/id";
import { useSyncStore } from "@/stores/syncStore.js";

defineOptions({ name: "Onboarding" });

const modules = [Pagination];
const swiperInstance = ref(null);
const syncStore = useSyncStore();

const name = ref("");
const gender = ref("");
const birthDate = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const router = useRouter();

useBackButton(20000, () => {
	if (swiperInstance.value?.isBeginning) {
		CapacitorApp.exitApp();
	} else {
		swiperInstance.value?.slidePrev();
	}
});

function onSwiper(swiper) {
	swiperInstance.value = swiper;
}

function next() {
	swiperInstance.value?.slideNext();
}

function handleLogin() {
	router.push({ name: "Login" });
}

function handleRegister() {
	router.push({ name: "Register" });
}

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

		await insertAppMetadata({ key: "active_child_id", value: childId });
		syncStore.retryPending()
		await router.replace("/app/home");
	} catch {
		errorMessage.value = "Nepodařilo se uložit profil miminka.";
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<style scoped>
.onboarding-wrap {
	height: 100%;
	display: flex;
	align-items: center;
}

.onboarding-swiper {
	width: 100%;
	height: 100%;
}

.slide {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 32px;
	height: 100%;
	text-align: center;
}

.slide-logo {
	width: 90px;
	height: 90px;
	border-radius: 20px;
	margin-bottom: 24px;
}

.slide-icon {
	font-size: 56px;
	margin-bottom: 16px;
}

.slide h1 {
	font-size: 1.8rem;
	font-weight: 700;
	margin: 0 0 12px;
}

.slide h2 {
	font-size: 1.4rem;
	font-weight: 700;
	margin: 0 0 12px;
}

.slide-text {
	font-size: 0.95rem;
	color: #555;
	line-height: 1.6;
	margin-bottom: 32px;
}

.form-group {
	width: 100%;
	text-align: left;
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
}

.form-group label {
	display: block;
	margin-bottom: 6px;
}

.form-group input,
.form-group select {
	width: 100%;
	padding: 14px;
	border-radius: 16px;
	border: 1px solid #ddd;
	font-size: 16px;
	background-color: #fff;
	color: #2b2b2b;
	appearance: none;
	-webkit-appearance: none;
	box-sizing: border-box;
}

.form-group select {
	padding-right: 40px;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right 12px center;
	background-size: 20px 20px;
}

.form-group input[type="date"] {
	display: block;
	min-height: 52px;
}

.form-group input:focus,
.form-group select:focus {
	outline: none;
	border-color: #66bb6a;
	box-shadow: 0 0 0 2px rgba(102, 187, 106, 0.2);
}

.error-message {
	color: #d24343;
	font-size: 14px;
	margin: 0 0 12px;
}

.slide-btn {
	width: 100%;
	margin-bottom: 12px;
}

.slide-btn-skip {
	width: 100%;
	--border-radius: 32px;
	--border-width: 2px;
	--border-style: solid;
	--border-color: #67b18c;
	--color: #67b18c;
	--background: transparent;
	--box-shadow: none;
	height: 56px;
	font-size: 1.1rem;
	font-weight: 600;
}
</style>
