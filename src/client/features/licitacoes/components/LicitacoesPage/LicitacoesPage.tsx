"use client"

import Link from "next/link"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent } from "@/client/components/ui/card"
import { FileText, Plus } from "lucide-react"
import { DashboardHeaderActions } from "@/client/features/dashboard/components/DashboardShell"
import { useApp } from "@/client/hooks/app/useApp"

export function LicitacoesPage() {
    const { empresaAtiva, orgAtiva } = useApp()
    const base = `/org/${orgAtiva?.id}/${empresaAtiva?.id}`

    return (
        <div className="space-y-6">
            <DashboardHeaderActions>
                <Button asChild>
                    <Link href={`${base}/licitacoes/nova`}>
                        <Plus className="size-4 mr-2" />
                        Nova Licitação
                    </Link>
                </Button>
            </DashboardHeaderActions>

            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <FileText className="size-10 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">Nenhuma licitação cadastrada</p>
                    <p className="text-sm text-muted-foreground/70">
                        Clique em &quot;Nova Licitação&quot; para importar um edital via PDF.
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-2">
                        <Link href={`${base}/licitacoes/nova`}>
                            <Plus className="size-3.5 mr-1.5" />
                            Nova Licitação
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
