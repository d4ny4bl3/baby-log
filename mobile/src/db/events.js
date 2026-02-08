import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME } from "./sqlite";

export async function clearEvents() {
	await CapacitorSQLite.run({
		database: DB_NAME,
		statement: `
			DELETE FROM events
		`,
		values: []
	})
}

export async function addEvent({
	type,
	start_ts,
	end_ts,
	amount,
	note
}) {
	const now = new Date()

	const statement = `
		INSERT INTO events (
			type, start_ts, end_ts, amount, note, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	const values = [
		type,
		start_ts,
		end_ts,
		amount,
		note,
		now,
		now,
	]

	await CapacitorSQLite.run({
		database: DB_NAME,
		statement,
		values
	})
}

export async function startSleep(startTs) {
	await addEvent({
		type: "sleep",
		start_ts: startTs
	})
}

export async function endSleep(endTs) {
	await CapacitorSQLite.run({
		database: DB_NAME,
		statement: `
			UPDATE events
			SET end_ts = ?, updated_at = ?
			WHERE id = (
				SELECT id
				FROM events
				WHERE type = 'sleep' AND end_ts IS NULL
				ORDER BY start_ts DESC
				LIMIT 1
			)
		`,
		values: [endTs, Date.now()]
	})
}


export async function getLastSleep() {
	const result = await CapacitorSQLite.query({
		database: DB_NAME,
		statement: `
			SELECT *
			FROM events
			WHERE type = 'sleep'
			ORDER BY start_ts DESC
			LIMIT 1
		`,
		values: []
	})

	return result.values?.[0] ?? null
}

export async function getLastEventByType(type) {
	const result = await CapacitorSQLite.query({
		database: DB_NAME,
		statement: `
			SELECT start_ts
			FROM events
			WHERE type = ?
			ORDER BY start_ts DESC
			LIMIT 1
		`,
		values: [type]
	})

	return result.values?.[0]?.start_ts ?? null
}

export async function getAllEvents() {
	const result = await CapacitorSQLite.query({
		database: DB_NAME,
		statement: `
			SELECT *
			FROM events
			ORDER BY start_ts DESC
		`,
		values: []
	})

	return result.values ?? null
}