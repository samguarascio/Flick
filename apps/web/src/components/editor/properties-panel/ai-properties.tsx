import { X, Wand2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AttachmentsSection, PromptSection } from "./ai-components";
import { Button } from "@/components/ui/button";
import { useMediaStore } from "@/stores/media-store";
import { MediaFile } from "@/types/media";

// Fill text animation component
function WavyText({ text }: { text: string }) {
  return (
    <motion.p 
      className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-600 via-pink-500 via-blue-500 to-transparent opacity-30"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      <span className="relative z-10">{text}</span>
    </motion.p>
  );
}

// Generating state component
interface GeneratingStateProps {
  title: string;
  prompt: string;
  onCancel: () => void;
}

function GeneratingState({ title, prompt, onCancel }: GeneratingStateProps) {
  return (
    <div className="space-y-6 pt-16 select-none">
      <div className="text-center space-y-8">
        <motion.h3 
          className="text-lg font-medium bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          style={{
            backgroundSize: "200% 200%"
          }}
        >
          {title}
        </motion.h3>
        <WavyText text={prompt} />
      </div>
      
      <div className="pt-4 text-center">
        <button
          className="text-sm text-white hover:opacity-70 transition-opacity cursor-pointer"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface AIPropertiesProps {
  onClose: () => void;
  task?: string;
}

