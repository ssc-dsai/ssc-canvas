import { BUSINESS_INTAKE_CONVERSATION_STATES } from "@/agent/open-canvas/prompts";
import { CheckCircle2, Circle } from "lucide-react";

interface ProgressIndicatorProps {
  currentState: string;
}

const stateLabels = {
  [BUSINESS_INTAKE_CONVERSATION_STATES.INITIAL]: "Getting Started",
  [BUSINESS_INTAKE_CONVERSATION_STATES.PROBLEM_GATHERING]: "Problem Statement",
  [BUSINESS_INTAKE_CONVERSATION_STATES.SCOPE_DEFINITION]: "Scope & Constraints",
  [BUSINESS_INTAKE_CONVERSATION_STATES.SUCCESS_CRITERIA]: "Success Criteria",
  [BUSINESS_INTAKE_CONVERSATION_STATES.TEMPLATE_CREATION]: "Document Creation",
  [BUSINESS_INTAKE_CONVERSATION_STATES.REVIEW]: "Review & Finalize"
};

export const BusinessIntakeProgress: React.FC<ProgressIndicatorProps> = ({ currentState }) => {
  const states = Object.values(BUSINESS_INTAKE_CONVERSATION_STATES);
  const currentIndex = states.indexOf(currentState);

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {states.map((state, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = state === currentState;
            
            return (
              <div key={state} className="flex items-center">
                <div className={`flex flex-col items-center ${
                  isCurrent ? 'text-blue-600' : 
                  isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className={`w-6 h-6 ${isCurrent ? 'fill-blue-100' : ''}`} />
                  )}
                  <span className="text-xs mt-1">{stateLabels[state]}</span>
                </div>
                {index < states.length - 1 && (
                  <div className={`h-[2px] w-16 mx-2 ${
                    index < currentIndex ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
