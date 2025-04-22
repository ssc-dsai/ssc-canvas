import { ArtifactMarkdownV3, ArtifactV3 } from "@/types";

// Keys for localStorage
export const NEED_AI_DOCUMENT_KEY = "need-ai-document-generation";

/**
 * Creates a placeholder artifact for the Canvas while the AI generates the full document
 * @param title Optional title for the document
 * @returns A placeholder artifact
 */
export const createPlaceholderArtifact = (title?: string): ArtifactV3 => {
  const placeholderContent = `# Artificial Intelligence Use Case Document
  
*Generating your comprehensive AI Use Case document...*

Please wait while we analyze your inputs and create a detailed document.`;

  return {
    currentIndex: 1,
    contents: [{
      index: 1,
      type: "text",
      title: title || "AI Use Case Document",
      fullMarkdown: placeholderContent
    } as ArtifactMarkdownV3]
  };
};

/**
 * Stores the form data for AI document generation
 * @param formData The wizard form data
 * @param threadId The current thread ID
 */
export const storeFormDataForAI = (formData: any, threadId?: string) => {
  // Store form data with thread ID for later processing
  const dataToStore = threadId 
    ? { ...formData, threadId } 
    : formData;
    
  localStorage.setItem(NEED_AI_DOCUMENT_KEY, JSON.stringify(dataToStore));
  
  console.log("Stored form data for AI document generation:", dataToStore);
};

/**
 * Creates a title for the document based on the problem statement
 * @param problem The problem statement from the wizard
 * @returns A formatted title
 */
export const generateDocumentTitle = (problem: string): string => {
  let title = (problem || "").trim();
  
  // Limit title length
  if (title.length > 45) {
    title = title.substring(0, 45).split(' ').slice(0, -1).join(' ') + '...';
  }
  
  // Format the title
  return title.length > 0 
    ? `AI Use Case: ${title}` 
    : "AI Use Case Document";
};

/**
 * Generates a prompt for the AI to create an AI Use Case document
 * @param formData The form data from the wizard
 * @returns A structured prompt for the AI
 */
export const generateAIUseCAsePrompt = (formData: any): string => {
  return `You are an expert document writer specializing in AI Use Case documents. 
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
#### a. Problem
#### b. Challenges
#### c. Scope
#### d. Constraints
#### e. Desired Outcomes
### 1.4 Measuring Success.
#### a. Existing Metrics or KPI
### 1.5 Artificial Intelligence and Machine Learning Overview.
#### 1.5.1 Artificial Intelligence Lifecycle.
## 2. CTOB AI CoE Standard Service Offering.
### 2.1 High-Level Flow.
### 2.2 Roles and Responsibilities
#### a. AICoE Responsibilities.
#### b. Client Responsibilities.
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
};

/**
 * Creates a fallback document if AI document generation fails
 * @param formData The form data from the wizard
 * @returns The content for a fallback document
 */
export const createFallbackDocumentContent = (formData: any): string => {
  return `# Artificial Intelligence Use Cases

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
};

/**
 * Creates a success message to display after document generation
 * @returns A message to display to the user
 */
export const getDocumentCreationSuccessMessage = (): string => {
  return `I've created a comprehensive AI Use Case document based on the information you provided. The document follows the standard template and includes all the sections required for a complete AI Use Case proposal.

You can view the complete document in the canvas on the right. Would you like me to explain any specific section in more detail or make any adjustments to the document?`;
}; 