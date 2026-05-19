"use client"

import React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Bell,
  Boxes,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  FileCheck,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  Plus,
  Radar,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
  User,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/client/components/ui/avatar"
import { Button } from "@/client/components/ui/button"
import { PageHeader, type PageHeaderBreadcrumb } from "@/client/components/common/PageHeader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu"
import { Input } from "@/client/components/ui/input"
import { cn } from "@/client/main/lib/utils"
import { AppContextProvider, useAppContext } from "@/client/hooks/app"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { DashboardProvider, useDashboard } from "@/client/features/dashboard/context/dashboard-context"

type NavBadgeType = "novidade" | "assine" | "em-breve"

type NavDropdownItem = {
  href?: string
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: NavBadgeType
  disabled?: boolean
}

type NavGroupProps = {
  icon: React.ElementType
  label: string
  active: boolean
  children: React.ReactNode
}

type CompanyOption = {
  id: string
  name: string
  cnpj: string | null
}

const HeaderActionsTargetContext = React.createContext<HTMLDivElement | null>(null)

export function DashboardHeaderActions({
  children,
}: {
  children: React.ReactNode
}) {
  const target = React.useContext(HeaderActionsTargetContext)

  if (!target) return null

  return createPortal(children, target)
}

function NavBadge({ type }: { type: NavBadgeType }) {
  const label = type === "novidade"
    ? "Novo"
    : type === "assine"
      ? "Assine"
      : "Em breve"

  return (
    <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold uppercase leading-none text-secondary-foreground">
      {label}
    </span>
  )
}

