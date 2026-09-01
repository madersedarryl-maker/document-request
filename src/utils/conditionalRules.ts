import { DocumentRequirement } from '../types';

export interface ConditionalRuleConfig {
  type: 'ALWAYS' | 'PURPOSE' | 'RELEASE_METHOD' | 'STUDENT_STATUS' | 'PRIORITY' | 'CUSTOM';
  field?: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'CONTAINS';
  value: string | string[];
  description?: string;
}

export interface StudentRequestContext {
  purpose?: string;
  release_method?: string;
  student_status?: string;
  year_level?: string;
  priority?: string;
}

/**
 * Standard preset purpose options for university document requests
 */
export const PURPOSE_OPTIONS = [
  'Employment Application',
  'Board Exam / PRC Licensure',
  'Scholarship Application',
  'Transfer to Another School',
  'Graduate Studies / Masteral Enrollment',
  'Visa / Study Abroad Application',
  'Lost Original Document / Replacement',
  'Claim via Authorized Representative',
  'Personal Reference / Evaluation',
  'Legal / Judicial Requirement',
];

/**
 * Standard release / claiming methods
 */
export const RELEASE_METHOD_OPTIONS = [
  { value: 'PICKUP_STUDENT', label: 'In-Person Pickup (Student)' },
  { value: 'PICKUP_REPRESENTATIVE', label: 'Pickup by Authorized Representative' },
  { value: 'COURIER_DOMESTIC', label: 'Domestic Courier Delivery' },
  { value: 'COURIER_INTERNATIONAL', label: 'International Express Shipping' },
  { value: 'DIGITAL_DOWNLOAD', label: 'Secure Digital Copy (PDF/Email)' },
];

/**
 * Standard student academic standings
 */
export const STUDENT_STATUS_OPTIONS = [
  'Undergraduate / Currently Enrolled',
  'Graduated / Alumni',
  'Transferee (Incoming / Outgoing)',
  'Returnee / On Leave of Absence',
  'Cross-Enrollee',
];

/**
 * Common preset specific documents for registrar offices
 */
export interface SpecificDocumentPreset {
  id: string;
  category: 'Identity' | 'Financial' | 'Clearance' | 'Academic' | 'Legal';
  name: string;
  description: string;
  isMandatory: boolean;
  fileType: string;
  maxFileSizeMb: number;
  allowMultiple: boolean;
  conditionalRule?: ConditionalRuleConfig | null;
  ruleDescription?: string;
}

