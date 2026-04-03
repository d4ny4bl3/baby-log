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

export async function getChild(id) {
	const db = await getDb();
	const result = await db.query(
		`SELECT id, name, birth_date, gender FROM children WHERE id = ? AND deleted_at IS NULL LIMIT 1;`,
		[id]
	);
	return result.values?.[0] ?? null;
}

export async function updateChild(id, { name, gender, birth_date }) {
	const db = await getDb();
	await db.run(
		`UPDATE children SET name = ?, gender = ?, birth_date = ?, updated_at = ? WHERE id = ?;`,
		[name, gender, birth_date, Date.now(), id]
	);
}

export async function deleteChild(id) {
	const db = await getDb();
	await db.run(
		`UPDATE children SET deleted_at = ?, updated_at = ? WHERE id = ?;`,
		[Date.now(), Date.now(), id]
	);
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
