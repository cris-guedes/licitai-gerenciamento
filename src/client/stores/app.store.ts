// Requires: npm install zustand
import { create } from "zustand"

interface AppState {
  // Adicione aqui o estado global da aplicação
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
