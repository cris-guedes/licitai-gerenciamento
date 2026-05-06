"use client"

import { ArrowRight, LoaderCircle, MoveRight } from "lucide-react"
import { Button } from "@/client/components/ui/button"
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
}: {
  item: OportunidadeBoardItem
  moveOptions: MoveOption[]
  isMoving: boolean
  onMove: (targetNodeId: string) => Promise<void>
}) {
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
        <Button type="button" variant="outline" size="sm" disabled={isMoving}>
          {isMoving ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : (
            <MoveRight className="mr-2 size-4" />
          )}
          Mover
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