export const REGISTRAR_DOCUMENT_PRESETS: SpecificDocumentPreset[] = [
  {
    id: 'preset-school-id',
    category: 'Identity',
    name: 'Valid School ID / Certificate of Registration',
    description: 'Clear front and back photo/scan of current semester validated student ID card or validated Certificate of Registration (COR).',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
    conditionalRule: {
      type: 'ALWAYS',
      operator: 'EQUALS',
      value: 'ALL',
      description: 'Always required for all student applicants.',
    },
    ruleDescription: 'Always Required for All Applicants',
  },
  {
    id: 'preset-payment-proof',
    category: 'Financial',
    name: 'Payment Proof / Official Cashier Receipt',
    description: 'Official assessment receipt, validated bank deposit slip, or online payment gateway transaction reference.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
    conditionalRule: {
      type: 'ALWAYS',
      operator: 'EQUALS',
      value: 'ALL',
      description: 'Always required for paid documents.',
    },
    ruleDescription: 'Always Required for Paid Requests',
  },
  {
    id: 'preset-library-clearance',
    category: 'Clearance',
    name: 'University Library Clearance',
    description: 'Signed clearance slip confirming no overdue books, unreturned journals, or unpaid library fines.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
    conditionalRule: {
      type: 'ALWAYS',
      operator: 'EQUALS',
      value: 'ALL',
    },
    ruleDescription: 'Standard Institutional Clearance',
  },
  {
    id: 'preset-accounting-clearance',
    category: 'Financial',
    name: 'Accounting & Cashier Zero-Balance Clearance',
    description: 'Official assessment slip showing zero outstanding tuition balance or payment receipt of graduation fee.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
    conditionalRule: {
      type: 'ALWAYS',
      operator: 'EQUALS',
      value: 'ALL',
    },
    ruleDescription: 'Financial Clearance',
  },
  {
    id: 'preset-dean-clearance',
    category: 'Clearance',
    name: 'Dean / Department Head Endorsement',
    description: 'Academic clearance signed by Department Chairperson or College Dean certifying curriculum completion.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
    conditionalRule: {
      type: 'ALWAYS',
      operator: 'EQUALS',
      value: 'ALL',
    },
    ruleDescription: 'Academic Endorsement',
  },
  {
    id: 'preset-affidavit-loss',
    category: 'Legal',
    name: 'Notarized Affidavit of Loss',
    description: 'Duly notarized legal affidavit stating the circumstances of the lost original diploma, transcript, or academic record.',
    isMandatory: true,
    fileType: 'PDF, JPG',
    maxFileSizeMb: 10,
    allowMultiple: false,
    conditionalRule: {
      type: 'PURPOSE',
      operator: 'CONTAINS',
      value: 'Lost Original Document / Replacement',
      description: 'Triggered when the request purpose is replacement of a lost document.',
    },
    ruleDescription: 'Conditional: Purpose is "Lost Document / Replacement"',
  },
  {
    id: 'preset-auth-letter',
    category: 'Legal',
    name: 'Signed Authorization Letter & Representative Valid ID',
    description: 'Signed letter of authorization with valid government-issued IDs of both the student and the authorized representative claiming the record.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 15,
    allowMultiple: true,
    conditionalRule: {
      type: 'RELEASE_METHOD',
      operator: 'CONTAINS',
      value: 'REPRESENTATIVE',
      description: 'Triggered when the claiming method is through an authorized representative.',
    },
    ruleDescription: 'Conditional: Release method is "Authorized Representative"',
  },
  {
    id: 'preset-psa-birth',
    category: 'Identity',
    name: 'PSA Authenticated Birth Certificate',
    description: 'Clear scan of Philippine Statistics Authority (PSA) issued Certificate of Live Birth with readable SECPA security paper.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
    conditionalRule: {
      type: 'ALWAYS',
      operator: 'EQUALS',
      value: 'ALL',
    },
    ruleDescription: 'Permanent Identity Proof',
  },
  {
    id: 'preset-id-photo',
    category: 'Identity',
    name: 'Formal 2x2 Studio ID Photo (White Background)',
    description: 'Recent studio photograph with plain white background, formal collared attire, and neutral facial expression.',
    isMandatory: true,
    fileType: 'JPG, PNG',
    maxFileSizeMb: 5,
    allowMultiple: false,
    conditionalRule: {
      type: 'ALWAYS',
      operator: 'EQUALS',
      value: 'ALL',
    },
    ruleDescription: 'Document Photo Affix',
  },
  {
    id: 'preset-form-137',
    category: 'Academic',
    name: 'High School Form 137 / SF10 Permanent Record',
    description: 'Certified True Copy of Secondary Student Permanent Record with copy for university notation.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 15,
    allowMultiple: false,
    conditionalRule: {
      type: 'STUDENT_STATUS',
      operator: 'CONTAINS',
      value: 'Undergraduate',
    },
    ruleDescription: 'Conditional: For Undergraduate / Transferee Admission',
  },
  {
    id: 'preset-honorable-dismissal',
    category: 'Academic',
    name: 'Certificate of Honorable Dismissal',
    description: 'Original transfer credential or certificate of honorable dismissal from previous tertiary institution.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 15,
    allowMultiple: false,
    conditionalRule: {
      type: 'PURPOSE',
      operator: 'CONTAINS',
      value: 'Transfer to Another School',
    },
    ruleDescription: 'Conditional: Purpose is "Transfer to Another School"',
  },
  {
    id: 'preset-clinic-clearance',
    category: 'Clearance',
    name: 'University Clinic Health & Dental Clearance',
    description: 'Medical certificate and dental record clearance from the campus health services unit.',
    isMandatory: false,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
    conditionalRule: {
      type: 'ALWAYS',
      operator: 'EQUALS',
      value: 'ALL',
    },
    ruleDescription: 'Optional Health Clearance',
  },
];

/**
 * Parse raw conditional rule string or object into structured ConditionalRuleConfig
 */
