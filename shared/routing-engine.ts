// Centralized routing engine for probate applications
// Determines eligibility, requirements, and application path based on all available data

export interface RoutingState {
  eligibleToApply: boolean;
  probateRequired: boolean;
  probateType: 'grant_of_probate' | 'letters_of_administration';
  ihtFormRequired: 'IHT400' | 'online_declaration' | null;
  estateIsExcepted: boolean;
  fastTrackEligible: boolean;
  needsMoreEstateData: boolean;
  needsMorePeopleData: boolean;
  dataConfidence: 'declared' | 'evaluated' | 'inferred' | 'incomplete';
}

export interface RoutingInputs {
  // User declarations (highest priority)
  estateDeclaratedExcepted?: boolean;
  iKnowWhatToDo?: boolean;
  
  // Evaluation answers
  evaluationAnswers?: Record<string, any>;
  
  // Estate data
  grossEstateValue?: number;
  netEstateValue?: number;
  
  // People data
  executors?: Array<{
    isApplicant: boolean;
    namedInWill: boolean;
    hasPoA?: boolean;
  }>;
  
  // Document status
  documents?: {
    willUploaded: boolean;
    deathCertificateUploaded: boolean;
    ihtFormUploaded: boolean;
  };
  
  // Assessment data
  assessmentResults?: Record<string, any>;
}

export function deriveRoutingState(inputs: RoutingInputs): RoutingState {
  const state: RoutingState = {
    eligibleToApply: false,
    probateRequired: false,
    probateType: 'grant_of_probate',
    ihtFormRequired: null,
    estateIsExcepted: false,
    fastTrackEligible: false,
    needsMoreEstateData: false,
    needsMorePeopleData: false,
    dataConfidence: 'incomplete'
  };

  // Determine data confidence level
  state.dataConfidence = getDataConfidence(inputs);
  
  // Check if user has declared they know what to do
  if (inputs.iKnowWhatToDo) {
    state.dataConfidence = 'declared';
    state.eligibleToApply = true; // Assume they've checked this
    state.probateRequired = true; // They wouldn't be here otherwise
    return state;
  }

  // Check eligibility to apply
  state.eligibleToApply = isEligibleToApply(inputs);
  
  // Determine if probate is required
  state.probateRequired = needsProbate(inputs);
  
  // Determine probate type
  state.probateType = getProbateType(inputs);
  
  // Determine IHT requirements
  state.ihtFormRequired = getIHTForm(inputs);
  
  // Check if estate is excepted
  state.estateIsExcepted = isExceptedEstate(inputs);
  
  // Check fast track eligibility
  state.fastTrackEligible = isFastTrackEligible(inputs, state);
  
  // Identify data gaps
  state.needsMoreEstateData = needsMoreEstateData(inputs);
  state.needsMorePeopleData = needsMorePeopleData(inputs);

  return state;
}

function getDataConfidence(inputs: RoutingInputs): 'declared' | 'evaluated' | 'inferred' | 'incomplete' {
  // User has explicitly declared estate status
  if (inputs.estateDeclaratedExcepted !== undefined || inputs.iKnowWhatToDo) {
    return 'declared';
  }
  
  // Complete evaluation with estate and people data
  if (inputs.evaluationAnswers && 
      Object.keys(inputs.evaluationAnswers).length > 10 &&
      inputs.grossEstateValue !== undefined &&
      inputs.executors?.length) {
    return 'evaluated';
  }
  
  // Some data available for inference
  if (inputs.grossEstateValue !== undefined || 
      inputs.evaluationAnswers && Object.keys(inputs.evaluationAnswers).length > 3) {
    return 'inferred';
  }
  
  return 'incomplete';
}

function isEligibleToApply(inputs: RoutingInputs): boolean {
  // Check evaluation answers first
  if (inputs.evaluationAnswers) {
    const isExecutor = inputs.evaluationAnswers.q1_executor_named === true;
    const hasPoA = inputs.evaluationAnswers.q2_poas === true;
    
    if (isExecutor || hasPoA) {
      return true;
    }
    
    // Explicit "no" to both means ineligible
    if (inputs.evaluationAnswers.q1_executor_named === false && 
        inputs.evaluationAnswers.q2_poas === false) {
      return false;
    }
  }
  
  // Check people data
  if (inputs.executors?.length) {
    const applicantExecutor = inputs.executors.find(e => e.isApplicant);
    if (applicantExecutor?.namedInWill || applicantExecutor?.hasPoA) {
      return true;
    }
  }
  
  // Default to true unless explicitly ruled out
  return true;
}

function needsProbate(inputs: RoutingInputs): boolean {
  // If gross estate value is available
  if (inputs.grossEstateValue !== undefined) {
    // Probate typically required for estates over £5,000
    return inputs.grossEstateValue > 5000;
  }
  
  // Check evaluation answers for ownership patterns
  if (inputs.evaluationAnswers) {
    // Sole property ownership usually requires probate
    if (inputs.evaluationAnswers.sole_property_ownership === true) {
      return true;
    }
    
    // Large bank accounts in sole name
    if (inputs.evaluationAnswers.bank_accounts_over_threshold === true) {
      return true;
    }
  }
  
  // Default assumption for probate applications
  return true;
}

