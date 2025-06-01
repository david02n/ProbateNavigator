// Evaluation routing and decision engine
// Determines probate path based on evaluation answers

export interface RoutingDecision {
  estateType: 'excepted' | 'non_excepted' | 'complex';
  ihtForm: 'IHT205' | 'IHT400' | 'IHT421' | 'none';
  probateType: 'grant_of_probate' | 'letters_of_administration' | 'letters_of_administration_with_will';
  nilRateBandThreshold: number;
  residenceNilRateBand: number;
  totalThreshold: number;
  requiresIht: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
  nextSteps: string[];
  warnings: string[];
  blockers: string[];
}

export interface EvaluationAnswers {
  // Phase 1: Estate & IHT Eligibility
  q1_domicile_uk?: boolean;
  q2_gifts_7yrs?: boolean | 'not_sure';
  q3_married_at_death?: boolean;
  q4_spouse_died_first?: boolean | 'not_sure';
  q5_nrb_transferred?: boolean | 'not_sure';
  q6_home_to_children?: boolean | 'not_sure';
  q7_owned_home_uk?: boolean | 'not_sure';
  q8_trusts?: boolean | 'not_sure';
  q9_foreign_assets?: boolean | 'not_sure';
  q10_gross_value?: number | 'unknown';
  q11_net_value?: number | 'unknown';
  
  // Phase 2: Application & Will Details
  q12_executor_named?: boolean;
  q13_po_attorney?: boolean;
  q14_applicant_count?: number;
  q15_minors_named?: boolean | 'not_sure';
  q16_alt_names?: boolean;
  q17_codicils?: boolean;
  q18_married_after_will?: boolean;
  q19_wills_outside_uk?: boolean;
  q20_all_executors_applying?: boolean;
  q21_executor_absence_reason?: 'deceased' | 'renunciation' | 'power_reserved' | 'lacks_capacity' | 'attorney';

  // Control flags
  evaluation_skipped?: boolean;
  estate_declared_excepted?: boolean;
}

