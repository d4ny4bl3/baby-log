import { getDb } from "../connection";

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

	const db = await getDb();
	await db.run(statement, values);
}

export async function hasAnyChild() {
	const db = await getDb();
	let result;
	try {
		result = await db.query(`
			SELECT COUNT(*) AS count
			FROM children
			WHERE deleted_at IS NULL;
		`);
	} catch (error) {
		if (isMissingChildrenTableError(error)) {
			return false;
		}
		throw error;
	}

	return (result.values?.[0]?.count || 0) > 0;
}

export async function getChildren() {
	const db = await getDb();
	let result;
	try {
		result = await db.query(`
			SELECT id, name, birth_date, gender
			FROM children
			WHERE deleted_at IS NULL
			ORDER BY created_at ASC;
		`);
	} catch (error) {
		if (isMissingChildrenTableError(error)) {
			return [];
		}
		throw error;
	}

	return result.values || [];
}

function isMissingChildrenTableError(error) {
	const message = String(error?.message || error || "").toLowerCase();
	return message.includes("no such table: children");
}
