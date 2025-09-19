/* eslint-disable @typescript-eslint/no-explicit-any */
import { ascending, group, max, rollup, ScaleBand, select } from 'd3'

import {
	BarEvent,
	CartesianOrientations,
	ColorClassNameTypes,
	Events,
	RenderTypes,
	Roles,
	TooltipEvent
} from '@/interfaces'
import { generateSVGPathString, getProperty } from '@/tools'
import { Bar } from './bar'

export const DEFAULT_STEP_FACTOR = 70
export const GROUP_PADDING = 5

/**
 * GroupedStackedBar is the core rendering component that implements the visual logic
 * for grouped stacked bar charts by extending Carbon Charts' Bar component.
 *
 * @extends Bar from @carbon/charts
 */
export class GroupedStackedBar extends Bar {
	public type = 'grouped-stacked-bar'
	public renderType = RenderTypes.SVG

	public override init(): void {
		// Highlight correct bar(s) on legend item hovers
		this.services.events.addEventListener(Events.Legend.ITEM_HOVER, this.handleLegendOnHover)

		// Un-highlight bar(s) on legend item mouseouts
		this.services.events.addEventListener(Events.Legend.ITEM_MOUSEOUT, this.handleLegendMouseOut)
	}

	public override render(animate: boolean): void {
		// Chart options mixed with the internal configurations
		const displayData = this.model.getDisplayData(this.configs.groups)

		const options = this.getOptions()
		const { groupMapsTo } = options.data
		const { stackMapsTo } = options.groupedStackedBar

		// We need to restructure the data to group by series and stack by metric...
		// Since we can't modify model functions we transform the data ourselves
		const transformedData = this.transformDataForGroupedStacking(displayData)

		const svg = this.getComponentContainer({
			ariaLabel: 'grouped bar graphs',
			withinChartClip: true
		})

		// Get unique category labels for the main groups
		const allCategoryLabels: string[] = Array.from(
			new Set(
				displayData.map(datum => {
					const domainIdentifier = this.services?.cartesianScales?.getDomainIdentifier(datum)

					return datum[domainIdentifier] && typeof datum[domainIdentifier].toString === 'function'
						? datum[domainIdentifier].toString()
						: datum[domainIdentifier]
				})
			)
		)

		// Update data on category groups (main groups on x-axis, the domain identifier)
		const categoryGroups = svg
			.selectAll('g.category-group')
			.data(allCategoryLabels, (d: unknown) => d as string)

		// Remove category groups that need to be removed
		categoryGroups.exit().attr('opacity', 0).remove()

		// Add the category groups that need to be introduced
		const categoryGroupsEnter = categoryGroups
			.enter()
			.append('g')
			.classed('category-group', true)
			.attr('role', Roles.GROUP)
			.attr('data-name', 'category-group')

		// Update data on all category groups
		const allCategoryGroups = categoryGroupsEnter.merge(categoryGroups as any)

		allCategoryGroups
			.transition()
			.call((t: unknown) =>
				this.services?.transitions?.setupTransition({
					transition: t,
					name: 'category-group-update-enter',
					animate
				})
			)
			.attr('transform', (categoryLabel: string) => {
				const scaleValue = this.services.cartesianScales?.getDomainValue(categoryLabel)
				const totalGroupWidth = this.getTotalCategoryGroupWidth(transformedData, categoryLabel)
				const translateBy = scaleValue! - totalGroupWidth / 2

				if (this.services.cartesianScales?.getOrientation() === CartesianOrientations.VERTICAL) {
					return `translate(${translateBy}, 0)`
				} else {
					return `translate(0, ${translateBy})`
				}
			})

		// Create series groups within each category group
		const seriesGroups = allCategoryGroups.selectAll('g.series-group').data(
			(categoryLabel: string) => {
				return this.getSeriesForCategory(transformedData, categoryLabel)
			},
			(d: any) => d.series
		)

		// Remove series groups that are no longer needed
		seriesGroups.exit().attr('opacity', 0).remove()

		// Add new series groups
		const seriesGroupsEnter = seriesGroups
			.enter()
			.append('g')
			.classed('series-group', true)
			.attr('role', Roles.GROUP)
			.attr('data-name', 'series-group')

		// Update all series groups
		const allSeriesGroups = seriesGroupsEnter.merge(seriesGroups as any)

		allSeriesGroups
			.transition()
			.call((t: unknown) =>
				this.services?.transitions?.setupTransition({
					transition: t,
					name: 'series-group-update-enter',
					animate
				})
			)
			.attr('transform', (d: any) => {
				const seriesIndex = this.getSeriesIndex(transformedData, d.category, d.series)
				const barWidth = this.getBarWidth()
				const seriesOffset = seriesIndex * (barWidth + GROUP_PADDING)

				if (this.services.cartesianScales?.getOrientation() === CartesianOrientations.VERTICAL) {
					return `translate(${seriesOffset}, 0)`
				} else {
					return `translate(0, ${seriesOffset})`
				}
			})

		// Create stacked bars within each series group
		const bars = allSeriesGroups.selectAll('path.bar').data(
			(d: any) => {
				return d.data // This contains the stacked data for metrics within this series
			},
			(d: any) => {
				return `${d[stackMapsTo]}-${d[groupMapsTo]}`
			}
		)

		// Remove bars that are no longer needed
		bars.exit().attr('opacity', 0).remove()

		// Add the bars that need to be introduced
		const barsEnter = bars.enter().append('path').attr('opacity', 0)

		// code for vertical grouped bar charts
		barsEnter
			.merge(bars as any)
			.classed('bar', true)
			.transition()
			.call((t: any) =>
				this.services?.transitions?.setupTransition({
					transition: t,
					name: 'bar-update-enter',
					animate
				})
			)
			.attr('class', (d: any) => {
				return this.model.getColorClassName({
					classNameTypes: [ColorClassNameTypes.FILL],
					dataGroupName: d[groupMapsTo], // Color by metric
					originalClassName: 'bar'
				})
			})
			.style('fill', (d: any) => {
				// Use groupMapsTo field for color since we want the metrics to have consistent colors
				return this.model.getFillColor(d[groupMapsTo], d[stackMapsTo], d)
			})
			.attr('d', (d: any) => {
				const barWidth = this.getBarWidth()
				const x0 = 0 // Already positioned by series group transform..
				const x1 = barWidth

				// Get the range scale to convert our stacked values
				const rangeScale = this.services?.cartesianScales?.getRangeScale()

				// Calculate y coordinates for stacked segments using raw stacked values
				// We already done all the stacking logic in transformDataForGroupedStacking()
				const y0 = rangeScale(d.y0)
				const y1 = rangeScale(d.y1)

				// don't show if part of bar is out of zoom domain
				const domainValue = this.services.cartesianScales?.getDomainValue(d)

				const zoomx0 = domainValue - barWidth / 2
				const zoomx1 = zoomx0 + barWidth
				if (this.isOutsideZoomedDomain(zoomx0, zoomx1)) {
					return null
				}

				return generateSVGPathString(
					{ x0, x1, y0, y1 },
					this.services.cartesianScales?.getOrientation()
				)
			})
			.attr('opacity', 1)
			.attr('role', Roles.GRAPHICS_SYMBOL)
			.attr('aria-roledescription', 'bar')
			.attr('aria-label', (d: any) => {
				return `${d[groupMapsTo]} ${d.value}`
			})

		// Add event listeners to elements drawn
		this.addEventListeners()
	}

