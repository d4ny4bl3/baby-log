import { getDb } from "./connection";
import migration0001 from './migrations/0001_init.sql?raw'

const migrations = [
	{ version: 1, sql: migration0001},
]

export async function runMigrations() {
	const db = await getDb()

	const res = await db.query("PRAGMA user_version;")
	const currentVersion = res.values?.[0]?.user_version || 0

	for (const migration of migrations) {
		if (currentVersion < migration.version) {
			await db.execute(migration.sql)
			await db.execute(`PRAGMA user_version = ${migration.version};`)
		}
	}
}
