import { ArtifactMarkdownV3, ArtifactV3 } from "@/types";

// Keys for localStorage
export const NEED_AI_DOCUMENT_KEY = "need-ai-document-generation";

// DocumentType enum 
export enum DocumentType {
  AI_USE_CASE = "AI_USE_CASE",
  RPA_PDD = "RPA_PDD"
}

/**
 * Creates a placeholder artifact for the Canvas while the AI generates the full document
 * @param title Optional title for the document
 * @param documentType Type of document to create
 * @returns A placeholder artifact
 */
export const createPlaceholderArtifact = (title?: string, documentType = DocumentType.AI_USE_CASE): ArtifactV3 => {
  let placeholderContent = '';
  let documentTitle = '';
  
  if (documentType === DocumentType.RPA_PDD) {
    documentTitle = title || "RPA Process Design Document";
    placeholderContent = `# RPA Process Design Document
  
*Generating your comprehensive RPA Process Design Document...*

Please wait while we analyze your inputs and create a detailed document.`;
  } else {
    documentTitle = title || "AI Use Case Document";
    placeholderContent = `# Artificial Intelligence Use Case Document
  
*Generating your comprehensive AI Use Case document...*

Please wait while we analyze your inputs and create a detailed document.`;
  }

  return {
    currentIndex: 1,
    contents: [{
      index: 1,
      type: "text",
      title: documentTitle,
      fullMarkdown: placeholderContent
    } as ArtifactMarkdownV3]
  };
};

/**
 * Stores the form data for document generation
 * @param formData The wizard form data
 * @param threadId The current thread ID
 */
export const storeFormDataForAI = (formData: any, threadId?: string) => {
  // Store form data with thread ID for later processing
  const dataToStore = threadId 
    ? { ...formData, threadId } 
    : formData;
    
  localStorage.setItem(NEED_AI_DOCUMENT_KEY, JSON.stringify(dataToStore));
  
  console.log("Stored form data for document generation:", dataToStore);
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

export function generateRpaPddPrompt(formData: {
  processName?: string;
  processDescription?: string;
  businessRules?: string;
  systemsInvolved?: string;
  expectedBenefits?: string;
}) {
  return `
You are an expert RPA process analyst and technical writer.
Please create a comprehensive RPA Process Design Document in Markdown format, following best industry standards and including all typical sections and subsections (such as Introduction, Process Overview, Solution Design, Implementation Plan, Expected Outcomes, Appendices, etc.).

Each section should be detailed (at least 3-5 sentences), professional, and include examples where appropriate. Incorporate the following user-provided information into the relevant sections, especially the Process Overview. If any information is missing, make reasonable assumptions.

Process Name: ${formData.processName || "Not specified"}
Process Description: ${formData.processDescription || "Not specified"}
Business Rules: ${formData.businessRules || "Not specified"}
Systems Involved: ${formData.systemsInvolved || "Not specified"}
Expected Benefits: ${formData.expectedBenefits || "Not specified"}
`.trim();
}

export function generateRpaPddMarkdown(formData: {
  processName?: string;
  processDescription?: string;
  businessRules?: string;
  systemsInvolved?: string;
  expectedBenefits?: string;
}) {
  return `
# RPA Process Design Document

## 1. Introduction

### 1.1 Purpose
_This section describes the purpose of this RPA Process Design Document and what it aims to achieve._

### 1.2 Background
_Provide background information about the business context and why this process is being considered for automation._

### 1.3 Process Overview

#### a. Process Name
${formData.processName || "_Not specified_"}

#### b. Process Description
${formData.processDescription || "_Not specified_"}

#### c. Business Rules
${formData.businessRules || "_Not specified_"}

#### d. Systems Involved
${formData.systemsInvolved || "_Not specified_"}

#### e. Expected Benefits
${formData.expectedBenefits || "_Not specified_"}

### 1.4 Stakeholders
_List the key stakeholders involved in the process and their roles._

### 1.5 Current Challenges
_Describe the main challenges or pain points in the current (manual) process._

---

## 2. RPA Solution Design

### 2.1 Solution Overview
_Provide a high-level overview of the proposed RPA solution._

### 2.2 High-Level Process Flow
_Describe the main steps of the automated process, possibly with a flow diagram (describe in text)._

### 2.3 Exception Handling
_Explain how exceptions and errors will be handled in the automated process._

### 2.4 Security and Compliance
_Discuss any security, privacy, or compliance considerations for the RPA solution._

---

## 3. Implementation Plan

### 3.1 Development Approach
_Describe the approach for developing and testing the RPA solution._

### 3.2 Deployment Plan
_Outline the plan for deploying the RPA solution into production._

### 3.3 Training and Change Management
_Describe how users will be trained and how change management will be handled._

### 3.4 Maintenance and Support
_Explain how the RPA solution will be maintained and supported after deployment._

---

## 4. Expected Outcomes and KPIs

### 4.1 Quantitative Benefits
_List measurable benefits (e.g., time savings, error reduction, cost savings)._

### 4.2 Qualitative Benefits
_Describe qualitative improvements (e.g., employee satisfaction, compliance)._

### 4.3 Key Performance Indicators (KPIs)
_Define the KPIs that will be used to measure the success of the RPA implementation._

---

## 5. Appendices

### 5.1 Glossary
_Provide definitions for any technical terms or acronyms used._

### 5.2 Contact Information
_List contact details for the project team and stakeholders._
`.trim();
}

export function appendChatMessage(message: {
  role: string;
  content: string;
  // ...any other metadata you use
}) {
  setMessages((prev) => [
    ...prev,
    message
  ]);
} 