	// Highlight elements that match the hovered legend item
	public readonly handleLegendOnHover = (event: Event) => {
		const customEvent = event as CustomEvent
		const { hoveredElement } = customEvent.detail
		const options = this.getOptions()
		const { groupMapsTo } = options.data

		// Since we're now coloring by metric we should highlight based on that
		this.parent
			?.selectAll('path.bar')
			.transition('legend-hover-bar')
			.call((t: any) =>
				this.services?.transitions?.setupTransition({
					transition: t,
					name: 'legend-hover-bar'
				})
			)
			.attr('opacity', (d: any) => {
				return d[groupMapsTo] !== hoveredElement.datum()['name'] ? 0.3 : 1
			})
	}

	// Un-highlight all elements
	public readonly handleLegendMouseOut = () => {
		this.parent
			?.selectAll('path.bar')
			.transition('legend-mouseout-bar')
			.call((t: unknown) =>
				this.services?.transitions?.setupTransition({
					transition: t,
					name: 'legend-mouseout-bar'
				})
			)
			.attr('opacity', 1)
	}

	public addEventListeners(): void {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this

		this.parent
			?.selectAll('path.bar')
			.on('mouseover', function (event: MouseEvent, datum: any) {
				const hoveredElement = select(this)
				hoveredElement.classed('hovered', true)

				// Dispatch mouse event
				self.services?.events?.dispatchEvent(BarEvent.BAR_MOUSEOVER, {
					event,
					element: hoveredElement,
					datum
				})

				// Show tooltip
				self.services?.events?.dispatchEvent(TooltipEvent.SHOW, {
					event,
					hoveredElement,
					data: [datum]
				})
			})
			.on('mousemove', function (event: MouseEvent, datum: any) {
				const hoveredElement = select(this)

				// Dispatch mouse event
				self.services?.events?.dispatchEvent(BarEvent.BAR_MOUSEMOVE, {
					event,
					element: hoveredElement,
					datum
				})

				self.services?.events?.dispatchEvent(TooltipEvent.MOVE, {
					event
				})
			})
			.on('click', function (event: MouseEvent, datum: any) {
				// Dispatch mouse event
				self.services?.events?.dispatchEvent(BarEvent.BAR_CLICK, {
					event,
					element: select(this),
					datum
				})
			})
			.on('mouseout', function (event: MouseEvent, datum: any) {
				const hoveredElement = select(this)
				hoveredElement.classed('hovered', false)

				// Dispatch mouse event
				self.services?.events?.dispatchEvent(BarEvent.BAR_MOUSEOUT, {
					event,
					element: hoveredElement,
					datum
				})

				// Hide tooltip
				self.services?.events?.dispatchEvent(TooltipEvent.HIDE, {
					hoveredElement
				})
			})
	}

