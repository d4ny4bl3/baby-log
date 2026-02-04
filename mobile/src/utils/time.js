export function formatTime(ts) {
	if (!ts) return "--"

	const d = new Date(ts)
	return d.toLocaleTimeString("cs-CZ", {
		hour: "2-digit",
		minute: "2-digit"
	})
}

export function formatRelativeTime(ts) {
	if (!ts) return "--"

	const diffMs = new Date() - ts
	const diffMin = Math.floor(diffMs / 60000)

	if (diffMs < 1) return "Právě teď"
	if (diffMin < 60) return `Před ${diffMin} min`

	const hours = Math.floor(diffMin / 60)
	const minutes = diffMin% 60

	if (hours < 24) {
		return minutes
			? `Před ${hours} h ${minutes} min`
      		: `Před ${hours} h`
	}

	const days = Math.floor(hours / 24)
	return `Před ${days} dny`
}