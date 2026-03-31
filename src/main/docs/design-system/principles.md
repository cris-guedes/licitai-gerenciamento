# Principles — Licitare Design System

> Princípios e regras de consistência visual que governam todas as decisões de design do produto.
> Última atualização: 2026-03-13

---

## Propósito deste documento

Este documento define os **porquês** do design system. Os outros documentos definem o **quê** e o **como**. Antes de criar qualquer interface nova, leia estes princípios — eles devem orientar cada decisão de design, especialmente em situações não cobertas pelas especificações técnicas.

---

## Princípio 1 — Clareza antes de estética

> "Se o usuário precisa pensar para entender a interface, o design falhou."

O produto serve usuários que lidam diariamente com processos complexos de licitação. A interface deve reduzir — nunca ampliar — essa complexidade cognitiva.

**Na prática:**
- Priorizar labels explícitos em vez de ícones ambíguos sozinhos
- Usar linguagem direta: "Criar Licitação" e não "+" ou "New"
- Hierarquia visual clara: o mais importante deve ser visualmente dominante
- Nunca sacrificar clareza por um visual mais "clean"

**Exemplo correto:**
```
✅  Botão com ícone + texto: [+ Criar Licitação]
✅  Status com label: [● Ativo] [● Pendente]
✅  Data formatada: "15 mar. 2025" ou "15/03/2025"
```

**Exemplo incorreto:**
```
❌  Botão só com "+", sem tooltip e sem contexto
❌  Status só com cor (sem texto) — acessibilidade e daltonismo
❌  Timestamp relativo vago: "há algum tempo"
```

---

## Princípio 2 — Consistência gera confiança

> "O usuário aprende a interface uma vez. Consistência protege esse aprendizado."

Um elemento que se comporta de forma diferente em contextos similares quebra a confiança do usuário no produto. Em software de gestão contratual — onde erros têm consequências reais — a confiança na interface é crítica.

**Na prática:**
- Mesmo nome de ação, mesmo visual, mesmo comportamento em todos os lugares
- Padrões de interação estabelecidos no design system **nunca** devem ser quebrados sem atualizar a documentação
- Se uma nova interface precisar de um novo padrão, documente-o antes de implementar

**Checklist de consistência antes de implementar:**
- [ ] Este componente já existe no design system?
- [ ] Esta ação segue o mesmo padrão dos botões definidos?
- [ ] Esta cor está na paleta oficial?
- [ ] Este espaçamento é múltiplo de 4px?
- [ ] Este texto segue a escala tipográfica?

---

## Princípio 3 — Hierarquia visual intencional

> "O olho deve ser guiado, não perdido."

Cada página tem uma ação principal. Cada seção tem um elemento dominante. A hierarquia visual guia o usuário pelo fluxo certo sem que ele precise ler tudo.

