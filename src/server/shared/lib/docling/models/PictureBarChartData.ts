/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChartBar } from './ChartBar';
/**
 * Represents data of a bar chart.
 *
 * Attributes:
 * kind (Literal["bar_chart_data"]): The type of the chart.
 * x_axis_label (str): The label for the x-axis.
 * y_axis_label (str): The label for the y-axis.
 * bars (list[ChartBar]): A list of bars in the chart.
 */
export type PictureBarChartData = {
  kind?: string;
  title: string;
  x_axis_label: string;
  y_axis_label: string;
  bars: Array<ChartBar>;
};

