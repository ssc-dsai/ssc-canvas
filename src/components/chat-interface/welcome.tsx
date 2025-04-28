import { ProgrammingLanguageOptions } from "@/types";
import { ThreadPrimitive, useThreadRuntime } from "@assistant-ui/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FC } from "react";
import { TighterText } from "../ui/header";
import { NotebookPen } from "lucide-react";
import { ProgrammingLanguagesDropdown } from "../ui/programming-lang-dropdown";
import { Button } from "../ui/button";
import { useGraphContext } from "@/contexts/GraphContext";
import { ArtifactV3, ArtifactMarkdownV3 } from "@/types";
import { DocumentType } from "@/components/business-intake/document-utils";

interface QuickStartButtonsProps {
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  composer: React.ReactNode;
  setChatStarted: (started: boolean) => void;
}

const QuickStartPrompts = ({ setChatStarted }: QuickStartButtonsProps) => {
  const threadRuntime = useThreadRuntime();
  const { setGraphContextValue, graphData, createThread, switchSelectedThread, userData } = useGraphContext();
  const { setArtifact } = graphData;

  const handleStartIntakeClick = (type = DocumentType.AI_USE_CASE) => {
    // Store the document type to use in the wizard
    localStorage.setItem("business-intake-wizard-document-type", type);
    
    // Set a flag in context to indicate we're starting the BRD process
    setGraphContextValue('isBRDProcess', true);
    
    // Add a simple initial message to guide the AI
    threadRuntime.append({
      role: "user",
      content: [{ 
        type: "text", 
        text: type === DocumentType.RPA_PDD 
          ? "I'd like to create an RPA Process Design Document. I'll use the wizard to provide key details."
          : "I'd like to create an AI Use Case document. I'll use the wizard to provide key details." 
      }],
    });
    setChatStarted(true);
  };

  const startWizardWithNewThread = async (documentType: DocumentType) => {
    if (!createThread || !switchSelectedThread) {
      console.error("Thread functions not available in GraphContext");
      return;
    }
    if (!userData.user) {
      console.error("No user found");
      return;
    }
    try {
      const title = documentType === DocumentType.RPA_PDD
        ? "RPA Process Design Document"
        : "AI Use Case Document";
      // Pass title and userId
      const thread = await createThread(title, userData.user.id);
      if (thread) {
        localStorage.setItem("business-intake-wizard-active", "true");
        localStorage.setItem("business-intake-wizard-thread-id", thread.thread_id);
        localStorage.setItem("business-intake-wizard-document-type", documentType);

        // Set the context value so the wizard shows up
        setGraphContextValue('isBRDProcess', true);

        switchSelectedThread(thread);
      }
    } catch (error) {
      console.error("Error creating new thread for wizard:", error);
    }
  };

  const handleCreateRpaPdd = async () => {
    await startWizardWithNewThread(DocumentType.RPA_PDD);
  };

  return (
    <div className="flex flex-col w-full gap-2 text-gray-700 items-center">
      <div className="flex gap-2 w-full max-w-xs">
        <Button
          onClick={() => handleStartIntakeClick(DocumentType.AI_USE_CASE)}
          variant="outline"
          className="flex-1 hover:bg-gray-50 transition-colors"
        >
          <TighterText>
            Start AI Use Case Document
          </TighterText>
        </Button>
      </div>

      <div className="flex gap-2 w-full max-w-xs mt-2">
        <Button
          onClick={handleCreateRpaPdd}
          variant="outline"
          className="flex-1 hover:bg-green-50 transition-colors border-green-200 text-green-700"
        >
          <TighterText>
            Start RPA Process Design Document
          </TighterText>
        </Button>
      </div>
    </div>
  );
};

const QuickStartButtons = (props: QuickStartButtonsProps) => {
  const handleLanguageSubmit = (language: ProgrammingLanguageOptions) => {
    props.handleQuickStart("code", language);
  };

  return (
    <div className="flex flex-col gap-8 items-center justify-center w-full">
      <div className="flex flex-col gap-6 w-full items-center">
        <p className="text-gray-600 text-sm">Let's get started</p>
        <QuickStartPrompts 
          setChatStarted={props.setChatStarted} 
          handleQuickStart={props.handleQuickStart} 
          composer={props.composer} 
        />
      </div>
    </div>
  );
};

interface ThreadWelcomeProps {
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  setChatStarted: (started: boolean) => void;
  composer: React.ReactNode;
}

export const ThreadWelcome: FC<ThreadWelcomeProps> = (props: ThreadWelcomeProps) => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex items-center justify-center mt-8 w-full">
        <div className="text-center max-w-3xl w-full">
          <div className="h-16 w-28 mx-auto relative mb-4">
            <img 
              src="/aip_logo.png" 
              alt="DSAI Logo" 
              className="h-full w-full object-contain" 
            />
          </div>
          <TighterText className="mt-4 text-lg font-medium">
            Welcome to Business Intake Canvas
          </TighterText>
          <p className="mt-2 text-sm text-gray-600">
            Let's create a comprehensive business intake document together. We'll guide you through the process step by step in the chat.
          </p>
          <div className="mt-8 w-full">
            <QuickStartButtons
              composer={props.composer}
              handleQuickStart={props.handleQuickStart}
              setChatStarted={props.setChatStarted}
            />
          </div>
          {props.composer && (
            <div className="mt-4 max-w-2xl mx-auto">
              {props.composer}
            </div>
          )}
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};
