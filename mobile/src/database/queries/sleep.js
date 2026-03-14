import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME } from "../connection";
import { getDb } from "../connection";

export async function insertSleep({
	id,
	child_id,
	started_at,
	ended_at = null,
	created_at = Date.now(),
	updated_at = created_at,
	deleted_at = null,
	sync_status = "pending",
	version = 1,
}) {
	const statement = `
		INSERT INTO sleep (
			id, child_id, started_at, ended_at, created_at, updated_at, deleted_at, sync_status, version
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	const values = [
		id,
		child_id,
		started_at,
		ended_at,
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

export async function getLastSleep(child_id) {
	const db = await getDb();
	const result = await db.query(
		`
		SELECT started_at, ended_at
		FROM sleep
		WHERE child_id = ? AND deleted_at IS NULL
		ORDER BY started_at DESC
		LIMIT 1;
	`,
		[child_id],
	);

	return result.values?.[0] ?? null;
}

export async function endLastOpenSleep(child_id, ended_at) {
	const db = await getDb();
	const nowTs = Date.now();

	await db.run(
		`
			UPDATE sleep
			SET ended_at = ?, updated_at = ?, sync_status = 'pending'
			WHERE id = (
				SELECT id
				FROM sleep
				WHERE child_id = ? AND ended_at IS NULL AND deleted_at IS NULL
				ORDER BY started_at DESC
				LIMIT 1
			);
		`,
		[ended_at, nowTs, child_id],
	);
}

export async function getSleepDurationInRange(
	child_id,
	rangeStartTs,
	rangeEndTs,
	nowTs = Date.now(),
) {
	const db = await getDb();
	const result = await db.query(
		`
		SELECT COALESCE(
			SUM(
				MAX(
					0,
					MIN(COALESCE(ended_at, ?), ?) - MAX(started_at, ?)
				)
			),
			0
		) AS total_ms
		FROM sleep
		WHERE child_id = ?
			AND deleted_at IS NULL
			AND started_at < ?
			AND COALESCE(ended_at, ?) > ?;
	`,
		[nowTs, rangeEndTs, rangeStartTs, child_id, rangeEndTs, nowTs, rangeStartTs],
	);

	return result.values?.[0]?.total_ms ?? 0;
}
