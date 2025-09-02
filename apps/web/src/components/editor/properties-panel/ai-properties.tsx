import { X, Wand2 } from "lucide-react";
import { useState } from "react";
import { AttachmentsSection, PromptSection } from "./ai-components";
import { Button } from "@/components/ui/button";
import { useMediaStore } from "@/stores/media-store";

interface AIPropertiesProps {
  onClose: () => void;
  task?: string;
}

export function AIProperties({ onClose, task }: AIPropertiesProps) {
  return (
    <div
      className="h-full relative p-[1px] rounded-xl"
      style={{
        background:
          "linear-gradient(45deg, rgb(147, 51, 234), rgb(236, 72, 153), rgb(59, 130, 246))",
        backgroundSize: "200% 200%",
        animation: "gradient-move 4s linear infinite",
      }}
    >
      {/* Main content container */}
      <div className="h-full w-full bg-panel rounded-[calc(0.75rem-1px)]">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-m font-medium">{task || "AI Generation"}</h2>
          <button
            onClick={onClose}
            className="hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 pt-0">
          {task === "Create Image" ? (
            <CreateImageContent />
          ) : task === "Create Video" ? (
            <CreateVideoContent />
          ) : task === "Make an Edit" ? (
            <MakeEditContent />
          ) : task === "Extend Clip" ? (
            <ExtendClipContent />
          ) : (
            <DefaultContent />
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}

// Content components for different AI tasks
function CreateImageContent() {
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const { mediaFiles } = useMediaStore();

  const handleMediaItemDrop = (mediaId: string) => {
    console.log("handleMediaItemDrop called with:", mediaId);
    console.log("Available media files:", mediaFiles);

    const mediaItem = mediaFiles.find((item) => item.id === mediaId);
    console.log("Found media item:", mediaItem);

    if (mediaItem && mediaItem.type === "image" && mediaItem.file) {
      console.log("Media item is valid image with file:", mediaItem.file);

      // Check if this media item is already in attachments
      const isAlreadyAttached = attachments.some((file) => {
        // For media items, we can check if the file name matches since it's the same file
        return file.name === mediaItem.file.name;
      });

      if (isAlreadyAttached) {
        console.log("Media item already attached, skipping");
        return;
      }

      if (attachments.length >= 5) {
        console.log("Max files limit reached");
        return;
      }

      console.log("Adding file to attachments");
      setAttachments((prev) => {
        const newAttachments = [...prev, mediaItem.file];
        console.log("New attachments:", newAttachments);
        return newAttachments;
      });
    } else {
      console.log("Media item validation failed:", {
        hasMediaItem: !!mediaItem,
        type: mediaItem?.type,
        hasFile: !!mediaItem?.file,
      });
    }
  };

  return (
    <div className="space-y-6">
      <AttachmentsSection
        title="Attachments"
        description="Drag and drop reference images here"
        acceptedTypes={["image/*"]}
        maxFiles={5}
        onFilesChange={setAttachments}
        onMediaItemDrop={handleMediaItemDrop}
        files={attachments}
      />

      <PromptSection
        title="Describe the image to create..."
        description="Describe the image you want to generate"
        placeholder="A beautiful landscape with mountains and a lake at sunset..."
        value={prompt}
        onChange={setPrompt}
      />

      <div className="pt-4">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
          disabled={!prompt.trim()}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          AI Generate
        </Button>
      </div>
    </div>
  );
}

function CreateVideoContent() {
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const { mediaFiles } = useMediaStore();

  const handleMediaItemDrop = (mediaId: string) => {
    const mediaItem = mediaFiles.find((item) => item.id === mediaId);
    if (mediaItem && mediaItem.type === "image" && mediaItem.file) {
      // Check if this media item is already in attachments
      const isAlreadyAttached = attachments.some((file) => {
        return file.name === mediaItem.file.name;
      });
      
      if (isAlreadyAttached) {
        return;
      }
      
      if (attachments.length >= 5) {
        return;
      }
      
      setAttachments((prev) => [...prev, mediaItem.file]);
    }
  };

  return (
    <div className="space-y-6">
      <AttachmentsSection
        title="Attachments"
        description="Drag and drop reference images here"
        acceptedTypes={["image/*"]}
        maxFiles={5}
        onFilesChange={setAttachments}
        onMediaItemDrop={handleMediaItemDrop}
        files={attachments}
      />

      <PromptSection
        title="Video Description"
        description="Describe the video you want to generate"
        placeholder="A short video showing a cat playing with a ball..."
        value={prompt}
        onChange={setPrompt}
      />

      <div className="pt-4">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
          disabled={!prompt.trim()}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          AI Generate
        </Button>
      </div>
    </div>
  );
}

function MakeEditContent() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="space-y-6">
      <PromptSection
        title="Edit Instructions"
        description="Describe what changes you want to make to the clip"
        placeholder="Remove the background, change the lighting to sunset..."
        value={prompt}
        onChange={setPrompt}
      />
    </div>
  );
}

function ExtendClipContent() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="space-y-6">
      <PromptSection
        title="Extension Instructions"
        description="Describe how you want to extend the clip"
        placeholder="Continue the scene with more action, extend the ending..."
        value={prompt}
        onChange={setPrompt}
      />
    </div>
  );
}

function DefaultContent() {
  return (
    <p className="text-sm text-muted-foreground">
      AI Generation panel coming soon...
    </p>
  );
}
