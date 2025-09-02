import { Textarea } from "@/components/ui/textarea";

interface PromptSectionProps {
  title?: string;
  description?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function PromptSection({
  title = "Prompt",
  description = "Describe what you want to generate",
  placeholder = "Enter your prompt here...",
  value = "",
  onChange,
  className,
}: PromptSectionProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-sm font-medium mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-h-[120px] resize-none bg-panel-accent border-muted-foreground/25 focus:border-primary/50"
      />
    </div>
  );
}
