<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { App } from '@capacitor/app'
import { onMounted, onUnmounted } from 'vue';

let backHandler

onMounted(() => {
  backHandler = App.addListener("backButton", ({ canGoBack }) => {
    console.log()
    if (!canGoBack) {
      App.exitApp()
    }
  })
})

onUnmounted(() => {
  backHandler?.remove()
})
</script>
