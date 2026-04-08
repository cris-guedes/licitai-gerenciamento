/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageRefMode } from './ImageRefMode';
import type { InputFormat } from './InputFormat';
import type { ocr_engines_enum } from './ocr_engines_enum';
import type { PdfBackend } from './PdfBackend';
import type { ProcessingPipeline } from './ProcessingPipeline';
import type { TableFormerMode } from './TableFormerMode';
import type { TargetName } from './TargetName';
import type { VlmModelType } from './VlmModelType';
export type Body_Chunk_files_with_HierarchicalChunker_v1_chunk_hierarchical_file_post = {
  files: Array<string>;
  /**
   * If true, the output will include both the chunks and the converted document.
   */
  include_converted_doc?: boolean;
  /**
   * Specification for the type of output target.
   */
  target_type?: TargetName;
  /**
   * Input format(s) to convert from. String or list of strings. Allowed values: docx, pptx, html, image, pdf, asciidoc, md, csv, xlsx, xml_uspto, xml_jats, xml_xbrl, mets_gbs, json_docling, audio, vtt, latex. Optional, defaults to all formats.
   */
  convert_from_formats?: Array<InputFormat>;
  /**
   * Image export mode for the document (in case of JSON, Markdown or HTML). Allowed values: placeholder, embedded, referenced. Optional, defaults to Embedded.
   */
  convert_image_export_mode?: ImageRefMode;
  /**
   * If enabled, the bitmap content will be processed using OCR. Boolean. Optional, defaults to true
   */
  convert_do_ocr?: boolean;
  /**
   * If enabled, replace existing text with OCR-generated text over content. Boolean. Optional, defaults to false.
   */
  convert_force_ocr?: boolean;
  /**
   * The OCR engine to use. String. Allowed values: auto, easyocr, ocrmac, rapidocr, tesserocr, tesseract. Optional, defaults to easyocr.
   */
  convert_ocr_engine?: ocr_engines_enum;
  /**
   * List of languages used by the OCR engine. Note that each OCR engine has different values for the language names. String or list of strings. Optional, defaults to empty.
   */
  convert_ocr_lang?: (Array<string> | null);
  /**
   * Preset ID for OCR engine.
   */
  convert_ocr_preset?: string;
  /**
   * Custom configuration for OCR engine. Use this to specify engine-specific options beyond ocr_lang. Each OCR engine kind has its own configuration schema.
   */
  convert_ocr_custom_config?: (Record<string, any> | null);
  /**
   * The PDF backend to use. String. Allowed values: pypdfium2, docling_parse, dlparse_v1, dlparse_v2, dlparse_v4. Optional, defaults to docling_parse.
   */
  convert_pdf_backend?: PdfBackend;
  /**
   * Mode to use for table structure, String. Allowed values: fast, accurate. Optional, defaults to accurate.
   */
  convert_table_mode?: TableFormerMode;
  /**
   * If true, matches table cells predictions back to PDF cells. Can break table output if PDF cells are merged across table columns. If false, let table structure model define the text cells, ignore PDF cells.
   */
  convert_table_cell_matching?: boolean;
  /**
   * Choose the pipeline to process PDF or image files.
   */
  convert_pipeline?: ProcessingPipeline;
  /**
   * Only convert a range of pages. The page number starts at 1.
   */
  convert_page_range?: any[];
  /**
   * The timeout for processing each document, in seconds.
   */
  convert_document_timeout?: number;
  /**
   * Abort on error if enabled. Boolean. Optional, defaults to false.
   */
  convert_abort_on_error?: boolean;
  /**
   * If enabled, the table structure will be extracted. Boolean. Optional, defaults to true.
   */
  convert_do_table_structure?: boolean;
  /**
   * If enabled, images will be extracted from the document. Boolean. Optional, defaults to true.
   */
  convert_include_images?: boolean;
  /**
   * Scale factor for images. Float. Optional, defaults to 2.0.
   */
  convert_images_scale?: number;
  /**
   * Add this placeholder between pages in the markdown output.
   */
  convert_md_page_break_placeholder?: string;
  /**
   * If enabled, perform OCR code enrichment. Boolean. Optional, defaults to false.
   */
  convert_do_code_enrichment?: boolean;
  /**
   * If enabled, perform formula OCR, return LaTeX code. Boolean. Optional, defaults to false.
   */
  convert_do_formula_enrichment?: boolean;
  /**
   * If enabled, classify pictures in documents. Boolean. Optional, defaults to false.
   */
  convert_do_picture_classification?: boolean;
  /**
   * If enabled, extract numeric data from charts. Boolean. Optional, defaults to false.
   */
  convert_do_chart_extraction?: boolean;
  /**
   * If enabled, describe pictures in documents. Boolean. Optional, defaults to false.
   */
  convert_do_picture_description?: boolean;
  /**
   * Minimum percentage of the area for a picture to be processed with the models.
   */
  convert_picture_description_area_threshold?: number;
  /**
   * DEPRECATED: Options for running a local vision-language model in the picture description. The parameters refer to a model hosted on Hugging Face. This parameter is mutually exclusive with picture_description_api. Please migrate to picture_description_preset or picture_description_custom_config.
   */
  convert_picture_description_local?: string;
  /**
   * DEPRECATED: API details for using a vision-language model in the picture description. This parameter is mutually exclusive with picture_description_local. Please migrate to picture_description_preset or picture_description_custom_config.
   */
  convert_picture_description_api?: string;
  /**
   * DEPRECATED: Preset of local and API models for the vlm pipeline. This parameter is mutually exclusive with vlm_pipeline_model_local and vlm_pipeline_model_api. Use the other options for more parameters. Please migrate to vlm_pipeline_preset or vlm_pipeline_custom_config.
   */
  convert_vlm_pipeline_model?: (VlmModelType | null);
  /**
   * DEPRECATED: Options for running a local vision-language model for the vlm pipeline. The parameters refer to a model hosted on Hugging Face. This parameter is mutually exclusive with vlm_pipeline_model_api and vlm_pipeline_model. Please migrate to vlm_pipeline_preset or vlm_pipeline_custom_config.
   */
  convert_vlm_pipeline_model_local?: string;
  /**
   * DEPRECATED: API details for using a vision-language model for the vlm pipeline. This parameter is mutually exclusive with vlm_pipeline_model_local and vlm_pipeline_model. Please migrate to vlm_pipeline_preset or vlm_pipeline_custom_config.
   */
  convert_vlm_pipeline_model_api?: string;
  /**
   * Preset ID to use (e.g., "default", "granite_docling"). Use "default" for stable, admin-controlled configuration.
   */
  convert_vlm_pipeline_preset?: (string | null);
  /**
   * Preset ID for picture description.
   */
  convert_picture_description_preset?: (string | null);
  /**
   * Preset ID for code/formula extraction.
   */
  convert_code_formula_preset?: (string | null);
  /**
   * Custom VLM configuration including model spec and engine options. Only available if admin allows it. Must include 'model_spec' and 'engine_options'.
   */
  convert_vlm_pipeline_custom_config?: string;
  /**
   * Custom picture description configuration including model spec and engine options.
   */
  convert_picture_description_custom_config?: string;
  /**
   * Custom code/formula extraction configuration including model spec and engine options.
   */
  convert_code_formula_custom_config?: string;
  /**
   * Custom configuration for table structure model. Use this to specify a non-default kind with its options. The 'kind' field in the config dict determines which table structure implementation to use. If not specified, uses the default kind with preset configuration.
   */
  convert_table_structure_custom_config?: (Record<string, any> | null);
  /**
   * Custom configuration for layout model. Use this to specify a non-default kind with its options. The 'kind' field in the config dict determines which layout implementation to use. If not specified, uses the default kind with preset configuration.
   */
  convert_layout_custom_config?: (Record<string, any> | null);
  /**
   * Preset ID for layout detection.
   */
  convert_layout_preset?: (string | null);
  /**
   * Preset ID for picture classification.
   */
  convert_picture_classification_preset?: (string | null);
  /**
   * Custom configuration for picture classification. Use this to specify custom options for the picture classifier. The configuration should match DocumentPictureClassifierOptions schema.
   */
  convert_picture_classification_custom_config?: (Record<string, any> | null);
  /**
   * Use markdown table format instead of triplets for table serialization.
   */
  chunking_use_markdown_tables?: boolean;
  /**
   * Include both raw_text and text (contextualized) in response. If False, only text is included.
   */
  chunking_include_raw_text?: boolean;
};

