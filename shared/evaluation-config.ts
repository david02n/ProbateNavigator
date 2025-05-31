// Evaluation question configuration for both landing page and in-app flows

export interface EvaluationQuestion {
  key: string;
  type: 'boolean' | 'number' | 'text' | 'select' | 'date' | 'object';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditionalLogic?: {
    showIf?: Record<string, any>;
    hideIf?: Record<string, any>;
  };
}

export interface EvaluationSection {
  id: string;
  title: string;
  description?: string;
  questions: EvaluationQuestion[];
}

// Landing page eligibility check - 6 simple questions
export const landingPageQuestions: EvaluationQuestion[] = [
  {
    key: 'has_person_died',
    type: 'boolean',
    title: 'Has someone passed away?',
    description: 'We can only help with probate applications for deceased persons.',
    required: true
  },
  {
    key: 'death_in_england_wales',
    type: 'boolean',
    title: 'Did the person die in England or Wales?',
    description: 'Our service covers probate applications in England and Wales only.',
    required: true,
    conditionalLogic: {
      showIf: { has_person_died: true }
    }
  },
  {
    key: 'has_will',
    type: 'boolean',
    title: 'Did the person leave a will?',
    description: 'This affects the type of probate application needed.',
    required: true,
    conditionalLogic: {
      showIf: { death_in_england_wales: true }
    }
  },
  {
    key: 'estate_value_estimate',
    type: 'select',
    title: 'What is the estimated value of the estate?',
    description: 'Include property, savings, investments, and personal belongings.',
    required: true,
    options: [
      'Under £5,000',
      '£5,000 - £325,000',
      'Over £325,000'
    ],
    conditionalLogic: {
      showIf: { has_will: [true, false] }
    }
  },
  {
    key: 'applicant_named_executor',
    type: 'boolean',
    title: 'Are you named as an executor in the will?',
    description: 'Only executors can apply for probate when there is a will.',
    required: true,
    conditionalLogic: {
      showIf: { has_will: true }
    }
  },
  {
    key: 'next_of_kin',
    type: 'boolean',
    title: 'Are you the spouse, civil partner, child, or parent of the deceased?',
    description: 'Priority order applies for administration applications.',
    required: true,
    conditionalLogic: {
      showIf: { has_will: false }
    }
  }
];

