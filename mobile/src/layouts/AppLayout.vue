<template>
	<IonPage>
		<IonTabs>
			<IonRouterOutlet id="main-content" />

			<IonTabBar slot="bottom">
				<IonTabButton tab="home" href="/home">
					<IonIcon :icon="homeOutline" />
					<IonLabel>Přehled</IonLabel>
				</IonTabButton>
			</IonTabBar>
		</IonTabs>
	</IonPage>
</template>

<script setup>
import {
	IonPage,
	IonTabs,
	IonTabBar,
	IonTabButton,
	IonIcon,
	IonLabel,
	IonRouterOutlet,
} from '@ionic/vue'

import { homeOutline } from 'ionicons/icons'
</script>