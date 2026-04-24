<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>

<script setup>
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter, modalController, actionSheetController } from '@ionic/vue'
import { App as CapacitorApp } from '@capacitor/app'
import { useAuthStore } from '@/stores/authStore.js'
import { useSyncStore } from '@/stores/syncStore.js'

const ionRouter = useIonRouter()
const authStore = useAuthStore()
const syncStore = useSyncStore()
authStore.loadToken()
syncStore.loadState()

useBackButton(10000, async () => {
  const topModal = await modalController.getTop()
  if (topModal) { await topModal.dismiss(); return }

  const topSheet = await actionSheetController.getTop()
  if (topSheet) { await topSheet.dismiss(); return }

  if (ionRouter.canGoBack()) { ionRouter.back(); return }

  CapacitorApp.exitApp()
})
</script>
