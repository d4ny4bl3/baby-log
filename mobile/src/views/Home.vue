<template>
	<IonPage>
		<IonHeader>
			<IonToolbar>
				<IonTitle class="ion-text-center">Baby Log</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent class="ion-padding-top">
			<IonGrid class="status_grid">
				<IonRow>
					<IonCol size="6">
						<IonCard class="status_card">
							<IonCardHeader>
								<IonCardTitle>
									Vstávala:
								</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="empty-main">--</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
					<IonCol size="6">
						<IonCard class="status_card">
							<IonCardHeader>
								<IonCardTitle>Usnula:</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="empty-main">--</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>
				<IonRow>
					<IonCol size="6">
						<IonCard class="status_card">
							<IonCardHeader>
								<IonCardTitle>
									Jedla:
								</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="empty-main">--</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
					<IonCol size="6">
						<IonCard class="status_card">
							<IonCardHeader>
								<IonCardTitle>
									Přebalena:
								</IonCardTitle>
							</IonCardHeader>

							<IonCardContent class="empty">
								<div class="empty-main">--</div>
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>
			</IonGrid>

			<!-- Buttons -->
			 <IonGrid class="button_grid">
				<IonRow>
					<IonCol size="6">
						<IonButton
							expand="block"
							class="action_btn awake"
							@click="openAlert('awake')"
						>
							Vzhůru
						</IonButton>
					</IonCol>
					<IonCol size="6">
						<IonButton
							expand="block"
							class="action_btn sleep"
							@click="openAlert('sleep')"
						>
							Usnula
						</IonButton>
					</IonCol>
				</IonRow>
				<IonRow>
					<IonCol size="6">
						<IonButton
							expand="block"
							class="action_btn eat"
							@click="openAlert('eat')"
						>
							Jedla
						</IonButton>
					</IonCol>
					<IonCol size="6">
						<IonButton
							expand="block"
							class="action_btn diaper"
							@click="openAlert('diaper')"
						>
							Přebalena
						</IonButton>
					</IonCol>
				</IonRow>
			 </IonGrid>

			 <IonAlert
			 	:key="alertType"
			 	:is-open="showAlert"
				:header="alertHeader"
				:inputs="alertInputs"
				:buttons="alertButtons"
				@didDismiss="showAlert = false"
			/>

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
	IonGrid,
	IonRow,
	IonCol,
	IonCard,
	IonCardHeader,
	IonCardTitle,
	IonCardContent,
	IonButton,
	IonAlert,
} from '@ionic/vue'

import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({
	name: "Home"
})

const route = useRoute()

const showAlert = ref(false)
const alertType = ref(null)

// const title = computed(() => route.meta.title)

const alertHeader = computed(() => {
	switch (alertType.value) {
		case "sleep": return "Usnula"
		case "awake": return "Vzhůru"
		case "eat": return "Jedla (ml)"
		case "diaper": return "Přebalena"
		default: return ""
	}
})

const alertInputs = computed(() => {
	const now = new Date().toISOString().slice(11, 16)

	switch (alertType.value) {
		case "sleep":
		case "awake":
			return [
				{ name: "time", type: "time", value: now }
			]

		case "eat":
			return [
				{ name: "time", type: "time", value: now },
				{ name: "amount", type: "number", value: 150, placeholder: "ml", min: 0 }
			]

		case "diaper":
			return []

		default:
			return []
	}
})

const openAlert = (type) => {
	alertType.value = type
	showAlert.value = true
}

const alertButtons = computed(() => [
	{ text: "Zrušit", role: "cancel" },
	{
		text: "OK",
		handler: (data) => {
			console.log("CONFIRMED", alertType.value, data)
		}
	}
])
</script>