// Detailed in-app evaluation flow
export const detailedEvaluationSections: EvaluationSection[] = [
  {
    id: 'applicant_details',
    title: 'Applicant Details',
    description: 'Information about who is applying for probate',
    questions: [
      {
        key: 'q1_executor_named',
        type: 'boolean',
        title: 'Are you named as an executor in the will?',
        required: true
      },
      {
        key: 'q2_power_of_attorney',
        type: 'boolean',
        title: 'Are you acting under a power of attorney on behalf of an executor?',
        required: true,
        conditionalLogic: {
          showIf: { q1_executor_named: false }
        }
      },
      {
        key: 'q3_applicant_count',
        type: 'number',
        title: 'How many people are applying for probate?',
        description: 'Maximum 4 applicants allowed',
        required: true,
        validation: {
          min: 1,
          max: 4
        }
      },
      {
        key: 'q4_under18_gift',
        type: 'boolean',
        title: 'Is anyone under 18 receiving a gift in the will or codicil?',
        description: 'If yes, at least 2 applicants are mandatory',
        required: true
      }
    ]
  },
  {
    id: 'deceased_information',
    title: "Deceased Person's Information",
    description: 'Details about the person who has died',
    questions: [
      {
        key: 'q5_name_dob_dod',
        type: 'object',
        title: "Deceased person's full details",
        description: 'Full name, date of birth, and date of death',
        required: true
      },
      {
        key: 'q6_domicile_uk',
        type: 'boolean',
        title: 'Did the deceased live permanently in England or Wales?',
        description: 'This affects domicile status for probate',
        required: true
      },
      {
        key: 'q7_alt_names',
        type: 'boolean',
        title: 'Did the deceased hold any assets under another name?',
        required: true
      },
      {
        key: 'q7_alt_names_list',
        type: 'text',
        title: 'List the alternative names',
        description: 'Enter each name on a new line',
        required: true,
        conditionalLogic: {
          showIf: { q7_alt_names: true }
        }
      },
      {
        key: 'q8_foreign_assets',
        type: 'boolean',
        title: 'Did the deceased own foreign (non-UK) assets?',
        description: 'This may trigger IHT400 requirement',
        required: true
      },
      {
        key: 'q8_foreign_asset_value',
        type: 'number',
        title: 'Estimated value of foreign assets (£)',
        required: true,
        conditionalLogic: {
          showIf: { q8_foreign_assets: true }
        }
      },
      {
        key: 'q9_settled_land',
        type: 'boolean',
        title: 'Was any land still held as settled land?',
        description: 'This requires legal review',
        required: true
      },
      {
        key: 'q10_adoptions',
        type: 'boolean',
        title: 'Were any relatives adopted in/out of the family?',
        description: 'This affects inheritance rights',
        required: true
      }
    ]
  },
  {
    id: 'will_executors',
    title: 'Will and Executors',
    description: 'Information about the will and other executors',
    questions: [
      {
        key: 'q11_will_date',
        type: 'date',
        title: 'What is the date of the will?',
        required: true
      },
      {
        key: 'q12_codicils',
        type: 'boolean',
        title: 'Are there codicils to the will?',
        required: true
      },
      {
        key: 'q12_codicil_dates',
        type: 'text',
        title: 'List the dates of all codicils',
        description: 'Enter each date on a new line (DD/MM/YYYY)',
        required: true,
        conditionalLogic: {
          showIf: { q12_codicils: true }
        }
      },
      {
        key: 'q13_will_revoked',
        type: 'boolean',
        title: 'Did the deceased marry after making the will?',
        description: 'This may revoke the will and require PA13',
        required: true
      },
      {
        key: 'q14_foreign_wills',
        type: 'boolean',
        title: 'Were any wills made outside England and Wales?',
        description: 'Translations may be needed',
        required: true
      },
      {
        key: 'q15_all_executors_applying',
        type: 'boolean',
        title: 'Are all named executors applying?',
        required: true
      },
      {
        key: 'q16_non_applying_reasons',
        type: 'select',
        title: 'Why are some executors not applying?',
        description: 'Select all that apply',
        required: true,
        options: [
          'Deceased',
          'Renouncing',
          'Has power reserved',
          'Mental incapacity',
          'Under 18',
          'Missing/cannot be found'
        ],
        conditionalLogic: {
          showIf: { q15_all_executors_applying: false }
        }
      }
    ]
  },
  {
    id: 'estate_tax',
    title: 'Estate & Tax Assessment',
    description: 'Financial information about the estate',
    questions: [
      {
        key: 'q17_gross_value',
        type: 'number',
        title: 'Estimated gross value of estate (£)',
        description: 'Total value before debts',
        required: true
      },
      {
        key: 'q18_net_value',
        type: 'number',
        title: 'Estimated net value of estate (£)',
        description: 'Value after debts and liabilities',
        required: true
      },
      {
        key: 'q19_iht_done',
        type: 'boolean',
        title: 'Has an Inheritance Tax form already been completed?',
        description: 'Required before PA1P submission',
        required: true
      },
      {
        key: 'q20_iht_form_type',
        type: 'select',
        title: 'Which IHT form was used?',
        required: true,
        options: ['IHT205', 'IHT400'],
        conditionalLogic: {
          showIf: { q19_iht_done: true }
        }
      }
    ]
  }
];

