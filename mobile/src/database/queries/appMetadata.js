import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME } from "../connection";
import { getDb } from "../connection";

export async function insertAppMetadata({ key, value = null }) {
	const statement = `
		INSERT OR REPLACE INTO app_metadata (key, value)
		VALUES (?, ?)
	`;

	await CapacitorSQLite.run({
		database: DB_NAME,
		statement,
		values: [key, value],
	});
}

export async function getAppMetadataValue(key) {
	const db = await getDb();
	const result = await db.query(
		`SELECT value FROM app_metadata WHERE key = ? LIMIT 1;`,
		[key],
	);
	return result.values?.[0]?.value ?? null;
}

export async function setActiveChildId(childId) {
	await insertAppMetadata({ key: "active_child_id", value: childId });
}

export async function getActiveChildId() {
	return getAppMetadataValue("active_child_id");
}
