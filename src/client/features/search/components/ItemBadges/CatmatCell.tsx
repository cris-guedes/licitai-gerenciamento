"use client"

export function CatmatCell({ it }: { it: any }) {
  if (it.catalogoCodigoItem) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs font-semibold">{it.catalogoCodigoItem}</span>
        {it.catalogo?.nome && (
          <span className="text-[10px] text-muted-foreground/70">{it.catalogo.nome}</span>
        )}
      </div>
    )
  }

  if (it.ncmNbsCodigo) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs font-semibold">{it.ncmNbsCodigo}</span>
        <span className="text-[10px] text-muted-foreground/70">NCM/NBS</span>
        {it.ncmNbsDescricao && (
          <span className="text-[10px] text-muted-foreground/60 line-clamp-2">{it.ncmNbsDescricao}</span>
        )}
      </div>
    )
  }

  return <span className="text-muted-foreground/40">—</span>
}
