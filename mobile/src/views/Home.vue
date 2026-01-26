<template>
	<IonPage>
		<IonHeader>
			<IonToolbar>
				<IonTitle>Baby Log - {{ title }}</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>

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
} from '@ionic/vue'

import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const title = computed(() => route.meta.title)
</script>