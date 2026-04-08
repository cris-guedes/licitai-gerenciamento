/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Represents a stacked bar in a stacked bar chart.
 *
 * Attributes:
 * label (list[str]): The labels for the stacked bars. Multiple values are stored
 * in cases where the chart is "double stacked," meaning bars are stacked both
 * horizontally and vertically.
 * values (list[tuple[str, int]]): A list of values representing different segments
 * of the stacked bar along with their label.
 */
export type ChartStackedBar = {
  label: Array<string>;
  values: Array<any[]>;
};

