<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>

<script setup>
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter, modalController  } from '@ionic/vue'
import { App as CapacitorApp } from '@capacitor/app'

const ionRouter = useIonRouter()

useBackButton(10000, async () => {
  const top = await modalController.getTop()
  if (top) {
    await top.dismiss()
    return
  }

  if (ionRouter.canGoBack()) {
    ionRouter.back()
    return
  }

  CapacitorApp.exitApp()
})
</script>
