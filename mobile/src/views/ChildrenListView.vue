<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Děti</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div v-if="children.length === 0" class="children-empty">
				<div class="children-empty-icon">
					<IonIcon :icon="addOutline" />
				</div>
				<h2 class="children-empty-title">Zatím žádné dítě</h2>
				<p class="children-empty-text">
					Přidejte profil miminka a začněte zaznamenávat krmení, spánek a přebalování.
				</p>
			</div>

			<div v-else class="children-list">
				<div v-for="child in children" :key="child.id" class="child-card"
					@click="router.push({ name: 'ChildDetail', params: { id: child.id } })">
					<img v-if="child.photo" :src="child.photo" class="child-photo" alt="" />
					<div v-else class="child-avatar">{{ child.name[0] }}</div>
					<div class="child-info">
						<div class="child-name">{{ child.name }}</div>
						<div class="child-pills">
							<span v-if="child.birth_date" class="child-pill age">
								<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 20h18" />
									<path d="M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" />
									<path d="M3 15c1.2 1 2 1 3 0s1.8-1 3 0 1.8 1 3 0 1.8-1 3 0 1.8 1 3 0" />
									<path d="M12 8V5" />
								</svg>
								{{ formatAge(child.birth_date) }}
							</span>
							<span v-if="child.gender" class="child-pill" :class="child.gender">
								{{ child.gender === 'girl' ? 'Holčička' : 'Chlapeček' }}
							</span>
						</div>
					</div>
					<IonIcon :icon="chevronForwardOutline" class="child-chevron" />
				</div>
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
	IonFab,
	IonIcon,
	onIonViewWillEnter,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { addOutline, chevronForwardOutline } from "ionicons/icons";
import { getChildren } from "@/database/queries";
import { formatAge } from "@/utils/time";

defineOptions({ name: "ChildrenList" });

const router = useRouter();
const children = ref([]);

onIonViewWillEnter(async () => {
	children.value = await getChildren();
});
</script>

<style scoped>
.children-list {
	padding: 32px 16px 96px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.child-card {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 14px;
	border-radius: 18px;
	background: #fff;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	cursor: pointer;
	transition: transform 0.12s;
}

.child-card:active {
	transform: scale(0.985);
}

.child-photo {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	object-fit: cover;
	flex-shrink: 0;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.child-avatar {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #9fd3b6, #67b18c);
	color: #fff;
	font-size: 1.5rem;
	font-weight: 700;
	box-shadow: 0 4px 16px rgba(103, 177, 140, 0.4);
}

.child-info {
	flex: 1;
	min-width: 0;
}

.child-name {
	font-size: 1.2rem;
	font-weight: 700;
	color: #3d3050;
}

.child-pills {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 7px;
}

.child-pill {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	border-radius: 999px;
	padding: 3px 11px;
	font-size: 0.8rem;
	font-weight: 700;
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

.child-chevron {
	font-size: 20px;
	color: #c9bff0;
	flex-shrink: 0;
}

.children-empty {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 0 40px;
}

.children-empty-icon {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f1ebfa;
	color: #9b87c6;
	font-size: 42px;
}

.children-empty-title {
	font-size: 1.3rem;
	font-weight: 700;
	color: #3d3050;
	margin: 20px 0 8px;
}

.children-empty-text {
	font-size: 1rem;
	color: #666;
	line-height: 1.55;
	margin: 0;
}

.fab-container {
	margin-bottom: 18px;
	margin-right: 18px;
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

.fab-add ion-icon {
	font-size: 1.4rem;
}
</style>
