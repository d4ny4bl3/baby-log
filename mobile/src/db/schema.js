import { CapacitorSQLite } from "@capacitor-community/sqlite"
import { DB_NAME } from "./sqlite";

export async function createTables() {
	await CapacitorSQLite.run({
		database: DB_NAME,
		statement:`
			CREATE TABLE IF NOT EXISTS events (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				type TEXT NOT NULL,
				start_ts INTEGER NOT NULL,
				end_ts INTEGER,
				amount INTEGER,
				note TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`,
		values: []
	})
}