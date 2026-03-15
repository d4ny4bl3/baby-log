<template>
	<IonPage class="settings-view">
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">Nastavení</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent class="ion-padding">
			<IonList inset class="settings-list">
				<IonItem button detail :router-link="{ name: 'ChildrenSettings' }">
					<IonLabel>Děti</IonLabel>
				</IonItem>
				<IonItem button detail :router-link="{ name: 'About' }">
					<IonLabel>O aplikaci</IonLabel>
				</IonItem>
			</IonList>
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
	IonList,
	IonItem,
	IonLabel,
} from "@ionic/vue";

defineOptions({ name: "Settings" });
</script>

<style scoped>
.settings-list {
	margin-top: 24px;
}

.settings-list ion-label {
	font-size: 18px;
	font-weight: 600;
}

.settings-list ion-item {
	--padding-start: 16px;
	--inner-padding-end: 16px;
}
</style>
