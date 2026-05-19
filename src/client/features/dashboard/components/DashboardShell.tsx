"use client"

import React from "react"
import { createPortal } from "react-dom"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Bell,
  Building2,
  Clock3,
  Boxes,
  ChevronsUpDown,
  ChevronRight,
  FileText,
  FileCheck,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
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

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/client/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/client/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/client/components/ui/avatar"
import { Button } from "@/client/components/ui/button"
import { AppContextProvider, useAppContext } from "@/client/hooks/app"
import { DashboardProvider, useDashboard } from "@/client/features/dashboard/context/dashboard-context"

const NAV_LABEL_CLASS = "text-[13px] font-medium leading-none tracking-normal group-data-[collapsible=icon]:hidden"

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


// ─── Company selector ─────────────────────────────────────────────────────────

function CompanySelector() {
  const { orgAtiva, empresaAtiva } = useAppContext()
  const { orgId, companyId } = useDashboard()
  const baseHref = `/org/${orgId}/${companyId}`

  return (
    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
      <SidebarMenu className="gap-2">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-auto min-h-[4.1rem] w-full rounded-none bg-transparent px-1 py-1 data-[state=open]:bg-white/[0.03] data-[state=open]:text-white"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[0.5rem] bg-white text-primary shadow-[0_8px_18px_rgba(4,22,39,0.18)]">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[13px] font-semibold leading-none text-white">
                    {empresaAtiva?.name ?? "…"}
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-sidebar-foreground/52">
                    {orgAtiva?.slug ?? "Organização ativa"}
                  </span>
                </div>
                <ChevronsUpDown className="size-4 shrink-0 opacity-40" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-border/70 bg-white text-primary shadow-[0_18px_40px_rgba(4,22,39,0.18)]"
              align="start"
              side="bottom"
              sideOffset={6}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Empresa ativa
              </DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 rounded-md p-2 text-primary focus:bg-surface-container-low focus:text-primary" asChild>
                <Link href={baseHref}>
                  <div className="flex size-6 items-center justify-center rounded-md border border-border/70 bg-white">
                    <Building2 className="size-3" />
                  </div>
                  {empresaAtiva?.name ?? "…"}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <Button
            asChild
            size="sm"
            className="h-10 w-full justify-center rounded-[0.65rem] text-[13px]"
          >
            <Link href={`${baseHref}/licitacoes/nova`}>
              <Plus className="size-4" />
              Nova Oportunidade
            </Link>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  )
}

// ─── Nav helpers ──────────────────────────────────────────────────────────────

function NavBadge({ type }: { type: "novidade" | "assine" | "em-breve" }) {
  if (type === "novidade") return (
    <span className="ml-auto rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold uppercase leading-none text-white group-data-[collapsible=icon]:hidden">
      Novo
    </span>
  )
  if (type === "assine") return (
    <span className="ml-auto rounded-full bg-white/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase leading-none text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
      Assine
    </span>
  )
  return (
    <span className="ml-auto rounded-full bg-white/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase leading-none text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
      Em breve
    </span>
  )
}

function DisabledSubItem({ icon: Icon, label, badge }: {
  icon: React.ElementType
  label: string
  badge: "novidade" | "assine" | "em-breve"
}) {
  return (
    <SidebarMenuSubItem>
      <div className="flex cursor-default select-none items-center gap-2 rounded-none px-3.5 py-1.5 text-[13px] text-sidebar-foreground/38 group-data-[collapsible=icon]:hidden">
        <Icon className="size-[14px] shrink-0" />
        <span className={`flex-1 truncate ${NAV_LABEL_CLASS}`}>{label}</span>
        <NavBadge type={badge} />
      </div>
    </SidebarMenuSubItem>
  )
}

function SidebarRailMenuToggle() {
  const { state } = useSidebar()

  if (state !== "collapsed") return null

  return (
    <SidebarMenuItem className="hidden md:block">
      <SidebarTrigger className="mx-auto flex size-9 rounded-[0.85rem] bg-transparent text-sidebar-foreground/72 hover:bg-white/[0.08] hover:text-white">
        <Menu className="size-4" />
        <span className="sr-only">Expandir sidebar</span>
      </SidebarTrigger>
    </SidebarMenuItem>
  )
}

