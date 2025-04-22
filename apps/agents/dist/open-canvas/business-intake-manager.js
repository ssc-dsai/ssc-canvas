"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessIntakeManager = void 0;
const prompts_1 = require("./prompts");
class BusinessIntakeManager {
    constructor() {
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Initialize the state using the locally defined interface
        this.state = {
            currentState: prompts_1.BUSINESS_INTAKE_CONVERSATION_STATES.INITIAL,
            gatheredInfo: {},
            // Initialize previousResponse if needed
            previousResponse: undefined
        };
    }
    // Modify getCurrentState to return the string state, not the whole object,
    // unless the whole object is needed elsewhere (e.g., for the progress indicator)
    // Let's keep it returning the string for now as that's what prompts use.
    getCurrentState() {
        return this.state.currentState;
    }
    // Method to get the full state object if needed
    getFullState() {
        return this.state;
    }
    getRequiredInfoForState(state) {
        const requirementMap = {
            [prompts_1.BUSINESS_INTAKE_CONVERSATION_STATES.PROBLEM_GATHERING]: [
                'problemStatement',
                'currentState',
            ],
            [prompts_1.BUSINESS_INTAKE_CONVERSATION_STATES.SCOPE_DEFINITION]: [
                'stakeholders',
                'constraints',
            ],
            [prompts_1.BUSINESS_INTAKE_CONVERSATION_STATES.SUCCESS_CRITERIA]: [
                'successMetrics',
                'timeline',
            ],
            // Add requirements for other states if necessary
            [prompts_1.BUSINESS_INTAKE_CONVERSATION_STATES.TEMPLATE_CREATION]: [],
            [prompts_1.BUSINESS_INTAKE_CONVERSATION_STATES.REVIEW]: []
        };
        return requirementMap[state] || [];
    }
    updateGatheredInfo(key, value) {
        // Ensure gatheredInfo exists before assigning
        if (!this.state.gatheredInfo) {
            this.state.gatheredInfo = {};
        }
        this.state.gatheredInfo[key] = value;
    }
    updatePreviousResponse(response) {
        this.state.previousResponse = response;
    }
    getOrchestratorPrompt() {
        // Ensure previousResponse is handled if undefined
        const previousResponseText = this.state.previousResponse || 'None';
        return prompts_1.BUSINESS_INTAKE_ORCHESTRATOR
            .replace('{currentState}', this.state.currentState)
            .replace('{previousResponse}', previousResponseText);
    }
    getStateTransitionPrompt() {
        const requiredInfo = this.getRequiredInfoForState(this.state.currentState);
        // Ensure gatheredInfo is stringified correctly, even if empty
        const gatheredInfoText = JSON.stringify(this.state.gatheredInfo || {}, null, 2);
        return prompts_1.BUSINESS_INTAKE_STATE_TRANSITION
            .replace('{currentState}', this.state.currentState)
            .replace('{requiredInfo}', JSON.stringify(requiredInfo))
            .replace('{gatheredInfo}', gatheredInfoText);
    }
    transitionState(newState) {
        // Optional: Add validation to ensure newState is a valid state key
        if (Object.values(prompts_1.BUSINESS_INTAKE_CONVERSATION_STATES).includes(newState)) {
            this.state.currentState = newState;
        }
        else {
            console.warn(`Attempted to transition to invalid state: ${newState}`);
        }
    }
    getProgressPercentage() {
        const states = Object.values(prompts_1.BUSINESS_INTAKE_CONVERSATION_STATES);
        const currentIndex = states.indexOf(this.state.currentState);
        // Handle case where state might not be found (though transitionState should prevent this)
        if (currentIndex === -1)
            return 0;
        // Avoid division by zero if there's only one state
        if (states.length <= 1)
            return 100;
        return Math.round((currentIndex / (states.length - 1)) * 100);
    }
    isReadyForNextState() {
        const requiredInfo = this.getRequiredInfoForState(this.state.currentState);
        // Ensure gatheredInfo is checked safely
        const currentGatheredInfo = this.state.gatheredInfo || {};
        return requiredInfo.every((key) => currentGatheredInfo[key] !== undefined);
    }
}
exports.BusinessIntakeManager = BusinessIntakeManager;
