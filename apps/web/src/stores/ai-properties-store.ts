import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIPropertiesTab = "transform" | "style" | "ai";

export interface AIPropertiesTabMeta {
  value: AIPropertiesTab;
  label: string;
}

export const AI_PROPERTIES_TABS: ReadonlyArray<AIPropertiesTabMeta> = [
  { value: "transform", label: "Transform" },
  { value: "style", label: "Style" },
  { value: "ai", label: "AI Generation" },
] as const;

export function isAIPropertiesTab(value: string): value is AIPropertiesTab {
  return AI_PROPERTIES_TABS.some((t) => t.value === value);
}

interface AIPropertiesState {
  activeTab: AIPropertiesTab;
  setActiveTab: (tab: AIPropertiesTab) => void;
}

export const useAIPropertiesStore = create<AIPropertiesState>()(
  persist(
    (set) => ({
      activeTab: "transform",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    { name: "ai-properties" }
  )
);
