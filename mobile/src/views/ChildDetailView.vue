<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonButtons slot="start" />
				<IonTitle class="ion-text-center">{{ child?.name }}</IonTitle>
				<IonButtons slot="end">
					<IonButton @click="openActions">
						<IonIcon slot="icon-only" :icon="ellipsisVertical" />
					</IonButton>
				</IonButtons>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div v-if="child" class="child-detail">
				<div class="child-avatar" @click="child.photo && (photoPreview = true)">
					<img v-if="child.photo" :src="child.photo" class="child-avatar-img" alt="">
					<span v-else>{{ child.name[0] }}</span>
				</div>
				<h1 class="child-name">{{ child.name }}</h1>
				<div class="child-pills">
					<span class="info-pill">{{ formatAge(child.birth_date) }}</span>
					<span class="info-pill">{{ child.gender === 'girl' ? 'Holčička' : 'Chlapeček' }}</span>
				</div>
				<p v-if="child.birth_date" class="child-birthdate">{{ formatBirthDate(child.birth_date) }}</p>
			</div>
		</IonContent>

		<Teleport to="body">
			<Transition name="cropper-modal">
				<div v-if="photoPreview && child" class="photo-preview-overlay" @click="photoPreview = false">
					<img :src="child.photo" class="photo-preview-img" alt="">
				</div>
			</Transition>
		</Teleport>

		<Teleport to="body">
			<Transition name="cropper-modal">
				<div v-if="cropperSrc" class="cropper-overlay">
					<div class="cropper-sheet">
						<div class="cropper-header">
							<button class="cropper-btn cropper-btn--cancel" @click="cropperSrc = null">Zrušit</button>
							<span class="cropper-title">Upravit fotku</span>
							<button class="cropper-btn cropper-btn--save" @click="confirmCrop">Uložit</button>
						</div>
						<Cropper
							ref="cropperRef"
							class="cropper"
							:src="cropperSrc"
							:stencil-props="{ aspectRatio: 1 }"
							:stencil-component="CircleStencil"
						/>
					</div>
				</div>
			</Transition>
		</Teleport>
	</IonPage>
</template>

<script setup>
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonButtons,
	IonButton,
	IonIcon,
	actionSheetController,
	alertController,
	onIonViewWillEnter,
	useBackButton,
} from "@ionic/vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ellipsisVertical, createOutline, trashOutline, cameraOutline } from "ionicons/icons";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import { getChild, deleteChild, updateChildPhoto } from "@/database/queries";
import { useSyncStore } from "@/stores/syncStore.js";

defineOptions({ name: "ChildDetail" });

const route = useRoute();
const syncStore = useSyncStore();
const router = useRouter();
const child = ref(null);
const cropperSrc = ref(null);
const cropperRef = ref(null);
const photoPreview = ref(false);

useBackButton(10001, (processNextHandler) => {
	if (photoPreview.value) {
		photoPreview.value = false;
	} else {
		processNextHandler();
	}
});

onIonViewWillEnter(async () => {
	child.value = await getChild(route.params.id);
});

async function openActions() {
	const sheet = await actionSheetController.create({
		buttons: [
			{
				text: "Upravit",
				icon: createOutline,
				handler: () => router.push({ name: "ChildEdit", params: { id: child.value.id } }),
			},
			{
				text: "Změnit fotku",
				icon: cameraOutline,
				handler: () => pickPhoto(),
			},
			{
				text: "Smazat",
				icon: trashOutline,
				role: "destructive",
				handler: () => confirmDelete(),
			},
		],
	});
	await sheet.present();
}

async function pickPhoto() {
	const photo = await Camera.getPhoto({
		quality: 90,
		resultType: CameraResultType.DataUrl,
		source: CameraSource.Prompt,
		promptLabelHeader: 'Fotka dítěte',
		promptLabelPhoto: 'Vybrat z galerie',
		promptLabelPicture: 'Vyfotit',
		promptLabelCancel: 'Zrušit',
	})
	cropperSrc.value = photo.dataUrl
}

async function confirmCrop() {
	const { canvas } = cropperRef.value.getResult()
	const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
	child.value.photo = dataUrl
	await updateChildPhoto(child.value.id, dataUrl)
	syncStore.retryPending()
	cropperSrc.value = null
}

async function confirmDelete() {
	const alert = await alertController.create({
		header: "Smazat dítě",
		message: `Opravdu chcete smazat profil „${child.value.name}"?`,
		buttons: [
			{ text: "Zrušit", role: "cancel" },
			{
				text: "Smazat",
				role: "destructive",
				handler: async () => {
					await deleteChild(child.value.id);
					syncStore.retryPending()
					router.back();
				},
			},
		],
	});
	await alert.present();
}

function formatBirthDate(ts) {
	return dayjs(ts).locale("cs").format("D. MMMM YYYY");
}

function formatAge(ts) {
	const birth = dayjs(ts);
	const days = dayjs().diff(birth, "day");
	const months = dayjs().diff(birth, "month");
	const years = dayjs().diff(birth, "year");

	if (days < 30) {
		if (days === 1) return "1 den";
		if (days < 5) return `${days} dny`;
		return `${days} dní`;
	}
	if (months < 24) {
		if (months === 1) return "1 měsíc";
		if (months < 5) return `${months} měsíce`;
		return `${months} měsíců`;
	}
	if (years === 1) return "1 rok";
	if (years < 5) return `${years} roky`;
	return `${years} let`;
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

.child-detail {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40px 24px 24px;
}

.child-avatar {
	width: 200px;
	height: 200px;
	border-radius: 50%;
	background: linear-gradient(135deg, #9fd3b6, #67b18c);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 3rem;
	font-weight: 700;
	margin-bottom: 20px;
	position: relative;
}

.child-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}

.child-name {
	font-size: 1.6rem;
	font-weight: 700;
	color: #1a1a1a;
	margin: 0 0 8px;
}

.child-pills {
	display: flex;
	gap: 8px;
	margin-bottom: 12px;
}

.info-pill {
	background: #f0f4f2;
	color: #4a7c62;
	font-size: 1.1rem;
	font-weight: 600;
	padding: 4px 14px;
	border-radius: 32px;
}

.child-birthdate {
	margin: 0;
}
</style>

<style>
.cropper-overlay {
	position: fixed;
	inset: 0;
	z-index: 9999;
	background: #000;
	display: flex;
	flex-direction: column;
}

.cropper-sheet {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.cropper-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	padding-top: calc(16px + env(safe-area-inset-top));
	background: #111;
}

.cropper-title {
	font-size: 1rem;
	font-weight: 600;
	color: #fff;
}

.cropper-btn {
	background: none;
	border: none;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	padding: 4px 0;
}

.cropper-btn--cancel {
	color: #aaa;
}

.cropper-btn--save {
	color: #9b87c6;
}

.cropper {
	flex: 1;
	background: #000;
}

.cropper-modal-enter-active,
.cropper-modal-leave-active {
	transition: opacity 0.2s ease;
}
.cropper-modal-enter-from,
.cropper-modal-leave-to {
	opacity: 0;
}

.photo-preview-overlay {
	position: fixed;
	inset: 0;
	z-index: 9999;
	background: rgba(0, 0, 0, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
}

.photo-preview-img {
	max-width: 90vw;
	max-height: 90vh;
	border-radius: 12px;
	object-fit: contain;
}
</style>
