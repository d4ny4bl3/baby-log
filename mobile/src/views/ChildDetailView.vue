<template>
	<IonPage>
		<IonContent :fullscreen="true" class="child-detail-content">
			<template v-if="child">
				<button class="detail-back" @click="router.back()">
					<IonIcon :icon="chevronBackOutline" />
				</button>

				<div class="child-hero" :class="child.gender">
					<div class="child-avatar" @click="child.photo && (photoPreview = true)">
						<img v-if="child.photo" :src="child.photo" class="child-avatar-img" alt="">
						<span v-else>{{ child.name[0] }}</span>
					</div>
					<h1 class="child-name">{{ child.name }}</h1>
					<div class="child-pills">
						<span class="child-pill age">
							<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
								stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 20h18" />
								<path d="M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" />
								<path d="M3 15c1.2 1 2 1 3 0s1.8-1 3 0 1.8 1 3 0 1.8-1 3 0 1.8 1 3 0" />
								<path d="M12 8V5" />
							</svg>
							{{ formatAge(child.birth_date) }}
						</span>
						<span class="child-pill" :class="child.gender">
							{{ child.gender === 'girl' ? 'Holčička' : 'Chlapeček' }}
						</span>
					</div>
					<div v-if="child.birth_date" class="child-birthdate">
						{{ child.gender === 'girl' ? 'Narozena' : 'Narozen' }} {{ formatBirthDate(child.birth_date) }}
					</div>
				</div>

				<div class="child-actions">
					<button class="action-tile" @click="router.push({ name: 'ChildEdit', params: { id: child.id } })">
						<div class="action-icon"><IonIcon :icon="createOutline" /></div>
						<span>Upravit</span>
					</button>
					<button class="action-tile" @click="pickPhoto">
						<div class="action-icon"><IonIcon :icon="cameraOutline" /></div>
						<span>Fotka</span>
					</button>
					<button class="action-tile danger" @click="confirmDelete">
						<div class="action-icon"><IonIcon :icon="trashOutline" /></div>
						<span>Smazat</span>
					</button>
				</div>

				<!-- <div class="child-placeholder-wrap">
					<div class="child-placeholder">
						<div class="child-placeholder-title">Statistiky a milníky</div>
						<div class="child-placeholder-text">Přibydou později — zatím tu žije jen profil.</div>
					</div>
				</div> -->

			</template>
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
	IonContent,
	IonIcon,
	alertController,
	onIonViewWillEnter,
	useBackButton,
} from "@ionic/vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { chevronBackOutline, createOutline, trashOutline, cameraOutline } from "ionicons/icons";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import { getChild, deleteChild, updateChildPhoto } from "@/database/queries";
import { useSyncStore } from "@/stores/syncStore.js";
import { formatAge, formatBirthDate } from "@/utils/time";

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
</script>

<style scoped>
.child-detail-content {
	--background: #fffafd;
}

.detail-back {
	position: absolute;
	top: calc(env(safe-area-inset-top) + 8px);
	left: 12px;
	z-index: 2;
	width: 42px;
	height: 42px;
	border-radius: 50%;
	border: none;
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(6px);
	-webkit-backdrop-filter: blur(6px);
	color: #5d4a7f;
	font-size: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.child-hero {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	padding: calc(env(safe-area-inset-top) + 64px) 24px 24px;
	background: linear-gradient(180deg, #f1ebfa 0%, #e4ddf5 55%, #fffafd 100%);
}

.child-hero.girl {
	background: linear-gradient(180deg, #fcebf2 0%, #f8dbe7 55%, #fffafd 100%);
}

.child-hero.boy {
	background: linear-gradient(180deg, #e9edfb 0%, #dbe2f6 55%, #fffafd 100%);
}

.child-avatar {
	width: 150px;
	height: 150px;
	border-radius: 50%;
	background: linear-gradient(135deg, #9fd3b6, #67b18c);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 3.4rem;
	font-weight: 700;
	box-shadow: 0 10px 30px rgba(103, 177, 140, 0.35), 0 0 0 6px #fff;
	cursor: pointer;
}

.child-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}

.child-name {
	font-size: 1.9rem;
	font-weight: 700;
	color: #3d3050;
	margin: 18px 0 12px;
}

.child-pills {
	display: flex;
	gap: 8px;
	margin-bottom: 10px;
}

.child-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	border-radius: 999px;
	padding: 6px 15px;
	font-size: 1rem;
	font-weight: 700;
	white-space: nowrap;
}

.child-pill.age {
	background: #f1ebfa;
	color: #7b68b0;
}

.child-pill.girl {
	background: #fcebf2;
	color: #b35f82;
}

.child-pill.boy {
	background: #e9edfb;
	color: #566bb5;
}

.child-birthdate {
	font-size: 0.95rem;
	font-weight: 600;
	color: #666;
}

.child-actions {
	display: flex;
	gap: 10px;
	padding: 4px 16px 16px;
}

.action-tile {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 16px 6px;
	border: none;
	border-radius: 14px;
	background: #fff;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	cursor: pointer;
	transition: transform 0.12s;
}

.action-tile:active {
	transform: scale(0.96);
}

.action-icon {
	width: 46px;
	height: 46px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f1ebfa;
	color: #8f7ac6;
	font-size: 22px;
}

.action-tile span {
	font-size: 0.9rem;
	font-weight: 700;
	color: #5d4a7f;
}

.action-tile.danger .action-icon {
	background: #fdecec;
	color: #e05555;
}

.action-tile.danger span {
	color: #e05555;
}

.child-placeholder-wrap {
	padding: 8px 16px 28px;
}

.child-placeholder {
	border: 1.5px dashed #e4ddf5;
	border-radius: 18px;
	padding: 22px 18px;
	text-align: center;
	background: #faf8ff;
}

.child-placeholder-title {
	font-size: 0.95rem;
	font-weight: 700;
	color: #7b68b0;
}

.child-placeholder-text {
	font-size: 0.85rem;
	color: #666;
	margin-top: 4px;
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
