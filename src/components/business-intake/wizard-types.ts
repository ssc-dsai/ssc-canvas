import { ArtifactV3 } from "@/types";

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