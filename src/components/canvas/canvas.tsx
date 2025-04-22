"use client";

import { ArtifactRenderer } from "@/components/artifacts/ArtifactRenderer";
import { ContentComposerChatInterface } from "./content-composer";
import { ALL_MODEL_NAMES } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { getLanguageTemplate } from "@/lib/get_language_template";
import { cn } from "@/lib/utils";
import {
  ArtifactCodeV3,
  ArtifactMarkdownV3,
  ArtifactV3,
  ProgrammingLanguageOptions,
} from "@/types";
import { useEffect, useState, useCallback } from "react";
import { useGraphContext } from "@/contexts/GraphContext";
import React from "react";
import { BusinessIntakeProgress } from "../business-intake/progress-indicator";
import { BusinessIntakeManager } from "@/agent/open-canvas/business-intake-manager";

export function CanvasComponent() {
  const { threadData, graphData, userData, setGraphContextValue } = useGraphContext();
  const { user } = userData;
  const { threadId, clearThreadsWithNoValues, setModelName } = threadData;
  const { setArtifact } = graphData;
  const { toast } = useToast();
  const [chatStarted, setChatStarted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);
  const [intakeManager] = useState(() => new BusinessIntakeManager());

  const showCanvas = useCallback(() => {
    console.log("Setting canvas visible");
    setIsCanvasVisible(true);
  }, []);

  useEffect(() => {
    setGraphContextValue('showCanvas', showCanvas);
  }, [showCanvas, setGraphContextValue]);

  useEffect(() => {
    if (!threadId || !user) return;
    clearThreadsWithNoValues(user.id);
  }, [threadId, user, clearThreadsWithNoValues]);

  const handleQuickStart = (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => {
    if (type === "code" && !language) {
      toast({
        title: "Language not selected",
        description: "Please select a language to continue",
        duration: 5000,
      });
      return;
    }
    setChatStarted(true);
    setIsCanvasVisible(true);

    let artifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
    if (type === "code" && language) {
      artifactContent = {
        index: 1,
        type: "code",
        title: `Quick start ${type}`,
        code: getLanguageTemplate(language),
        language,
      };
    } else {
      artifactContent = {
        index: 1,
        type: "text",
        title: `Quick start ${type}`,
        fullMarkdown: "",
      };
    }

    const newArtifact: ArtifactV3 = {
      currentIndex: 1,
      contents: [artifactContent],
    };
    setArtifact(newArtifact);
    setIsEditing(true);
  };

  return (
    <main className="h-screen flex flex-row">
      <div
        className={cn(
          "transition-all duration-500 ease-in-out",
          isCanvasVisible ? "w-[30%]" : "w-full",
          "h-full bg-gray-50/70 shadow-inner-right flex-shrink-0"
        )}
      >
        <ContentComposerChatInterface
          switchSelectedThreadCallback={(thread) => {
            if ((thread.values as Record<string, any>)?.messages?.length) {
              setChatStarted(true);
              setModelName(
                thread?.metadata?.customModelName as ALL_MODEL_NAMES
              );
              
              const threadValues = thread.values as Record<string, any>;
              if (threadValues.artifact) {
                setIsCanvasVisible(true);
                setArtifact(threadValues.artifact);
              }
            } else {
              setChatStarted(false);
              setIsCanvasVisible(false);
            }
          }}
          setChatStarted={setChatStarted}
          hasChatStarted={chatStarted}
          handleQuickStart={handleQuickStart}
        />
      </div>
      {isCanvasVisible && (
        <div className="w-[70%] h-full flex-grow">
          <ArtifactRenderer setIsEditing={setIsEditing} isEditing={isEditing} />
        </div>
      )}
    </main>
  );
}

export const Canvas = React.memo(CanvasComponent);
