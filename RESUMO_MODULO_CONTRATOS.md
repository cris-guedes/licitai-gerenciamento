# Módulo de Execução de Contratos e Logística - LicitAi

Este documento resume a implementação do novo módulo de contratos, empenhos e pipeline logístico.

## 1. Banco de Dados (Prisma)
A estrutura de dados foi desenhada para suportar o fluxo completo desde a assinatura do contrato até o pagamento final.

### Modelos Criados:
- **`Contrato`**: Armazena as informações principais (número, valores global/inicial, vigência).
- **`ContratoItem`**: Vincula itens de uma oportunidade a um contrato, controlando saldos.
- **`ContratoEmpenho`**: Registra as notas de empenho, deduzindo do saldo do contrato.
- **`EmpenhoItem`**: Detalhamento dos itens específicos reservados em um empenho.
- **`EmpenhoLocalEntrega`**: Cadastro de endereços/órgãos para entrega.
- **`EmpenhoEntrega`**: Pipeline de logística (Pendente -> Entregue -> Aceite -> Pago).

## 2. Casos de Uso (Backend)
Implementados seguindo a Clean Architecture e o padrão `core-api`:
- **`CreateContrato`**: Converte uma oportunidade ganha em contrato.
- **`GetContratoWorkspace`**: Dashboard central que consolida dados do contrato, itens e histórico financeiro.
- **`CreateEmpenho`**: Lógica de reserva de saldo com validação transacional (não permite empenhar mais do que o saldo contratado).
- **`ListEmpenhos`**: Listagem filtrada por contrato.
- **`CreateLocalEntrega`**: Gestão de destinos.
- **`CreateEntrega`**: Inicia o fluxo de transporte/entrega para itens empenhados.
- **`UpdateEntregaStatus`**: Avança o status no pipeline (ex: confirmar recebimento).

## 3. Lógica e Padrões
- **Roteamento Simplificado**: Todas as rotas foram migradas para caminhos estáticos (ex: `/contratos/workspace`) passando IDs via `Query` ou `Body`. Isso evita conflitos com o sistema de slugs do Next.js.
- **Validação Flexível**: Schemas do Zod ajustados para aceitar formatos de data simplificados (`YYYY-MM-DD`) e permitir criações incrementais (ex: criar empenho antes de vincular itens detalhados).
- **Repositórios Transacionais**: O `PrismaEmpenhoRepository` garante a integridade dos saldos utilizando `prisma.$transaction`.

## 4. O que falta / Próximos Passos
- [ ] **Edição de Entidades**: Telas para editar dados de contratos e empenhos já criados.
- [ ] **Gestão de Aditivos**: Lógica para aditivos de valor/prazo no contrato.
- [ ] **Anexos**: Upload de PDFs (notas de empenho, comprovantes de entrega).
- [ ] **Relatórios**: Visão consolidada de execução por empresa/órgão.
- [ ] **Notificações**: Alertas automáticos para vencimento de vigência ou atraso na entrega.
- [ ] **Seleção de Itens na UI**: Melhorar os diálogos de criação para permitir selecionar quantidades específicas de cada item da lista.

---
*Gerado por LicitAi Assistant*
