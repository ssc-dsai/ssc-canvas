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
import { useEffect, useState } from "react";
import { useGraphContext } from "@/contexts/GraphContext";
import React from "react";
import { BusinessIntakeWizard } from "../business-intake/wizard";

// Keys for localStorage
const WIZARD_ACTIVE_KEY = "business-intake-wizard-active";
const WIZARD_THREAD_ID_KEY = "business-intake-wizard-thread-id";
const WIZARD_DATA_KEY = "business-intake-wizard-data";
const WIZARD_STEP_KEY = "business-intake-wizard-step";

export function CanvasComponent() {
  const { threadData, graphData, userData, setGraphContextValue, contextValues } = useGraphContext();
  const { user } = userData;
  const { threadId, clearThreadsWithNoValues, setModelName } = threadData;
  const { artifact, setArtifact } = graphData;
  const { toast } = useToast();
  const [chatStarted, setChatStarted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  
  // Check if we're in BRD process
  const isBRDProcess = contextValues?.isBRDProcess === true;

  // Check localStorage for in-progress wizard on initial render
  useEffect(() => {
    if (!showWizard && !artifact) {
      const wizardActive = localStorage.getItem(WIZARD_ACTIVE_KEY) === "true";
      const savedThreadId = localStorage.getItem(WIZARD_THREAD_ID_KEY);
      
      if (wizardActive && savedThreadId === threadId) {
        setShowWizard(true);
        setChatStarted(true);
        setGraphContextValue('isBRDProcess', true);
      }
    }
  }, [threadId, setGraphContextValue, showWizard, artifact, isBRDProcess]);

  // Also modify the BRD process detection:
  useEffect(() => {
    if (isBRDProcess && chatStarted && !showWizard && !artifact) {
      setShowWizard(true);
    }
  }, [isBRDProcess, chatStarted, showWizard, artifact]);

  useEffect(() => {
    if (!threadId || !user) return;
    clearThreadsWithNoValues(user.id);
  }, [threadId, user, clearThreadsWithNoValues]);

  const handleWizardComplete = (newArtifact: ArtifactV3) => {
    // Clear any wizard state from localStorage first
    localStorage.removeItem(WIZARD_DATA_KEY);
    localStorage.removeItem(WIZARD_STEP_KEY);
    localStorage.removeItem(WIZARD_ACTIVE_KEY);
    localStorage.removeItem(WIZARD_THREAD_ID_KEY);
    
    // Set the artifact in state
    setArtifact(newArtifact);
    
    // Mark chat as started (ensures chat interface is shown)
    setChatStarted(true);
    
    // Hide the wizard (do this AFTER setting the artifact)
    setShowWizard(false);
    
    // Notify user that the document is created
    setGraphContextValue('wizardCompleted', true);
  };

  const handleWizardCancel = () => {
    // Hide the wizard
    setShowWizard(false);
    // Reset BRD process flag
    setGraphContextValue('isBRDProcess', false);
    
    // Clear the localStorage wizard data
    localStorage.removeItem(WIZARD_ACTIVE_KEY);
    localStorage.removeItem("business-intake-wizard-data");
    localStorage.removeItem("business-intake-wizard-step");
    localStorage.removeItem(WIZARD_THREAD_ID_KEY);
  };

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
    
    // Reset BRD flag for quick starts
    setGraphContextValue('isBRDProcess', false);
    
    setChatStarted(true);

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
          (artifact || showWizard) ? "w-[30%]" : "w-full",
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
                setArtifact(threadValues.artifact);
              }
              
              // Reset BRD flag for existing threads, unless we're continuing a wizard
              const savedThreadId = localStorage.getItem(WIZARD_THREAD_ID_KEY);
              const wizardActive = localStorage.getItem(WIZARD_ACTIVE_KEY) === "true";
              if (!(wizardActive && savedThreadId === thread.thread_id)) {
                setGraphContextValue('isBRDProcess', false);
                setShowWizard(false);
              } else {
                // If we're continuing a wizard for this thread, show it
                setGraphContextValue('isBRDProcess', true);
                setShowWizard(true);
              }
            } else {
              setChatStarted(false);
              setShowWizard(false);
            }
          }}
          setChatStarted={setChatStarted}
          hasChatStarted={chatStarted}
          handleQuickStart={handleQuickStart}
        />
      </div>
      
      {/* Show either the wizard or the artifact, but not both */}
      {showWizard && threadId && (
        <div className="w-[70%] h-full flex-grow">
          <BusinessIntakeWizard 
            onComplete={handleWizardComplete} 
            onCancel={handleWizardCancel}
            threadId={threadId}
          />
        </div>
      )}
      
      {/* Make sure this condition will pass right after wizard completion */}
      {!showWizard && artifact && (
        <div className="w-[70%] h-full flex-grow">
          <ArtifactRenderer 
            setIsEditing={setIsEditing} 
            isEditing={isEditing} 
          />
        </div>
      )}
    </main>
  );
}

export const Canvas = React.memo(CanvasComponent);
