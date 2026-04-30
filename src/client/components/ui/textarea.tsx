import * as React from "react"

import { cn } from "@/client/main/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground/35 flex field-sizing-content min-h-24 w-full rounded-[1.15rem] border bg-surface-container-lowest px-4 py-3 text-base text-foreground shadow-[0_8px_24px_rgba(4,22,39,0.04)] transition-[border-color,box-shadow,background-color] outline-none focus-visible:border-secondary focus-visible:ring-[4px] focus-visible:ring-[rgba(0,88,190,0.1)] aria-invalid:ring-destructive/20 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
