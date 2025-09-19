import { AxisChart } from '@/axis-chart'
import {
	Component,
	Grid,
	GroupedStackedBar,
	Skeleton,
	StackedRuler,
	TwoDimensionalAxes,
	ZeroLine
} from '@/components'
import { options } from '@/configuration'
import { BarChartOptions, ChartConfig, Skeletons } from '@/interfaces'
import { GroupedStackedBarChartOptions } from '@/interfaces/charts'
import { mergeDefaultChartOptions } from '@/tools'

/**
 * GroupedStackedBarChart is a custom chart implementation that extends Carbon Charts' AxisChart
 * to provide a specialized visualization combining both grouping and stacking capabilities.
 *
 * This chart type displays data where:
 * - Data points are grouped by categories (e.g., different regions or time periods)
 * - Within each group, data is further organized into series (e.g., different runs or scenarios)
 * - Within each series, data values are stacked by metrics (e.g., different cost components)
 *
 * @extends AxisChart from @carbon/charts
 * @example
 * ```typescript
 * const chart = new GroupedStackedBarChart(containerElement, {
 *   data: chartData,
 *   options: {
 *     axes: { ... },
 *     data: {
 *       groupMapsTo: 'metric',     // Field to stack by (colors)
 *       stackMapsTo: 'series'      // Field to group series by
 *     }
 *   }
 * });
 * ```
 */
export class GroupedStackedBarChart extends AxisChart {
	public constructor(
		holder: HTMLDivElement,
		chartConfigs: ChartConfig<GroupedStackedBarChartOptions>
	) {
		super(holder, chartConfigs)

		// Merge the default options for this chart
		// With the user provided options
		const mergedOptions = mergeDefaultChartOptions(
			options.groupedStackedBarChart,
			chartConfigs.options
		)
		this.model.setOptions(mergedOptions)
		// Initialize data, services, components etc.
		this.init(holder, chartConfigs)
	}

	/**
	 * Retrieves the components to be rendered inside the graph frame.
	 *
	 * @returns {Component[]} An array of components to be rendered.
	 */
	public override getComponents(): Component[] {
		const graphFrameComponents: Component[] = [
			new TwoDimensionalAxes(this.model, this.services),
			new Grid(this.model, this.services),
			new StackedRuler(this.model, this.services),
			new GroupedStackedBar(this.model, this.services),
			new Skeleton(this.model, this.services, {
				skeleton: Skeletons.VERT_OR_HORIZ
			}),
			new ZeroLine(this.model, this.services)
		]

		const components: Component[] = this.getAxisChartComponents(graphFrameComponents)
		return components
	}
}