function CompanySelector({ companyName }: { companyName: string }) {
  const api = useCoreApi()
  const { orgAtiva, empresaAtiva, setEmpresaAtiva } = useAppContext()
  const { orgId, companyId } = useDashboard()
  const [search, setSearch] = React.useState("")
  const baseHref = `/org/${orgId}/${companyId}`
  const displayName = empresaAtiva?.name ?? companyName
  const companiesQuery = useQuery({
    queryKey: ["dashboard-company-switcher", orgAtiva?.id],
    queryFn: async (): Promise<CompanyOption[]> => {
      const response = await api.company.listCompanies({ organizationId: orgAtiva!.id })

      return response.companies.map(company => ({
        id: company.id,
        name: company.nome_fantasia ?? company.razao_social,
        cnpj: company.cnpj,
      }))
    },
    enabled: Boolean(orgAtiva?.id),
    staleTime: 5 * 60 * 1000,
  })

  const fallbackCompanies: CompanyOption[] = empresaAtiva
    ? [{
        id: empresaAtiva.id,
        name: displayName,
        cnpj: empresaAtiva.cnpj,
      }]
    : [{
        id: companyId,
        name: displayName,
        cnpj: null,
      }]
  const companies = companiesQuery.data?.length ? companiesQuery.data : fallbackCompanies
  const filteredCompanies = companies.filter(company => {
    const term = search.trim().toLowerCase()

    if (!term) return true

    return `${company.name} ${company.cnpj ?? ""}`.toLowerCase().includes(term)
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-[min(70vw,16rem)] justify-start gap-2 rounded-md bg-background px-2 shadow-xs"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 data-icon="inline-start" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-[13px] font-semibold leading-none text-foreground">
              {displayName}
            </span>
            <span className="sr-only">{orgAtiva?.slug ?? "Organização ativa"}</span>
          </span>
          <ChevronDown data-icon="inline-end" className="ml-auto opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>
          <span className="block text-xs font-semibold uppercase text-muted-foreground">
            Empresa ativa
          </span>
          <span className="mt-1 block truncate text-sm font-semibold">
            {displayName}
          </span>
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar empresa..."
              className="h-9 pl-8"
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map(company => {
              const active = company.id === companyId

              return (
                <DropdownMenuItem
                  key={company.id}
                  onSelect={() => {
                    setEmpresaAtiva({
                      id: company.id,
                      name: company.name,
                      cnpj: company.cnpj,
                    })
                  }}
                >
                  <Building2 />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{company.name}</span>
                    {company.cnpj ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {company.cnpj}
                      </span>
                    ) : null}
                  </span>
                  {active ? <Check /> : null}
                </DropdownMenuItem>
              )
            })
          ) : companiesQuery.isLoading ? (
            <DropdownMenuItem disabled>Carregando empresas...</DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>Nenhuma empresa encontrada</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`${baseHref}/empresa`}>
            <Settings />
            Gerenciar empresas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu() {
  const { user, signOut } = useAppContext()
  const { orgId, companyId } = useDashboard()
  const router = useRouter()
  const initials = user?.name?.charAt(0).toUpperCase() ?? "U"

  async function handleSignOut() {
    await signOut()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="rounded-md">
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Abrir menu da conta</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-semibold">
            {user?.name ?? "Usuário"}
          </span>
          <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
            {user?.email ?? ""}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/org/${orgId}/${companyId}/conta`}>
              <User />
              Minha Conta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault()
              void handleSignOut()
            }}
          >
            <LogOut />
            Sair
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavLinkItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-md px-3 text-[13px] font-medium text-muted-foreground",
        active && "bg-accent text-accent-foreground",
      )}
    >
      <Link href={href}>
        <Icon data-icon="inline-start" />
        {label}
      </Link>
    </Button>
  )
}

function NavGroup({ icon: Icon, label, active, children }: NavGroupProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-current={active ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-md px-3 text-[13px] font-medium text-muted-foreground",
            active && "bg-accent text-accent-foreground",
          )}
        >
          <Icon data-icon="inline-start" />
          {label}
          <ChevronDown data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuGroup>{children}</DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavDropdownItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
  disabled,
}: NavDropdownItem) {
  if (disabled || !href) {
    return (
      <DropdownMenuItem disabled>
        <Icon />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {badge ? <NavBadge type={badge} /> : null}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem asChild className={cn(active && "bg-accent text-accent-foreground")}>
      <Link href={href}>
        <Icon />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {badge ? <NavBadge type={badge} /> : null}
      </Link>
    </DropdownMenuItem>
  )
}

function HorizontalNav({ className }: { className?: string }) {
  const { orgId, companyId } = useDashboard()
  const pathname = usePathname()
  const base = `/org/${orgId}/${companyId}`
  const isHome = pathname === base || pathname === `${base}/`
  const is = (path: string) => pathname.startsWith(`${base}/${path}`)

  return (
    <nav
      aria-label="Menu principal"
      className={cn("flex min-w-0 items-center gap-1 overflow-x-auto", className)}
    >
      <NavLinkItem
        href={base}
        icon={LayoutDashboard}
        label="Dashboard"
        active={isHome}
      />

      <NavGroup icon={Radar} label="Captação" active={is("search")}>
        <NavDropdownItem
          href={`${base}/search`}
          icon={Search}
          label="Encontrar Licitações"
          active={is("search")}
        />
        <NavDropdownItem icon={Bell} label="Alertas Personalizados" badge="em-breve" disabled />
        <NavDropdownItem icon={Target} label="Licitações Estratégicas" badge="em-breve" disabled />
      </NavGroup>

      <NavLinkItem
        href={`${base}/workspace-ia`}
        icon={Sparkles}
        label="Análise IA"
        active={is("workspace-ia")}
      />

      <NavGroup icon={FileText} label="Oportunidades" active={is("licitacoes") || is("oportunidades")}>
        <NavDropdownItem
          href={`${base}/licitacoes`}
          icon={FileText}
          label="Minhas Oportunidades"
          active={pathname === `${base}/licitacoes`}
        />
        <NavDropdownItem
          href={`${base}/licitacoes/rascunhos`}
          icon={Clock3}
          label="Rascunhos"
          active={pathname === `${base}/licitacoes/rascunhos`}
        />
      </NavGroup>

      <NavGroup icon={Handshake} label="Contratos" active={is("contratos")}>
        <NavDropdownItem
          href={`${base}/contratos`}
          icon={FileCheck}
          label="Meus Contratos"
          active={pathname === `${base}/contratos`}
        />
      </NavGroup>

      <NavGroup icon={Boxes} label="Cadastro" active={is("cadastro")}>
        <NavDropdownItem
          href={`${base}/cadastro/itens`}
          icon={Boxes}
          label="Itens"
          active={pathname === `${base}/cadastro/itens`}
        />
      </NavGroup>

      <NavGroup
        icon={Building2}
        label="Empresa"
        active={is("time") || is("empresa") || is("configuracoes") || is("conta")}
      >
        <NavDropdownItem href={`${base}/time`} icon={Users} label="Gerenciar Time" active={is("time")} />
        <NavDropdownItem href={`${base}/empresa`} icon={Settings} label="Gerenciar Empresas" active={is("empresa")} />
        <NavDropdownItem href={`${base}/configuracoes`} icon={SlidersHorizontal} label="Configurações" active={is("configuracoes")} />
        <NavDropdownItem icon={FileText} label="Gerenciar Documentos" badge="em-breve" disabled />
        <NavDropdownItem href={`${base}/conta`} icon={User} label="Minha Conta" active={is("conta")} />
      </NavGroup>
    </nav>
  )
}

function AppTopBar({ companyName }: { companyName: string }) {
  const { orgId, companyId } = useDashboard()

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="flex min-h-14 min-w-0 items-center gap-3 px-4 md:px-6">
        <CompanySelector companyName={companyName} />
        <div className="hidden h-8 w-px shrink-0 bg-border md:block" />

        <HorizontalNav className="hidden flex-1 md:flex" />

        <div className="ml-auto flex min-w-0 items-center justify-end gap-2">
          <Button asChild size="sm" className="hidden rounded-md 2xl:inline-flex">
            <Link href={`/org/${orgId}/${companyId}/licitacoes/nova`}>
              <Plus data-icon="inline-start" />
              Nova Oportunidade
            </Link>
          </Button>
          <UserMenu />
        </div>
      </div>

      <div className="border-t px-3 py-2 md:hidden">
        <HorizontalNav />
      </div>
    </header>
  )
}

interface Props {
  orgId: string
  companyId: string
  companyName: string
  children: React.ReactNode
}

type DashboardPageMeta = {
  title: string
  subtitle: string
  breadcrumbs?: PageHeaderBreadcrumb[]
}

function resolvePageMeta(pathname: string, base: string): DashboardPageMeta | null {
  if (pathname.includes("/licitacoes/nova")) {
    return null
  }

  if (pathname.startsWith(`${base}/contratos/`)) {
    return null
  }

  if (pathname === base || pathname === `${base}/`) {
    return { title: "Dashboard", subtitle: "Panorama estratégico da operação." }
  }

  const homeBreadcrumb: PageHeaderBreadcrumb = { label: "Início", href: base }
  const sectionBreadcrumbs = (label: string): PageHeaderBreadcrumb[] => [
    homeBreadcrumb,
    { label },
  ]

  if (pathname.startsWith(`${base}/search`)) {
    return null
  }

  const matches: Array<DashboardPageMeta & { key: string }> = [
    {
      key: "workspace-ia",
      title: "Análise IA",
      subtitle: "Analise documentos e oportunidades com assistentes especializados.",
      breadcrumbs: sectionBreadcrumbs("Análise IA"),
    },
    {
      key: "licitacoes/rascunhos",
      title: "Rascunhos",
      subtitle: "Retome licitações em andamento com o contexto da IA preservado.",
      breadcrumbs: [
        homeBreadcrumb,
        { label: "Oportunidades", href: `${base}/licitacoes` },
        { label: "Rascunhos" },
      ],
    },
    {
      key: "licitacoes",
      title: "Gerenciar Oportunidades",
      subtitle: "Acompanhe oportunidades, status e próximos movimentos.",
      breadcrumbs: sectionBreadcrumbs("Oportunidades"),
    },
    {
      key: "contratos",
      title: "Execução e Contratos",
      subtitle: "Gestão de contratos, empenhos e pipeline logístico.",
      breadcrumbs: sectionBreadcrumbs("Contratos"),
    },
    {
      key: "cadastro/itens",
      title: "Cadastro de Itens",
      subtitle: "Monte o catálogo interno que será reutilizado na precificação.",
      breadcrumbs: [
        homeBreadcrumb,
        { label: "Cadastro" },
        { label: "Itens" },
      ],
    },
    {
      key: "time",
      title: "Gerenciar Time",
      subtitle: "Coordene acessos, papéis e responsabilidades.",
      breadcrumbs: [
        homeBreadcrumb,
        { label: "Empresa" },
        { label: "Time" },
      ],
    },
    {
      key: "empresa",
      title: "Gerenciar Empresas",
      subtitle: "Organize os dados mestres da operação.",
      breadcrumbs: [
        homeBreadcrumb,
        { label: "Empresa" },
        { label: "Empresas" },
      ],
    },
    {
      key: "configuracoes",
      title: "Configurações",
      subtitle: "Defina ajustes globais da empresa ativa.",
      breadcrumbs: [
        homeBreadcrumb,
        { label: "Empresa" },
        { label: "Configurações" },
      ],
    },
    {
      key: "conta",
      title: "Minha Conta",
      subtitle: "Ajuste preferências e dados de acesso.",
      breadcrumbs: [
        homeBreadcrumb,
        { label: "Empresa" },
        { label: "Minha Conta" },
      ],
    },
  ]

  return matches.find(item => pathname.includes(`/${item.key}`))
    ?? {
      title: "Licitai Control",
      subtitle: "Command center para licitações e inteligência operacional.",
      breadcrumbs: sectionBreadcrumbs("Página"),
    }
}

function DashboardShellFrame({
  children,
  companyName,
}: Pick<Props, "children" | "companyName">) {
  const pathname = usePathname()
  const { orgId, companyId } = useDashboard()
  const base = `/org/${orgId}/${companyId}`
  const pageMeta = resolvePageMeta(pathname, base)
  const isContratoWorkspace = pathname.startsWith(`${base}/contratos/`)
  const isSearchWorkspace = pathname.startsWith(`${base}/search`)
  const [headerActionsTarget, setHeaderActionsTarget] = React.useState<HTMLDivElement | null>(null)

  return (
    <HeaderActionsTargetContext.Provider value={headerActionsTarget}>
      <div className="flex min-h-svh min-w-0 flex-col bg-background">
        <AppTopBar companyName={companyName} />

        <main
          className={cn(
            "flex min-w-0 max-w-full flex-1 flex-col bg-background",
            isSearchWorkspace
              ? "min-h-0 overflow-hidden px-4 py-4 md:px-6 md:py-5"
              : isContratoWorkspace
                ? "gap-0 overflow-x-hidden px-0 py-0"
                : "gap-5 overflow-x-hidden px-4 py-4 md:px-6 md:py-5",
          )}
        >
          {pageMeta ? (
            <PageHeader
              title={pageMeta.title}
              description={pageMeta.subtitle}
              breadcrumbs={pageMeta.breadcrumbs}
              className="px-1 py-1"
              actions={(
                <div
                  ref={setHeaderActionsTarget}
                  className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end"
                />
              )}
            />
          ) : isSearchWorkspace ? null : (
            <div
              ref={setHeaderActionsTarget}
              className="flex shrink-0 flex-wrap items-center justify-end gap-2 px-1 py-1"
            />
          )}

          <div
            className={cn(
              "flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden",
              isSearchWorkspace && "min-h-0 overflow-hidden",
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </HeaderActionsTargetContext.Provider>
  )
}

export function DashboardShell({ orgId, companyId, companyName, children }: Props) {
  return (
    <DashboardProvider orgId={orgId} companyId={companyId}>
      <AppContextProvider companyInitialName={companyName}>
        <DashboardShellFrame companyName={companyName}>
          {children}
        </DashboardShellFrame>
      </AppContextProvider>
    </DashboardProvider>
  )
}
