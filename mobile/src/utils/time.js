export function formatTime(ts) {
	if (!ts) return "--"

	const d = new Date(ts)
	return d.toLocaleTimeString("cs-CZ", {
		hour: "2-digit",
		minute: "2-digit"
	})
}

export function formatRelativeTime(ts, nowTs = Date.now()) {
	if (!ts) return "--"

	const diffMs = nowTs - ts
	const diffMin = Math.floor(diffMs / 60000)

	if (diffMs < 1) return "Právě teď"
	if (diffMin < 60) return `${diffMin} min`

	const hours = Math.floor(diffMin / 60)
	const minutes = diffMin% 60

	if (hours < 24) {
		return minutes
			? `${hours} h ${minutes} min`
      		: `${hours} h`
	}

	const days = Math.floor(hours / 24)
	return `${days} dny`
}