/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TableData } from './TableData';
/**
 * Base class for picture chart data.
 *
 * Attributes:
 * title (str): The title of the chart.
 * chart_data (TableData): Chart data in the table format.
 */
export type PictureTabularChartData = {
  kind?: string;
  title: string;
  chart_data: TableData;
};

