import {
  BUSINESS_INTAKE_CONVERSATION_STATES,
  BUSINESS_INTAKE_ORCHESTRATOR,
  BUSINESS_INTAKE_STATE_TRANSITION,
} from './prompts';

// Make the types more specific
interface GatheredInfo {
  problemStatement?: string;
  currentState?: string;
  desiredState?: string;
  stakeholders?: string[];
  constraints?: string[];
  successMetrics?: string[];
  timeline?: string;
}

type StringFields = 'problemStatement' | 'currentState' | 'desiredState' | 'timeline';
type ArrayFields = 'stakeholders' | 'constraints' | 'successMetrics';
type GatheredInfoKey = StringFields | ArrayFields;

// Define the BusinessIntakeState interface here
interface BusinessIntakeState {
  currentState: string;
  gatheredInfo: GatheredInfo;
  previousResponse?: string;
}

export class BusinessIntakeManager {
  private state: BusinessIntakeState;

  constructor() {
    // Initialize the state using the locally defined interface
    this.state = {
      currentState: BUSINESS_INTAKE_CONVERSATION_STATES.INITIAL,
      gatheredInfo: {},
      // Initialize previousResponse if needed
      previousResponse: undefined 
    };
  }

  // Modify getCurrentState to return the string state, not the whole object,
  // unless the whole object is needed elsewhere (e.g., for the progress indicator)
  // Let's keep it returning the string for now as that's what prompts use.
  getCurrentState(): string {
    return this.state.currentState;
  }
  
  // Method to get the full state object if needed
  getFullState(): BusinessIntakeState {
      return this.state;
  }

  getRequiredInfoForState(state: string): GatheredInfoKey[] {
    const requirementMap: Record<string, GatheredInfoKey[]> = {
      [BUSINESS_INTAKE_CONVERSATION_STATES.PROBLEM_GATHERING]: [
        'problemStatement',
        'currentState',
      ],
      [BUSINESS_INTAKE_CONVERSATION_STATES.SCOPE_DEFINITION]: [
        'stakeholders',
        'constraints',
      ],
      [BUSINESS_INTAKE_CONVERSATION_STATES.SUCCESS_CRITERIA]: [
        'successMetrics',
        'timeline',
      ],
      // Add requirements for other states if necessary
      [BUSINESS_INTAKE_CONVERSATION_STATES.TEMPLATE_CREATION]: [], 
      [BUSINESS_INTAKE_CONVERSATION_STATES.REVIEW]: []
    };
    return requirementMap[state] || [];
  }

  updateGatheredInfo<K extends GatheredInfoKey>(
    key: K,
    value: K extends StringFields ? string : string[]
  ) {
    // Ensure gatheredInfo exists before assigning
    if (!this.state.gatheredInfo) {
        this.state.gatheredInfo = {};
    }
    this.state.gatheredInfo[key] = value as GatheredInfo[K];
  }
  
  updatePreviousResponse(response: string) {
      this.state.previousResponse = response;
  }

  getOrchestratorPrompt(): string {
    // Ensure previousResponse is handled if undefined
    const previousResponseText = this.state.previousResponse || 'None';
    return BUSINESS_INTAKE_ORCHESTRATOR
      .replace('{currentState}', this.state.currentState)
      .replace('{previousResponse}', previousResponseText);
  }

  getStateTransitionPrompt(): string {
    const requiredInfo = this.getRequiredInfoForState(this.state.currentState);
    // Ensure gatheredInfo is stringified correctly, even if empty
    const gatheredInfoText = JSON.stringify(this.state.gatheredInfo || {}, null, 2);
    return BUSINESS_INTAKE_STATE_TRANSITION
      .replace('{currentState}', this.state.currentState)
      .replace('{requiredInfo}', JSON.stringify(requiredInfo))
      .replace('{gatheredInfo}', gatheredInfoText);
  }

  transitionState(newState: string) {
    // Optional: Add validation to ensure newState is a valid state key
    if (Object.values(BUSINESS_INTAKE_CONVERSATION_STATES).includes(newState)) {
        this.state.currentState = newState;
    } else {
        console.warn(`Attempted to transition to invalid state: ${newState}`);
    }
  }

  getProgressPercentage(): number {
    const states = Object.values(BUSINESS_INTAKE_CONVERSATION_STATES);
    const currentIndex = states.indexOf(this.state.currentState);
    // Handle case where state might not be found (though transitionState should prevent this)
    if (currentIndex === -1) return 0; 
    // Avoid division by zero if there's only one state
    if (states.length <= 1) return 100; 
    return Math.round((currentIndex / (states.length - 1)) * 100);
  }

  isReadyForNextState(): boolean {
    const requiredInfo = this.getRequiredInfoForState(this.state.currentState);
    // Ensure gatheredInfo is checked safely
    const currentGatheredInfo = this.state.gatheredInfo || {}; 
    return requiredInfo.every((key) => currentGatheredInfo[key] !== undefined);
  }
}
