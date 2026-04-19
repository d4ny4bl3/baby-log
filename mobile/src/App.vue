<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>

<script setup>
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter, modalController, actionSheetController } from '@ionic/vue'
import { App as CapacitorApp } from '@capacitor/app'

const ionRouter = useIonRouter()

useBackButton(10000, async () => {
  const topModal = await modalController.getTop()
  if (topModal) { await topModal.dismiss(); return }

  const topSheet = await actionSheetController.getTop()
  if (topSheet) { await topSheet.dismiss(); return }

  if (ionRouter.canGoBack()) { ionRouter.back(); return }

  CapacitorApp.exitApp()
})
</script>
