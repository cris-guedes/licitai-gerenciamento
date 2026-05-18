import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

loadEnv({ path: path.join(projectRoot, ".env") });
loadEnv({ path: path.join(projectRoot, ".env.local"), override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não encontrado no ambiente.");
}

const jsonPath = path.join(projectRoot, "itens.json");
const targetCompanyIdArg = process.argv.find(arg => arg.startsWith("--companyId="));
const targetCompanyId = targetCompanyIdArg ? targetCompanyIdArg.split("=")[1]?.trim() : null;

if (!fs.existsSync(jsonPath)) {
  throw new Error(`Arquivo não encontrado: ${jsonPath}`);
}

const raw = fs.readFileSync(jsonPath, "utf8");
const parsed = JSON.parse(raw);

if (!Array.isArray(parsed)) {
  throw new Error("O arquivo itens.json precisa conter um array de itens.");
}

function normalizeString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeDate(value, fallback = new Date()) {
  if (typeof value !== "string") return fallback;
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? fallback : parsedDate;
}

function normalizeItem(item) {
  const companyId = targetCompanyId ?? normalizeString(item.empresa_id);
  const codigo =
    normalizeString(item.sku_bling) ??
    normalizeString(item.produto_bling_id) ??
    normalizeString(item.id);
  const descricao = normalizeString(item.descricao);
  const marca = normalizeString(item.marca);
  const unidadeMedida = normalizeString(item.unidade) ?? "UN";
  const imageUrl = normalizeString(item.imageURL);
  const precoReferencia = typeof item.preco_bling === "number" ? item.preco_bling : null;
  const ativo = normalizeString(item.situacao)?.toLowerCase() !== "inativo";
  const createdAt = normalizeDate(item.created_at);
  const updatedAt = normalizeDate(item.synced_at, createdAt);

  if (!companyId) return null;
  if (!codigo) return null;
  if (!descricao) return null;

  return {
    companyId,
    codigo,
    descricao,
    marca,
    unidadeMedida,
    imageUrl,
    precoReferencia,
    ativo,
    createdAt,
    updatedAt,
  };
}

const grouped = new Map();

for (const item of parsed) {
  const normalized = normalizeItem(item);

  if (!normalized) continue;

  const items = grouped.get(normalized.companyId) ?? [];
  items.push(normalized);
  grouped.set(normalized.companyId, items);
}

if (!grouped.size) {
  throw new Error("Nenhum item válido foi encontrado para importação.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalRead = 0;

  for (const [companyId, items] of grouped.entries()) {
    totalRead += items.length;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, razao_social: true },
    });

    if (!company) {
      console.warn(`Empresa ${companyId} não encontrada. Pulando ${items.length} item(ns).`);
      continue;
    }

    let insertedForCompany = 0;
    let updatedForCompany = 0;

    for (const item of items) {
      const existing = await prisma.companyItem.findUnique({
        where: {
          companyId_codigo: {
            companyId: item.companyId,
            codigo: item.codigo,
          },
        },
        select: { id: true },
      });

      await prisma.companyItem.upsert({
        where: {
          companyId_codigo: {
            companyId: item.companyId,
            codigo: item.codigo,
          },
        },
        update: {
          descricao: item.descricao,
          marca: item.marca,
          unidadeMedida: item.unidadeMedida,
          imageUrl: item.imageUrl,
          precoReferencia: item.precoReferencia,
          ativo: item.ativo,
          updatedAt: item.updatedAt,
        },
        create: item,
      });

      if (existing) {
        updatedForCompany += 1;
      } else {
        insertedForCompany += 1;
      }
    }

    totalInserted += insertedForCompany;
    totalUpdated += updatedForCompany;

    console.log(
      `Empresa ${company.razao_social} (${company.id}): ${insertedForCompany} inseridos, ${updatedForCompany} atualizados, total ${items.length}.`,
    );
  }

  console.log("");
  console.log(`Leitura total: ${totalRead} item(ns).`);
  console.log(`Inseridos: ${totalInserted} item(ns).`);
  console.log(`Atualizados: ${totalUpdated} item(ns).`);
  console.log(`Ignorados por empresa ausente: ${totalRead - totalInserted - totalUpdated} item(ns).`);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
