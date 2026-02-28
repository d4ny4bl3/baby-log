export function createId() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID()
	}

	return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
