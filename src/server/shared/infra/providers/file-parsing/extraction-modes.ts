import type { ConvertDocumentsRequestOptions } from "@/server/shared/lib/docling";

export type ExtractionMode = "velocidade" | "balanceado" | "qualidade" | "imagem";

export const EXTRACTION_MODE_OPTIONS: Record<ExtractionMode, Partial<ConvertDocumentsRequestOptions>> = {
    /**
     * Velocidade: parser leve, sem análise de tabelas. Ideal para PDFs nativos simples.
     */
    velocidade: {
        pipeline:           "standard",
        pdf_backend:        "pypdfium2",
        do_ocr:             false,
        force_ocr:          false,
        table_mode:         "fast",
        do_table_structure: false, // desabilita TableFormer → corta ~35% do tempo
        image_export_mode:  "placeholder",
        document_timeout:   120,
        abort_on_error:     false,
    },

    /**
     * Balanceado (padrão): análise completa de tabelas com parser padrão. Funciona bem para a maioria dos editais.
     */
    balanceado: {
        pipeline:           "standard",
        pdf_backend:        "docling_parse",
        do_ocr:             false,
        force_ocr:          false,
        table_mode:         "accurate",
        do_table_structure: true,
        image_export_mode:  "placeholder",
        document_timeout:   300,
        abort_on_error:     false,
    },

    /**
     * Qualidade: parser de última geração com melhor detecção de layout e tabelas complexas.
     */
    qualidade: {
        pipeline:           "standard",
        pdf_backend:        "dlparse_v4",
        do_ocr:             false,
        force_ocr:          false,
        table_mode:         "accurate",
        do_table_structure: true,
        image_export_mode:  "placeholder",
        document_timeout:   480,
        abort_on_error:     false,
    },

    /**
     * Extração de Imagem: OCR forçado para PDFs escaneados (páginas como imagem).
     */
    imagem: {
        pipeline:           "standard",
        pdf_backend:        "docling_parse",
        do_ocr:             true,
        force_ocr:          true,
        ocr_engine:         "easyocr",
        table_mode:         "accurate",
        do_table_structure: true,
        image_export_mode:  "placeholder",
        document_timeout:   600,
        abort_on_error:     false,
    },
};
