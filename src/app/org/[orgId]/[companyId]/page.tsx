import { FerramentasGrid } from "@/client/features/dashboard/components/FerramentasGrid"

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bem-vindo ao seu painel de controle.</p>
      </div>
      <FerramentasGrid />
    </div>
  )
}
