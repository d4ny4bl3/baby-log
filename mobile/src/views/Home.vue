<template>
	<IonPage>
		<IonHeader>
			<IonToolbar>
				<IonTitle>Baby Log - {{ title }}</IonTitle>
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
						<IonButton expand="block" class="action_btn awake">Vzhůru</IonButton>
					</IonCol>
					<IonCol size="6">
						<IonButton expand="block" class="action_btn sleep">Usnula</IonButton>
					</IonCol>
				</IonRow>
				<IonRow>
					<IonCol size="6">
						<IonButton expand="block" class="action_btn eat">Jedla</IonButton>
					</IonCol>
					<IonCol size="6">
						<IonButton expand="block" class="action_btn diaper">Přebalena</IonButton>
					</IonCol>
				</IonRow>
			 </IonGrid>
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
} from '@ionic/vue'

import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const title = computed(() => route.meta.title)
</script>