export function parseConditionalRule(rule: any): ConditionalRuleConfig | null {
  if (!rule) return null;
  if (typeof rule === 'object' && rule.type) {
    return rule as ConditionalRuleConfig;
  }
  if (typeof rule === 'string') {
    try {
      const parsed = JSON.parse(rule);
      if (parsed && typeof parsed === 'object' && parsed.type) {
        return parsed as ConditionalRuleConfig;
      }
    } catch {
      // String format shorthand parsing
      if (rule.toLowerCase().includes('lost') || rule.toLowerCase().includes('affidavit')) {
        return {
          type: 'PURPOSE',
          operator: 'CONTAINS',
          value: 'Lost Original Document / Replacement',
          description: 'Visible when purpose is Lost Document / Replacement',
        };
      }
      if (rule.toLowerCase().includes('representative') || rule.toLowerCase().includes('auth')) {
        return {
          type: 'RELEASE_METHOD',
          operator: 'CONTAINS',
          value: 'REPRESENTATIVE',
          description: 'Visible when claiming via Authorized Representative',
        };
      }
      if (rule.toLowerCase().includes('transfer')) {
        return {
          type: 'PURPOSE',
          operator: 'CONTAINS',
          value: 'Transfer to Another School',
          description: 'Visible when purpose is Transfer to Another School',
        };
      }
      if (rule.toLowerCase().includes('alumni') || rule.toLowerCase().includes('graduat')) {
        return {
          type: 'STUDENT_STATUS',
          operator: 'CONTAINS',
          value: 'Graduated / Alumni',
          description: 'Visible for Alumni / Graduates',
        };
      }
    }
  }
  return null;
}

/**
 * Formats a conditional rule into a human-readable badge/summary string
 */
export function formatConditionalRuleSummary(rule: any): { label: string; isConditional: boolean; badgeColor: string } {
  const parsed = parseConditionalRule(rule);
  if (!parsed || parsed.type === 'ALWAYS') {
    return {
      label: 'Always Required for All Applicants',
      isConditional: false,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  if (parsed.type === 'PURPOSE') {
    return {
      label: `Conditional: When Purpose includes "${Array.isArray(parsed.value) ? parsed.value.join(', ') : parsed.value}"`,
      isConditional: true,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  if (parsed.type === 'RELEASE_METHOD') {
    return {
      label: `Conditional: When Release Method is Representative / Courier`,
      isConditional: true,
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    };
  }

  if (parsed.type === 'STUDENT_STATUS') {
    return {
      label: `Conditional: When Student Status is "${Array.isArray(parsed.value) ? parsed.value.join(', ') : parsed.value}"`,
      isConditional: true,
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    };
  }

  if (parsed.type === 'PRIORITY') {
    return {
      label: `Conditional: When Priority is Rush / Express`,
      isConditional: true,
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  }

  return {
    label: parsed.description || 'Custom Conditional Visibility Rule',
    isConditional: true,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  };
}

/**
 * Evaluates whether a requirement is visible for a given student request context
 */
export function evaluateRequirementVisibility(
  req: DocumentRequirement | { conditional_rule?: any },
  context: StudentRequestContext
): boolean {
  const rule = parseConditionalRule(req.conditional_rule);
  if (!rule || rule.type === 'ALWAYS') {
    return true;
  }

  switch (rule.type) {
    case 'PURPOSE': {
      if (!context.purpose) return false;
      const target = Array.isArray(rule.value) ? rule.value : [rule.value];
      if (rule.operator === 'EQUALS') {
        return target.includes(context.purpose);
      }
      return target.some((v) => context.purpose!.toLowerCase().includes(v.toLowerCase()));
    }

    case 'RELEASE_METHOD': {
      if (!context.release_method) return false;
      const target = Array.isArray(rule.value) ? rule.value : [rule.value];
      if (rule.operator === 'EQUALS') {
        return target.includes(context.release_method);
      }
      return target.some((v) => context.release_method!.toUpperCase().includes(v.toUpperCase()));
    }

    case 'STUDENT_STATUS': {
      if (!context.student_status && !context.year_level) return true;
      const statusText = `${context.student_status || ''} ${context.year_level || ''}`.toLowerCase();
      const target = Array.isArray(rule.value) ? rule.value : [rule.value];
      return target.some((v) => statusText.includes(v.toLowerCase()));
    }

    case 'PRIORITY': {
      if (!context.priority) return false;
      return context.priority.toUpperCase() === 'HIGH' || context.priority.toUpperCase() === 'EXPRESS';
    }

    case 'CUSTOM':
    default:
      return true;
  }
}
