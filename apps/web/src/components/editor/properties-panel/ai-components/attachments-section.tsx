import { Upload, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AttachmentsSectionProps {
  title?: string;
  description?: string;
  acceptedTypes?: string[];
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  onMediaItemDrop?: (mediaId: string) => void;
  files?: File[];
  className?: string;
}

export function AttachmentsSection({
  title = "Attachments",
  description = "Drag and drop files here or click to browse",
  acceptedTypes = ["image/*"],
  maxFiles = 5,
  onFilesChange,
  onMediaItemDrop,
  className,
  files: externalFiles,
}: AttachmentsSectionProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Use external files if provided, otherwise use internal state
  const files = externalFiles || internalFiles;
  const setFiles = externalFiles ? (newFiles: File[]) => onFilesChange?.(newFiles) : setInternalFiles;

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
        console.log("Media item data available during drag over:", mediaItemData);
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
    
    let newFiles: File[] = [];
    
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
    const validFiles = droppedFiles.filter(file => 
      acceptedTypes.some(type => {
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

    newFiles = [...files, ...validFiles];
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };



  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {isDragOver ? "Drop images here" : "Drag and drop images here"}
        </p>
      </div>

      {/* Image previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {files.length} of {maxFiles} images selected
          </p>
          <div className="grid grid-cols-5 gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-20 object-cover rounded-md"
                  onError={(e) => {
                    console.error("Failed to load image:", file.name, e);
                  }}
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
