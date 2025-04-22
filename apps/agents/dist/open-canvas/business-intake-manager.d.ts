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
interface BusinessIntakeState {
    currentState: string;
    gatheredInfo: GatheredInfo;
    previousResponse?: string;
}
export declare class BusinessIntakeManager {
    private state;
    constructor();
    getCurrentState(): string;
    getFullState(): BusinessIntakeState;
    getRequiredInfoForState(state: string): GatheredInfoKey[];
    updateGatheredInfo<K extends GatheredInfoKey>(key: K, value: K extends StringFields ? string : string[]): void;
    updatePreviousResponse(response: string): void;
    getOrchestratorPrompt(): string;
    getStateTransitionPrompt(): string;
    transitionState(newState: string): void;
    getProgressPercentage(): number;
    isReadyForNextState(): boolean;
}
export {};
