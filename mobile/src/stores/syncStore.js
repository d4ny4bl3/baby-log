import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Network } from '@capacitor/network'
import api from '@/api/axios.js'
import { getDb } from '@/database/connection.js'
import { insertAppMetadata, getAppMetadataValue } from '@/database/queries/appMetadata.js'
import { useAuthStore } from '@/stores/authStore.js'

const MODELS = ['children', 'sleep', 'eat', 'diaper']

function toServerPayload(model, record) {
    if (model === 'children') return record
    const { child_id, ...rest } = record
    return { ...rest, child: child_id }
}

function toLocalRecord(model, record) {
    if (model === 'children') return record
    const { child, ...rest } = record
    return { ...rest, child_id: child }
}

export const useSyncStore = defineStore('sync', () => {
    const isSyncing = ref(false)
    const isBgSyncing = ref(false)
    const lastSyncAt = ref(null)
    const pendingCount = ref(0)
    const syncError = ref(null)

    async function loadState() {
        const val = await getAppMetadataValue('last_sync_at')
        lastSyncAt.value = val ? parseInt(val) : null
        await refreshPendingCount()
    }

    async function refreshPendingCount() {
        const db = await getDb()
        let count = 0
        for (const table of MODELS) {
            const res = await db.query(`SELECT COUNT(*) as n FROM ${table} WHERE sync_status = 'pending'`)
            count += res.values?.[0]?.n ?? 0
        }
        pendingCount.value = count
    }

    async function setSynced(table, id) {
        const db = await getDb()
        await db.run(`UPDATE ${table} SET sync_status = 'synced' WHERE id = ?`, [id])
    }

    async function pushRecord(model, record) {
        const authStore = useAuthStore()
        if (!authStore.isLoggedIn) return

        try {
            const payload = toServerPayload(model, record)
            if (record.deleted_at) {
                try {
                    await api.delete(`/api/v1/${model}/${record.id}/`)
                } catch (e) {
                    if (e.response?.status !== 404) throw e
                }
            } else {
                try {
                    await api.patch(`/api/v1/${model}/${record.id}/`, payload)
                } catch (e) {
                    if (e.response?.status === 404) {
                        await api.post(`/api/v1/${model}/`, payload)
                    } else throw e
                }
            }
            await setSynced(model, record.id)
            pendingCount.value = Math.max(0, pendingCount.value - 1)
        } catch {
            // fire-and-forget — zůstane pending
        }
    }

    async function retryPending() {
        const db = await getDb()
        for (const model of MODELS) {
            const res = await db.query(`SELECT * FROM ${model} WHERE sync_status = 'pending'`)
            for (const record of (res.values ?? [])) {
                await pushRecord(model, record)
            }
        }
    }

    async function pull() {
        const authStore = useAuthStore()
        if (!authStore.isLoggedIn) return

        const since = lastSyncAt.value ?? 0
        const { data } = await api.get(`/api/v1/sync/pull/?since=${since}`)
        const db = await getDb()
        const now = Date.now()

        for (const record of (data.children ?? [])) {
            const r = toLocalRecord('children', record)
            await db.run(
                `INSERT INTO children (id, name, birth_date, gender, photo, created_at, updated_at, deleted_at, sync_status, version)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced', 1)
                 ON CONFLICT(id) DO UPDATE SET
                     name = excluded.name, birth_date = excluded.birth_date, gender = excluded.gender,
                     photo = excluded.photo, updated_at = excluded.updated_at, deleted_at = excluded.deleted_at,
                     sync_status = CASE WHEN sync_status = 'pending' THEN 'pending' ELSE 'synced' END
                 WHERE excluded.updated_at > updated_at`,
                [r.id, r.name, r.birth_date, r.gender, r.photo, r.created_at, r.updated_at, r.deleted_at]
            )
        }

        for (const record of (data.sleeps ?? [])) {
            const r = toLocalRecord('sleep', record)
            await db.run(
                `INSERT INTO sleep (id, child_id, started_at, ended_at, created_at, updated_at, deleted_at, sync_status, version)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', 1)
                 ON CONFLICT(id) DO UPDATE SET
                     started_at = excluded.started_at, ended_at = excluded.ended_at,
                     updated_at = excluded.updated_at, deleted_at = excluded.deleted_at,
                     sync_status = CASE WHEN sync_status = 'pending' THEN 'pending' ELSE 'synced' END
                 WHERE excluded.updated_at > updated_at`,
                [r.id, r.child_id, r.started_at, r.ended_at, r.created_at, r.updated_at, r.deleted_at]
            )
        }

        for (const record of (data.eats ?? [])) {
            const r = toLocalRecord('eat', record)
            await db.run(
                `INSERT INTO eat (id, child_id, started_at, type, amount, note, created_at, updated_at, deleted_at, sync_status, version)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', 1)
                 ON CONFLICT(id) DO UPDATE SET
                     started_at = excluded.started_at, type = excluded.type, amount = excluded.amount,
                     note = excluded.note, updated_at = excluded.updated_at, deleted_at = excluded.deleted_at,
                     sync_status = CASE WHEN sync_status = 'pending' THEN 'pending' ELSE 'synced' END
                 WHERE excluded.updated_at > updated_at`,
                [r.id, r.child_id, r.started_at, r.type, r.amount, r.note, r.created_at, r.updated_at, r.deleted_at]
            )
        }

        for (const record of (data.diapers ?? [])) {
            const r = toLocalRecord('diaper', record)
            await db.run(
                `INSERT INTO diaper (id, child_id, changed_at, type, created_at, updated_at, deleted_at, sync_status, version)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', 1)
                 ON CONFLICT(id) DO UPDATE SET
                     changed_at = excluded.changed_at, type = excluded.type,
                     updated_at = excluded.updated_at, deleted_at = excluded.deleted_at,
                     sync_status = CASE WHEN sync_status = 'pending' THEN 'pending' ELSE 'synced' END
                 WHERE excluded.updated_at > updated_at`,
                [r.id, r.child_id, r.changed_at, r.type, r.created_at, r.updated_at, r.deleted_at]
            )
        }

        const syncTime = data.server_time ?? now
        lastSyncAt.value = syncTime
        await insertAppMetadata({ key: 'last_sync_at', value: String(syncTime) })
    }

    async function syncNow({ silent = false } = {}) {
        if (silent ? isBgSyncing.value : isSyncing.value) return
        const { connected } = await Network.getStatus()
        if (!connected) return
        if (silent) isBgSyncing.value = true
        else { isSyncing.value = true; syncError.value = null }
        try {
            await retryPending()
            await pull()
        } catch {
            if (!silent) syncError.value = 'Server není dostupný.'
        } finally {
            if (silent) isBgSyncing.value = false
            else isSyncing.value = false
            await refreshPendingCount()
        }
    }

    return { isSyncing, lastSyncAt, pendingCount, syncError, loadState, refreshPendingCount, pushRecord, retryPending, pull, syncNow }
})
