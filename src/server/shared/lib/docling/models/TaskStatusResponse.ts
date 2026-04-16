/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskProcessingMeta } from './TaskProcessingMeta';
import type { TaskType } from './TaskType';
export type TaskStatusResponse = {
  task_id: string;
  task_type: TaskType;
  task_status: string;
  task_position?: (number | null);
  task_meta?: (TaskProcessingMeta | null);
  error_message?: (string | null);
};

