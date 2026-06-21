<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter, modalController, actionSheetController } from '@ionic/vue'
import { App as CapacitorApp } from '@capacitor/app'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import { useSyncStore } from '@/stores/syncStore.js'

const ionRouter = useIonRouter()
const route = useRoute()
const authStore = useAuthStore()
const syncStore = useSyncStore()

let syncInterval = null
let wasActive = true

onMounted(async () => {
  await authStore.loadToken()
  await syncStore.loadState()
  syncStore.syncNow({ silent: true })
  syncInterval = setInterval(() => syncStore.syncNow({ silent: true }), 60_000)
  CapacitorApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive && !wasActive) {
      syncStore.resetSync()
      syncStore.syncNow({ silent: true })
    }
    wasActive = isActive
  })
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

  if (route.name === 'Login' || route.name === 'Register') {
    ionRouter.navigate({ name: 'ChildInit' }, 'back', 'replace')
    return
  }

  CapacitorApp.exitApp()
})
</script>
