export const DIAPER_TYPES = [
	{ key: 'wet',   label: 'Mokrá' },
	{ key: 'dirty', label: 'Špinavá' },
]

export function diaperTypeLabel(key) {
	return DIAPER_TYPES.find(t => t.key === key)?.label ?? ''
}

export const EAT_TYPES = [
	{ key: 'bottle', label: 'Lahvička' },
	{ key: 'solid',  label: 'Příkrm' },
]

export function eatTypeLabel(key) {
	return EAT_TYPES.find(t => t.key === key)?.label ?? ''
}
