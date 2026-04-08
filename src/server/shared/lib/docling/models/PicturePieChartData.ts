/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChartSlice } from './ChartSlice';
/**
 * Represents data of a pie chart.
 *
 * Attributes:
 * kind (Literal["pie_chart_data"]): The type of the chart.
 * slices (list[ChartSlice]): A list of slices in the pie chart.
 */
export type PicturePieChartData = {
  kind?: string;
  title: string;
  slices: Array<ChartSlice>;
};