	public override destroy(): void {
		// Remove event listeners
		this.parent
			?.selectAll('path.bar')
			.on('mouseover', null)
			.on('mousemove', null)
			.on('mouseout', null)

		// Remove legend listeners
		const eventsFragment = this.services.events
		eventsFragment?.removeEventListener(Events.Legend.ITEM_HOVER, this.handleLegendOnHover)
		eventsFragment?.removeEventListener(Events.Legend.ITEM_MOUSEOUT, this.handleLegendMouseOut)
	}

	protected transformDataForGroupedStacking(displayData: any[]): Map<string, any> {
		const options = this.getOptions()
		const { groupMapsTo } = options.data
		const { stackMapsTo } = options.groupedStackedBar
		const domainIdentifier = this.services?.cartesianScales?.getDomainIdentifier(displayData[0])

		// Group data by category-series combination and directly create stacked data
		const transformedData = new Map()

		// Group by category and series in one pass
		const grouped = group(displayData, d => `${d[domainIdentifier]}-${d[stackMapsTo]}`)

		grouped.forEach((data, key) => {
			const firstDatum = data[0]

			// Sort by metric for consistent stacking order
			data.sort((a: any, b: any) => ascending(a[groupMapsTo], b[groupMapsTo]))

			// Create stacked data with cumulative values in one pass
			let cumulative = 0
			const stackedData = data.map(datum => {
				const result = {
					...datum,
					y0: cumulative,
					y1: cumulative + datum.value,
					stackKey: key
				}
				cumulative += datum.value
				return result
			})

			transformedData.set(key, {
				category: firstDatum[domainIdentifier!],
				series: firstDatum[stackMapsTo],
				data: stackedData
			})
		})

		this.updateRangeScaleDomainWithPadding(transformedData)

		return transformedData
	}

	protected updateRangeScaleDomainWithPadding(transformedData: Map<string, any>): void {
		// Flatten all stacked data and find the maximum y1 value using D3's max function
		const allStackedData = Array.from(transformedData.values()).flatMap(grouped => grouped.data)

		const maxStackedValue = max(allStackedData, (datum: any) => datum.y1) || 0

		// Apply Carbon Design System padding (typically 10% of domain range)
		const paddingRatio = 0.1 // Carbon's default padding ratio
		const padding = maxStackedValue * paddingRatio
		const adjustedMax = maxStackedValue + padding

		// Update the range scale domain
		const rangeScale = this.services?.cartesianScales?.getRangeScale()
		if (rangeScale && typeof rangeScale.domain === 'function') {
			const currentDomain = rangeScale.domain()
			// Preserve the lower bound (usually 0) and extend the upper bound
			rangeScale.domain([currentDomain[0], adjustedMax])
		}
	}

