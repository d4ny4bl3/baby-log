<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Detail dítěte</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<div v-if="child" class="child-detail">
				<div class="child-avatar">
					<span>{{ child.name[0] }}</span>
				</div>
				<h1 class="child-name">{{ child.name }}</h1>
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
	onIonViewWillEnter,
} from "@ionic/vue";
import { ref } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import { getChild } from "@/database/queries";

defineOptions({ name: "ChildDetail" });

const route = useRoute();
const child = ref(null);

onIonViewWillEnter(async () => {
	child.value = await getChild(route.params.id);
});

function formatBirthDate(ts) {
	return dayjs(ts).locale("cs").format("D. MMMM YYYY");
}
</script>

<style scoped>
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

.child-birthdate {
	font-size: 1rem;
	color: #888;
	margin: 0;
}
</style>