// Logic engine for deriving flags from answers
export function deriveEvaluationFlags(answers: Record<string, any>): Record<string, any> {
  const flags: Record<string, any> = {};
  
  // Eligibility checks
  flags.eligible_to_apply = true;
  flags.needs_probate = true;
  flags.probate_type = 'grant_of_probate';
  
  // Check basic eligibility
  if (answers.q1_executor_named === false && answers.q2_power_of_attorney === false) {
    flags.eligible_to_apply = false;
    flags.error_reason = 'Not named as executor and no power of attorney';
  }
  
  // Determine probate type
  if (!answers.has_will || answers.has_will === false) {
    flags.probate_type = 'letters_of_administration';
  }
  
  // Document requirements
  flags.needs_renunciation_form = false;
  flags.needs_pa13 = false;
  flags.needs_translation = false;
  
  if (answers.q15_all_executors_applying === false) {
    const reasons = answers.q16_non_applying_reasons || [];
    if (reasons.includes('Renouncing')) {
      flags.needs_renunciation_form = true;
    }
  }
  
  if (answers.q13_will_revoked === true) {
    flags.needs_pa13 = true;
  }
  
  if (answers.q14_foreign_wills === true) {
    flags.needs_translation = true;
  }
  
  // IHT form determination
  flags.iht_form_required = 'IHT205';
  
  const grossValue = answers.q17_gross_value || 0;
  const hasForeignAssets = answers.q8_foreign_assets === true;
  
  if (grossValue > 325000 || hasForeignAssets) {
    flags.iht_form_required = 'IHT400';
  }
  
  // PA1P sections required
  flags.pa1p_sections = {
    section_a: true, // Always required
    section_b: true, // Always required
    section_c: true, // Always required
    section_d: answers.q4_under18_gift === true,
    section_e: answers.q15_all_executors_applying === false,
    section_f: answers.q7_alt_names === true,
    section_g: answers.q10_adoptions === true
  };
  
  // Validation flags
  flags.application_ready = true;
  flags.missing_requirements = [];
  
  if (answers.q19_iht_done !== true) {
    flags.application_ready = false;
    flags.missing_requirements.push('IHT form must be completed first');
  }
  
  if (answers.q3_applicant_count > 4) {
    flags.application_ready = false;
    flags.missing_requirements.push('Maximum 4 applicants allowed');
  }
  
  if (answers.q4_under18_gift === true && (answers.q3_applicant_count || 1) < 2) {
    flags.application_ready = false;
    flags.missing_requirements.push('At least 2 applicants required when under-18s receive gifts');
  }
  
  return flags;
}

// Landing page eligibility logic
export function deriveLandingPageResult(answers: Record<string, any>): {
  eligible: boolean;
  probateRequired: boolean;
  nextSteps: string[];
  warnings: string[];
} {
  const result = {
    eligible: true,
    probateRequired: true,
    nextSteps: [] as string[],
    warnings: [] as string[]
  };
  
  // Basic eligibility checks
  if (!answers.has_person_died) {
    result.eligible = false;
    result.probateRequired = false;
    result.nextSteps.push('Probate can only be applied for after someone has died.');
    return result;
  }
  
  if (!answers.death_in_england_wales) {
    result.eligible = false;
    result.nextSteps.push('For deaths outside England and Wales, contact the relevant jurisdiction.');
    return result;
  }
  
  // Estate value checks
  if (answers.estate_value_estimate === 'Under £5,000') {
    result.probateRequired = false;
    result.nextSteps.push('Probate may not be required for estates under £5,000.');
    result.nextSteps.push('Check with individual institutions about their requirements.');
    return result;
  }
  
  // Applicant eligibility
  if (answers.has_will && !answers.applicant_named_executor) {
    result.eligible = false;
    result.nextSteps.push('Only named executors can apply when there is a will.');
    result.warnings.push('You may need to contact the named executors.');
    return result;
  }
  
  if (!answers.has_will && !answers.next_of_kin) {
    result.eligible = false;
    result.nextSteps.push('Priority rules apply - spouse, children, or parents typically apply first.');
    result.warnings.push('Other relatives may be able to apply if closer relatives renounce.');
    return result;
  }
  
  // Success case
  result.nextSteps.push('You appear eligible to apply for probate.');
  result.nextSteps.push('Continue to ProbateSwift to complete your detailed application.');
  
  if (answers.estate_value_estimate === 'Over £325,000') {
    result.warnings.push('Inheritance tax may be due on estates over £325,000.');
  }
  
  return result;
}