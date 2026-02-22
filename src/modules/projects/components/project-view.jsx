"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import ProjectHeader from "./project-header";
// import { Code, CrownIcon, EyeIcon } from "lucide-react";
// import FragmentWeb from "./fragment-web";
// import { FileExplorer } from "./file-explorer";
import React from 'react'
import MessageContainer from "./message-container";

const ProjectView = ({ projectId }) => {

  const [activeFragment, setActiveFragment] = useState(null);


  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <ProjectHeader projectId={projectId} />

          <MessageContainer
            projectId={projectId}
            activeFragment={activeFragment}
            setActiveFragment={setActiveFragment} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50} >
          {/* add tabs for code view */}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ProjectView
