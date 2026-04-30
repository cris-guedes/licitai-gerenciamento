import * as React from "react"

import { cn } from "@/client/main/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/35 selection:bg-primary selection:text-primary-foreground border-input h-11 w-full min-w-0 rounded-xl border bg-surface-container-lowest px-4 py-2 text-base text-foreground shadow-[0_8px_24px_rgba(4,22,39,0.04)] transition-[border-color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-secondary focus-visible:ring-[4px] focus-visible:ring-[rgba(0,88,190,0.1)] focus-visible:bg-white",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
