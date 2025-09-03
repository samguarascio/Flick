"use client";

import { useMediaStore } from "@/stores/media-store";
import { useTimelineStore } from "@/stores/timeline-store";
import { ScrollArea } from "../../ui/scroll-area";
import { AudioProperties } from "./audio-properties";
import { MediaProperties } from "./media-properties";
import { TextProperties } from "./text-properties";
import { AIProperties } from "./ai-properties";
import { SquareSlashIcon, X } from "lucide-react";
import { usePropertiesViewStore } from "@/stores/properties-view-store";

export function PropertiesPanel() {
  const { selectedElements, tracks } = useTimelineStore();
  const { mediaFiles } = useMediaStore();
  const { activeTab, setActiveTab, aiTask } = usePropertiesViewStore();

  return (
    <div className="flex flex-col h-full bg-panel rounded-sm overflow-y-scroll">
      <div className="flex-1">
        {activeTab === "properties" ? (
          <ScrollArea className="h-full">
            {selectedElements.length > 0 ? (
              <>
                {selectedElements.map(({ trackId, elementId }) => {
                  const track = tracks.find((t) => t.id === trackId);
                  const element = track?.elements.find((e) => e.id === elementId);

                  if (element?.type === "text") {
                    return (
                      <div key={elementId}>
                        <TextProperties element={element} trackId={trackId} />
                      </div>
                    );
                  }
                  if (element?.type === "media") {
                    const mediaFile = mediaFiles.find(
                      (file) => file.id === element.mediaId
                    );

                    if (mediaFile?.type === "audio") {
                      return <AudioProperties key={elementId} element={element} />;
                    }

                    return (
                      <div key={elementId}>
                        <MediaProperties element={element} />
                      </div>
                    );
                  }
                  return null;
                })}
              </>
            ) : (
              <EmptyView />
            )}
          </ScrollArea>
        ) : (
          <div className="h-full">
            <AIProperties 
              onClose={() => setActiveTab("properties")} 
              task={aiTask || undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyView() {
  return (
    <div className="bg-panel h-full p-4 flex flex-col items-center justify-center gap-3">
      <SquareSlashIcon
        className="w-10 h-10 text-muted-foreground"
        strokeWidth={1.5}
      />
      <div className="flex flex-col gap-2 text-center">
      </div>
    </div>
  );
}
