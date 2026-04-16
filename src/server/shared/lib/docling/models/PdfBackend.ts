/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Available PDF parsing backends for document processing.
 *
 * Different backends offer varying levels of text extraction quality, layout preservation,
 * and processing speed. Choose based on your document complexity and quality requirements.
 *
 * Attributes:
 * PYPDFIUM2: Standard PDF parser using PyPDFium2 library. Fast and reliable for basic text extraction.
 * DLPARSE_V1: Docling Parse v1 backend with enhanced layout analysis and structure preservation.
 * DLPARSE_V2: Docling Parse v2 backend with improved table detection and complex layout handling.
 * DLPARSE_V4: Docling Parse v4 backend (latest) with advanced features and best accuracy for complex documents.
 */
export type PdfBackend = 'pypdfium2' | 'docling_parse' | 'dlparse_v1' | 'dlparse_v2' | 'dlparse_v4';
