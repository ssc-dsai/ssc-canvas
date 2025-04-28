"use client";

import React, { useState, useEffect, Fragment } from "react";
import { cn } from "@/lib/utils";
import { ArtifactMarkdownV3, ArtifactV3 } from "@/types";
import { 
  createPlaceholderArtifact, 
  storeFormDataForAI,
  generateDocumentTitle,
  DocumentType
} from "./document-utils";
import { WizardFormData } from "./wizard-types";

// Keys for localStorage
const WIZARD_DATA_KEY = "business-intake-wizard-data";
const WIZARD_STEP_KEY = "business-intake-wizard-step";
const WIZARD_ACTIVE_KEY = "business-intake-wizard-active";
const WIZARD_THREAD_ID_KEY = "business-intake-wizard-thread-id";
const WIZARD_TYPE_KEY = "business-intake-wizard-document-type";

interface BusinessIntakeWizardProps {
  onComplete: (artifact: ArtifactV3) => void;
  onCancel: () => void;
  threadId: string;
}

// Step configs for each document type
const WIZARD_STEPS = {
  [DocumentType.AI_USE_CASE]: [
    {
      key: "problem",
      label: "Problem",
      description: "Define the specific business problem that AI could help solve.",
      placeholder: "Examples: Customer service response times are too slow; Document processing is error-prone and time-consuming; ..."
    },
    {
      key: "challenges",
      label: "Challenges",
      description: "Outline the challenges associated with the problem.",
      placeholder: "Examples: High volume of unstructured data; Lack of skilled resources; ..."
    },
    {
      key: "scope",
      label: "Scope",
      description: "Define the boundaries of the AI solution.",
      placeholder: "Examples: Implementing a chatbot for customer inquiries; ..."
    },
    {
      key: "constraints",
      label: "Constraints",
      description: "Identify constraints that may impact the AI solution.",
      placeholder: "Examples: Budget limit of $X; Must be implemented within 6 months; ..."
    },
    {
      key: "desiredOutcomes",
      label: "Desired Outcomes",
      description: "Specify the outcomes you hope to achieve with this AI solution.",
      placeholder: "Examples: Reduce processing time by 50%; Improve accuracy from 85% to 95%; ..."
    }
  ],
  [DocumentType.RPA_PDD]: [
    {
      key: "processName",
      label: "Process Name",
      description: "Name the business process to be automated with RPA.",
      placeholder: "Examples: Invoice Processing; Customer Onboarding; ..."
    },
    {
      key: "processDescription",
      label: "Process Description",
      description: "Describe the current process that needs automation.",
      placeholder: "Describe the step-by-step flow of the current process, including who performs each step, how long it takes, and any pain points..."
    },
    {
      key: "businessRules",
      label: "Business Rules",
      description: "Define the business rules that govern this process.",
      placeholder: "Examples: Invoices over $10,000 require manager approval; ..."
    },
    {
      key: "systemsInvolved",
      label: "Systems Involved",
      description: "List the systems and applications involved in this process.",
      placeholder: "Examples: SAP ERP, Microsoft Excel, Email (Outlook), ..."
    },
    {
      key: "expectedBenefits",
      label: "Expected Benefits",
      description: "Describe the benefits expected from automating this process.",
      placeholder: "Examples: 70% reduction in processing time; 100% accuracy in data entry; ..."
    }
  ]
};

// Step component with circular indicator
const StepIndicator = ({ step, currentStep, totalSteps }: { step: number; currentStep: number; totalSteps: number }) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
          isActive ? "border-blue-500 bg-blue-100 text-blue-700" : 
          isCompleted ? "border-green-500 bg-green-100 text-green-700" : 
          "border-gray-300 bg-gray-50 text-gray-500"
        )}
      >
        {isCompleted ? (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          step
        )}
      </div>
      <div className={cn(
        "text-xs mt-1",
        isActive ? "text-blue-600 font-medium" : 
        isCompleted ? "text-green-600" : "text-gray-500"
      )}>
        {getStepTitle(step)}
      </div>
    </div>
  );
};