function NavCollapsible({
  id, icon: Icon, label, active, children, badge, disabled, highlight
}: {
  id: string
  icon: React.ElementType
  label: string
  active: boolean
  children: React.ReactNode
  badge?: "novidade" | "assine" | "em-breve"
  disabled?: boolean
  highlight?: boolean
}) {
  return (
    <SidebarMenuItem>
      <Collapsible defaultOpen={active} className={`group/nav-${id}`}>
        <CollapsibleTrigger asChild disabled={disabled}>
          <SidebarMenuButton 
            isActive={active} 
            className={`
              relative
              text-[13px] font-medium leading-none
              ${disabled ? "pointer-events-none opacity-70" : ""}
              ${active ? "rounded-none bg-white/[0.04] pl-5 text-white before:absolute before:top-0 before:bottom-0 before:left-0 before:w-1 before:bg-secondary before:content-[''] group-data-[collapsible=icon]:rounded-[0.9rem] group-data-[collapsible=icon]:bg-[linear-gradient(135deg,rgba(0,88,190,0.96),rgba(33,112,228,0.92))] group-data-[collapsible=icon]:pl-2.5 group-data-[collapsible=icon]:shadow-[0_10px_22px_rgba(0,88,190,0.18)] group-data-[collapsible=icon]:before:hidden" : ""}
              ${!active && !highlight ? "text-sidebar-foreground/78 hover:bg-white/[0.04] hover:text-white" : ""}
              ${highlight ? "rounded-none bg-white/[0.05] text-white" : ""}
            `}
          >
            <Icon className={`size-[15px] ${highlight ? "text-sidebar-primary-foreground" : ""}`} />
            <span className={NAV_LABEL_CLASS}>{label}</span>
            {badge && <NavBadge type={badge} />}
            <ChevronRight className={`ml-auto size-3.5 transition-transform group-data-[state=open]/nav-${id}:rotate-90 group-data-[collapsible=icon]:hidden ${disabled ? "hidden" : ""}`} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>{children}</SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function NavMain() {
  const { orgId, companyId } = useDashboard()
  const pathname = usePathname()
  const base     = `/org/${orgId}/${companyId}`

  const is = (path: string) => pathname.startsWith(`${base}/${path}`)

  return (
    <div className="space-y-1">
      <SidebarMenu className="gap-1">
      <SidebarRailMenuToggle />

      {/* Dashboard */}
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === base || pathname === `${base}/`}
          className={pathname === base || pathname === `${base}/`
            ? "relative text-[13px] font-medium leading-none rounded-none bg-white/[0.04] pl-5 text-white before:absolute before:top-0 before:bottom-0 before:left-0 before:w-1 before:bg-secondary before:content-[''] group-data-[collapsible=icon]:rounded-[0.9rem] group-data-[collapsible=icon]:bg-[linear-gradient(135deg,rgba(0,88,190,0.96),rgba(33,112,228,0.92))] group-data-[collapsible=icon]:pl-2.5 group-data-[collapsible=icon]:shadow-[0_10px_22px_rgba(0,88,190,0.18)] group-data-[collapsible=icon]:before:hidden"
            : "text-[13px] font-medium leading-none text-sidebar-foreground/78 hover:bg-white/[0.04] hover:text-white"}
        >
          <Link href={base}>
            <LayoutDashboard className="size-[15px]" />
            <span className={NAV_LABEL_CLASS}>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Captação */}
      <NavCollapsible id="captacao" icon={Radar} label="Captação" active={is("search")}>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("search")}>
            <Link href={`${base}/search`}>
              <Search className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Encontrar Licitações</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <DisabledSubItem icon={Bell}   label="Alertas Personalizados"  badge="em-breve" />
        <DisabledSubItem icon={Target} label="Licitações Estratégicas" badge="em-breve" />
      </NavCollapsible>

      {/* Inteligência */}
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={is("workspace-ia")}
          className={is("workspace-ia")
            ? "relative text-[13px] font-medium leading-none rounded-none bg-white/[0.04] pl-5 text-white before:absolute before:top-0 before:bottom-0 before:left-0 before:w-1 before:bg-secondary before:content-[''] group-data-[collapsible=icon]:rounded-[0.9rem] group-data-[collapsible=icon]:bg-[linear-gradient(135deg,rgba(0,88,190,0.96),rgba(33,112,228,0.92))] group-data-[collapsible=icon]:pl-2.5 group-data-[collapsible=icon]:shadow-[0_10px_22px_rgba(0,88,190,0.18)] group-data-[collapsible=icon]:before:hidden"
            : "text-[13px] font-medium leading-none text-sidebar-foreground/78 hover:bg-white/[0.04] hover:text-white"}
        >
          <Link href={`${base}/workspace-ia`}>
            <Sparkles className="size-[15px]" />
            <span className={NAV_LABEL_CLASS}>Análise IA</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Gerenciar Oportunidades */}
      <NavCollapsible id="licitacoes" icon={FileText} label="Gerenciar Oportunidades" active={is("licitacoes")}>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={pathname === `${base}/licitacoes`}>
            <Link href={`${base}/licitacoes`}>
              <FileText className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Minhas Oportunidades</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={pathname === `${base}/licitacoes/rascunhos`}>
            <Link href={`${base}/licitacoes/rascunhos`}>
              <Clock3 className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Rascunhos</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </NavCollapsible>

      {/* Execução e Contratos */}
      <NavCollapsible id="contratos" icon={Handshake} label="Execução e Contratos" active={is("contratos")}>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={pathname === `${base}/contratos`}>
            <Link href={`${base}/contratos`}>
              <FileCheck className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Meus Contratos</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </NavCollapsible>

      {/* Cadastro */}
      <NavCollapsible id="cadastro" icon={Boxes} label="Cadastro" active={is("cadastro")}>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={pathname === `${base}/cadastro/itens`}>
            <Link href={`${base}/cadastro/itens`}>
              <Boxes className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Itens</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </NavCollapsible>

      {/* Minha Empresa */}
      <NavCollapsible id="empresa" icon={Building2} label="Minha Empresa" active={is("time") || is("empresa") || is("configuracoes") || is("conta")}>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("time")}>
            <Link href={`${base}/time`}>
              <Users className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Gerenciar Time</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("empresa")}>
            <Link href={`${base}/empresa`}>
              <Settings className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Gerenciar Empresas</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("configuracoes")}>
            <Link href={`${base}/configuracoes`}>
              <SlidersHorizontal className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Configurações</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <DisabledSubItem icon={FileText} label="Gerenciar Documentos" badge="em-breve" />
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("conta")}>
            <Link href={`${base}/conta`}>
              <User className="size-[14px]" />
              <span className={NAV_LABEL_CLASS}>Minha Conta</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </NavCollapsible>
      </SidebarMenu>
    </div>
  )
}

