import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME } from "../connection";

export async function insertSleep({
	id,
	child_id,
	started_at,
	ended_at = null,
	created_at = Date.now(),
	updated_at = created_at,
	deleted_at = null,
	version = 1,
}) {
	const statement = `
		INSERT INTO sleep (
			id, child_id, started_at, ended_at, created_at, updated_at, deleted_at, version
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`;

	const values = [
		id,
		child_id,
		started_at,
		ended_at,
		created_at,
		updated_at,
		deleted_at,
		version,
	];

	await CapacitorSQLite.run({
		database: DB_NAME,
		statement,
		values,
	});
}
