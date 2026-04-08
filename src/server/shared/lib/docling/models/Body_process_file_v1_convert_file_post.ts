/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageRefMode } from './ImageRefMode';
import type { InputFormat } from './InputFormat';
import type { ocr_engines_enum } from './ocr_engines_enum';
import type { OutputFormat } from './OutputFormat';
import type { PdfBackend } from './PdfBackend';
import type { ProcessingPipeline } from './ProcessingPipeline';
import type { TableFormerMode } from './TableFormerMode';
import type { TargetName } from './TargetName';
import type { VlmModelType } from './VlmModelType';
export type Body_process_file_v1_convert_file_post = {
  files: Array<string>;
  target_type?: TargetName;
  /**
   * Input format(s) to convert from. String or list of strings. Allowed values: docx, pptx, html, image, pdf, asciidoc, md, csv, xlsx, xml_uspto, xml_jats, xml_xbrl, mets_gbs, json_docling, audio, vtt, latex. Optional, defaults to all formats.
   */
  from_formats?: Array<InputFormat>;
  /**
   * Output format(s) to convert to. String or list of strings. Allowed values: md, json, yaml, html, html_split_page, text, doctags. Optional, defaults to Markdown.
   */
  to_formats?: Array<OutputFormat>;
  /**
   * Image export mode for the document (in case of JSON, Markdown or HTML). Allowed values: placeholder, embedded, referenced. Optional, defaults to Embedded.
   */
  image_export_mode?: ImageRefMode;
  /**
   * If enabled, the bitmap content will be processed using OCR. Boolean. Optional, defaults to true
   */
  do_ocr?: boolean;
  /**
   * If enabled, replace existing text with OCR-generated text over content. Boolean. Optional, defaults to false.
   */
  force_ocr?: boolean;
  /**
   * The OCR engine to use. String. Allowed values: auto, easyocr, ocrmac, rapidocr, tesserocr, tesseract. Optional, defaults to easyocr.
   */
  ocr_engine?: ocr_engines_enum;
  /**
   * List of languages used by the OCR engine. Note that each OCR engine has different values for the language names. String or list of strings. Optional, defaults to empty.
   */
  ocr_lang?: (Array<string> | null);
  /**
   * Preset ID for OCR engine.
   */
  ocr_preset?: string;
  /**
   * Custom configuration for OCR engine. Use this to specify engine-specific options beyond ocr_lang. Each OCR engine kind has its own configuration schema.
   */
  ocr_custom_config?: (Record<string, any> | null);
  /**
   * The PDF backend to use. String. Allowed values: pypdfium2, docling_parse, dlparse_v1, dlparse_v2, dlparse_v4. Optional, defaults to docling_parse.
   */
  pdf_backend?: PdfBackend;
  /**
   * Mode to use for table structure, String. Allowed values: fast, accurate. Optional, defaults to accurate.
   */
  table_mode?: TableFormerMode;
  /**
   * If true, matches table cells predictions back to PDF cells. Can break table output if PDF cells are merged across table columns. If false, let table structure model define the text cells, ignore PDF cells.
   */
  table_cell_matching?: boolean;
  /**
   * Choose the pipeline to process PDF or image files.
   */
  pipeline?: ProcessingPipeline;
  /**
   * Only convert a range of pages. The page number starts at 1.
   */
  page_range?: any[];
  /**
   * The timeout for processing each document, in seconds.
   */
  document_timeout?: number;
  /**
   * Abort on error if enabled. Boolean. Optional, defaults to false.
   */
  abort_on_error?: boolean;
  /**
   * If enabled, the table structure will be extracted. Boolean. Optional, defaults to true.
   */
  do_table_structure?: boolean;
  /**
   * If enabled, images will be extracted from the document. Boolean. Optional, defaults to true.
   */
  include_images?: boolean;
  /**
   * Scale factor for images. Float. Optional, defaults to 2.0.
   */
  images_scale?: number;
  /**
   * Add this placeholder between pages in the markdown output.
   */
  md_page_break_placeholder?: string;
  /**
   * If enabled, perform OCR code enrichment. Boolean. Optional, defaults to false.
   */
  do_code_enrichment?: boolean;
  /**
   * If enabled, perform formula OCR, return LaTeX code. Boolean. Optional, defaults to false.
   */
  do_formula_enrichment?: boolean;
  /**
   * If enabled, classify pictures in documents. Boolean. Optional, defaults to false.
   */
  do_picture_classification?: boolean;
  /**
   * If enabled, extract numeric data from charts. Boolean. Optional, defaults to false.
   */
  do_chart_extraction?: boolean;
  /**
   * If enabled, describe pictures in documents. Boolean. Optional, defaults to false.
   */
  do_picture_description?: boolean;
  /**
   * Minimum percentage of the area for a picture to be processed with the models.
   */
  picture_description_area_threshold?: number;
  /**
   * DEPRECATED: Options for running a local vision-language model in the picture description. The parameters refer to a model hosted on Hugging Face. This parameter is mutually exclusive with picture_description_api. Please migrate to picture_description_preset or picture_description_custom_config.
   */
  picture_description_local?: string;
  /**
   * DEPRECATED: API details for using a vision-language model in the picture description. This parameter is mutually exclusive with picture_description_local. Please migrate to picture_description_preset or picture_description_custom_config.
   */
  picture_description_api?: string;
  /**
   * DEPRECATED: Preset of local and API models for the vlm pipeline. This parameter is mutually exclusive with vlm_pipeline_model_local and vlm_pipeline_model_api. Use the other options for more parameters. Please migrate to vlm_pipeline_preset or vlm_pipeline_custom_config.
   */
  vlm_pipeline_model?: (VlmModelType | null);
  /**
   * DEPRECATED: Options for running a local vision-language model for the vlm pipeline. The parameters refer to a model hosted on Hugging Face. This parameter is mutually exclusive with vlm_pipeline_model_api and vlm_pipeline_model. Please migrate to vlm_pipeline_preset or vlm_pipeline_custom_config.
   */
  vlm_pipeline_model_local?: string;
  /**
   * DEPRECATED: API details for using a vision-language model for the vlm pipeline. This parameter is mutually exclusive with vlm_pipeline_model_local and vlm_pipeline_model. Please migrate to vlm_pipeline_preset or vlm_pipeline_custom_config.
   */
  vlm_pipeline_model_api?: string;
  /**
   * Preset ID to use (e.g., "default", "granite_docling"). Use "default" for stable, admin-controlled configuration.
   */
  vlm_pipeline_preset?: (string | null);
  /**
   * Preset ID for picture description.
   */
  picture_description_preset?: (string | null);
  /**
   * Preset ID for code/formula extraction.
   */
  code_formula_preset?: (string | null);
  /**
   * Custom VLM configuration including model spec and engine options. Only available if admin allows it. Must include 'model_spec' and 'engine_options'.
   */
  vlm_pipeline_custom_config?: string;
  /**
   * Custom picture description configuration including model spec and engine options.
   */
  picture_description_custom_config?: string;
  /**
   * Custom code/formula extraction configuration including model spec and engine options.
   */
  code_formula_custom_config?: string;
  /**
   * Custom configuration for table structure model. Use this to specify a non-default kind with its options. The 'kind' field in the config dict determines which table structure implementation to use. If not specified, uses the default kind with preset configuration.
   */
  table_structure_custom_config?: (Record<string, any> | null);
  /**
   * Custom configuration for layout model. Use this to specify a non-default kind with its options. The 'kind' field in the config dict determines which layout implementation to use. If not specified, uses the default kind with preset configuration.
   */
  layout_custom_config?: (Record<string, any> | null);
  /**
   * Preset ID for layout detection.
   */
  layout_preset?: (string | null);
  /**
   * Preset ID for picture classification.
   */
  picture_classification_preset?: (string | null);
  /**
   * Custom configuration for picture classification. Use this to specify custom options for the picture classifier. The configuration should match DocumentPictureClassifierOptions schema.
   */
  picture_classification_custom_config?: (Record<string, any> | null);
};

