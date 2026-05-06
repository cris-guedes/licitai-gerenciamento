import { FerramentasGrid } from "@/client/features/dashboard/components/FerramentasGrid"

export default function DashboardHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
      <FerramentasGrid />
    </div>
  )
}
