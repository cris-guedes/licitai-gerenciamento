/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChartStackedBar } from './ChartStackedBar';
/**
 * Represents data of a stacked bar chart.
 *
 * Attributes:
 * kind (Literal["stacked_bar_chart_data"]): The type of the chart.
 * x_axis_label (str): The label for the x-axis.
 * y_axis_label (str): The label for the y-axis.
 * stacked_bars (list[ChartStackedBar]): A list of stacked bars in the chart.
 */
export type PictureStackedBarChartData = {
  kind?: string;
  title: string;
  x_axis_label: string;
  y_axis_label: string;
  stacked_bars: Array<ChartStackedBar>;
};

