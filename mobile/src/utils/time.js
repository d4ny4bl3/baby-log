import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import "dayjs/locale/cs"

dayjs.extend(duration)

export function formatTime(ts) {
	if (!ts) return "--"

	return dayjs(ts).locale("cs").format("HH:mm")
}

export function formatRelativeTime(ts, nowTs = Date.now()) {
	if (!ts) return "--"

	const diffMs = nowTs - ts
	if (diffMs < 1) return "právě teď"
	const diff = dayjs.duration(diffMs)
	const diffMin = Math.floor(diff.asMinutes())
	if (diffMin < 60) return `${diffMin} min`

	const hours = Math.floor(diff.asHours())
	const minutes = diffMin % 60

	if (hours < 24) {
		return minutes
			? `${hours} h ${minutes} min`
      		: `${hours} h`
	}

	const days = Math.floor(diff.asDays())
	return `${days} dny`
}
