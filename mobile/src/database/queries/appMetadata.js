import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME } from "../connection";

export async function insertAppMetadata({ key, value = null }) {
	const statement = `
		INSERT INTO app_metadata (key, value)
		VALUES (?, ?)
	`;

	await CapacitorSQLite.run({
		database: DB_NAME,
		statement,
		values: [key, value],
	});
}
