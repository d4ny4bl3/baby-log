import { getDb } from "./connection";
import { runMigrations } from "./migrations";

let initialized = false

export async function initDatabase() {
	if (initialized) return

	await getDb()
	await runMigrations()

	initialized = true
}