// ─── User footer ──────────────────────────────────────────────────────────────

function UserFooter() {
  const { user, signOut } = useAppContext()
  const { orgId, companyId } = useDashboard()
  const router   = useRouter()
  const initials = user?.name?.charAt(0).toUpperCase() ?? "U"

  async function handleSignOut() {
    await signOut()
    router.push("/")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="text-sidebar-foreground/78 hover:bg-white/[0.04] hover:text-white">
          <Link href={`/org/${orgId}/${companyId}/conta`}>
            <User className="size-4" />
            <span className={NAV_LABEL_CLASS}>Minha Conta</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton onClick={handleSignOut} className="text-red-200/90 hover:bg-red-500/10 hover:text-red-100">
          <LogOut className="size-4" />
          <span className={NAV_LABEL_CLASS}>Sair</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-3 rounded-none bg-transparent px-3 py-3">
          <Avatar className="size-9 shrink-0 border border-white/8">
            <AvatarFallback className="bg-white/[0.06] text-xs text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-[13px] font-medium leading-none text-white">{user?.name ?? "Usuário"}</span>
            <span className="truncate text-xs text-sidebar-foreground/48">{user?.email ?? ""}</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface Props {
  orgId:       string
  companyId:   string
  companyName: string
  children:    React.ReactNode
}

function resolvePageMeta(pathname: string, base: string) {
  if (pathname.includes("/licitacoes/nova")) {
    return null
  }

  if (pathname.startsWith(`${base}/contratos/`)) {
    return null
  }

  if (pathname === base || pathname === `${base}/`) {
    return { title: "Dashboard", subtitle: "Panorama estratégico da operação." }
  }

  const matches: Array<{ key: string; title: string; subtitle: string }> = [
    { key: "search", title: "Captação", subtitle: "Monitore oportunidades com mais precisão." },
    { key: "workspace-ia", title: "Análise IA", subtitle: "Analise documentos e oportunidades com assistentes especializados." },
    { key: "licitacoes/nova", title: "Nova Oportunidade", subtitle: "Monte o cadastro como um workspace editorial." },
    { key: "licitacoes/rascunhos", title: "Rascunhos", subtitle: "Retome licitações em andamento com o contexto da IA preservado." },
    { key: "licitacoes", title: "Gerenciar Oportunidades", subtitle: "Acompanhe oportunidades, status e próximos movimentos." },
    { key: "contratos", title: "Execução e Contratos", subtitle: "Gestão de contratos, empenhos e pipeline logístico." },
    { key: "cadastro/itens", title: "Cadastro de Itens", subtitle: "Monte o catálogo interno que será reutilizado na precificação." },
    { key: "time", title: "Gerenciar Time", subtitle: "Coordene acessos, papéis e responsabilidades." },
    { key: "empresa", title: "Gerenciar Empresas", subtitle: "Organize os dados mestres da operação." },
    { key: "configuracoes", title: "Configurações", subtitle: "Defina ajustes globais da empresa ativa." },
    { key: "conta", title: "Minha Conta", subtitle: "Ajuste preferências e dados de acesso." },
  ]

  return matches.find(item => pathname.includes(`/${item.key}`))
    ?? { title: "Licitai Control", subtitle: "Command center para licitações e inteligência operacional." }
}

function DashboardShellFrame({ children }: Pick<Props, "children">) {
  const pathname = usePathname()
  const { orgId, companyId } = useDashboard()
  const base = `/org/${orgId}/${companyId}`
  const pageMeta = resolvePageMeta(pathname, base)
  const isContratoWorkspace = pathname.startsWith(`${base}/contratos/`)
  const [headerActionsTarget, setHeaderActionsTarget] = React.useState<HTMLDivElement | null>(null)

  return (
    <HeaderActionsTargetContext.Provider value={headerActionsTarget}>
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_22%)]" />
          <div className="relative flex h-full flex-col">
            <SidebarHeader className="px-2 pt-2 pb-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
              <div className="hidden items-center justify-end px-1 pb-2 group-data-[collapsible=icon]:hidden md:flex">
                <SidebarTrigger className="size-8 rounded-[0.8rem] bg-white/[0.04] text-sidebar-foreground/72 hover:bg-white/[0.08] hover:text-white">
                  <Menu className="size-4" />
                  <span className="sr-only">Recolher sidebar</span>
                </SidebarTrigger>
              </div>
              <div className="border-b border-white/8 pb-4 group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:pb-0">
                <CompanySelector />
              </div>
            </SidebarHeader>

            <SidebarContent>
              <NavMain />
            </SidebarContent>

            <SidebarSeparator className="mx-3 mt-4" />

            <SidebarFooter>
              <UserFooter />
            </SidebarFooter>
          </div>
        </Sidebar>

        <SidebarInset className="bg-white">
          <div className={`flex min-h-svh min-w-0 max-w-full flex-col overflow-x-hidden bg-white ${isContratoWorkspace ? "gap-0 px-0 py-0 md:px-0 md:py-0" : "gap-4 px-4 py-4 md:px-6 md:py-4"}`}>
            {pageMeta ? (
              <header className="flex items-start justify-between gap-4 bg-transparent px-1 py-1">
                <div className="flex items-start gap-3">
                  <SidebarTrigger className="mt-0.5 size-8 rounded-[0.75rem] bg-surface-container-high text-primary hover:bg-surface-container-highest md:hidden" />
                  <div className="min-w-0">
                    <h1 className="font-display text-[1.65rem] font-semibold leading-[0.98] text-primary md:text-[1.95rem]">
                      {pageMeta.title}
                    </h1>
                    <p className="mt-1 max-w-2xl text-[0.92rem] leading-snug text-muted-foreground">
                      {pageMeta.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  ref={setHeaderActionsTarget}
                  className="flex shrink-0 flex-wrap items-center justify-end gap-2"
                />
              </header>
            ) : (
              <div className="flex items-center justify-between px-1 py-1 md:hidden">
                <SidebarTrigger className="size-8 rounded-[0.75rem] bg-surface-container-high text-primary hover:bg-surface-container-highest" />
                <div ref={setHeaderActionsTarget} className="flex shrink-0 flex-wrap items-center justify-end gap-2" />
              </div>
            )}

            <div className="min-w-0 max-w-full flex flex-1 flex-col overflow-x-hidden">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HeaderActionsTargetContext.Provider>
  )
}

export function DashboardShell({ orgId, companyId, companyName, children }: Props) {
  return (
    <DashboardProvider orgId={orgId} companyId={companyId}>
      <AppContextProvider companyInitialName={companyName}>
        <DashboardShellFrame>
          {children}
        </DashboardShellFrame>
      </AppContextProvider>
    </DashboardProvider>
  )
}
