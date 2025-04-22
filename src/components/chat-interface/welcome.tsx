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
  const { setGraphContextValue, graphData } = useGraphContext();
  const { setArtifact } = graphData;

  const handleStartIntakeClick = () => {
    // Set a flag in context to indicate we're starting the BRD process
    setGraphContextValue('isBRDProcess', true);
    
    // Add a simple initial message to guide the AI
    threadRuntime.append({
      role: "user",
      content: [{ 
        type: "text", 
        text: "I'd like to create an AI Use Case document. I'll use the wizard to provide key details, and then you'll help generate a comprehensive document that follows the standard template." 
      }],
    });
    setChatStarted(true);
  };

  return (
    <div className="flex flex-col w-full gap-2 text-gray-700 items-center">
      <div className="flex gap-2 w-full max-w-xs">
        <Button
          onClick={handleStartIntakeClick}
          variant="outline"
          className="flex-1 hover:bg-gray-50 transition-colors"
        >
          <TighterText>
            Start Business Intake Document
            <span className="hidden">
              Tasks: Follow these tasks in order
              1. The purpose of this engagement document is to inform potential clients of the current engagement and business intake process for incubating AI and IA use case with the DSAI team.
              2. Create a sample template for the intake document
              3. Goal is to fill out section 1.3, YOU MUST PROMPT the user to retrieve the problem statement, start by givin an example of an AI use case problem statement.

             The document should follow the following Table of Contents Format:
              Artificial Intelligence Use Case
              -1    Introduction
              -1.1  Purpose
              -1.2  Background
              -1.3  Proposed Use Case
                a.  Problem
                b.  Challenges
                c.  Scope
                d.  Constraints
                e.  Success Criteria
                f.  Timeline
                g.  Desired Outcome
                h.  Scope
              -1.4  Measuring Success
                a.  Existing Metrics or KPI
              -1.5  Artificial Intelligne and Machine Learning Overview
                a.  Artificial Intelligence Lifecycle
              -2    CTOB AI COE Standard Service Offering
              -2.1  High-Level Flow
              -2.2  Roles and Responsibilities
                a.  AICOE Responsibilities
                b.  Client Responsibilities
              -2.3  AICOE Extended Service Offering
              -2.4  Continuous Monitoring
              -3    Use Case Planning
              -3.1  SSC AI Viability Model
              -3.2  Responsible Use of Artificial Intelligence (AI)
              -3.3  Human Resources and Costing
              -3.4  Training
              -3.5  Funding
              -3.6  Acceptable Testing
              -3.7  Day-2 Operations
              -3.8  Contact Information
            </span>
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
