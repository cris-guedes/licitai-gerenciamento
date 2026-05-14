"use client"

import { DocumentSurface } from "@/client/components/document"

type Props = {
  url: string
  title?: string
  className?: string
}

export function DocumentViewer({ url, title, className }: Props) {
  return <DocumentSurface url={url} title={title} className={className} />
}
