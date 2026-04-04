import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const org     = await prisma.organization.findFirst();
  const company = await prisma.company.findFirst();

  if (!org || !company) {
    throw new Error("Nenhuma organização ou empresa encontrada. Faça o onboarding primeiro.");
  }

  console.log(`Usando org: ${org.id} | company: ${company.id}`);

  const licitacoes = [
    {
      edital: {
        editalNumber:          "PE 012/2025",
        portal:                "ComprasNet",
        sphere:                "federal",
        state:                 "DF",
        object:                "Aquisição de material de escritório para o exercício de 2025",
        modality:              "Pregão Eletrônico",
        contractType:          "Compras",
        estimatedValue:        85000.00,
        editalUrl:             "https://comprasnet.gov.br/pe-012-2025",
        publicationDate:       new Date("2025-03-01"),
        openingDate:           new Date("2025-03-20T10:00:00"),
        proposalDeadline:      new Date("2025-03-19T23:59:00"),
        processNumber:         "23480.001234/2025-01",
        uasg:                  "158140",
        judgmentCriteria:      "Menor Preço",
        disputeMode:           "Aberto",
        proposalValidityDays:  60,
        exclusiveSmallBusiness: true,
        allowsAdhesion:        false,
      },
      tender: { status: "open",      phase: "proposal" },
    },
    {
      edital: {
        editalNumber:          "CC 003/2025",
        portal:                "BNC",
        sphere:                "estadual",
        state:                 "SP",
        object:                "Contratação de empresa especializada em serviços de limpeza e conservação predial",
        modality:              "Concorrência",
        contractType:          "Serviços",
        estimatedValue:        1200000.00,
        editalUrl:             "https://bnc.org.br/cc-003-2025",
        publicationDate:       new Date("2025-02-15"),
        openingDate:           new Date("2025-04-10T14:00:00"),
        proposalDeadline:      new Date("2025-04-09T17:00:00"),
        processNumber:         "SES-SP-2025/00342",
        uasg:                  null,
        judgmentCriteria:      "Menor Preço Global",
        disputeMode:           "Fechado",
        proposalValidityDays:  90,
        exclusiveSmallBusiness: false,
        allowsAdhesion:        true,
      },
      tender: { status: "open", phase: "edital" },
    },
    {
      edital: {
        editalNumber:          "PE 078/2024",
        portal:                "ComprasNet",
        sphere:                "federal",
        state:                 "RJ",
        object:                "Fornecimento de equipamentos de informática — notebooks, monitores e acessórios",
        modality:              "Pregão Eletrônico",
        contractType:          "Compras",
        estimatedValue:        430000.00,
        editalUrl:             "https://comprasnet.gov.br/pe-078-2024",
        publicationDate:       new Date("2024-11-05"),
        openingDate:           new Date("2024-11-25T09:00:00"),
        proposalDeadline:      new Date("2024-11-24T23:59:00"),
        processNumber:         "50600.002271/2024-88",
        uasg:                  "050001",
        judgmentCriteria:      "Menor Preço por Item",
        disputeMode:           "Aberto",
        proposalValidityDays:  60,
        exclusiveSmallBusiness: false,
        allowsAdhesion:        true,
      },
      tender: { status: "awarded", phase: "contract" },
    },
    {
      edital: {
        editalNumber:          "TP 001/2025",
        portal:                "Licitações-e",
        sphere:                "municipal",
        state:                 "PR",
        object:                "Execução de obras de pavimentação asfáltica em vias urbanas do município",
        modality:              "Tomada de Preços",
        contractType:          "Obras",
        estimatedValue:        650000.00,
        editalUrl:             "https://licitacoes-e.com.br/tp-001-2025",
        publicationDate:       new Date("2025-01-10"),
        openingDate:           new Date("2025-02-05T09:30:00"),
        proposalDeadline:      new Date("2025-02-04T17:00:00"),
        processNumber:         "PMF-2025/00089",
        uasg:                  null,
        judgmentCriteria:      "Menor Preço Global",
        disputeMode:           "Fechado",
        proposalValidityDays:  120,
        exclusiveSmallBusiness: false,
        allowsAdhesion:        false,
      },
      tender: { status: "closed", phase: "judgment" },
    },
    {
      edital: {
        editalNumber:          "DL 045/2025",
        portal:                "ComprasNet",
        sphere:                "federal",
        state:                 "MG",
        object:                "Aquisição de uniformes e EPIs para servidores do departamento operacional",
        modality:              "Dispensa de Licitação",
        contractType:          "Compras",
        estimatedValue:        48000.00,
        editalUrl:             null,
        publicationDate:       new Date("2025-03-10"),
        openingDate:           new Date("2025-03-15T10:00:00"),
        proposalDeadline:      new Date("2025-03-14T18:00:00"),
        processNumber:         "01100.003812/2025-55",
        uasg:                  "110404",
        judgmentCriteria:      "Menor Preço",
        disputeMode:           "Aberto",
        proposalValidityDays:  30,
        exclusiveSmallBusiness: true,
        allowsAdhesion:        false,
      },
      tender: { status: "open", phase: "proposal" },
    },
  ];

  for (const item of licitacoes) {
    const edital = await prisma.edital.create({
      data: {
        orgId:     org.id,
        companyId: company.id,
        ...item.edital,
      },
    });

    await prisma.tender.create({
      data: {
        orgId:     org.id,
        companyId: company.id,
        editalId:  edital.id,
        ...item.tender,
      },
    });

    console.log(`✅ Criado: ${item.edital.editalNumber} — ${item.edital.object.slice(0, 50)}...`);
  }

  console.log("\n✅ Seed concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
