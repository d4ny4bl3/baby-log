<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter, modalController, actionSheetController } from '@ionic/vue'
import { App as CapacitorApp } from '@capacitor/app'
import { useAuthStore } from '@/stores/authStore.js'
import { useSyncStore } from '@/stores/syncStore.js'

const ionRouter = useIonRouter()
const authStore = useAuthStore()
const syncStore = useSyncStore()

let syncInterval = null

onMounted(async () => {
  await authStore.loadToken()
  await syncStore.loadState()
  syncStore.syncNow({ silent: true })
  syncInterval = setInterval(() => syncStore.syncNow({ silent: true }), 60_000)
})

onUnmounted(() => {
  clearInterval(syncInterval)
})

useBackButton(10000, async () => {
  const topModal = await modalController.getTop()
  if (topModal) { await topModal.dismiss(); return }

  const topSheet = await actionSheetController.getTop()
  if (topSheet) { await topSheet.dismiss(); return }

  if (ionRouter.canGoBack()) { ionRouter.back(); return }

  CapacitorApp.exitApp()
})
</script>
