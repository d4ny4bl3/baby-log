<template>
	<IonPage>
		<IonHeader>
			<IonToolbar class="header_primary">
				<IonTitle class="ion-text-center">O aplikaci</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent class="ion-padding">
			<div class="about-hero">
				<img src="/logo.png" class="about-logo" alt="Baby Log" />
				<h1 class="about-name">Baby Log</h1>
				<p class="about-version">Verze 0.2.0</p>
			</div>

			<div class="about-body">
				<p>Baby Log je jednoduchý deník pro každodenní péči o miminko. Pomáhá rychle zaznamenat krmení, spánek a přebalení, abyste měly přehled o celém dni na jednom místě.</p>
				<p>Aplikace je navržená hlavně pro maminky, které chtějí:</p>
				<ul>
					<li>mít jistotu v denním režimu miminka,</li>
					<li>snadno sdílet přehled s partnerem nebo pediatrem,</li>
					<li>sledovat změny v čase bez složitého nastavování.</li>
				</ul>
				<p>Baby Log vznikl s důrazem na klid, jednoduchost a rychlé ovládání jednou rukou.</p>
			</div>

			<IonList inset class="about-list">
				<IonItem>
					<IonLabel>
						<p class="about-item-label">Autor</p>
						<p class="about-item-value">d4ny4bl3</p>
					</IonLabel>
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

defineOptions({ name: "About" });
</script>

<style scoped>
.about-hero {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 10px 0 10px;
	gap: 8px;
}

.about-logo {
	width: 100px;
	height: 100px;
	border-radius: 20px;
}

.about-name {
	font-size: 1.6rem;
	font-weight: 700;
	margin: 0;
}

.about-version {
	font-size: 0.95rem;
	color: #888;
	margin: 0;
}

.about-item-label {
	font-size: 0.8rem;
	color: #888;
	margin-bottom: 2px;
}

.about-item-value {
	font-size: 1rem;
	font-weight: 500;
	color: #1a1a1a;
}

.about-body {
	padding: 0 4px 8px;
	color: #3a3a3a;
	line-height: 1.6;
}

.about-body p {
	margin-bottom: 10px;
}

.about-body ul {
	padding-left: 20px;
	margin-bottom: 12px;
}

.about-body li {
	margin-bottom: 4px;
}
</style>
