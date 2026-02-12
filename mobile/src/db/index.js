import { initSQLite } from "./sqlite";
import { createTables } from "./schema";

let initialized = false

export async function initDatabase() {
	if (initialized) return

	await initSQLite()
	await createTables()

	initialized = true
}