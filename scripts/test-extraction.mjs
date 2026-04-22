/**
 * Script de teste para extração de edital.
 * Envia o PDF via multipart/form-data e salva o resultado.
 * 
 * Uso: node scripts/test-extraction.mjs [caminho-do-pdf]
 */
import fs from "fs";
import path from "path";

const PDF_PATH = process.argv[2] || "temp/82489700-9749-4c66-a9d6-fd1074c58457/original.pdf";
const API_URL = "http://localhost:3000/api/core/extract-edital-data";

async function main() {
    const pdfAbsPath = path.resolve(PDF_PATH);
    if (!fs.existsSync(pdfAbsPath)) {
        console.error(`PDF não encontrado: ${pdfAbsPath}`);
        process.exit(1);
    }

    console.log(`📄 PDF: ${pdfAbsPath} (${(fs.statSync(pdfAbsPath).size / 1024).toFixed(0)} KB)`);
    console.log(`🌐 API: ${API_URL}`);
    console.log(`⏳ Enviando...`);

    const fileBuffer = fs.readFileSync(pdfAbsPath);
    const blob = new Blob([fileBuffer], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", blob, path.basename(pdfAbsPath));

    const start = Date.now();

    const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (!res.ok) {
        const text = await res.text();
        console.error(`❌ HTTP ${res.status} após ${elapsed}s`);
        console.error(text.slice(0, 500));
        process.exit(1);
    }

    const data = await res.json();
    console.log(`✅ Extração concluída em ${elapsed}s\n`);

    const l = data.licitacao || data;
    const c = l.edital?.certame || {};
    const e = l.edital?.execucao || {};
    const h = l.edital?.habilitacao || [];
    const it = l.edital?.itens || [];

    const cr = l.edital?.cronograma || {};

    // --- Análise dos campos ---
    const fields = {
        "objeto": l.objeto,
        "orgaoGerenciador.nome": l.orgaoGerenciador?.nome,
        "orgaoGerenciador.cnpj": l.orgaoGerenciador?.cnpj,
        "orgaoGerenciador.municipio": l.orgaoGerenciador?.municipio,
        "numeroLicitacao": l.numeroLicitacao,
        "processo": l.processo,
        "modalidade": l.modalidade,
        "srp": l.srp,
        "valorTotalEstimado": l.valorTotalEstimado,
        "cronograma.acolhimentoInicio": cr.acolhimentoInicio,
        "cronograma.sessaoPublica": cr.sessaoPublica,
        "cronograma.acolhimentoFim": cr.acolhimentoFim,
        "cronograma.horaLimite": cr.horaLimite,
        "cronograma.horaSessaoPublica": cr.horaSessaoPublica,
        "cronograma.impugnacaoAte": cr.impugnacaoAte,
        "exclusivoMeEpp": c.exclusivoMeEpp,
        "permiteConsorcio": c.permiteConsorcio,
        "exigeVisitaTecnica": c.exigeVisitaTecnica,
        "permiteAdesao": c.permiteAdesao,
        "percentualAdesao": c.percentualAdesao,
        "difal": c.difal,
        "vigenciaContratoDias": c.vigenciaContratoDias,
        "vigenciaAtaMeses": c.vigenciaAtaMeses,
        "entrega.prazoEmDias": e.entrega?.prazoEmDias,
        "entrega.localEntrega": e.entrega?.localEntrega,
        "pagamento.prazoEmDias": e.pagamento?.prazoEmDias,
        "aceite.prazoEmDias": e.aceite?.prazoEmDias,
        "garantia.meses": e.garantia?.meses,
        "garantia.tempoAtendimentoHoras": e.garantia?.tempoAtendimentoHoras,
        "habilitacao (count)": h.length,
        "itens (count)": it.length,
    };

    console.log("--- CAMPOS EXTRAÍDOS ---");
    let preenchidos = 0;
    let total = 0;
    for (const [key, val] of Object.entries(fields)) {
        total++;
        const ok = val !== null && val !== undefined && val !== "" && val !== 0;
        if (ok) preenchidos++;
        const icon = ok ? "✅" : "❌";
        console.log(`  ${icon} ${key}: ${JSON.stringify(val)}`);
    }
    console.log(`\n📊 Preenchimento: ${preenchidos}/${total} (${((preenchidos / total) * 100).toFixed(0)}%)`);

    // Salva resultado
    const outDir = path.dirname(pdfAbsPath);
    const outPath = path.join(outDir, "extraction-test.json");
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(`💾 Resultado salvo em: ${outPath}`);
}

main().catch(err => {
    console.error("Erro fatal:", err);
    process.exit(1);
});
