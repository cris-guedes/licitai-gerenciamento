"use client"

import { ArrowRight, LoaderCircle, MoveRight } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { cn } from "@/client/main/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu"
import type { OportunidadeBoardItem } from "../../services/use-licitacao.service"

type MoveOption = {
  nodeId: string
  label: string
  transitionType: string | null
  phaseId: string | null
  phaseLabel: string | null
}

export function OportunidadeWorkflowActions({
  item,
  moveOptions,
  isMoving,
  onMove,
  compact = false,
}: {
  item: OportunidadeBoardItem
  moveOptions: MoveOption[]
  isMoving: boolean
  onMove: (targetNodeId: string) => Promise<void>
  compact?: boolean
}) {
  if (compact && (!item.canMove || moveOptions.length === 0)) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label={!item.canMove ? "Somente leitura" : "Sem próximos passos"}
        className="size-7 rounded text-slate-300"
      >
        <MoveRight className="size-4" />
      </Button>
    )
  }

  if (!item.canMove) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        Somente leitura
      </Button>
    )
  }

  if (moveOptions.length === 0) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        Sem próximos passos
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={compact ? "ghost" : "outline"}
          size={compact ? "icon" : "sm"}
          disabled={isMoving}
          aria-label="Mover oportunidade"
          className={cn(
            compact && "size-7 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700",
          )}
        >
          {isMoving ? (
            <LoaderCircle className={cn("size-4 animate-spin", !compact && "mr-2")} />
          ) : (
            <MoveRight className={cn("size-4", !compact && "mr-2")} />
          )}
          {compact ? null : "Mover"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Próximos passos possíveis</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {moveOptions.map(option => (
          <DropdownMenuItem
            key={option.nodeId}
            onClick={() => void onMove(option.nodeId)}
            className="items-start"
          >
            <ArrowRight className="mt-0.5 size-4" />
            <div className="flex min-w-0 flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.phaseLabel ?? "Fase não identificada"}
                {option.transitionType ? ` · ${option.transitionType}` : ""}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
