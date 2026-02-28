import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME } from "../connection";

export async function insertChild({
	id,
	name,
	birth_date = null,
	gender = null,
	created_at = Date.now(),
	updated_at = created_at,
	deleted_at = null,
	sync_status = "pending",
	version = 1,
}) {
	const statement = `
		INSERT INTO children (
			id, name, birth_date, gender, created_at, updated_at, deleted_at, sync_status, version
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	const values = [
		id,
		name,
		birth_date,
		gender,
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
