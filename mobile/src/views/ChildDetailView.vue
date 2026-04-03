<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonButtons slot="start" />
				<IonTitle class="ion-text-center">Detail dítěte</IonTitle>
				<IonButtons slot="end">
					<IonButton @click="openActions">
						<IonIcon slot="icon-only" :icon="ellipsisVertical" />
					</IonButton>
				</IonButtons>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div v-if="child" class="child-detail">
				<div class="child-avatar">
					<span>{{ child.name[0] }}</span>
				</div>
				<h1 class="child-name">{{ child.name }}</h1>
				<div class="child-pills">
					<span class="info-pill">{{ formatAge(child.birth_date) }}</span>
					<span class="info-pill">{{ child.gender === 'girl' ? 'Holčička' : 'Chlapeček' }}</span>
				</div>
				<p v-if="child.birth_date" class="child-birthdate">{{ formatBirthDate(child.birth_date) }}</p>
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
	IonButtons,
	IonButton,
	IonIcon,
	actionSheetController,
	alertController,
	onIonViewWillEnter,
} from "@ionic/vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ellipsisVertical, createOutline, trashOutline } from "ionicons/icons";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import { getChild, deleteChild } from "@/database/queries";

defineOptions({ name: "ChildDetail" });

const route = useRoute();
const router = useRouter();
const child = ref(null);

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
				text: "Smazat",
				icon: trashOutline,
				role: "destructive",
				handler: () => confirmDelete(),
			},
		],
	});
	await sheet.present();
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
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background: linear-gradient(135deg, #9fd3b6, #67b18c);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 2.6rem;
	font-weight: 700;
	margin-bottom: 20px;
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
	/* color: #888; */
	margin: 0;
}

</style>
