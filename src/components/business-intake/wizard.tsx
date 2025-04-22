"use client";

import React, { useState, useEffect, Fragment } from "react";
import { cn } from "@/lib/utils";
import { ArtifactMarkdownV3, ArtifactV3 } from "@/types";

// Keys for localStorage
const WIZARD_DATA_KEY = "business-intake-wizard-data";
const WIZARD_STEP_KEY = "business-intake-wizard-step";
const WIZARD_ACTIVE_KEY = "business-intake-wizard-active";
const WIZARD_THREAD_ID_KEY = "business-intake-wizard-thread-id";

interface BusinessIntakeWizardProps {
  onComplete: (artifact: ArtifactV3) => void;
  onCancel: () => void;
  threadId: string;
}

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
  switch (step) {
    case 1: return "Problem";
    case 2: return "Challenges";
    case 3: return "Scope";
    case 4: return "Constraints";
    case 5: return "Outcomes";
    default: return `Step ${step}`;
  }
};

export function BusinessIntakeWizard({ onComplete, onCancel, threadId }: BusinessIntakeWizardProps) {
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    problem: '',
    challenges: '',
    scope: '',
    constraints: '',
    desiredOutcomes: ''
  });
  
  // Total number of steps in the wizard - one for each subsection of 1.3
  const totalWizardSteps = 5;

  // Load saved wizard state from localStorage
  useEffect(() => {
    try {
      // Mark wizard as active
      localStorage.setItem(WIZARD_ACTIVE_KEY, "true");
      localStorage.setItem(WIZARD_THREAD_ID_KEY, threadId);
    
      // Load saved step if it's for the same thread
      const savedThreadId = localStorage.getItem(WIZARD_THREAD_ID_KEY);
      if (savedThreadId === threadId) {
        const savedStep = localStorage.getItem(WIZARD_STEP_KEY);
        if (savedStep) {
          setWizardStep(parseInt(savedStep, 10));
        }
        
        // Load saved data
        const savedData = localStorage.getItem(WIZARD_DATA_KEY);
        if (savedData) {
          setFormData(JSON.parse(savedData));
        }
      }
    } catch (error) {
      console.error("Error loading wizard data:", error);
    }
  }, [threadId]);

  // Save wizard state to localStorage
  useEffect(() => {
    localStorage.setItem(WIZARD_STEP_KEY, wizardStep.toString());
    localStorage.setItem(WIZARD_DATA_KEY, JSON.stringify(formData));
  }, [wizardStep, formData]);

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Go to previous step
  const handlePrevious = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  // Go to next step
  const handleNext = () => {
    if (wizardStep < totalWizardSteps) {
      setWizardStep(wizardStep + 1);
    }
  };

  // Complete the wizard
  const handleFinish = () => {
    console.log("Creating AI-generated Use Case document with data:", formData);
    
    // First, set a placeholder artifact so the canvas shows up
    const placeholderContent = `# Artificial Intelligence Use Case Document
  
*Generating your comprehensive AI Use Case document...*

Please wait while we analyze your inputs and create a detailed document.`;

    const placeholderArtifact: ArtifactV3 = {
      currentIndex: 1,
      contents: [{
        index: 1,
        type: "text",
        title: "AI Use Case Document - " + formData.problem.substring(0, 10),
        fullMarkdown: placeholderContent
      } as ArtifactMarkdownV3]
    };
    
    // Clear localStorage
    localStorage.removeItem(WIZARD_DATA_KEY);
    localStorage.removeItem(WIZARD_STEP_KEY);
    localStorage.removeItem(WIZARD_ACTIVE_KEY);
    localStorage.removeItem(WIZARD_THREAD_ID_KEY);
    
    // Call the completion handler with the placeholder artifact
    console.log("Calling onComplete with placeholder - AI will generate full document");
    onComplete(placeholderArtifact);
    
    // Also set a flag to indicate we need to generate the document with AI
    localStorage.setItem("need-ai-document-generation", JSON.stringify(formData));
  };

  // Handle cancel
  const handleCancel = () => {
    localStorage.removeItem(WIZARD_DATA_KEY);
    localStorage.removeItem(WIZARD_STEP_KEY);
    localStorage.removeItem(WIZARD_ACTIVE_KEY);
    localStorage.removeItem(WIZARD_THREAD_ID_KEY);
    onCancel();
  };

  // Render the current step
  const renderStep = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">1. Problem</h2>
            <p className="text-sm text-gray-600">Define the specific business problem that AI could help solve.</p>
            <div className="space-y-2">
              <label className="block text-sm font-medium">What is the core problem you're trying to address?</label>
              <textarea 
                className="w-full p-2 border rounded-md" 
                rows={6}
                value={formData.problem}
                onChange={(e) => handleInputChange('problem', e.target.value)}
                placeholder="Examples: Customer service response times are too slow; Document processing is error-prone and time-consuming; We need to predict equipment failures before they occur..."
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">2. Challenges</h2>
            <p className="text-sm text-gray-600">Outline the challenges associated with the problem.</p>
            <div className="space-y-2">
              <label className="block text-sm font-medium">What challenges do you face in addressing this problem?</label>
              <textarea 
                className="w-full p-2 border rounded-md" 
                rows={6}
                value={formData.challenges}
                onChange={(e) => handleInputChange('challenges', e.target.value)}
                placeholder="Examples: High volume of unstructured data; Lack of skilled resources; Rapidly changing conditions; Need to integrate with legacy systems..."
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">3. Scope</h2>
            <p className="text-sm text-gray-600">Define the boundaries of the AI solution.</p>
            <div className="space-y-2">
              <label className="block text-sm font-medium">What is the scope of this AI initiative?</label>
              <textarea 
                className="w-full p-2 border rounded-md" 
                rows={6}
                value={formData.scope}
                onChange={(e) => handleInputChange('scope', e.target.value)}
                placeholder="Examples: Implementing a chatbot for customer inquiries; Developing an AI-based document classification system; Creating a predictive maintenance solution for manufacturing equipment..."
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">4. Constraints</h2>
            <p className="text-sm text-gray-600">Identify constraints that may impact the AI solution.</p>
            <div className="space-y-2">
              <label className="block text-sm font-medium">What constraints must be considered?</label>
              <textarea 
                className="w-full p-2 border rounded-md" 
                rows={6}
                value={formData.constraints}
                onChange={(e) => handleInputChange('constraints', e.target.value)}
                placeholder="Examples: Budget limit of $X; Must be implemented within 6 months; Compliance with GDPR/HIPAA; Limited availability of training data; Need to work with existing systems..."
              />
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">5. Desired Outcomes</h2>
            <p className="text-sm text-gray-600">Specify the outcomes you hope to achieve with this AI solution.</p>
            <div className="space-y-2">
              <label className="block text-sm font-medium">What outcomes do you want to achieve?</label>
              <textarea 
                className="w-full p-2 border rounded-md" 
                rows={6}
                value={formData.desiredOutcomes}
                onChange={(e) => handleInputChange('desiredOutcomes', e.target.value)}
                placeholder="Examples: Reduce processing time by 50%; Improve accuracy from 85% to 95%; Decrease operational costs by 30%; Enable 24/7 customer support; Identify 90% of potential failures at least 48 hours in advance..."
              />
            </div>
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">AI Use Case Wizard</h1>
        
        {/* Circular step indicators */}
        <div className="flex justify-between items-center mb-8 px-8">
          {Array.from({ length: totalWizardSteps }).map((_, i) => (
            <Fragment key={i + 1}>
              <StepIndicator 
                step={i + 1} 
                currentStep={wizardStep} 
                totalSteps={totalWizardSteps} 
              />
              {i < totalWizardSteps - 1 && (
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