function getProbateType(inputs: RoutingInputs): 'grant_of_probate' | 'letters_of_administration' {
  // Check if will exists
  if (inputs.documents?.willUploaded) {
    return 'grant_of_probate';
  }
  
  // Check evaluation answers
  if (inputs.evaluationAnswers?.has_valid_will === true) {
    return 'grant_of_probate';
  }
  
  if (inputs.evaluationAnswers?.has_valid_will === false) {
    return 'letters_of_administration';
  }
  
  // Default to grant of probate (most common)
  return 'grant_of_probate';
}

function getIHTForm(inputs: RoutingInputs): 'IHT400' | 'online_declaration' | null {
  const grossValue = inputs.grossEstateValue || 0;
  const netValue = inputs.netEstateValue || grossValue;
  
  // Determine nil rate band threshold
  let nilRateBandThreshold = 325000; // Base threshold
  
  // Check for transferable nil rate band
  if (inputs.evaluationAnswers?.married_civil_partnership === true &&
      inputs.evaluationAnswers?.spouse_partner_deceased === true &&
      inputs.evaluationAnswers?.spouse_nrb_fully_used === false) {
    nilRateBandThreshold = 650000; // Double threshold
  }
  
  // Check for residence nil rate band
  let totalThreshold = nilRateBandThreshold;
  if (inputs.evaluationAnswers?.home_to_children_grandchildren === true &&
      inputs.evaluationAnswers?.deceased_lived_uk_property === true) {
    totalThreshold += 175000; // Add RNRB
    
    // Add transferred RNRB if applicable
    if (nilRateBandThreshold === 650000) {
      totalThreshold += 175000;
    }
  }
  
  // Check for IHT400 triggers
  const iht400Triggers = [
    inputs.evaluationAnswers?.gifts_last_7_years === true,
    inputs.evaluationAnswers?.trust_involvement === true,
    inputs.evaluationAnswers?.overseas_assets === true,
    grossValue > 1000000, // £1M+ always requires IHT400
    inputs.evaluationAnswers?.foreign_domicile === true
  ];
  
  const hasIht400Triggers = iht400Triggers.some(trigger => trigger);
  
  // Determine form requirement
  if (hasIht400Triggers || netValue > totalThreshold) {
    return 'IHT400';
  }
  
  if (grossValue > 250000) {
    return 'online_declaration'; // IHT205 equivalent
  }
  
  return null; // No IHT form required
}

function isExceptedEstate(inputs: RoutingInputs): boolean {
  // User has declared it's excepted
  if (inputs.estateDeclaratedExcepted === true) {
    return true;
  }
  
  // Explicit declaration it's not excepted
  if (inputs.estateDeclaratedExcepted === false) {
    return false;
  }
  
  // Calculate based on IHT form requirement
  const ihtForm = getIHTForm(inputs);
  return ihtForm !== 'IHT400';
}

function isFastTrackEligible(inputs: RoutingInputs, state: RoutingState): boolean {
  // Must be eligible to apply
  if (!state.eligibleToApply) {
    return false;
  }
  
  // Must have required documents
  if (!inputs.documents?.willUploaded || !inputs.documents?.deathCertificateUploaded) {
    return false;
  }
  
  // Must have at least one executor
  if (!inputs.executors?.length) {
    return false;
  }
  
  // Estate must be excepted
  if (!state.estateIsExcepted) {
    return false;
  }
  
  // IHT requirements must be clear
  if (state.ihtFormRequired === 'IHT400') {
    // Need IHT400 uploaded or completed
    return inputs.documents?.ihtFormUploaded === true;
  }
  
  return true;
}

function needsMoreEstateData(inputs: RoutingInputs): boolean {
  // No estate value data at all
  if (inputs.grossEstateValue === undefined && inputs.netEstateValue === undefined) {
    return true;
  }
  
  // Evaluation suggests complex estate but no detailed estate data
  if (inputs.evaluationAnswers?.trust_involvement === true ||
      inputs.evaluationAnswers?.overseas_assets === true) {
    return inputs.grossEstateValue === undefined;
  }
  
  return false;
}

function needsMorePeopleData(inputs: RoutingInputs): boolean {
  // No executor information
  if (!inputs.executors?.length) {
    return true;
  }
  
  // No applicant identified
  const hasApplicant = inputs.executors.some(e => e.isApplicant);
  if (!hasApplicant) {
    return true;
  }
  
  return false;
}

// Helper function to check routing state completeness
export function isRoutingStateComplete(state: RoutingState): boolean {
  return state.dataConfidence !== 'incomplete' && 
         !state.needsMoreEstateData && 
         !state.needsMorePeopleData;
}

// Helper function to get next required action
export function getNextRequiredAction(state: RoutingState): string {
  if (!state.eligibleToApply) {
    return 'Contact a solicitor - you may not be eligible to apply for probate yourself';
  }
  
  if (state.needsMorePeopleData) {
    return 'Add executor information in the People section';
  }
  
  if (state.needsMoreEstateData) {
    return 'Complete estate valuation in the Estate section';
  }
  
  if (state.ihtFormRequired === 'IHT400') {
    return 'Complete and submit IHT400 form before proceeding';
  }
  
  if (state.fastTrackEligible) {
    return 'Ready to generate probate application forms';
  }
  
  return 'Complete remaining evaluation questions or upload required documents';
}