**Hierarquia de importância visual:**
1. **Ação de Impacto (Accent)** — Botão Vibrant Yellow (#E2F32B), usado para conversão e "uau".
2. **Ação Primária (Brand)** — Botão Dark Obsidian (#2b2e35), usado para fluxos padrão e navegação.
3. **Conteúdo principal** — Cards com fundo branco e bordas leves.
4. **Metadados** — Texto em cinza neutro (#a0aec0).

**Regras:**
- Use o **Vibrant Yellow** (#E2F32B) apenas para o CTA mais importante da página.
- O **Dark Obsidian** (#2b2e35) é a base para a maioria das ações estruturais.
- Espaço em branco generoso é essencial para manter o visual premium.

---

## Princípio 4 — Densidade com dignidade

> "Eficiência não é bagunça; é organização inteligente de informação."

Dashboards de gestão precisam mostrar muito dado. A tentação é comprimir ao máximo. O equilíbrio certo é: denso o suficiente para ser eficiente, espaçado o suficiente para ser legível.

**Referência de densidade:**
- **Compacto** (tabelas): 40–48px por linha, padding reduzido
- **Padrão** (cards, formulários): espaçamento `space-4` a `space-6`
- **Generoso** (landing, onboarding): espaçamento `space-8` a `space-12`

**Regras:**
- Nunca reduzir `font-size` abaixo de 12px para economizar espaço
- Truncar texto com `text-ellipsis` + tooltip, nunca quebrar layout
- Priorizar scroll vertical a comprimir horizontalmente
- Tabelas com muitas colunas: scroll horizontal no container, não na página

---

## Princípio 5 — Feedback imediato e honesto

> "O usuário sempre deve saber o que está acontecendo."

Em processos de licitação, a incerteza sobre o estado de uma ação é inaceitável. O sistema deve sempre comunicar o que está acontecendo, o que deu errado e o que fazer a seguir.

**Estados que sempre devem ter feedback visual:**
| Estado | Feedback |
|---|---|
| Ação em processamento | Botão disabled + spinner |
| Sucesso | Toast de confirmação + atualização visual do dado |
| Erro de validação | Mensagem inline no campo, bordas vermelhas |
| Erro de sistema | Alert de erro + sugestão de ação |
| Carregamento de dados | Skeleton loader, nunca spinner de página inteira |
| Estado vazio | Empty state com contexto e ação sugerida |

**Linguagem de feedback:**
- **Sucesso:** confirmação direta no passado — "Contrato salvo.", "Licitação criada."
- **Erro:** causa + solução — "CNPJ inválido. Verifique o formato: 00.000.000/0000-00"
- **Loading:** gerúndio — "Carregando licitações...", "Salvando..."
- **Vazio:** contexto + ação — "Nenhuma licitação encontrada. Crie a primeira."

---

## Princípio 6 — Simplicidade por padrão, complexidade quando necessário

> "Não adicione o que não foi pedido. Não esconda o que é necessário."

O produto serve usuários técnicos (jurídico, administrativo) que precisam de acesso a informações detalhadas. Mas a entrada deve ser simples — a complexidade surge conforme o usuário aprofunda.

**Modelo de progressive disclosure:**
1. **Lista/tabela** — visão resumida: número, objeto, status, prazo
2. **Detalhe do registro** — informações completas ao clicar
3. **Edição** — modal ou página de edição ao clicar em "Editar"
4. **Histórico** — aba ou seção colapsável para auditoria

**Regras:**
- Formulários de criação: apenas campos obrigatórios por padrão; campos opcionais em seção "Dados adicionais" colapsável
- Tabelas: colunas essenciais visíveis; colunas extras em "Personalizar colunas"
- Filtros: 2–3 filtros principais expostos; filtros avançados em "Mais filtros"

---

## Princípio 7 — Acessibilidade não é opcional

> "Um produto inclusivo é um produto profissional."

O produto serve equipes diversas. Acessibilidade garante que todos os usuários — incluindo aqueles com deficiências visuais ou motoras — possam usar o sistema eficientemente.

**Requisitos mínimos (WCAG 2.1 AA):**
- Contraste de texto mínimo **4.5:1** para texto normal
- Contraste de texto mínimo **3:1** para texto grande (≥18px ou ≥14px bold)
- Todos os campos de formulário com labels associados (`for`/`id`)
- Todos os ícones interativos com `aria-label`
- Navegação por teclado funcional em todos os componentes interativos
- Status nunca comunicado apenas por cor (sempre incluir texto ou ícone)
- Imagens informativas com `alt` descritivo

**Checklist de acessibilidade por componente:**
- [ ] Inputs: `id`, `name`, `aria-describedby` para erros
- [ ] Botões de ícone: `aria-label`
- [ ] Modais: `aria-labelledby`, `aria-describedby`, focus trap
- [ ] Tabelas: `<thead>` com `scope="col"`, dados numéricos com `tabular-nums`
- [ ] Badges de status: incluem texto, não só cor

---

## Princípio 8 — Mobile como constraint, não como prioridade

O produto é primariamente usado em desktop (escritório, trabalho administrativo). Mobile deve funcionar para consultas rápidas, não para entrada intensiva de dados.

**Estratégia por tipo de tela:**

| Tipo de tela | Desktop | Mobile |
|---|---|---|
| Dashboard / KPIs | Layout completo 4 colunas | 1 coluna, scroll |
| Tabelas de licitações | Todas as colunas | Colunas essenciais + scroll horizontal |
| Formulários | 2 colunas | 1 coluna |
| Modais | Largura fixa centralizada | Full screen |
| Sidebar | Fixa visível | Drawer oculto (hambúrguer) |

**Breakpoint crítico:** `lg` (1024px) — abaixo disso, a sidebar colapsa para drawer.

---

## Princípio 9 — Nomes e linguagem do domínio

> "O produto fala a língua do usuário, não da tecnologia."

Usuários de licitação têm vocabulário específico. O produto deve usar os termos corretos do domínio, mesmo que o código use outros nomes internamente.

**Glossário de termos do produto:**

| Termo correto | Nunca usar |
|---|---|
| Licitação | Processo, Deal, Oportunidade |
| Modalidade | Tipo, Categoria (quando se refere à modalidade licitatória) |
| Órgão Licitante | Cliente, Empresa compradora |
| Proposta | Bid, Oferta |
| Impugnação | Contestação, Recurso genérico |
| Ata de Registro de Preços | ARP |
| PNCP | Portal Nacional |

---

## Princípio 10 — O design system é um produto vivo

> "Um design system desatualizado é pior do que nenhum design system."

### Processo de atualização

1. **Identificar necessidade** — novo padrão, inconsistência ou melhoria
2. **Propor** — documentar a mudança proposta antes de implementar
3. **Revisar** — checar impacto em componentes e telas existentes
4. **Documentar** — atualizar o arquivo `.md` relevante com data
5. **Comunicar** — registrar a mudança no changelog do design system
6. **Implementar** — atualizar componentes afetados

### Quando criar um novo componente vs reutilizar

| Situação | Decisão |
|---|---|
| Comportamento coberto por componente existente | Reutilizar e adaptar via props/className |
| Variação visual pequena | Adicionar variante ao componente existente |
| Novo padrão de interação não coberto | Criar novo componente + documentar |
| Componente de negócio específico (ex: LicitacaoCard) | Criar em `features/`, não no design system |

### O que nunca fazer

- Criar um componente inline sem documentar
- Sobrescrever estilos de shadcn com `!important`
- Usar valores de cor ou espaçamento fora da escala definida
- Criar variações de componentes sem registrar no design system
- Duplicar um componente ao invés de estender o existente

---

## Resumo — Checklist pré-implementação

Antes de criar ou modificar qualquer interface, confirme:

- [ ] Cores usadas estão em `colors.md`
- [ ] Tamanhos tipográficos seguem `typography.md`
- [ ] Espaçamentos são múltiplos de 4px (ver `layout.md`)
- [ ] Componentes usados estão especificados em `components.md`
- [ ] Hierarquia visual segue os princípios acima
- [ ] Todos os estados (loading, error, empty, disabled) estão contemplados
- [ ] Acessibilidade mínima (contraste, labels, aria) está garantida
- [ ] A interface faz sentido em mobile (mesmo que não seja o foco)
- [ ] A linguagem usa os termos corretos do domínio