export function AIProperties({ onClose, task }: AIPropertiesProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const previousTaskRef = useRef<string | undefined>(undefined);

  // Detect task changes and trigger flash effect
  useEffect(() => {
    if (task) {
      // Always flash when there's a task
      setIsFlashing(true);
      
      // Remove flash class after animation completes
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 300); // Quick 300ms flash
      
      return () => clearTimeout(timer);
    }
  }, [task]);

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
      <div 
        className={`h-full w-full rounded-[calc(0.75rem-1px)] transition-background-color duration-300`}
        style={{
          backgroundColor: isFlashing ? '#434343' : '#1C1C1C'
        }}
      >
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
  const [attachedMediaFiles, setAttachedMediaFiles] = useState<MediaFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { mediaFiles } = useMediaStore();

  const handleMediaItemDrop = (mediaId: string) => {
    console.log("handleMediaItemDrop called with:", mediaId);
    console.log("Available media files:", mediaFiles);

    const mediaItem = mediaFiles.find((item) => item.id === mediaId);
    console.log("Found media item:", mediaItem);

    if (mediaItem && mediaItem.type === "image" && mediaItem.file) {
      console.log("Media item is valid image with file:", mediaItem.file);

      // Check if this media item is already in attachments
      const isAlreadyAttached = attachedMediaFiles.some((item) => item.id === mediaId);

      if (isAlreadyAttached) {
        console.log("Media item already attached, skipping");
        return;
      }

      if (attachedMediaFiles.length >= 5) {
        console.log("Max files limit reached");
        return;
      }

      console.log("Adding media item to attachments");
      setAttachedMediaFiles((prev) => {
        const newAttachments = [...prev, mediaItem];
        console.log("New media attachments:", newAttachments);
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

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // TODO: Implement actual AI generation logic here
  };

  const handleCancel = () => {
    setIsGenerating(false);
    // TODO: Implement actual cancellation logic here
  };

  if (isGenerating) {
    return (
      <GeneratingState
        title="Generating your image..."
        prompt={prompt}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AttachmentsSection
        title="Attachments"
        description="Here you can attach media and reference it."
        acceptedTypes={["image/*"]}
        maxFiles={5}
        onFilesChange={setAttachments}
        onMediaFilesChange={setAttachedMediaFiles}
        onMediaItemDrop={handleMediaItemDrop}
        files={attachments}
        mediaFiles={attachedMediaFiles}
      />

      <PromptSection
        title="Describe the image to create..."
        description="Describe the image you want to generate"
        placeholder="A beautiful landscape with mountains and a lake at sunset"
        value={prompt}
        onChange={setPrompt}
      />

      <div className="pt-4">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
          disabled={!prompt.trim()}
          onClick={handleGenerate}
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
  const [attachedMediaFiles, setAttachedMediaFiles] = useState<MediaFile[]>([]);
  const { mediaFiles } = useMediaStore();

  const handleMediaItemDrop = (mediaId: string) => {
    const mediaItem = mediaFiles.find((item) => item.id === mediaId);
    if (mediaItem && mediaItem.type === "image" && mediaItem.file) {
      // Check if this media item is already in attachments
      const isAlreadyAttached = attachedMediaFiles.some((item) => item.id === mediaId);
      
      if (isAlreadyAttached) {
        return;
      }
      
      if (attachedMediaFiles.length >= 5) {
        return;
      }
      
      setAttachedMediaFiles((prev) => [...prev, mediaItem]);
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
        onMediaFilesChange={setAttachedMediaFiles}
        onMediaItemDrop={handleMediaItemDrop}
        files={attachments}
        mediaFiles={attachedMediaFiles}
      />

      <PromptSection
        title="Describe the video to create..."
        description="Describe the video you want to generate"
        placeholder="An ape vlogging while climbing a mountain"
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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachedMediaFiles, setAttachedMediaFiles] = useState<MediaFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { mediaFiles } = useMediaStore();

  const handleMediaItemDrop = (mediaId: string) => {
    const mediaItem = mediaFiles.find((item) => item.id === mediaId);
    if (mediaItem && (mediaItem.type === "image" || mediaItem.type === "video") && mediaItem.file) {
      // Check if this media item is already in attachments
      const isAlreadyAttached = attachedMediaFiles.some((item) => item.id === mediaId);
      
      if (isAlreadyAttached) {
        return;
      }
      
      if (attachedMediaFiles.length >= 5) {
        return;
      }
      
      setAttachedMediaFiles((prev) => [...prev, mediaItem]);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // TODO: Implement actual AI generation logic here
  };

  const handleCancel = () => {
    setIsGenerating(false);
    // TODO: Implement actual cancellation logic here
  };

  if (isGenerating) {
    return (
      <GeneratingState
        title="Making your edit..."
        prompt={prompt}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AttachmentsSection
        title="Attachments"
        description="Here you can attach media and reference it."
        acceptedTypes={["image/*", "video/*"]}
        maxFiles={5}
        onFilesChange={setAttachments}
        onMediaFilesChange={setAttachedMediaFiles}
        onMediaItemDrop={handleMediaItemDrop}
        files={attachments}
        mediaFiles={attachedMediaFiles}
      />

      <PromptSection
        title="Describe the edit..."
        description="What changes should be made?"
        placeholder="Change the lighting to sunset"
        value={prompt}
        onChange={setPrompt}
      />

      <div className="pt-4">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
          disabled={!prompt.trim()}
          onClick={handleGenerate}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          AI Generate
        </Button>
      </div>
    </div>
  );
}

function ExtendClipContent() {
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachedMediaFiles, setAttachedMediaFiles] = useState<MediaFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { mediaFiles } = useMediaStore();

  const handleMediaItemDrop = (mediaId: string) => {
    const mediaItem = mediaFiles.find((item) => item.id === mediaId);
    if (mediaItem && (mediaItem.type === "image" || mediaItem.type === "video") && mediaItem.file) {
      // Check if this media item is already in attachments
      const isAlreadyAttached = attachedMediaFiles.some((item) => item.id === mediaId);
      
      if (isAlreadyAttached) {
        return;
      }
      
      if (attachedMediaFiles.length >= 5) {
        return;
      }
      
      setAttachedMediaFiles((prev) => [...prev, mediaItem]);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // TODO: Implement actual AI generation logic here
  };

  const handleCancel = () => {
    setIsGenerating(false);
    // TODO: Implement actual cancellation logic here
  };

  if (isGenerating) {
    return (
      <GeneratingState
        title="Extending your clip..."
        prompt={prompt}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AttachmentsSection
        title="Attachments"
        description="Here you can attach media and reference it."
        acceptedTypes={["image/*", "video/*"]}
        maxFiles={5}
        onFilesChange={setAttachments}
        onMediaFilesChange={setAttachedMediaFiles}
        onMediaItemDrop={handleMediaItemDrop}
        files={attachments}
        mediaFiles={attachedMediaFiles}
      />

      <PromptSection
        title="Describe how to extend..."
        description="Describe how you want to extend the clip"
        placeholder="Make the character hold still while laughing"
        value={prompt}
        onChange={setPrompt}
      />

      <div className="pt-4">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
          disabled={!prompt.trim()}
          onClick={handleGenerate}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          AI Generate
        </Button>
      </div>
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
