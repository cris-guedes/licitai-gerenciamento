/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type S3Target = {
  /**
   * S3 service endpoint, without protocol. Required.
   */
  endpoint: string;
  /**
   * If enabled, SSL will be used to connect to s3. Boolean. Optional, defaults to true
   */
  verify_ssl?: boolean;
  /**
   * S3 access key. Required.
   */
  access_key: string;
  /**
   * S3 secret key. Required.
   */
  secret_key: string;
  /**
   * S3 bucket name. Required.
   */
  bucket: string;
  /**
   * Prefix for the object keys on s3. Optional, defaults to empty.
   */
  key_prefix?: string;
  kind?: string;
};

