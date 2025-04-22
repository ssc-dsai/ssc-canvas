"use client";

import { useToast } from "@/hooks/use-toast";
import {
  convertLangchainMessages,
  convertToOpenAIFormat,
} from "@/lib/convert_messages";
import { ProgrammingLanguageOptions } from "@/types";
import {
  AppendMessage,
  AssistantRuntimeProvider,
  useExternalMessageConverter,
  useExternalStoreRuntime,
  useThreadRuntime,
} from "@assistant-ui/react";
import { HumanMessage } from "@langchain/core/messages";
import { Thread as ThreadType } from "@langchain/langgraph-sdk";
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Toaster } from "../ui/toaster";
import { Thread } from "@/components/chat-interface";
import { useGraphContext } from "@/contexts/GraphContext";

export interface ContentComposerChatInterfaceProps {
  switchSelectedThreadCallback: (thread: ThreadType) => void;
  setChatStarted: React.Dispatch<React.SetStateAction<boolean>>;
  hasChatStarted: boolean;
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
}

// Updated WizardCompletionNotifier
function WizardCompletionNotifier() {
//   const { contextValues, setGraphContextValue } = useGraphContext();
//   const threadRuntime = useThreadRuntime();
  
//   useEffect(() => {
//     if (contextValues?.wizardCompleted && threadRuntime) {
//       try {
//         console.log("Sending detailed completion message for AI Use Case");
//         // Send a more informative message about the created document
//         threadRuntime.append({
//           role: "assistant",
//           content: [{ 
//             type: "text", 
//             text: `I've created a comprehensive AI Use Case document based on the information you provided. The document follows the standard template and includes:

// 1. **Introduction** - With purpose, background, and your proposed use case
// 2. **Proposed Use Case** - Including your inputs on:
//    - Problem
//    - Challenges
//    - Scope
//    - Constraints 
//    - Desired Outcomes
// 3. **Standard Sections** - Including measuring success, AI overview, roles and responsibilities, and planning considerations

// You can view the complete document in the canvas on the right. Would you like me to explain any specific section in more detail or make any adjustments to the document?` 
//           }]
//         });
        
//         // Reset the flag after sending the message
//         setGraphContextValue('wizardCompleted', false);
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     }
//   }, [contextValues?.wizardCompleted, threadRuntime, setGraphContextValue]);
  
//   return null;
}

