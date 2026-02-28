import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME } from "../connection";
import { getDb } from "../connection";

export async function insertEat({
	id,
	child_id,
	started_at,
	amount = null,
	note = null,
	created_at = Date.now(),
	updated_at = created_at,
	deleted_at = null,
	sync_status = "pending",
	version = 1,
}) {
	const statement = `
		INSERT INTO eat (
			id, child_id, started_at, amount, note, created_at, updated_at, deleted_at, sync_status, version
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	const values = [
		id,
		child_id,
		started_at,
		amount,
		note,
		created_at,
		updated_at,
		deleted_at,
		sync_status,
		version,
	];

	await CapacitorSQLite.run({
		database: DB_NAME,
		statement,
		values,
	});
}

export async function getLastEatTimestamp() {
	const db = await getDb();
	const result = await db.query(`
		SELECT started_at AS ts
		FROM eat
		WHERE deleted_at IS NULL
		ORDER BY started_at DESC
		LIMIT 1;
	`);

	return result.values?.[0]?.ts ?? null;
}
