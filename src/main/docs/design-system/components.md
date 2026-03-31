# Components — Licitare Design System

> Especificação dos componentes de interface. Todos os componentes usam shadcn/ui como base.
> Última atualização: 2026-03-13

---

## Princípio geral

Todos os componentes base vêm do shadcn/ui e devem ser customizados via **CSS variables** e **cn()** utility — nunca editando os arquivos em `src/client/components/ui/` diretamente.

Componentes de negócio específicos ficam em `src/client/features/[feature]/components/`.

---

## 1. Button

### Variantes

| Variante | Uso | Visual |
|---|---|---|
| `default` | Ação principal estrutural. | Background: Obsidian (#2b2e35), Text: White |
| `accent` | **CTA de alto impacto/Conversão.** | Background: Yellow (#E2F32B), Text: Black |
| `secondary` | Ação secundária. | Background: Soft Gray (#edf2f7), Text: Obsidian |
| `outline` | Ações de menor destaque. | Border: Obsidian, Text: Obsidian |

### Tamanhos

| Tamanho | Padding | Font | Uso |
|---|---|---|---|
| `sm` | `6px 12px` | 13px / medium | Botões em linhas de tabela, badges clicáveis |
| `default` | `10px 20px` | 15px / medium | Padrão para a maioria dos contextos |
| `lg` | `12px 24px` | 16px / medium | CTA principal em modais ou páginas de formulário |
| `icon` | `8px` (quadrado) | — | Botão só com ícone; sempre incluir `aria-label` |

### Estados

| Estado | Visual |
|---|---|
| Default | Cor base da variante |
| Hover | 10% mais escuro, transição 150ms |
| Active/Pressed | 15% mais escuro |
| Disabled | 40% opacity, `cursor-not-allowed` |
| Loading | Spinner no lugar do ícone/texto, disabled |

### Regras

- **Hierarquia visual:** em um mesmo grupo de ações, use no máximo 1 `primary` + 1 `outline` ou `ghost`
- **Ícones:** quando usar ícone + texto, o ícone vem à esquerda, 16×16px, gap de 8px
- **Labels:** sempre verbos imperativos — "Criar", "Salvar", "Cancelar", nunca "OK" ou "Sim"
- **Loading:** desabilitar o botão e mostrar spinner para evitar duplos envios

```tsx
// Padrão de uso
<Button variant="default" size="default">
  <PlusIcon className="w-4 h-4 mr-2" />
  Criar Licitação
</Button>

<Button variant="outline" size="default">
  Cancelar
</Button>

<Button variant="destructive" size="sm" disabled={isLoading}>
  {isLoading ? <Spinner /> : "Excluir"}
</Button>
```

---

## 2. Input

### Variantes de estado

| Estado | Visual |
|---|---|
| Default | Borda `neutral-200` (#e2e8f0), fundo `#f7fafc` |
| Focus | Borda `brand-obsidian-600` (#2b2e35), ring 2px Obsidian |
| Error | Borda `danger` (#e53e3e), ring 2px vermelho |

### Estrutura de campo (Field)

Todo input em formulário segue a estrutura:

```tsx
<div className="space-y-1.5">
  <Label htmlFor="cnpj">CNPJ</Label>
  <Input
    id="cnpj"
    placeholder="00.000.000/0000-00"
    aria-describedby="cnpj-error"
  />
  <p id="cnpj-error" className="text-xs text-danger-600">
    CNPJ inválido
  </p>
</div>
```

### Regras

- Todo input deve ter um `<Label>` associado por `htmlFor`/`id`
- Placeholder descreve o formato, não o propósito — o label cumpre esse papel
- Mensagem de erro aparece abaixo, nunca ao lado
- Campos obrigatórios marcados com `*` após o label (cor `danger-600`)
- Para CNPJs, datas e números de processo: usar `font-mono` e `tracking-wide`

---

## 3. Select

Usar `<Select>` do shadcn para campos com lista fixa de opções (≤ 20 itens).
Para listas dinâmicas ou buscáveis (empresas, usuários, municípios): usar `<Combobox>` / `<Command>`.

### Variantes

| Variante | Uso |
|---|---|
| Select padrão | Status de licitação, modalidade, tipo de contrato |
| Combobox buscável | Seleção de empresa, município, órgão licitante |
| Multi-select | Seleção de múltiplas categorias ou tags |

### Regras

- Label obrigatório
- Sempre ter uma opção placeholder: "Selecione..." (não selecionável)
- Ordenar opções alfabeticamente, exceto quando houver ordem lógica (ex: status por progressão)

---

## 4. Dropdown Menu

Para menus contextuais de ação (ex: menu de "..." em linhas de tabela).

### Estrutura padrão

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Ações">
      <EllipsisHorizontalIcon className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem>
      <EyeIcon className="w-4 h-4 mr-2" />
      Visualizar
    </DropdownMenuItem>
    <DropdownMenuItem>
      <PencilIcon className="w-4 h-4 mr-2" />
      Editar
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-danger-600">
      <TrashIcon className="w-4 h-4 mr-2" />
      Excluir
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Regras

- Separar ações destrutivas com `<DropdownMenuSeparator>`
- Ações destrutivas sempre em vermelho (`text-danger-600`)
- Largura mínima de 160px, máxima de 240px
- Sempre incluir ícones para identificação rápida

---

## 5. Card

O card é a superfície base para agrupar conteúdo relacionado.

### Variantes

| Variante | Uso |
|---|---|
| **Card padrão** | Formulários, detalhe de registro, conteúdo editável |
| **Card de KPI** | Métricas e indicadores no dashboard |
| **Card de lista** | Container de tabelas ou listas de itens |
| **Card interativo** | Clicável, hover state visível — ex: card de empresa na seleção |

### Card de KPI

```tsx
<Card>
  <CardContent className="p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-neutral-500">Licitações Ativas</p>
      <div className="p-2 bg-brand-50 rounded-lg">
        <DocumentTextIcon className="w-4 h-4 text-brand-600" />
      </div>
    </div>
    <p className="text-3xl font-bold text-neutral-900 mt-2 tabular-nums">42</p>
    <p className="text-xs text-neutral-500 mt-1">
      <span className="text-success-600 font-medium">+3</span> esta semana
    </p>
  </CardContent>
</Card>
```

### Card interativo (hover)

```tsx
<Card className="cursor-pointer transition-colors hover:border-brand-300 hover:bg-brand-50">
  {/* conteúdo */}
</Card>
```

---

## 6. Table

Tabelas são o componente central do produto — usadas em licitações, contratos e documentos.

### Estrutura

```tsx
<div className="rounded-md border border-neutral-200 overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow className="bg-neutral-50 hover:bg-neutral-50">
        <TableHead className="w-[140px] font-semibold text-neutral-700">
          Nº do Processo
        </TableHead>
        <TableHead className="font-semibold text-neutral-700">
          Objeto
        </TableHead>
        <TableHead className="text-right font-semibold text-neutral-700">
          Valor Estimado
        </TableHead>
        <TableHead className="w-[100px]">Status</TableHead>
        <TableHead className="w-[40px]" /> {/* ações */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id} className="cursor-pointer hover:bg-neutral-50">
          <TableCell className="font-mono text-sm text-neutral-700">
            {item.processNumber}
          </TableCell>
          <TableCell className="text-sm text-neutral-900 font-medium">
            {item.object}
          </TableCell>
          <TableCell className="text-right text-sm tabular-nums text-neutral-700">
            {formatCurrency(item.estimatedValue)}
          </TableCell>
          <TableCell>
            <StatusBadge status={item.status} />
          </TableCell>
          <TableCell>
            <RowActions item={item} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Regras de tabela

- Colunas numéricas (`text-right`) e com `tabular-nums`
- Colunas de ação (`w-[40px]`, alinhamento central) sempre à direita
- Número de processo sempre em `font-mono`
- Linha de cabeçalho com fundo `neutral-50`, sem hover
- Hover de linha: `bg-neutral-50`
- Linhas clicáveis: `cursor-pointer`
- Tabelas longas: container com `overflow-x-auto`
- Empty state dentro da tabela, nunca fora

### Estado vazio de tabela

```tsx
<TableRow>
  <TableCell colSpan={5} className="h-32 text-center">
    <div className="flex flex-col items-center gap-2 text-neutral-500">
      <DocumentIcon className="w-8 h-8 text-neutral-300" />
      <p className="text-sm">Nenhuma licitação encontrada</p>
      <p className="text-xs">Tente ajustar os filtros ou crie uma nova licitação</p>
    </div>
  </TableCell>
</TableRow>
```

---

## 7. Modal / Dialog

### Tamanhos

| Tamanho | Largura | Uso |
|---|---|---|
| `sm` | 400px | Confirmação de exclusão, avisos simples |
| `default` | 560px | Formulários de criação/edição padrão |
| `lg` | 720px | Formulários complexos, múltiplas abas |
| `xl` | 900px | Visualização de documentos, tabelas internas |
| `full` | 100% - 48px | Formulários muito extensos (usar com moderação) |

### Estrutura padrão

```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-[560px]">
    <DialogHeader>
      <DialogTitle>Criar Licitação</DialogTitle>
      <DialogDescription>
        Preencha os dados do processo licitatório.
      </DialogDescription>
    </DialogHeader>

    {/* Formulário */}
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* campos */}
    </form>

    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : "Criar Licitação"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Regras

- Sempre um título claro e uma descrição contextual
- Footer com ações: `Cancelar` (outline) + ação principal (primary)
- Nunca mais de 2 ações no footer
- Modal de confirmação de exclusão: descrever exatamente o que será excluído
- Fechar modal ao clicar no overlay **apenas** se não houver dados preenchidos

---

## 8. Badge

Badges comunicam status de forma compacta.

### Variantes de status

| Variante | Cor | Uso |
|---|---|---|
| `active` | Verde (#38a169) | Licitação ativa, contrato vigente |
| `pending` | Laranja (#f6ad55) | Aguardando ação, prazo próximo |
| `expired` | Vermelho (#e53e3e) | Vencido, expirado, cancelado |

```tsx
function StatusBadge({ status }) {
  const variants = {
    active: 'bg-success-100 text-success-700 border-success-200',
    pending: 'bg-warning-100 text-warning-700 border-warning-200',
    expired: 'bg-danger-100 text-danger-700 border-danger-200',
    draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    info: 'bg-brand-100 text-brand-700 border-brand-200',
  }

  const labels = {
    active: 'Ativo',
    pending: 'Pendente',
    expired: 'Vencido',
    draft: 'Rascunho',
    info: 'Em Análise',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      variants[status]
    )}>
      {labels[status]}
    </span>
  )
}
```

### Regras

- Badges são informativos, não interativos (exceto se explicitamente clicáveis)
- Máximo de 2 badges por linha de tabela
- Nunca usar badges para ações — use botões
- Usar ponto colorido (`●`) antes do label para reforço visual quando útil

---

## 9. Alert

Para mensagens contextuais dentro de páginas ou formulários.

### Variantes

| Variante | Uso |
|---|---|
| `info` | Instruções, informações contextuais, avisos neutros |
| `success` | Confirmações de ação realizada |
| `warning` | Atenção necessária, prazos |
| `error` | Erros de sistema, falhas de validação global |

```tsx
<Alert variant="warning">
  <ExclamationTriangleIcon className="h-4 w-4" />
  <AlertTitle>Contrato vencendo em 5 dias</AlertTitle>
  <AlertDescription>
    O contrato <strong>CT-2025-0018</strong> vence em 15/03/2025.
    Providencie a renovação ou o encerramento.
  </AlertDescription>
</Alert>
```

### Regras

- Alerts dentro de páginas: posição fixa no topo do conteúdo relevante
- Não usar alerts para validação de campo individual — use mensagens de erro inline
- Alerts de sucesso devem ter auto-dismiss após 5s ou ser fecháveis manualmente
- Alerts de erro nunca devem fechar automaticamente

---

## 10. Form Layout

### Layout padrão (uma coluna)

```tsx
<form className="space-y-6 max-w-[640px]">
  {/* Grupo de campos */}
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-neutral-900">
      Dados do Processo
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <FormField name="processNumber" label="Nº do Processo" required />
      <FormField name="modality" label="Modalidade" required />
    </div>
    <FormField name="object" label="Objeto" required />
  </div>

  {/* Grupo de datas */}
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-neutral-900">
      Cronograma
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <FormField name="openingDate" label="Data de Abertura" type="date" />
      <FormField name="closingDate" label="Data de Encerramento" type="date" />
    </div>
  </div>

  {/* Footer do formulário */}
  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
    <Button variant="outline" type="button">Cancelar</Button>
    <Button type="submit">Criar Processo</Button>
  </div>
</form>
```

### Regras de formulário

- Agrupar campos semanticamente com título de grupo
- Campos de mesma relevância em grid de 2 colunas no desktop
- Campos de texto longo (objeto, descrição) sempre em 1 coluna (100%)
- Footer com separador visual acima das ações
- Validação em tempo real após o primeiro submit (não enquanto o usuário digita)
- Sempre mostrar estado de loading no botão de submit

---

## 11. Sidebar Navigation

### Estrutura

```tsx
<nav className="flex flex-col h-full px-3 py-4">
  {/* Logo */}
  <div className="px-3 mb-6">
    <Logo />
  </div>

  {/* Seletor de empresa (se multi-empresa) */}
  <CompanySelector className="mb-4" />

  {/* Navegação principal */}
  <div className="space-y-1 flex-1">
    <NavItem href="/dashboard" icon={HomeIcon} label="Dashboard" />
    <NavItem href="/licitacoes" icon={DocumentTextIcon} label="Licitações" />
    <NavItem href="/contratos" icon={ClipboardDocumentIcon} label="Contratos" />
    <NavItem href="/documentos" icon={FolderIcon} label="Documentos" />
  </div>

  {/* Navegação secundária */}
  <div className="space-y-1 border-t border-neutral-200 pt-3">
    <NavItem href="/configuracoes" icon={Cog6ToothIcon} label="Configurações" />
  </div>

  {/* Avatar do usuário */}
  <UserMenu className="mt-3" />
</nav>
```

### NavItem — estados

| Estado | Visual |
|---|---|
| Default | Texto `neutral-700`, ícone `neutral-500` |
| Active | Fundo `brand-yellow-500` (#E2F32B), Texto `brand-obsidian-900` |

---

## 12. Toast / Sonner

Para feedback de ações do usuário (sucesso, erro, loading).

```tsx
// Uso (via sonner)
toast.success('Licitação criada com sucesso.')
toast.error('Não foi possível salvar. Tente novamente.')
toast.loading('Enviando documentos...')
toast.promise(uploadPromise, {
  loading: 'Enviando documentos...',
  success: 'Documentos enviados.',
  error: 'Falha no envio.',
})
```

### Regras

- Posição: `bottom-right`
- Duração padrão: 4 segundos
- Toasts de erro: 6 segundos, fecháveis manualmente
- Toasts de loading: sem auto-dismiss, fechar ao resolver
- Máximo de 3 toasts simultâneos
- Mensagens curtas e no passado ("Salvo.", "Excluído.") ou no gerúndio ("Salvando...")
