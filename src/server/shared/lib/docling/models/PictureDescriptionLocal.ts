/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PictureClassificationLabel } from './PictureClassificationLabel';
export type PictureDescriptionLocal = {
  /**
   * Repository id from the Hugging Face Hub.
   */
  repo_id: string;
  /**
   * Prompt used when calling the vision-language model.
   */
  prompt?: string;
  /**
   * Config from https://huggingface.co/docs/transformers/en/main_classes/text_generation#transformers.GenerationConfig
   */
  generation_config?: Record<string, any>;
  /**
   * Only describe pictures whose predicted class is in this allow-list.
   */
  classification_allow?: (Array<PictureClassificationLabel> | null);
  /**
   * Do not describe pictures whose predicted class is in this deny-list.
   */
  classification_deny?: (Array<PictureClassificationLabel> | null);
  /**
   * Minimum classification confidence required before a picture can be described.
   */
  classification_min_confidence?: number;
};

