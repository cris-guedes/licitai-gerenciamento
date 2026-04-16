/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FileSourceRequest = {
  /**
   * Content of the file serialized in base64. For example it can be obtained via `base64 -w 0 /path/to/file/pdf-to-convert.pdf`.
   */
  base64_string: string;
  /**
   * Filename of the uploaded document
   */
  filename: string;
  kind?: string;
};

