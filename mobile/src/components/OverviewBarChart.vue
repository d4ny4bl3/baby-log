<template>
	<VueApexCharts
		type="bar"
		height="180"
		:options="chartOptions"
		:series="series"
	/>
</template>

<script setup>
import { computed } from "vue";
import VueApexCharts from "vue3-apexcharts";

const props = defineProps({
	values: {
		type: Array,
		required: true,
	},
	categories: {
		type: Array,
		required: true,
	},
	seriesName: {
		type: String,
		default: "",
	},
	color: {
		type: String,
		default: "#efad86",
	},
	yFormatter: {
		type: Function,
		default: (value) => String(Math.round(Number(value))),
	},
	yMin: {
		type: Number,
		default: 6,
	},
})

const series = computed(() => [
	{
		name: props.seriesName,
		data: props.values.map((v) => Number(Number(v).toFixed(2))),
	},
])

const chartOptions = computed(() => {
	const maxValue = Math.max(...props.values, 0)
	const yAxisMax = Math.max(props.yMin, Math.ceil((maxValue + 0.1) / 2) * 2)

	return {
		chart: {
			type: "bar",
			toolbar: { show: false },
			zoom: { enabled: false },
			parentHeightOffset: 0,
		},
		legend: { show: false },
		dataLabels: { enabled: false },
		colors: [props.color],
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: "55%",
			},
		},
		grid: {
			borderColor: "rgba(93, 74, 127, 0.16)",
			strokeDashArray: 4,
			padding: {
				top: 6,
				right: 8,
				bottom: 0,
				left: 0,
			},
		},
		xaxis: {
			categories: props.categories,
			tooltip: { enabled: false },
			labels: {
				style: {
					colors: "#7a6a91",
					fontSize: "12px",
					fontWeight: 500,
				},
			},
			axisBorder: {
				show: true,
				color: "rgba(93, 74, 127, 0.22)",
			},
			axisTicks: { show: false },
		},
		yaxis: {
			min: 0,
			max: yAxisMax,
			tickAmount: 2,
			forceNiceScale: true,
			decimalsInFloat: 0,
			labels: {
				formatter: props.yFormatter,
				align: "right",
				style: {
					colors: "#7a6a91",
					fontSize: "12px",
				},
				minWidth: 40,
				maxWidth: 44,
				offsetX: -14,
			},
		},
		tooltip: {
			enabled: true,
			theme: "light",
			style: { fontSize: "12px" },
			y: { formatter: props.yFormatter },
		},
	}
})
</script>

<style scoped>
:deep(.apexcharts-canvas) {
	outline: none;
}
:deep(.apexcharts-canvas svg) {
	outline: none;
}
</style>
