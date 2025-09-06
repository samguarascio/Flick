import {
  VideoIcon,
  LucideIcon,
  SettingsIcon,
} from "lucide-react";
import { create } from "zustand";

export type Tab =
  | "media"
  | "settings";

export const tabs: { [key in Tab]: { icon: LucideIcon; label: string } } = {
  media: {
    icon: VideoIcon,
    label: "Media",
  },
  settings: {
    icon: SettingsIcon,
    label: "Settings",
  },
};

interface MediaPanelStore {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  highlightMediaId: string | null;
  requestRevealMedia: (mediaId: string) => void;
  clearHighlight: () => void;
}

export const useMediaPanelStore = create<MediaPanelStore>((set) => ({
  activeTab: "media",
  setActiveTab: (tab) => set({ activeTab: tab }),
  highlightMediaId: null,
  requestRevealMedia: (mediaId) =>
    set({ activeTab: "media", highlightMediaId: mediaId }),
  clearHighlight: () => set({ highlightMediaId: null }),
}));
