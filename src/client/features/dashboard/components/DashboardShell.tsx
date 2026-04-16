"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Bell,
  Bot,
  Building2,
  ChevronsUpDown,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Radar,
  Scale,
  Search,
  Settings,
  Target,
  User,
  Users,
  Zap,
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
import { Separator } from "@/client/components/ui/separator"
import { AppContextProvider, useAppContext } from "@/client/hooks/app"


// ─── Company selector ─────────────────────────────────────────────────────────

function CompanySelector() {
  const { orgAtiva, empresaAtiva } = useAppContext()
  const baseHref = `/org/${orgAtiva?.id}/${empresaAtiva?.id}`

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="font-semibold text-sm truncate">
                  {empresaAtiva?.name ?? "…"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organização ativa
            </DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 p-2" asChild>
              <Link href={baseHref}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Building2 className="size-3" />
                </div>
                {empresaAtiva?.name ?? "…"}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// ─── Nav helpers ──────────────────────────────────────────────────────────────

function NavBadge({ type }: { type: "novidade" | "assine" | "em-breve" }) {
  if (type === "novidade") return (
    <span className="ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-white leading-none">
      Novo
    </span>
  )
  if (type === "assine") return (
    <span className="ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-foreground/10 text-muted-foreground leading-none">
      Assine
    </span>
  )
  return (
    <span className="ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60 leading-none">
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
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sidebar-foreground/40 cursor-default select-none text-sm">
        <Icon className="size-3.5 shrink-0" />
        <span className="flex-1 truncate">{label}</span>
        <NavBadge type={badge} />
      </div>
    </SidebarMenuSubItem>
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
            className={`${disabled ? "opacity-70 pointer-events-none" : ""} ${highlight ? "bg-emerald-50/60 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40" : ""}`}
          >
            <Icon className={`size-4 ${highlight ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
            <span>{label}</span>
            {badge && <NavBadge type={badge} />}
            <ChevronRight className={`ml-auto size-3.5 transition-transform group-data-[state=open]/nav-${id}:rotate-90 ${disabled ? "hidden" : ""}`} />
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
  const { orgAtiva, empresaAtiva } = useAppContext()
  const pathname = usePathname()
  const base     = `/org/${orgAtiva?.id}/${empresaAtiva?.id}`

  const is = (path: string) => pathname.startsWith(`${base}/${path}`)

  return (
    <SidebarMenu className="gap-4">

      {/* Dashboard */}
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === base || pathname === `${base}/`}>
          <Link href={base}>
            <LayoutDashboard className="size-4" />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Captação */}
      <NavCollapsible id="captacao" icon={Radar} label="Captação" active={is("search")}>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("search")}>
            <Link href={`${base}/search`}>
              <Search className="size-3.5" />
              <span>Encontrar Licitações</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <DisabledSubItem icon={Bell}   label="Alertas Personalizados"  badge="em-breve" />
        <DisabledSubItem icon={Target} label="Licitações Estratégicas" badge="em-breve" />
      </NavCollapsible>

      {/* Gerenciar Licitações */}
      <NavCollapsible id="licitacoes" icon={FileText} label="Gerenciar Licitações" active={is("licitacoes")}>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={pathname === `${base}/licitacoes`}>
            <Link href={`${base}/licitacoes`}>
              <FileText className="size-3.5" />
              <span>Minhas Licitações</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("licitacoes/nova")}>
            <Link href={`${base}/licitacoes/nova`}>
              <FileText className="size-3.5" />
              <span>Nova Licitação</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </NavCollapsible>

      {/* Minha Empresa */}
      <NavCollapsible id="empresa" icon={Building2} label="Minha Empresa" active={is("time") || is("empresa") || is("conta")}>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("time")}>
            <Link href={`${base}/time`}>
              <Users className="size-3.5" />
              <span>Gerenciar Time</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("empresa")}>
            <Link href={`${base}/empresa`}>
              <Settings className="size-3.5" />
              <span>Gerenciar Empresas</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <DisabledSubItem icon={FileText} label="Gerenciar Documentos" badge="em-breve" />
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={is("conta")}>
            <Link href={`${base}/conta`}>
              <User className="size-3.5" />
              <span>Minha Conta</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </NavCollapsible>

      {/* Inteligência Artificial */}
      <NavCollapsible id="ia" icon={Bot} label="Inteligência Artificial" active={false} badge="em-breve" disabled highlight>
        <DisabledSubItem icon={Bot}          label="Assistente IA"       badge="em-breve" />
        <DisabledSubItem icon={Scale}        label="Consultor Jurídico"  badge="em-breve" />
        <DisabledSubItem icon={FileText}     label="Resumo do Edital"    badge="em-breve" />
        <DisabledSubItem icon={MessageSquare} label="Pergunte ao Edital" badge="em-breve" />
      </NavCollapsible>

      {/* Automação */}
      <NavCollapsible id="automacao" icon={Zap} label="Automação" active={false} badge="em-breve" disabled>
        <DisabledSubItem icon={Zap}  label="Robô de Lance"    badge="em-breve" />
        <DisabledSubItem icon={Lock} label="Monitorar Portais" badge="em-breve" />
      </NavCollapsible>

    </SidebarMenu>
  )
}

// ─── User footer ──────────────────────────────────────────────────────────────

function UserFooter() {
  const { user, signOut, orgAtiva, empresaAtiva } = useAppContext()
  const router   = useRouter()
  const initials = user?.name?.charAt(0).toUpperCase() ?? "U"

  async function handleSignOut() {
    await signOut()
    router.push("/")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href={`/org/${orgAtiva?.id}/${empresaAtiva?.id}/conta`}>
            <User className="size-4" />
            <span>Minha Conta</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton onClick={handleSignOut} className="text-destructive hover:text-destructive">
          <LogOut className="size-4" />
          <span>Sair</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarSeparator />

      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate">{user?.name ?? "Usuário"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</span>
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

export function DashboardShell({ companyName, children }: Props) {
  return (
    <AppContextProvider companyInitialName={companyName}>
      <SidebarProvider>
        <Sidebar variant="inset">
          <SidebarHeader>
            <CompanySelector />
          </SidebarHeader>

          <SidebarContent>
            <NavMain />
          </SidebarContent>

          <SidebarFooter>
            <UserFooter />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
          </header>

          <div className="flex flex-1 flex-col gap-4 px-6 py-6 min-w-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppContextProvider>
  )
}
