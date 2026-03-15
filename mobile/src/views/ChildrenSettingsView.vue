<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Děti</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div class="children-list">
				<IonCard v-for="child in children" :key="child.id">
					<IonCardContent>
						<IonItem lines="none" style="--background: #fff">
							<IonAvatar slot="start" class="child-avatar">
								<span>{{ child.name[0] }}</span>
							</IonAvatar>
							<IonLabel>
								<h2 class="child-name">{{ child.name }}</h2>
								<p v-if="child.birth_date" class="child-birthdate">{{ formatBirthDate(child.birth_date) }}</p>
							</IonLabel>
						</IonItem>
					</IonCardContent>
				</IonCard>
			</div>

			<IonFab slot="fixed" vertical="bottom" horizontal="end" class="fab-container">
				<button class="fab-add" @click="router.push({ name: 'ChildAdd' })">
					<IonIcon :icon="addOutline" />
					Přidat dítě
				</button>
			</IonFab>
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
	IonCard,
	IonCardContent,
	IonItem,
	IonAvatar,
	IonLabel,
	IonFab,
	IonIcon,
	onIonViewWillEnter,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { addOutline } from "ionicons/icons";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import { getChildren } from "@/database/queries";

defineOptions({ name: "ChildrenSettings" });

const router = useRouter();
const children = ref([]);

onIonViewWillEnter(async () => {
	children.value = await getChildren();
});

function formatBirthDate(ts) {
	return dayjs(ts).locale("cs").format("D. MMMM YYYY");
}
</script>

<style scoped>
.fab-container {
	margin-bottom: 18px;
	margin-right: 18px;
}

.children-list {
	padding: 16px;
}

.child-card {
	margin: 0 0 12px;
	border-radius: 16px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.child-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #9fd3b6, #67b18c);
	border-radius: 50%;
	color: #fff;
	font-size: 1.4rem;
	font-weight: 700;
}

.child-name {
	font-size: 1.2rem !important;
	font-weight: 700 !important;
	color: #1a1a1a;
}

.child-birthdate {
	font-size: 0.9rem;
	color: #888;
	margin-top: 2px;
}

.fab-add ion-icon {
	font-size: 1.4rem;
}

.fab-add {
	display: flex;
	align-items: center;
	gap: 8px;
	background: linear-gradient(135deg, #9fd3b6, #67b18c);
	box-shadow: 0 4px 16px rgba(103, 177, 140, 0.4);
	border: none;
	border-radius: 32px;
	padding: 14px 24px;
	color: #fff;
	font-size: 1.2rem;
	font-weight: 600;
	cursor: pointer;
}
</style>