	protected getTotalCategoryGroupWidth(
		transformedData: Map<string, any>,
		categoryLabel: string | number
	): number {
		const seriesForCategory = this.getSeriesForCategory(transformedData, categoryLabel)
		const barWidth = this.getBarWidth()
		return seriesForCategory.length * barWidth + (seriesForCategory.length - 1) * GROUP_PADDING
	}

	protected getSeriesForCategory(
		transformedData: Map<string, any>,
		categoryLabel: string | number
	): any[] {
		// Convert Map entries to array and filter/map in one pass
		return Array.from(transformedData.entries())
			.filter(([, grouped]) => grouped.category === categoryLabel)
			.map(([key, grouped]) => ({
				category: grouped.category,
				series: grouped.series,
				data: grouped.data,
				key: key
			}))
			.sort((a, b) => ascending(a.series, b.series))
	}

	protected getSeriesIndex(
		transformedData: Map<string, any>,
		category: string | number,
		series: string | number
	): number {
		const seriesForCategory = this.getSeriesForCategory(transformedData, category)
		return seriesForCategory.findIndex((s: any) => s.series === series)
	}

	protected getGroupWidth(): number {
		// For the new implementation, we need to calculate based on series count
		const displayData = this.model.getDisplayData(this.configs.groups)
		const transformedData = this.transformDataForGroupedStacking(displayData)

		// Get the maximum number of series in any category using D3's rollup
		const seriesCountByCategory = rollup(
			Array.from(transformedData.values()),
			groups => new Set(groups.map(g => g.series)).size,
			grouped => grouped.category
		)

		const maxSeriesCount = max(Array.from(seriesCountByCategory.values())) || 1
		const totalGroupPadding = GROUP_PADDING * (maxSeriesCount - 1)

		return this.getBarWidth() * maxSeriesCount + totalGroupPadding
	}

	protected getDomainScaleStep(): number {
		const domainScale =
			this.services?.cartesianScales?.getDomainScale() as unknown as ScaleBand<string>

		let step = DEFAULT_STEP_FACTOR
		if (typeof (domainScale as any).step === 'function') {
			step = domainScale.step()
		} else {
			// Try to get step from the domain scale based on categories
			const displayData = this.model.getDisplayData(this.configs.groups)
			if (displayData.length > 1) {
				const domainIdentifier = this.services?.cartesianScales?.getDomainIdentifier(displayData[0])
				const uniqueCategories = Array.from(
					new Set(displayData.map((d: any) => d[domainIdentifier]))
				)
				if (uniqueCategories.length > 1) {
					const category1 = uniqueCategories[1]
					const category0 = uniqueCategories[0]
					if (category1 && category0) {
						step = Math.abs(domainScale(category1.toString())! - domainScale(category0.toString())!)
					}
				}
			}
		}
		return step
	}

	// Gets the correct width for bars based on options & configurations
	protected override getBarWidth(): number {
		const options = this.getOptions()
		const providedWidth = getProperty(options, 'bars', 'width')
		const providedMaxWidth = getProperty(options, 'bars', 'maxWidth')

		// If there's a provided width, compare with maxWidth and
		// Determine which to return
		if (providedWidth !== null) {
			if (providedMaxWidth === null || providedWidth <= providedMaxWidth) {
				return providedWidth
			}
		}

		// Calculate based on available space and number of series per category
		const displayData = this.model.getDisplayData(this.configs.groups)
		const transformedData = this.transformDataForGroupedStacking(displayData)

		// Get the maximum number of series in any category using D3's rollup
		const seriesCountByCategory = rollup(
			Array.from(transformedData.values()),
			groups => new Set(groups.map(g => g.series)).size,
			grouped => grouped.category
		)

		const maxSeriesCount = max(Array.from(seriesCountByCategory.values())) || 1
		const totalGroupPadding = GROUP_PADDING * (maxSeriesCount - 1)

		const calculatedWidth = Math.min(
			providedMaxWidth || Infinity,
			(this.getDomainScaleStep() - totalGroupPadding) / maxSeriesCount
		)

		return Math.max(calculatedWidth, 1) // Ensure minimum width of 1
	}
}
