import React, { useEffect } from 'react';
import { useGraphContext } from "@/contexts/GraphContext";
import { useThreadRuntime } from "@assistant-ui/react";
import {
  NEED_AI_DOCUMENT_KEY,
  generateDocumentTitle,
  generateAIUseCAsePrompt,
  createFallbackDocumentContent,
  getDocumentCreationSuccessMessage,
  generateRpaPddPrompt
} from "./document-utils";

/**
 * Component that handles AI document generation
 * This can be extended later for different document types
 */
export const DocumentGenerator: React.FC = () => {
  const { graphData, setGraphContextValue } = useGraphContext();
  const { artifact, setArtifact } = graphData;
  const threadRuntime = useThreadRuntime();
  const { threadData, userData } = useGraphContext();
  
  useEffect(() => {
    // Check if we need to generate a document with AI
    const storedData = localStorage.getItem(NEED_AI_DOCUMENT_KEY);
    
    if (storedData && artifact && threadRuntime) {
      // Parse the stored form data
      const formData = JSON.parse(storedData);
      
      // Remove the flag immediately to prevent multiple attempts
      localStorage.removeItem(NEED_AI_DOCUMENT_KEY);
      
      // Update the thread title if possible
      updateThreadTitle(formData);
      
      // Generate the document
      generateDocument(formData);
    }
  }, [artifact, threadRuntime]);
  
  // Update thread title based on problem statement
  const updateThreadTitle = (formData: any) => {
    if (!formData.threadId || !userData?.user) return;
    
    const newTitle = generateDocumentTitle(formData.problem);
    console.log("Updating thread title to:", newTitle);
    
    try {
      // Try to find a way to update the thread title
      if (typeof threadData.updateThread === 'function') {
        threadData.updateThread(formData.threadId, {
          title: newTitle,
          userId: userData.user.id
        });
      } else if (typeof threadData.setThreads === 'function' && Array.isArray(threadData.threads)) {
        // Alternative approach if updateThread isn't available
        const updatedThreads = threadData.threads.map(thread => {
          if (thread.thread_id === formData.threadId) {
            return { ...thread, title: newTitle };
          }
          return thread;
        });
        threadData.setThreads(updatedThreads);
      } else {
        console.warn("No method available to update thread title");
      }
    } catch (error) {
      console.error("Error updating thread title:", error);
    }
  };
  
  // Generate document using AI
  const generateDocument = async (formData: any) => {
    try {
      console.log("Generating AI document with form data:", formData);
      
      // Get the prompt for the AI
      const prompt = formData.documentType === "RPA_PDD"
        ? generateRpaPddPrompt(formData)
        : generateAIUseCAsePrompt(formData);
      
      try {
        // Send the prompt to the AI
        await threadRuntime.append({
          role: "user",
          content: [{ type: "text", text: prompt }]
        });
        
        // Set up listener for AI response
        setupResponseListener(formData);
        
        // Alternative direct method with timeout
        setupDirectResponseCheck(formData);
        
      } catch (error) {
        console.error("Error sending prompt to AI:", error);
        createFallbackDocument(formData);
      }
    } catch (error) {
      console.error("Error in document generation flow:", error);
      createFallbackDocument(formData);
    }
  };
  
  // Set up event listener for AI response
  const setupResponseListener = (formData: any) => {
    const handleNewMessages = (event: any) => { 
      if (event?.data?.messages) {
        const messages = event.data.messages;
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage?.role === 'assistant' && lastMessage?.content?.length > 0) {
          processAIResponse(lastMessage, handleNewMessages);
        }
      }
    };
    
    // Add event listener
    window.addEventListener('message', handleNewMessages);
  };
  
  // Check for AI response directly after timeout
  const setupDirectResponseCheck = (formData: any) => {
    setTimeout(() => {
      const currentStoreMessages = threadRuntime.getState().messages;
      if (currentStoreMessages?.length > 0) {
        const lastMessage = currentStoreMessages[currentStoreMessages.length - 1];
        
        if (lastMessage?.role === 'assistant' && lastMessage?.content?.length > 0) {
          processAIResponse(lastMessage);
        }
      }
    }, 5000);
  };
  
  // Process AI response and update artifact
  const processAIResponse = async (message: any, listener?: any) => {
    try {
      // Extract content
      const generatedContent = typeof message.content[0] === 'object' && 'text' in message.content[0] 
        ? message.content[0].text 
        : JSON.stringify(message.content[0]);
      
      // Update artifact
      const updatedArtifact = {
        ...artifact,
        contents: [{
          ...artifact.contents[0],
          fullMarkdown: generatedContent
        }]
      };
      
      console.log("Updating artifact with AI-generated content");
      setArtifact(updatedArtifact);
      
      // Remove event listener if provided
      if (listener) {
        window.removeEventListener('message', listener);
      }
      
      // Send a confirmation message
      await threadRuntime.append({
        role: "assistant",
        content: [{ 
          type: "text", 
          text: getDocumentCreationSuccessMessage()
        }]
      });
      
      // Notify that document is created
      setGraphContextValue('wizardCompleted', true);
      
    } catch (error) {
      console.error("Error processing AI response:", error);
    }
  };
  
  // Create fallback document if AI generation fails
  const createFallbackDocument = (formData: any) => {
    const fallbackContent = createFallbackDocumentContent(formData);
    
    // Update artifact with fallback content
    const updatedArtifact = {
      ...artifact,
      contents: [{
        ...artifact.contents[0],
        fullMarkdown: fallbackContent
      }]
    };
    
    console.log("Updating artifact with fallback content");
    setArtifact(updatedArtifact);
    
    // Notify that document is created
    setGraphContextValue('wizardCompleted', true);
    
    // Send confirmation message
    threadRuntime.append({
      role: "assistant",
      content: [{ 
        type: "text", 
        text: getDocumentCreationSuccessMessage()
      }]
    });
  };
  
  return null;
};

export default DocumentGenerator;

export function generateDocumentContent(formData: WizardFormData): string {
  if (formData.documentType === DocumentType.RPA_PDD) {
    // RPA PDD template
    return `
# RPA Process Design Document

## 1. Process Name
${formData.processName}

## 2. Process Description
${formData.processDescription}

## 3. Business Rules
${formData.businessRules}

## 4. Systems Involved
${formData.systemsInvolved}

## 5. Expected Benefits
${formData.expectedBenefits}
    `.trim();
  } else {
    // AI Use Case template
    return `
# AI Use Case Document

## 1. Problem
${formData.problem}

## 2. Challenges
${formData.challenges}

## 3. Scope
${formData.scope}

## 4. Constraints
${formData.constraints}

## 5. Desired Outcomes
${formData.desiredOutcomes}
    `.trim();
  }
} 