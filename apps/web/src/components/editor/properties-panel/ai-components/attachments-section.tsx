import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { MediaFile } from "@/types/media";

interface AttachmentItem {
  id: string;
  name: string;
  file: File;
  type: "image" | "video" | "audio";
  url?: string;
}

interface AttachmentsSectionProps {
  title?: string;
  description?: string;
  acceptedTypes?: string[];
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  onMediaFilesChange?: (mediaFiles: MediaFile[]) => void;
  onMediaItemDrop?: (mediaId: string) => void;
  files?: File[];
  mediaFiles?: MediaFile[];
  className?: string;
}

export function AttachmentsSection({
  title = "Attachments",
  description = "Drag and drop files here or click to browse",
  acceptedTypes = ["image/*"],
  maxFiles = 5,
  onFilesChange,
  onMediaFilesChange,
  onMediaItemDrop,
  className,
  files: externalFiles,
  mediaFiles,
}: AttachmentsSectionProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [internalMediaFiles, setInternalMediaFiles] = useState<MediaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use external files if provided, otherwise use internal state
  const files = externalFiles || internalFiles;
  const mediaFilesToUse = mediaFiles || internalMediaFiles;
  const setFiles = externalFiles
    ? (newFiles: File[]) => onFilesChange?.(newFiles)
    : setInternalFiles;
  const setMediaFiles = mediaFiles
    ? (newMediaFiles: MediaFile[]) => onMediaFilesChange?.(newMediaFiles)
    : setInternalMediaFiles;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);

    // Debug: Check what's available during drag over
    console.log("Drag over event triggered");
    console.log("Drag over - types:", e.dataTransfer.types);
    console.log("Drag over - effectAllowed:", e.dataTransfer.effectAllowed);

    if (e.dataTransfer.types.includes("application/x-media-item")) {
      console.log("Media item type detected during drag over");
    }

    // Also check if we can see the data during drag over
    try {
      const mediaItemData = e.dataTransfer.getData("application/x-media-item");
      if (mediaItemData) {
        console.log(
          "Media item data available during drag over:",
          mediaItemData
        );
      }
    } catch (error) {
      // This is expected - getData only works on drop
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    console.log("Drop event triggered");
    console.log("DataTransfer types:", e.dataTransfer.types);
    console.log("Files:", e.dataTransfer.files);

    // Check for custom media panel drag data first
    // Try multiple ways to get the data
    let mediaItemData = e.dataTransfer.getData("application/x-media-item");
    if (!mediaItemData) {
      // Try getting it as text
      mediaItemData = e.dataTransfer.getData("text");
    }
    if (!mediaItemData) {
      // Try getting it as plain text
      mediaItemData = e.dataTransfer.getData("text/plain");
    }

    console.log("Media item data:", mediaItemData);

    if (mediaItemData) {
      try {
        const dragData = JSON.parse(mediaItemData);
        console.log("Parsed drag data:", dragData);
        if (dragData.id && onMediaItemDrop) {
          console.log("Calling onMediaItemDrop with:", dragData.id);
          onMediaItemDrop(dragData.id);
          return;
        }
      } catch (error) {
        console.error("Failed to parse media item data:", error);
      }
    }

    // Handle regular file drops
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter((file) =>
      acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      })
    );

    if (files.length + validFiles.length > maxFiles) {
      // Handle max files limit
      return;
    }

    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) =>
      acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      })
    );

    if (files.length + validFiles.length > maxFiles) {
      // Handle max files limit
      return;
    }

    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  // Create a combined list of attachment items from both files and media files
  const getAttachmentItems = (): AttachmentItem[] => {
    const items: AttachmentItem[] = [];
    
    // Add media files first (these have proper names from media tab)
    mediaFilesToUse.forEach((mediaFile) => {
      items.push({
        id: mediaFile.id,
        name: mediaFile.name,
        file: mediaFile.file,
        type: mediaFile.type,
        url: mediaFile.url,
      });
    });
    
    // Add regular files (these will use file.name)
    files.forEach((file, index) => {
      // Check if this file is already represented by a media file
      const isAlreadyInMediaFiles = mediaFilesToUse.some(
        (mediaFile) => mediaFile.file.name === file.name
      );
      
      if (!isAlreadyInMediaFiles) {
        items.push({
          id: `file-${index}`,
          name: file.name,
          file: file,
          type: file.type.startsWith("image/") ? "image" : 
                file.type.startsWith("video/") ? "video" : "audio",
        });
      }
    });
    
    return items;
  };

  const attachmentItems = getAttachmentItems();

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <h3 className="text-sm text-muted-foreground font-medium mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">Here you can attach media and reference it.</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
      >
        <Upload className="mx-auto h-4 w-4 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">
          {isDragOver ? "Drop images here" : "You can drag and drop images here"}
        </p>
      </div>

      {/* Image previews */}
      {attachmentItems.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-2">
            {attachmentItems.map((item, index) => {
              // Remove file extension from name
              const fileNameWithoutExtension = item.name.replace(/\.[^/.]+$/, "");
              
              return (
                <div key={item.id} className="flex items-center gap-3 p-2 border rounded-md group hover:bg-muted/50 transition-colors">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.url || URL.createObjectURL(item.file)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                      onError={(e) => {
                        console.error("Failed to load image:", item.name, e);
                      }}
                    />
                    <button
                      onClick={() => {
                        // Remove from appropriate list based on item type
                        if (item.id.startsWith('file-')) {
                          // This is a regular file, remove from files array
                          const fileIndex = parseInt(item.id.split('-')[1]);
                          removeFile(fileIndex);
                        } else {
                          // This is a media file, remove from media files array
                          const newMediaFiles = mediaFilesToUse.filter(mf => mf.id !== item.id);
                          setMediaFiles(newMediaFiles);
                        }
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-muted text-muted-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      type="button"
                      title="Remove file"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {fileNameWithoutExtension}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.file.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
