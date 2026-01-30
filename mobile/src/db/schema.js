import { CapacitorSQLite } from "@capacitor-community/sqlite"
import { DB_NAME } from "./sqlite";

export async function createTables() {
	await CapacitorSQLite.run({
		database: DB_NAME,
		statement:`
			CREATE TABLE IF NOT EXIST events(

			)
		`
	})
}