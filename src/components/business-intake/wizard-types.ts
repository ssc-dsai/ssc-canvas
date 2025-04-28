import { ArtifactV3 } from "@/types";
import { DocumentType } from "./document-utils";

// Base wizard step interface
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  fieldName: string;
  placeholder: string;
}

// Document template interface
export interface DocumentTemplate {
  id: string;
  name: string;
  steps: WizardStep[];
  generateDocument: (formData: Record<string, string>) => string;
  // Function to generate placeholder content while AI is working
  generatePlaceholder: () => string;
}

// Props for generic wizard component
export interface WizardProps {
  template: DocumentTemplate;
  onComplete: (artifact: ArtifactV3) => void;
  onCancel: () => void;
  threadId: string;
}

export interface BusinessIntakeWizardProps {
  onComplete: (artifact: ArtifactV3) => void;
  onCancel: () => void;
  threadId?: string;
  documentType?: DocumentType;
}

export interface WizardFormData {
  // Common field
  documentType: DocumentType;
  
  // AI Use Case fields
  problem?: string;
  challenges?: string;
  scope?: string;
  constraints?: string;
  desiredOutcomes?: string;
  
  // RPA PDD fields
  processName?: string;
  processDescription?: string;
  businessRules?: string;
  systemsInvolved?: string;
  expectedBenefits?: string;
}

// LocalStorage keys
export const WIZARD_DATA_KEY = "business-intake-wizard-data";
export const WIZARD_STEP_KEY = "business-intake-wizard-step";
export const WIZARD_ACTIVE_KEY = "business-intake-wizard-active";
export const WIZARD_THREAD_ID_KEY = "business-intake-wizard-thread-id";
export const WIZARD_TYPE_KEY = "business-intake-wizard-document-type"; 