// AI Document Generator component with fixed implementation
function AIDocumentGenerator() {
  const { graphData, setGraphContextValue } = useGraphContext();
  const { artifact, setArtifact } = graphData;
  const threadRuntime = useThreadRuntime();
  
  useEffect(() => {
    // Check if we need to generate a document with AI
    const storedData = localStorage.getItem("need-ai-document-generation");
    
    if (storedData && artifact && threadRuntime) {
      // Parse the stored form data
      const formData = JSON.parse(storedData);
      
      // Remove the flag immediately to prevent multiple attempts
      localStorage.removeItem("need-ai-document-generation");
      
      // Generate the document using AI
      const generateDocument = async () => {
        try {
          console.log("Generating AI document with form data:", formData);
          
          // Create a prompt for the AI to generate the document
          const prompt = `You are an expert document writer specializing in AI Use Case documents. 
Please create a very detailed and comprehensive AI Use Case document based on the following information and assumptions. Each section should be very detailed and comprehensive and atleast 3-5 sentences:

Problem: ${formData.problem || "Not specified"}
Challenges: ${formData.challenges || "Not specified"}
Scope: ${formData.scope || "Not specified"}
Constraints: ${formData.constraints || "Not specified"}
Desired Outcomes: ${formData.desiredOutcomes || "Not specified"}

Follow this structure precisely:
# Artificial Intelligence Use Cases

## 1. Introduction.
### 1.1 Purpose.
### 1.2 Background.
### 1.3 Proposed Use Case.
    a. Problem
    b. Challenges
    c. Scope
    d. Constraints
    e. Desired Outcomes
### 1.4 Measuring Success.
    a. Existing Metrics or KPI
### 1.5 Artificial Intelligence and Machine Learning Overview.
### 1.5.1 Artificial Intelligence Lifecycle.
## 2. CTOB AI CoE Standard Service Offering.
### 2.1 High-Level Flow.
### 2.2 Roles and Responsibilities
    a. AICoE Responsibilities.
    b. Client Responsibilities.
### 2.4 AICoE Extended Service Offering.
### 2.5 Continuous Monitoring.
## 3. Use Case Planning.
### 3.1 SSC AI Viability Model
### 3.2 Responsible Use of Artificial Intelligence (AI)
### 3.3 Human Resources and Costing.
### 3.4 Training.
### 3.5 Funding.
### 3.6 Acceptance Testing.
### 3.7 Day-2 Operations.
### 3.8 Contact Information.

Be detailed and professional. Incorporate the provided information into the document, especially in section 1.3 Proposed Use Case.
If any information is missing, make reasonable assumptions based on industry standards.
Format the document using proper Markdown syntax.`;

          // Send the prompt to the AI and directly capture the response
          // Use a hidden user message and let the assistant respond
          try {
            await threadRuntime.append({
              role: "user",
              content: [{ type: "text", text: prompt }]
            });
            
            // Set up a listener for the next AI response
            const handleNewMessages = (event: any) => { 
              if (event && event.data && event.data.messages) {
                const messages = event.data.messages;
                const lastMessage = messages[messages.length - 1];
                
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content && lastMessage.content.length > 0) {
                  // Extract the AI-generated content
                  const generatedContent = typeof lastMessage.content[0] === 'object' && 'text' in lastMessage.content[0] 
                    ? lastMessage.content[0].text 
                    : JSON.stringify(lastMessage.content[0]);
                  
                  // Update the artifact with the generated content
                  const updatedArtifact = {
                    ...artifact,
                    contents: [{
                      ...artifact.contents[0],
                      fullMarkdown: generatedContent
                    }]
                  };
                  
                  console.log("Updating artifact with AI-generated content");
                  setArtifact(updatedArtifact);
                  
                  // Remove the listener after processing
                  window.removeEventListener('message', handleNewMessages);
                  
                  // Notify that the document is created
                  setGraphContextValue('wizardCompleted', true);
                }
              }
            };
            
            // Add event listener for message events
            window.addEventListener('message', handleNewMessages);
            
            // Alternative direct approach
            setTimeout(async () => {
              // If the event listener doesn't work, use a direct approach
              // Get the current messages
              const currentStoreMessages = threadRuntime.getState().messages;
              if (currentStoreMessages && currentStoreMessages.length > 0) {
                const lastMessage = currentStoreMessages[currentStoreMessages.length - 1];
                
                if (lastMessage && lastMessage.role === 'assistant' && 
                    lastMessage.content && lastMessage.content.length > 0) {
                  // Extract content
                  const generatedContent = typeof lastMessage.content[0] === 'object' && 'text' in lastMessage.content[0] 
                    ? lastMessage.content[0].text 
                    : JSON.stringify(lastMessage.content[0]);
                  
                  // Update artifact
                  const updatedArtifact = {
                    ...artifact,
                    contents: [{
                      ...artifact.contents[0],
                      fullMarkdown: generatedContent
                    }]
                  };
                  
                  console.log("Updating artifact with AI-generated content (direct method)");
                  setArtifact(updatedArtifact);
                  
                  // Send notification message about the document
                  await threadRuntime.append({
                    role: "assistant",
                    content: [{ 
                      type: "text", 
                      text: `I've created a comprehensive AI Use Case document based on the information you provided. The document follows the standard template and includes all the sections required for a complete AI Use Case proposal.

You can view the complete document in the canvas on the right. Would you like me to explain any specific section in more detail or make any adjustments to the document?` 
                    }]
                  });
                  
                  // Remove the window event listener if it was added
                  window.removeEventListener('message', handleNewMessages);
                  
                  // Notify that document is created
                  setGraphContextValue('wizardCompleted', true);
                }
              }
            }, 5000); // Wait 5 seconds for the response
          } catch (error) {
            console.error("Error sending prompt to AI:", error);
            // Create a fallback document with the provided information
            createFallbackDocument(formData);
          }
        } catch (error) {
          console.error("Error in generate document flow:", error);
          // Create a fallback document if something goes wrong
          createFallbackDocument(formData);
        }
      };
      
      // Function to create a fallback document if AI generation fails
      const createFallbackDocument = (formData: any) => {
        const fallbackContent = `# Artificial Intelligence Use Cases

## 1. Introduction

### 1.1 Purpose
This document outlines a proposed artificial intelligence use case to address specific business needs and challenges.

### 1.2 Background
Organizations are increasingly leveraging AI technologies to improve efficiency, reduce costs, and gain competitive advantage.

### 1.3 Proposed Use Case

#### a. Problem
${formData.problem || "Not specified"}

#### b. Challenges
${formData.challenges || "Not specified"}

#### c. Scope
${formData.scope || "Not specified"}

#### d. Constraints
${formData.constraints || "Not specified"}

#### e. Desired Outcomes
${formData.desiredOutcomes || "Not specified"}

### 1.4 Measuring Success
Success will be measured through quantifiable improvements in efficiency and accuracy.

### 1.5 Artificial Intelligence and Machine Learning Overview
AI and ML technologies offer powerful capabilities to address business challenges through automation and insights.

## 2. CTOB AI CoE Standard Service Offering

### 2.1 High-Level Flow
The implementation will follow the standard AI Center of Excellence methodology.

### 2.2 Roles and Responsibilities
Clear roles ensure efficient project execution.

### 2.4 AICoE Extended Service Offering
Additional services are available beyond the standard offering.

### 2.5 Continuous Monitoring
The solution will include monitoring capabilities to track performance.

## 3. Use Case Planning

### 3.1 SSC AI Viability Model
This use case has been evaluated for AI suitability.

### 3.2 Responsible Use of Artificial Intelligence (AI)
The solution will adhere to ethical AI principles.

### 3.3 Human Resources and Costing
Resource planning will be detailed in the next phase.

### 3.4 Training
Training will be provided for all users of the system.

### 3.5 Funding
Funding requirements will be identified in planning.

### 3.6 Acceptance Testing
Testing will ensure the solution meets all requirements.

### 3.7 Day-2 Operations
Operational procedures will be established for maintenance.

### 3.8 Contact Information
Contact details will be provided in the project plan.`;

        // Update the artifact with fallback content
        const updatedArtifact = {
          ...artifact,
          contents: [{
            ...artifact.contents[0],
            fullMarkdown: fallbackContent
          }]
        };
        
        console.log("Updating artifact with fallback content");
        setArtifact(updatedArtifact);
        
        // Notify that document is created (with fallback)
        setGraphContextValue('wizardCompleted', true);
        
        // Send a message about the created document
        threadRuntime.append({
          role: "assistant",
          content: [{ 
            type: "text", 
            text: `I've created an AI Use Case document based on the information you provided. The document follows the standard template structure with your inputs included.

You can view the document in the canvas on the right. Would you like me to explain any specific section in more detail or make any adjustments to the document?` 
          }]
        });
      };
      
      // Execute the document generation
      generateDocument();
    }
  }, [artifact, setArtifact, threadRuntime, setGraphContextValue]);
  
  return null;
}

