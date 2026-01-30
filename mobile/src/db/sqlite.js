import { CapacitorSQLite } from "@capacitor-community/sqlite"

export const DB_NAME = "app_db"

export async function initSQLite(params) {
	await CapacitorSQLite.createConnection({
        database: DB_NAME,
        encrypted: false,
        mode: "no-encryption",
        version: 1,
    })

    await CapacitorSQLite.open({ database: DB_NAME })
}
