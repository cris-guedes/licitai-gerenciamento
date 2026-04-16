/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChartLine } from './ChartLine';
/**
 * Represents data of a line chart.
 *
 * Attributes:
 * kind (Literal["line_chart_data"]): The type of the chart.
 * x_axis_label (str): The label for the x-axis.
 * y_axis_label (str): The label for the y-axis.
 * lines (list[ChartLine]): A list of lines in the chart.
 */
export type PictureLineChartData = {
  kind?: string;
  title: string;
  x_axis_label: string;
  y_axis_label: string;
  lines: Array<ChartLine>;
};

