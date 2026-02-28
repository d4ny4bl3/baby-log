export function getSleepState(lastSleep) {
	if (!lastSleep) {
		return { status: "empty", at: null }
	}

	const startedAt = lastSleep.started_at ?? lastSleep.start_ts ?? null
	const endedAt = lastSleep.ended_at ?? lastSleep.end_ts ?? null

	if (endedAt === null) {
		return { status: "sleeping", at: startedAt }
	}

	return { status: "awake", at: endedAt }
}
