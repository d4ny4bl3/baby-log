<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>

<script setup>
import {
  IonApp,
  IonRouterOutlet,
} from '@ionic/vue'

import { onMounted } from 'vue';
import { initSQLite } from '@/db/sqlite';
import { createTables } from '@/db/schema';

onMounted(async () => {
  try {
    await initSQLite()
    await createTables()
  } catch (e) {
    console.error("SQLite init failed", e)
  }
})
</script>
