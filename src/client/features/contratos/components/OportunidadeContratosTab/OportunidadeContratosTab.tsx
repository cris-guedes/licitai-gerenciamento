import { useQuery } from "@tanstack/react-query";
import { useCoreApi } from "@/client/hooks/use-core-api";
import { Button } from "@/client/components/ui/button";
import { Plus } from "lucide-react";
import { CreateContratoDialog } from "./CreateContratoDialog";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { ContratosListResponse } from "../../types";

type Props = {
    companyId: string;
    oportunidadeId: string;
};

export function OportunidadeContratosTab({ companyId, oportunidadeId }: Props) {
    const router = useRouter();
    const params = useParams();
    const orgId = params.orgId as string;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const api = useCoreApi();

    const { data: contratos, isLoading } = useQuery({
        queryKey: ["contratos", companyId, oportunidadeId],
        queryFn: async () => api.contratos.getCoreContratosList({
            companyId,
            oportunidadeId,
        }) as Promise<ContratosListResponse>,
    });

    return (
        <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="space-y-4 px-5 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Contratos da Oportunidade
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Acompanhe os contratos originados desta oportunidade ou registre um novo.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="rounded-xl"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus className="mr-2 size-4" />
                            Novo Contrato
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex animate-pulse flex-col space-y-3">
                        <div className="h-16 w-full rounded-xl bg-slate-100"></div>
                        <div className="h-16 w-full rounded-xl bg-slate-100"></div>
                    </div>
                ) : contratos?.data?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm leading-6 text-muted-foreground">
                        Nenhum contrato registrado para esta oportunidade.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {contratos?.data?.map((contrato) => (
                            <div key={contrato.id} className="rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-primary">{contrato.numeroContrato || "Sem número"}</h4>
                                        <p className="text-xs text-muted-foreground">Status: {contrato.status}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => router.push(`/org/${orgId}/${companyId}/contratos/${contrato.id}`)}
                                    >
                                        Acessar Workspace
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateContratoDialog 
                open={isCreateModalOpen} 
                onOpenChange={setIsCreateModalOpen} 
                companyId={companyId} 
                oportunidadeId={oportunidadeId} 
            />
        </section>
    );
}
