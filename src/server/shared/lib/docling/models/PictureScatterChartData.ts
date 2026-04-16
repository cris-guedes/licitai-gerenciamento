/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChartPoint } from './ChartPoint';
/**
 * Represents data of a scatter chart.
 *
 * Attributes:
 * kind (Literal["scatter_chart_data"]): The type of the chart.
 * x_axis_label (str): The label for the x-axis.
 * y_axis_label (str): The label for the y-axis.
 * points (list[ChartPoint]): A list of points in the scatter chart.
 */
export type PictureScatterChartData = {
  kind?: string;
  title: string;
  x_axis_label: string;
  y_axis_label: string;
  points: Array<ChartPoint>;
};

