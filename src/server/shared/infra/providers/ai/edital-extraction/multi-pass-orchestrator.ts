import { PROMPT_PASS1_IDENTIFICACAO }                from "./prompts/pass1-identificacao";
import { PROMPT_PASS2_ITENS }                        from "./prompts/pass2-itens";
import { PROMPT_PASS3_REGRAS_EXECUCAO_HABILITACAO }  from "./prompts/pass3-regras-execucao-habilitacao";

// ─── Tipos internos dos passes ────────────────────────────────────────────────

type Pass1Result = {
    numero?: string | null;
    numero_processo?: string | null;
    modalidade?: string | null;
    amparo_legal?: string | null;
    srp?: boolean | null;
    objeto?: string | null;
    objeto_resumido?: string | null;
    valor_estimado_total?: number | null;
    orgao_gerenciador?: Record<string, any>;
    cronograma?: Record<string, any>;
    orgaos_participantes?: any[];
};

type Pass2Result = { itens?: any[] };

type Pass3Result = {
    disputa?: Record<string, any>;
    regras?: Record<string, any>;
    logistica?: Record<string, any>;
    prazos?: Record<string, any>;
    garantia?: Record<string, any>;
    documentos_habilitacao?: Record<string, any>;
    observacoes?: string | null;
};

// ─── Divisor de seções ────────────────────────────────────────────────────────

/**
 * Divide o texto do edital em 3 seções lógicas para os passes paralelos.
 *
 * Estratégia de divisão baseada na estrutura típica de editais brasileiros:
 *
 *   Seção A (Pass 1) — Início até o fim do objeto (~30% do doc)
 *     Contém: capa, preâmbulo, objeto, cronograma, órgão
 *
 *   Seção B (Pass 2) — Termo de Referência / tabela de itens
 *     Contém: itens, especificações técnicas
 *     Detectado por: "TERMO DE REFERÊNCIA", "ANEXO I", "ESPECIFICAÇÕES"
 *
 *   Seção C (Pass 3) — Habilitação + Julgamento + Execução
 *     Contém: habilitação, critérios de julgamento, prazos, garantia
 *     Detectado por: "HABILITAÇÃO", "JULGAMENTO", "PAGAMENTO", "EXECUÇÃO"
 */
export function splitEditalIntoSections(text: string): { sectionA: string; sectionB: string; sectionC: string } {
    // Marcadores comuns de início de cada seção
    const MARKERS_TR = [
        /TERMO\s+DE\s+REFER[EÊ]NCIA/i,
        /ANEXO\s+I\b/i,
        /ESPECIFICA[ÇC][ÕO]ES\s+T[EÉ]CNICAS/i,
        /OBJETO\s+DA\s+LICITA[ÇC][ÃA]O/i,
    ];

    const MARKERS_HAB = [
        /HABILITA[ÇC][ÃA]O\b/i,
        /DA\s+HABILITA[ÇC][ÃA]O\b/i,
        /DOCUMENTOS\s+DE\s+HABILITA[ÇC][ÃA]O/i,
        /JULGAMENTO\s+DAS\s+PROPOSTAS/i,
        /CRIT[EÉ]RIOS?\s+DE\s+JULGAMENTO/i,
    ];

    const totalLen = text.length;

    // Encontra posição do primeiro marcador do TR
    let trStart = -1;
    for (const marker of MARKERS_TR) {
        const match = text.search(marker);
        if (match !== -1 && (trStart === -1 || match < trStart)) {
            trStart = match;
        }
    }

    // Encontra posição do primeiro marcador de Habilitação APÓS o TR
    let habStart = -1;
    const searchFrom = trStart > -1 ? trStart + 100 : Math.floor(totalLen * 0.4);
    for (const marker of MARKERS_HAB) {
        const idx = text.indexOf(text.slice(searchFrom).match(marker)?.[0] ?? "\x00", searchFrom);
        if (idx !== -1 && (habStart === -1 || idx < habStart)) {
            habStart = idx;
        }
    }

    // Fallback: divisão proporcional se marcadores não forem encontrados
    if (trStart === -1)  trStart  = Math.floor(totalLen * 0.25);
    if (habStart === -1) habStart = Math.floor(totalLen * 0.60);

    // Garante que as seções não fiquem vazias
    if (trStart <= 0)              trStart  = Math.floor(totalLen * 0.25);
    if (habStart <= trStart + 500) habStart = Math.min(trStart + Math.floor(totalLen * 0.35), totalLen - 500);

    const sectionA = text.slice(0, trStart).trim();
    const sectionB = text.slice(trStart, habStart).trim();
    const sectionC = text.slice(habStart).trim();

    console.log(`[MultiPassSplitter] A: 0→${trStart} (${Math.round(sectionA.length/1000)}k) | B: ${trStart}→${habStart} (${Math.round(sectionB.length/1000)}k) | C: ${habStart}→end (${Math.round(sectionC.length/1000)}k)`);

    return { sectionA, sectionB, sectionC };
}

// ─── Merge dos resultados ─────────────────────────────────────────────────────

/**
 * Merge profundo dos 3 resultados parciais no formato final do edital.
 * Campos nulos do pass N são sobrescritos por valores não-nulos do pass M.
 */
export function mergePassResults(p1: Pass1Result, p2: Pass2Result, p3: Pass3Result): Record<string, any> {
    return {
        edital: {
            // Pass 1 — identidade
            numero:               p1.numero               ?? null,
            numero_processo:      p1.numero_processo       ?? null,
            modalidade:           p1.modalidade            ?? null,
            amparo_legal:         p1.amparo_legal          ?? null,
            srp:                  p1.srp                   ?? null,
            objeto:               p1.objeto                ?? null,
            objeto_resumido:      p1.objeto_resumido       ?? null,
            valor_estimado_total: p1.valor_estimado_total  ?? null,
            orgao_gerenciador:    p1.orgao_gerenciador      ?? null,
            cronograma:           p1.cronograma             ?? null,
            orgaos_participantes: p1.orgaos_participantes  ?? [],

            // Pass 2 — itens
            itens: p2.itens ?? [],

            // Pass 3 — regras + execução + habilitação
            disputa:                 p3.disputa                ?? null,
            regras:                  p3.regras                 ?? null,
            logistica:               p3.logistica              ?? null,
            prazos:                  p3.prazos                 ?? null,
            garantia:                p3.garantia               ?? null,
            documentos_habilitacao:  p3.documentos_habilitacao ?? { juridica: [], fiscal_trabalhista: [], tecnica: [], economica: [] },
            observacoes:             p3.observacoes            ?? null,
        },
    };
}

// ─── Parser JSON seguro ───────────────────────────────────────────────────────

export function safeParseJson<T>(raw: string, passName: string): T {
    // Remove markdown code fences se o modelo as adicionou
    const cleaned = raw.trim().replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");
    try {
        return JSON.parse(cleaned) as T;
    } catch {
        console.error(`[MultiPass] Falha ao parsear JSON do ${passName}: ${cleaned.slice(0, 300)}`);
        return {} as T;
    }
}

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type { Pass1Result, Pass2Result, Pass3Result };
export { PROMPT_PASS1_IDENTIFICACAO, PROMPT_PASS2_ITENS, PROMPT_PASS3_REGRAS_EXECUCAO_HABILITACAO };
