"use client"

import Link from "next/link"
import { useAppContext } from "@/client/hooks/app"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent } from "@/client/components/ui/card"
import { FileText, Plus } from "lucide-react"

export function LicitacoesPage() {
    const { orgAtiva, empresaAtiva } = useAppContext()
    const base = `/org/${orgAtiva?.id}/${empresaAtiva?.id}`

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Licitações</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gerencie os editais da sua empresa.
                    </p>
                </div>
                <Button asChild>
                    <Link href={`${base}/licitacoes/nova`}>
                        <Plus className="size-4 mr-2" />
                        Nova Licitação
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <FileText className="size-10 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">Nenhuma licitação cadastrada</p>
                    <p className="text-sm text-muted-foreground/70">
                        Clique em "Nova Licitação" para importar um edital via PDF.
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
