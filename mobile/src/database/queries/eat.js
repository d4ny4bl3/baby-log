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

	try {
		await CapacitorSQLite.run({
			database: DB_NAME,
			statement,
			values,
		});
	} catch (err) {
		console.error('[db] insertEat failed:', err)
		throw err
	}
}

export async function getLastEatTimestamp(child_id) {
	const db = await getDb();
	const result = await db.query(
		`
		SELECT started_at AS ts
		FROM eat
		WHERE child_id = ? AND deleted_at IS NULL
		ORDER BY started_at DESC
		LIMIT 1;
	`,
		[child_id],
	);

	return result.values?.[0]?.ts ?? null;
}

export async function getEatCountInRange(child_id, rangeStartTs, rangeEndTs) {
	const db = await getDb();
	const result = await db.query(
		`
		SELECT COUNT(*) AS count
		FROM eat
		WHERE child_id = ?
			AND deleted_at IS NULL
			AND started_at >= ?
			AND started_at < ?;
	`,
		[child_id, rangeStartTs, rangeEndTs],
	);

	return result.values?.[0]?.count ?? 0;
}
