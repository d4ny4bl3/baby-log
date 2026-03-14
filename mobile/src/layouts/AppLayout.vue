<template>
	<IonPage>
		<IonTabs>
			<IonRouterOutlet id="main-content" />

			<IonTabBar slot="bottom">
				<IonTabButton tab="home" href="/app/home">
					<IonIcon :icon="homeOutline" />
					<IonLabel>Domů</IonLabel>
				</IonTabButton>
				<IonTabButton tab="overview" href="/app/overview">
					<IonIcon :icon="statsChartOutline" />
					<IonLabel>Přehledy</IonLabel>
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

import { homeOutline, statsChartOutline } from 'ionicons/icons'
</script>
