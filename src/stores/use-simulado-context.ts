import { create } from "zustand"

interface SimuladoContextState {
  // Current group context (when on /grupos/[id] page)
  groupId: string | null
  groupName: string | null

  // Actions
  setGroupContext: (groupId: string, groupName: string) => void
  clearGroupContext: () => void
}

export const useSimuladoContext = create<SimuladoContextState>((set) => ({
  groupId: null,
  groupName: null,

  setGroupContext: (groupId, groupName) => set({ groupId, groupName }),
  clearGroupContext: () => set({ groupId: null, groupName: null }),
}))
