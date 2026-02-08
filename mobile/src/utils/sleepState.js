export function getSleepState(lastSleep) {
	if (!lastSleep) {
		return { status: "empty", at: null }
	}

	if (lastSleep.end_ts === null) {
		return { status: "sleeping", at: lastSleep.start_ts }
	}

	return { status: "awake", at: lastSleep.end_ts }
}