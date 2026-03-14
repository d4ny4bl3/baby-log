import { getDb } from "./connection";
import migration0001 from './migrations/0001_init.sql?raw'

const migrations = [
	{ version: 1, sql: migration0001},
]

async function tableExists(db, tableName) {
	const result = await db.query(
		`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?;`,
		[tableName],
	)
	return (result.values?.length ?? 0) > 0
}

export async function runMigrations() {
	const db = await getDb()

	const res = await db.query("PRAGMA user_version;")
	let currentVersion = Number(res.values?.[0]?.user_version || 0)
	const hasChildrenTable = await tableExists(db, "children")

	for (const migration of migrations) {
		const shouldRunByVersion = currentVersion < migration.version
		const shouldBootstrapSchema = migration.version === 1 && !hasChildrenTable

		if (shouldRunByVersion || shouldBootstrapSchema) {
			// Android plugin splits statements by ";\n"; normalize CRLF inputs.
			const normalizedSql = migration.sql.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
			await db.execute(normalizedSql)
			await db.execute(`PRAGMA user_version = ${migration.version};`)
			currentVersion = migration.version
		}
	}
}
