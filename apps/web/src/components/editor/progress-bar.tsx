"use client";

import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface ProgressBarProps {
  value: number;
  maxValue: number;
  onIncrement?: () => void;
  className?: string;
  hasPro: boolean;
}

export function ProgressBar({ value, maxValue, hasPro, onIncrement, className = "" }: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-3 min-w-[160px]">
        <span className="text-sm text-muted-foreground text-right">
        AI Usage
      </span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 transition-all duration-200 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-sm text-muted-foreground text-right">
        {value} / {maxValue}
      </span>
      <div className="relative group">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-[0.8rem] group-hover:opacity-90 transition-opacity" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={'relative h-7 bg-background rounded-[0.8rem] border-0 px-3'}
          onClick={onIncrement}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onIncrement?.();
            }
          }}
        >
          <Plus className="h-3 w-3" />
          {!hasPro && <span>Upgrade</span>}
        </Button>
      </div>
    </div>
  );
}
