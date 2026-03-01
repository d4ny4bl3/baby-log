import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite"

export const DB_NAME = "baby_log"
const sqlite = new SQLiteConnection(CapacitorSQLite)
let db = null
let dbPromise = null

export async function getDb() {
    if (db) return db
    if (dbPromise) return dbPromise

    dbPromise = (async () => {
        const consistency = await sqlite.checkConnectionsConsistency()
        const isConn = await sqlite.isConnection(DB_NAME, false)
        let connection = null

        if (consistency.result && isConn.result) {
            connection = await sqlite.retrieveConnection(DB_NAME, false)
        } else {
            connection = await sqlite.createConnection(
                DB_NAME,
                false,
                "no-encryption",
                1,
                false
            )
        }

        const isDbOpen = await connection.isDBOpen()
        if (!isDbOpen.result) {
            await connection.open()
        }

        db = connection
        return db
    })()

    try {
        return await dbPromise
    } finally {
        dbPromise = null
    }
}
