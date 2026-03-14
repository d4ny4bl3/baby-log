import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME } from "../connection";
import { getDb } from "../connection";

export async function insertDiaper({
	id,
	child_id,
	changed_at,
	type = null,
	created_at = Date.now(),
	updated_at = created_at,
	deleted_at = null,
	sync_status = "pending",
	version = 1,
}) {
	const statement = `
		INSERT INTO diaper (
			id, child_id, changed_at, type, created_at, updated_at, deleted_at, sync_status, version
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	const values = [
		id,
		child_id,
		changed_at,
		type,
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

export async function getLastDiaperTimestamp(child_id) {
	const db = await getDb();
	const result = await db.query(
		`
		SELECT changed_at AS ts
		FROM diaper
		WHERE child_id = ? AND deleted_at IS NULL
		ORDER BY changed_at DESC
		LIMIT 1;
	`,
		[child_id],
	);

	return result.values?.[0]?.ts ?? null;
}

export async function getDiaperCountInRange(child_id, rangeStartTs, rangeEndTs) {
	const db = await getDb();
	const result = await db.query(
		`
		SELECT COUNT(*) AS count
		FROM diaper
		WHERE child_id = ?
			AND deleted_at IS NULL
			AND changed_at >= ?
			AND changed_at < ?;
	`,
		[child_id, rangeStartTs, rangeEndTs],
	);

	return result.values?.[0]?.count ?? 0;
}
