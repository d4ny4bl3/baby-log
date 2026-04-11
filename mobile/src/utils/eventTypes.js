export const DIAPER_TYPES = [
	{ key: 'wet',   label: 'Mokrá' },
	{ key: 'dirty', label: 'Špinavá' },
	{ key: 'mixed', label: 'Smíšená' },
]

export function diaperTypeLabel(key) {
	return DIAPER_TYPES.find(t => t.key === key)?.label ?? ''
}