export function deriveRoutingState(answers: EvaluationAnswers): RoutingDecision {
  const decision: RoutingDecision = {
    estateType: 'excepted',
    ihtForm: 'none',
    probateType: 'grant_of_probate',
    nilRateBandThreshold: 325000,
    residenceNilRateBand: 0,
    totalThreshold: 325000,
    requiresIht: false,
    complexity: 'simple',
    nextSteps: [],
    warnings: [],
    blockers: []
  };

  // Handle skipped evaluation or declared excepted estate
  if (answers.evaluation_skipped || answers.estate_declared_excepted) {
    decision.nextSteps.push('Complete estate valuation');
    decision.nextSteps.push('Upload required documents');
    decision.nextSteps.push('Submit probate application');
    return decision;
  }

  // Check for blockers first
  if (answers.q1_domicile_uk === false) {
    decision.blockers.push('Non-UK domiciled estates require specialist advice');
    decision.complexity = 'complex';
  }

  // Determine probate type based on will and executor status
  if (answers.q12_executor_named === true) {
    decision.probateType = 'grant_of_probate';
  } else if (answers.q12_executor_named === false) {
    // Check if there's a will but user isn't named executor
    decision.probateType = 'letters_of_administration_with_will';
    decision.warnings.push('You may need renunciation from named executors');
  }

  // Calculate nil rate band and thresholds
  const baseNilRateBand = 325000;
  let transferredNilRateBand = 0;
  
  // Check for transferred nil rate band
  if (answers.q3_married_at_death === true && answers.q4_spouse_died_first === true) {
    if (answers.q5_nrb_transferred === false || answers.q5_nrb_transferred === 'not_sure') {
      transferredNilRateBand = baseNilRateBand;
      decision.warnings.push('Verify spouse\'s nil rate band usage for accurate threshold');
    }
  }

  decision.nilRateBandThreshold = baseNilRateBand + transferredNilRateBand;

  // Calculate residence nil rate band
  if (answers.q6_home_to_children === true && answers.q7_owned_home_uk === true) {
    decision.residenceNilRateBand = 175000;
    if (transferredNilRateBand > 0) {
      decision.residenceNilRateBand += 175000; // Transferred RNRB
    }
  }

  decision.totalThreshold = decision.nilRateBandThreshold + decision.residenceNilRateBand;

  // Determine estate type and IHT requirements
  const grossValue = typeof answers.q10_gross_value === 'number' ? answers.q10_gross_value : 0;
  const netValue = typeof answers.q11_net_value === 'number' ? answers.q11_net_value : 0;

  // Check for IHT400 triggers (complexity factors)
  const iht400Triggers = [
    answers.q2_gifts_7yrs === true,
    answers.q8_trusts === true,
    answers.q9_foreign_assets === true,
    grossValue > 1000000, // £1M+ always requires IHT400
    answers.q16_alt_names === true,
    answers.q19_wills_outside_uk === true
  ];

  const hasIht400Triggers = iht400Triggers.some(trigger => trigger);

  if (hasIht400Triggers) {
    decision.estateType = 'non_excepted';
    decision.ihtForm = 'IHT400';
    decision.requiresIht = true;
    decision.complexity = 'complex';
  } else if (netValue > decision.totalThreshold) {
    decision.estateType = 'non_excepted';
    decision.ihtForm = 'IHT400';
    decision.requiresIht = true;
    decision.complexity = 'moderate';
  } else if (grossValue > 250000) {
    decision.estateType = 'excepted';
    decision.ihtForm = 'IHT205';
    decision.requiresIht = true;
    decision.complexity = 'simple';
  } else {
    decision.estateType = 'excepted';
    decision.ihtForm = 'none';
    decision.requiresIht = false;
    decision.complexity = 'simple';
  }

  // Check applicant requirements
  if (answers.q15_minors_named === true && (answers.q14_applicant_count || 1) < 2) {
    decision.warnings.push('Estates with minor beneficiaries typically require 2+ applicants');
  }

  if (answers.q20_all_executors_applying === false) {
    decision.nextSteps.push('Obtain renunciation or power reserved forms from non-applying executors');
  }

  // Generate next steps based on complexity
  if (decision.complexity === 'complex') {
    decision.nextSteps.push('Consider professional legal advice');
    decision.nextSteps.push('Gather comprehensive asset valuations');
    decision.nextSteps.push('Prepare detailed IHT400 and supporting schedules');
  } else if (decision.complexity === 'moderate') {
    decision.nextSteps.push('Complete professional asset valuations');
    decision.nextSteps.push('Prepare IHT400 form');
    decision.nextSteps.push('Gather supporting documentation');
  } else {
    decision.nextSteps.push('Complete basic asset valuations');
    if (decision.ihtForm !== 'none') {
      decision.nextSteps.push(`Prepare ${decision.ihtForm} form`);
    }
    decision.nextSteps.push('Upload will and death certificate');
    decision.nextSteps.push('Submit probate application');
  }

  // Handle unknown values
  if (answers.q10_gross_value === 'unknown' || answers.q11_net_value === 'unknown') {
    decision.warnings.push('Complete estate valuation required to determine exact IHT requirements');
    decision.nextSteps.unshift('Use estate valuation tool to determine asset values');
  }

  return decision;
}

// Helper function to get human-readable decision summary
export function getDecisionSummary(decision: RoutingDecision): string {
  const estateTypeText = {
    'excepted': 'Excepted Estate',
    'non_excepted': 'Non-Excepted Estate', 
    'complex': 'Complex Estate'
  }[decision.estateType];

  const ihtText = decision.requiresIht 
    ? `IHT required (${decision.ihtForm})`
    : 'No IHT required';

  const thresholdText = decision.totalThreshold > decision.nilRateBandThreshold
    ? `Threshold: £${decision.totalThreshold.toLocaleString()} (including residence nil rate band)`
    : `Threshold: £${decision.totalThreshold.toLocaleString()}`;

  return `${estateTypeText} • ${ihtText} • ${thresholdText}`;
}

// Helper function to check if evaluation is complete enough for routing
export function isEvaluationComplete(answers: EvaluationAnswers): boolean {
  const requiredAnswers = [
    'q1_domicile_uk',
    'q10_gross_value',
    'q11_net_value',
    'q12_executor_named'
  ];

  return requiredAnswers.every(key => answers[key as keyof EvaluationAnswers] !== undefined);
}