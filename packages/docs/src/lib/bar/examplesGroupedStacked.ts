import {
	type ChartTabularData,
	type GroupedStackedBarChartOptions,
	ScaleTypes
} from '@carbon/charts'
import type { ChartTypes, Example } from '../types'

const vanilla = 'GroupedStackedBarChart'
export const chartTypesGroupedStacked: Partial<ChartTypes> = {
	vanilla
}

const groupedStackedBarOptions: GroupedStackedBarChartOptions = {
	title: 'Vertical grouped bar (discrete)',
	axes: {
		left: {
			mapsTo: 'value'
		},
		bottom: {
			scaleType: ScaleTypes.LABELS,
			mapsTo: 'year'
		}
	},
	groupedStackedBar: {
		stackMapsTo: 'group'
	},
	data: {
		groupMapsTo: 'key'
	},
	height: '400px'
}

const groupedStackedBarData: ChartTabularData = [
	{ group: 'Dataset 1', key: 'Qty', value: 65000, year: '2020' },
	{ group: 'Dataset 1', key: 'More', value: 29123, year: '2020' },
	{ group: 'Dataset 1', key: 'Sold', value: 35213, year: '2020' },
	{ group: 'Dataset 1', key: 'Restocking', value: 51213, year: '2020' },
	{ group: 'Dataset 1', key: 'Misc', value: 16932, year: '2020' },
	{ group: 'Dataset 2', key: 'Qty', value: 32432, year: '2020' },
	{ group: 'Dataset 2', key: 'More', value: 21312, year: '2020' },
	{ group: 'Dataset 2', key: 'Sold', value: 56456, year: '2020' },
	{ group: 'Dataset 2', key: 'Restocking', value: 21312, year: '2020' },
	{ group: 'Dataset 2', key: 'Misc', value: 34234, year: '2020' },
	{ group: 'Dataset 3', key: 'Qty', value: 12312, year: '2020' },
	{ group: 'Dataset 3', key: 'More', value: 23232, year: '2020' },
	{ group: 'Dataset 3', key: 'Sold', value: 34232, year: '2020' },
	{ group: 'Dataset 3', key: 'Restocking', value: 12312, year: '2020' },
	{ group: 'Dataset 3', key: 'Misc', value: 34234, year: '2020' },
	{ group: 'Dataset 4', key: 'Qty', value: 32423, year: '2020' },
	{ group: 'Dataset 4', key: 'More', value: 21313, year: '2020' },
	{ group: 'Dataset 4', key: 'Sold', value: 64353, year: '2020' },
	{ group: 'Dataset 4', key: 'Restocking', value: 24134, year: '2020' },
	{ group: 'Dataset 4', key: 'Misc', value: 24134, year: '2020' },

	// 2021
	{ group: 'Dataset 1', key: 'Qty', value: 67000, year: '2021' },
	{ group: 'Dataset 1', key: 'More', value: 30123, year: '2021' },
	{ group: 'Dataset 1', key: 'Sold', value: 36213, year: '2021' },
	{ group: 'Dataset 1', key: 'Restocking', value: 52213, year: '2021' },
	{ group: 'Dataset 1', key: 'Misc', value: 17932, year: '2021' },
	{ group: 'Dataset 2', key: 'Qty', value: 33432, year: '2021' },
	{ group: 'Dataset 2', key: 'More', value: 22312, year: '2021' },
	{ group: 'Dataset 2', key: 'Sold', value: 57456, year: '2021' },
	{ group: 'Dataset 2', key: 'Restocking', value: 22312, year: '2021' },
	{ group: 'Dataset 2', key: 'Misc', value: 35234, year: '2021' },
	{ group: 'Dataset 3', key: 'Qty', value: 13312, year: '2021' },
	{ group: 'Dataset 3', key: 'More', value: 24232, year: '2021' },
	{ group: 'Dataset 3', key: 'Sold', value: 35232, year: '2021' },
	{ group: 'Dataset 3', key: 'Restocking', value: 13312, year: '2021' },
	{ group: 'Dataset 3', key: 'Misc', value: 35234, year: '2021' },
	{ group: 'Dataset 4', key: 'Qty', value: 33423, year: '2021' },
	{ group: 'Dataset 4', key: 'More', value: 22313, year: '2021' },
	{ group: 'Dataset 4', key: 'Sold', value: 65353, year: '2021' },
	{ group: 'Dataset 4', key: 'Restocking', value: 25134, year: '2021' },
	{ group: 'Dataset 4', key: 'Misc', value: 25134, year: '2021' },

	// 2022
	{ group: 'Dataset 1', key: 'Qty', value: 69000, year: '2022' },
	{ group: 'Dataset 1', key: 'More', value: 31123, year: '2022' },
	{ group: 'Dataset 1', key: 'Sold', value: 37213, year: '2022' },
	{ group: 'Dataset 1', key: 'Restocking', value: 53213, year: '2022' },
	{ group: 'Dataset 1', key: 'Misc', value: 18932, year: '2022' },
	{ group: 'Dataset 2', key: 'Qty', value: 34432, year: '2022' },
	{ group: 'Dataset 2', key: 'More', value: 23312, year: '2022' },
	{ group: 'Dataset 2', key: 'Sold', value: 58456, year: '2022' },
	{ group: 'Dataset 2', key: 'Restocking', value: 23312, year: '2022' },
	{ group: 'Dataset 2', key: 'Misc', value: 36234, year: '2022' },
	{ group: 'Dataset 3', key: 'Qty', value: 14312, year: '2022' },
	{ group: 'Dataset 3', key: 'More', value: 25232, year: '2022' },
	{ group: 'Dataset 3', key: 'Sold', value: 36232, year: '2022' },
	{ group: 'Dataset 3', key: 'Restocking', value: 14312, year: '2022' },
	{ group: 'Dataset 3', key: 'Misc', value: 36234, year: '2022' },
	{ group: 'Dataset 4', key: 'Qty', value: 34423, year: '2022' },
	{ group: 'Dataset 4', key: 'More', value: 23313, year: '2022' },
	{ group: 'Dataset 4', key: 'Sold', value: 66353, year: '2022' },
	{ group: 'Dataset 4', key: 'Restocking', value: 26134, year: '2022' },
	{ group: 'Dataset 4', key: 'Misc', value: 26134, year: '2022' },

	// 2023
	{ group: 'Dataset 1', key: 'Qty', value: 71000, year: '2023' },
	{ group: 'Dataset 1', key: 'More', value: 32123, year: '2023' },
	{ group: 'Dataset 1', key: 'Sold', value: 38213, year: '2023' },
	{ group: 'Dataset 1', key: 'Restocking', value: 54213, year: '2023' },
	{ group: 'Dataset 1', key: 'Misc', value: 19932, year: '2023' },
	{ group: 'Dataset 2', key: 'Qty', value: 35432, year: '2023' },
	{ group: 'Dataset 2', key: 'More', value: 24312, year: '2023' },
	{ group: 'Dataset 2', key: 'Sold', value: 59456, year: '2023' },
	{ group: 'Dataset 2', key: 'Restocking', value: 24312, year: '2023' },
	{ group: 'Dataset 2', key: 'Misc', value: 37234, year: '2023' },
	{ group: 'Dataset 3', key: 'Qty', value: 15312, year: '2023' },
	{ group: 'Dataset 3', key: 'More', value: 26232, year: '2023' },
	{ group: 'Dataset 3', key: 'Sold', value: 37232, year: '2023' },
	{ group: 'Dataset 3', key: 'Restocking', value: 15312, year: '2023' },
	{ group: 'Dataset 3', key: 'Misc', value: 37234, year: '2023' },
	{ group: 'Dataset 4', key: 'Qty', value: 35423, year: '2023' },
	{ group: 'Dataset 4', key: 'More', value: 24313, year: '2023' },
	{ group: 'Dataset 4', key: 'Sold', value: 67353, year: '2023' },
	{ group: 'Dataset 4', key: 'Restocking', value: 27134, year: '2023' },
	{ group: 'Dataset 4', key: 'Misc', value: 27134, year: '2023' }
]

export const examplesGroupedStacked: Example[] = [
	{
		options: groupedStackedBarOptions,
		data: groupedStackedBarData,
		tags: ['test']
	}
]
