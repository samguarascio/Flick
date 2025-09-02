import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PropertiesViewTab = "properties" | "ai";

interface PropertiesViewState {
  activeTab: PropertiesViewTab;
  setActiveTab: (tab: PropertiesViewTab) => void;
  aiTask: string | null;
  setAITask: (task: string | null) => void;
}

export const usePropertiesViewStore = create<PropertiesViewState>()(
  persist(
    (set) => ({
      activeTab: "properties",
      setActiveTab: (tab) => set({ activeTab: tab }),
      aiTask: null,
      setAITask: (task) => set({ aiTask: task }),
    }),
    { name: "properties-view" }
  )
);