export function ContentComposerChatInterfaceComponent(
  props: ContentComposerChatInterfaceProps
): React.ReactElement {
  const { toast } = useToast();
  const { userData, graphData, threadData } = useGraphContext();
  const { messages, setMessages, streamMessage } = graphData;
  const { getUserThreads } = threadData;
  const [isRunning, setIsRunning] = useState(false);

  async function onNew(message: AppendMessage): Promise<void> {
    if (!userData.user) {
      toast({
        title: "User not found",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (message.content?.[0]?.type !== "text") {
      toast({
        title: "Only text messages are supported",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    props.setChatStarted(true);
    setIsRunning(true);

    try {
      const humanMessage = new HumanMessage({
        content: message.content[0].text,
        id: uuidv4(),
      });

      setMessages((prevMessages) => [...prevMessages, humanMessage]);

      await streamMessage({
        messages: [convertToOpenAIFormat(humanMessage)],
      });
    } finally {
      setIsRunning(false);
      // Re-fetch threads so that the current thread's title is updated.
      await getUserThreads(userData.user.id);
    }
  }

  const threadMessages = useExternalMessageConverter({
    callback: convertLangchainMessages,
    messages: messages,
    isRunning,
  });

  const runtime = useExternalStoreRuntime({
    messages: threadMessages,
    isRunning,
    onNew,
  });

  return (
    <div className="h-full">
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread
          userId={userData?.user?.id}
          setChatStarted={props.setChatStarted}
          handleQuickStart={props.handleQuickStart}
          hasChatStarted={props.hasChatStarted}
          switchSelectedThreadCallback={props.switchSelectedThreadCallback}
        />
        <WizardCompletionNotifier />
        <AIDocumentGenerator />
      </AssistantRuntimeProvider>
      <Toaster />
    </div>
  );
}

export const ContentComposerChatInterface = React.memo(
  ContentComposerChatInterfaceComponent
);