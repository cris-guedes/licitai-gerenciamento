"use client"

const ROLE_LABELS: Record<string, string> = {
  OWNER:  "Proprietário",
  ADMIN:  "Administrador",
  MEMBER: "Membro",
}

const ROLE_CLASSES: Record<string, string> = {
  OWNER:  "bg-amber-100 text-amber-800",
  ADMIN:  "bg-blue-100 text-blue-800",
  MEMBER: "bg-gray-100 text-gray-700",
}

export function MemberRoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_CLASSES[role] ?? ROLE_CLASSES.MEMBER}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}