// Function to get step title
const getStepTitle = (step: number) => {
  const documentTypeFromStorage = localStorage.getItem(WIZARD_TYPE_KEY);
  
  // Check if we're in RPA PDD mode
  if (documentTypeFromStorage === DocumentType.RPA_PDD) {
    switch (step) {
      case 1: return "Process Name";
      case 2: return "Description";
      case 3: return "Rules";
      case 4: return "Systems";
      case 5: return "Benefits";
      default: return `Step ${step}`;
    }
  } else {
    // Default to AI Use Case
    switch (step) {
      case 1: return "Problem";
      case 2: return "Challenges";
      case 3: return "Scope";
      case 4: return "Constraints";
      case 5: return "Outcomes";
      default: return `Step ${step}`;
    }
  }
};

export function BusinessIntakeWizard({ onComplete, onCancel, threadId }: BusinessIntakeWizardProps) {
  // 1. Get documentType from localStorage synchronously
  const getInitialDocumentType = () => {
    const storedType = typeof window !== "undefined" ? localStorage.getItem(WIZARD_TYPE_KEY) : null;
    return storedType === DocumentType.RPA_PDD ? DocumentType.RPA_PDD : DocumentType.AI_USE_CASE;
  };

  const [documentType, setDocumentType] = useState<DocumentType>(getInitialDocumentType);

  // 2. When threadId changes, update documentType (in case of thread switch)
  useEffect(() => {
    const storedType = localStorage.getItem(WIZARD_TYPE_KEY);
    setDocumentType(storedType === DocumentType.RPA_PDD ? DocumentType.RPA_PDD : DocumentType.AI_USE_CASE);
  }, [threadId]);

  // 3. Now use documentType to initialize formData and steps
  const steps = WIZARD_STEPS[documentType];
  const totalWizardSteps = steps.length;

  const initFormData = (): WizardFormData => {
    if (documentType === DocumentType.RPA_PDD) {
      return {
        documentType,
        processName: '',
        processDescription: '',
        businessRules: '',
        systemsInvolved: '',
        expectedBenefits: ''
      };
    } else {
      return {
        documentType: DocumentType.AI_USE_CASE,
        problem: '',
        challenges: '',
        scope: '',
        constraints: '',
        desiredOutcomes: ''
      };
    }
  };

  // 4. Only initialize formData after documentType is set
  const [formData, setFormData] = useState<WizardFormData>(initFormData());

  // 5. When documentType changes (e.g. after thread switch), reset formData
  useEffect(() => {
    setFormData(initFormData());
  }, [documentType]);

  const [wizardStep, setWizardStep] = useState(1);
  
  // Get step title based on document type
  const getStepTitleWithType = (step: number) => {
    if (documentType === DocumentType.RPA_PDD) {
      switch (step) {
        case 1: return "Process Name";
        case 2: return "Description";
        case 3: return "Rules";
        case 4: return "Systems";
        case 5: return "Benefits";
        default: return `Step ${step}`;
      }
    } else {
      switch (step) {
        case 1: return "Problem";
        case 2: return "Challenges";
        case 3: return "Scope";
        case 4: return "Constraints";
        case 5: return "Outcomes";
        default: return `Step ${step}`;
      }
    }
  };
  
  // Load saved state from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(WIZARD_DATA_KEY);
    const savedStep = localStorage.getItem(WIZARD_STEP_KEY);
    const savedType = localStorage.getItem(WIZARD_TYPE_KEY);
    
    // Mark wizard as active
    localStorage.setItem(WIZARD_ACTIVE_KEY, "true");
    localStorage.setItem(WIZARD_THREAD_ID_KEY, threadId || "");
    localStorage.setItem(WIZARD_TYPE_KEY, documentType);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Only load data if the document type matches or if it's a new wizard
        if (savedType === documentType || !savedType) {
          setFormData(parsedData);
        } else {
          // If document type changed, initialize with new type
          setFormData(initFormData());
        }
      } catch (e) {
        console.error("Error parsing saved wizard data:", e);
        setFormData(initFormData());
      }
    }
    
    if (savedStep && savedType === documentType) {
      try {
        setWizardStep(parseInt(savedStep, 10));
      } catch (e) {
        console.error("Error parsing saved wizard step:", e);
        setWizardStep(1);
      }
    }
  }, [threadId, documentType]);
  
  // Save current state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(WIZARD_DATA_KEY, JSON.stringify(formData));
    localStorage.setItem(WIZARD_STEP_KEY, wizardStep.toString());
  }, [formData, wizardStep]);
  
  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Navigation functions
  const handleNext = () => {
    if (wizardStep < totalWizardSteps) {
      setWizardStep(wizardStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };
  
  // Handle finish
  const handleFinish = () => {
    console.log("Creating document with data:", formData);
    
    // Create a placeholder artifact
    let title = "";
    if (documentType === DocumentType.RPA_PDD) {
      title = formData.processName || "RPA Process Design Document";
    } else {
      title = generateDocumentTitle(formData.problem || "");
    }
    
    // Create placeholder artifact
    const placeholderArtifact = createPlaceholderArtifact(title, documentType);
    
    // Clear localStorage
    localStorage.removeItem(WIZARD_DATA_KEY);
    localStorage.removeItem(WIZARD_STEP_KEY);
    localStorage.removeItem(WIZARD_ACTIVE_KEY);
    localStorage.removeItem(WIZARD_THREAD_ID_KEY);
    
    // Call the completion handler with the placeholder artifact
    storeFormDataForAI(formData, threadId);
    onComplete(placeholderArtifact);
  };
  
  // Handle cancel
  const handleCancel = () => {
    localStorage.removeItem(WIZARD_DATA_KEY);
    localStorage.removeItem(WIZARD_STEP_KEY);
    localStorage.removeItem(WIZARD_ACTIVE_KEY);
    localStorage.removeItem(WIZARD_THREAD_ID_KEY);
    onCancel();
  };

  // Render the appropriate step based on document type
  const renderStep = () => {
    const stepConfig = steps[wizardStep - 1];
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{wizardStep}. {stepConfig.label}</h2>
        <p className="text-sm text-gray-600">{stepConfig.description}</p>
        <div className="space-y-2">
          <label htmlFor={stepConfig.key} className="block text-sm font-medium">
            {stepConfig.label}
          </label>
          <textarea
            id={stepConfig.key}
            className="w-full p-2 border rounded-md"
            rows={6}
            value={formData[stepConfig.key] || ""}
            onChange={e => handleInputChange(stepConfig.key, e.target.value)}
            placeholder={stepConfig.placeholder}
          />
        </div>
      </div>
    );
  };

  // Updated StepIndicator component that includes document type
  const StepIndicatorWithType = ({ step, currentStep }: { step: number; currentStep: number }) => {
    const isActive = step === currentStep;
    const isCompleted = step < currentStep;
    return (
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
            isActive ? "border-blue-500 bg-blue-100 text-blue-700" :
              isCompleted ? "border-green-500 bg-green-100 text-green-700" :
                "border-gray-300 bg-gray-50 text-gray-500"
          )}
        >
          {isCompleted ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            step
          )}
        </div>
        <div className={cn(
          "text-xs mt-1",
          isActive ? "text-blue-600 font-medium" :
            isCompleted ? "text-green-600" : "text-gray-500"
        )}>
          {steps[step - 1].label}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">
          {documentType === DocumentType.RPA_PDD ? 'RPA Process Design Document Wizard' : 'AI Use Case Wizard'}
        </h1>
        
        {/* Circular step indicators */}
        <div className="flex justify-between items-center mb-8 px-8">
          {steps.map((_, i) => (
            <Fragment key={i + 1}>
              <StepIndicatorWithType
                step={i + 1}
                currentStep={wizardStep}
              />
              {i < steps.length - 1 && (
                <div className={cn(
                  "h-1 flex-grow mx-2",
                  i < wizardStep - 1 ? "bg-green-400" : "bg-gray-200"
                )} />
              )}
            </Fragment>
          ))}
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-grow overflow-auto mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
        {renderStep()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-auto">
        {wizardStep > 1 ? (
          <button 
            onClick={handlePrevious}
            type="button"
            className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
        ) : (
          <button 
            onClick={handleCancel}
            type="button"
            className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
        
        {wizardStep < totalWizardSteps ? (
          <button 
            onClick={handleNext}
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={handleFinish}
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
          >
            Generate Document
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default BusinessIntakeWizard;