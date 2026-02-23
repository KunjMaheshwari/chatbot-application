"use client"

import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"

function ResizablePanelGroup({ className, ...props }) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full min-h-0 min-w-0",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({ className, ...props }) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("min-h-0 min-w-0", className)}
      {...props}
    />
  );
}

function ResizableHandle({ withHandle, className, ...props }) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex items-center justify-center",
        "bg-border",
        "w-2 cursor-col-resize", 
        "select-none",
        "z-50",                  
        className
      )}
      {...props}
    >
      {withHandle && (
        <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }