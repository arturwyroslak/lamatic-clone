// Industry-specific workflow templates for common business automation scenarios
import { WorkflowTemplate } from './workflow-templates';

export interface IndustryWorkflowTemplate extends WorkflowTemplate {
  industry: string;
  compliance?: string[];
  regulations?: string[];
  integrations: string[];
}

export const HEALTHCARE_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: 'patient-intake-automation',
    name: 'Patient Intake Automation',
    description: 'Automate patient registration, insurance verification, and appointment scheduling',
    category: 'Healthcare',
    industry: 'Healthcare',
    tags: ['healthcare', 'patient-intake', 'hipaa', 'automation'],
    featured: true,
    difficulty: 'intermediate',
    estimatedTime: '30 minutes',
    compliance: ['HIPAA', 'HITECH'],
    regulations: ['CFR Title 45 Part 164'],
    integrations: ['epic', 'cerner', 'athenahealth', 'nextgen'],
    useCases: [
      'Automated patient form collection',
      'Insurance eligibility verification',
      'Appointment scheduling optimization',
      'Patient communication automation',
    ],
    nodes: [
      {
        id: 'patient-form-trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Patient Form Submitted',
          description: 'Triggers when patient completes intake form',
          config: {
            type: 'webhook',
            endpoint: '/webhooks/patient-intake',
            method: 'POST',
          },
        },
      },
      {
        id: 'validate-patient-data',
        type: 'condition',
        position: { x: 300, y: 100 },
        data: {
          title: 'Validate Patient Information',
          description: 'Validate required fields and data formats',
          config: {
            conditions: [
              { field: 'firstName', operator: 'exists' },
              { field: 'lastName', operator: 'exists' },
              { field: 'dob', operator: 'isDate' },
              { field: 'insurance.memberId', operator: 'exists' },
            ],
          },
        },
      },
      {
        id: 'insurance-verification',
        type: 'integration',
        position: { x: 500, y: 100 },
        data: {
          title: 'Verify Insurance Coverage',
          description: 'Check insurance eligibility and benefits',
          integration: 'clearinghouse',
          config: {
            action: 'verify_eligibility',
            timeout: 30000,
          },
        },
      },
      {
        id: 'schedule-appointment',
        type: 'integration',
        position: { x: 700, y: 100 },
        data: {
          title: 'Schedule Appointment',
          description: 'Book appointment in EHR system',
          integration: 'ehr',
          config: {
            action: 'create_appointment',
            department: 'primary_care',
          },
        },
      },
    ],
    connections: [
      {
        id: 'conn-1',
        source: 'patient-form-trigger',
        target: 'validate-patient-data',
      },
      {
        id: 'conn-2',
        source: 'validate-patient-data',
        target: 'insurance-verification',
        condition: 'validation.success === true',
      },
      {
        id: 'conn-3',
        source: 'insurance-verification',
        target: 'schedule-appointment',
        condition: 'insurance.eligible === true',
      },
    ],
    variables: [
      {
        id: 'appointment-duration',
        name: 'Default Appointment Duration',
        type: 'number',
        defaultValue: 30,
        description: 'Default appointment length in minutes',
        required: true,
      },
    ],
    triggers: [
      {
        id: 'intake-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/patient-intake',
          method: 'POST',
          authentication: 'hmac',
        },
      },
    ],
  },
  {
    id: 'clinical-decision-support',
    name: 'Clinical Decision Support Workflow',
    description: 'AI-powered clinical decision support with drug interaction checking and treatment recommendations',
    category: 'Healthcare',
    industry: 'Healthcare',
    tags: ['clinical-decision', 'ai-assistance', 'drug-interactions', 'treatment-recommendations'],
    featured: true,
    difficulty: 'advanced',
    estimatedTime: '45 minutes',
    compliance: ['HIPAA', 'FDA Guidelines'],
    regulations: ['21 CFR Part 820', 'IEC 62304'],
    integrations: ['epic', 'cerner', 'fda_orange_book', 'clinical_databases'],
    useCases: [
      'Drug interaction checking',
      'Treatment protocol recommendations',
      'Clinical alert generation',
      'Evidence-based decision support',
    ],
    nodes: [
      {
        id: 'patient-data-input',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Patient Data Updated',
          description: 'Triggered when patient clinical data is updated',
          config: {
            type: 'ehr_webhook',
            events: ['diagnosis_added', 'medication_prescribed', 'lab_results_added'],
          },
        },
      },
      {
        id: 'extract-clinical-data',
        type: 'action',
        position: { x: 300, y: 100 },
        data: {
          title: 'Extract Clinical Information',
          description: 'Parse and structure clinical data from EHR',
          config: {
            fields: ['diagnoses', 'medications', 'allergies', 'lab_results', 'vital_signs'],
            format: 'structured_json',
          },
        },
      },
      {
        id: 'drug-interaction-check',
        type: 'integration',
        position: { x: 500, y: 50 },
        data: {
          title: 'Check Drug Interactions',
          description: 'Analyze potential drug-drug interactions',
          integration: 'drug_interaction_api',
          config: {
            severity_threshold: 'moderate',
            include_contraindications: true,
          },
        },
      },
      {
        id: 'clinical-ai-analysis',
        type: 'agent',
        position: { x: 500, y: 150 },
        data: {
          title: 'AI Clinical Analysis',
          description: 'AI-powered clinical decision support',
          agent: 'clinical_decision_ai',
          config: {
            model: 'medical_gpt_4',
            include_guidelines: true,
            evidence_level: 'high',
          },
        },
      },
    ],
    connections: [
      {
        id: 'conn-1',
        source: 'patient-data-input',
        target: 'extract-clinical-data',
      },
      {
        id: 'conn-2',
        source: 'extract-clinical-data',
        target: 'drug-interaction-check',
      },
      {
        id: 'conn-3',
        source: 'extract-clinical-data',
        target: 'clinical-ai-analysis',
      },
    ],
    variables: [
      {
        id: 'alert-severity-threshold',
        name: 'Alert Severity Threshold',
        type: 'string',
        defaultValue: 'moderate',
        description: 'Minimum severity level for clinical alerts',
        required: true,
      },
    ],
    triggers: [
      {
        id: 'ehr-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/ehr-update',
          method: 'POST',
          authentication: 'oauth2',
        },
      },
    ],
  },
];

export const FINANCE_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: 'automated-loan-processing',
    name: 'Automated Loan Processing',
    description: 'Complete loan application processing with credit checks, risk assessment, and approval workflows',
    category: 'Finance',
    industry: 'Finance',
    tags: ['finance', 'loans', 'credit-scoring', 'risk-assessment'],
    featured: true,
    difficulty: 'advanced',
    estimatedTime: '45 minutes',
    compliance: ['SOX', 'GDPR', 'PCI-DSS', 'FCRA'],
    regulations: ['Fair Credit Reporting Act', 'Equal Credit Opportunity Act', 'Truth in Lending Act'],
    integrations: ['experian', 'equifax', 'transunion', 'plaid', 'yodlee'],
    useCases: [
      'Automated credit score retrieval',
      'Income verification through bank connections',
      'AI-powered risk assessment',
      'Automated approval/rejection decisions',
      'Compliance documentation generation',
    ],
    nodes: [
      {
        id: 'loan-application-received',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Loan Application Received',
          description: 'New loan application submitted through web portal',
          config: {
            type: 'webhook',
            endpoint: '/webhooks/loan-application',
            validation_schema: 'loan_application_v1',
          },
        },
      },
      {
        id: 'identity-verification',
        type: 'integration',
        position: { x: 300, y: 50 },
        data: {
          title: 'Identity Verification',
          description: 'Verify applicant identity using KYC services',
          integration: 'jumio_kyc',
          config: {
            verification_level: 'standard',
            document_types: ['drivers_license', 'passport', 'state_id'],
          },
        },
      },
      {
        id: 'credit-bureau-check',
        type: 'integration',
        position: { x: 300, y: 150 },
        data: {
          title: 'Credit Bureau Check',
          description: 'Retrieve credit score and report from multiple bureaus',
          integration: 'credit_bureau_aggregator',
          config: {
            bureaus: ['experian', 'equifax', 'transunion'],
            report_type: 'tri_merge',
          },
        },
      },
      {
        id: 'income-verification',
        type: 'integration',
        position: { x: 500, y: 100 },
        data: {
          title: 'Income Verification',
          description: 'Verify income through bank account analysis',
          integration: 'plaid',
          config: {
            analysis_period_months: 6,
            income_categories: ['salary', 'freelance', 'investments'],
          },
        },
      },
      {
        id: 'ai-risk-assessment',
        type: 'agent',
        position: { x: 700, y: 100 },
        data: {
          title: 'AI Risk Assessment',
          description: 'Calculate loan risk using machine learning model',
          agent: 'credit_risk_analyzer',
          config: {
            model_version: 'risk_model_v3.2',
            risk_factors: ['credit_score', 'income_stability', 'debt_to_income', 'employment_history'],
            output_format: 'risk_score_with_explanation',
          },
        },
      },
    ],
    connections: [
      {
        id: 'conn-1',
        source: 'loan-application-received',
        target: 'identity-verification',
      },
      {
        id: 'conn-2',
        source: 'loan-application-received',
        target: 'credit-bureau-check',
      },
      {
        id: 'conn-3',
        source: 'identity-verification',
        target: 'income-verification',
        condition: 'identity_verification.status === "verified"',
      },
      {
        id: 'conn-4',
        source: 'credit-bureau-check',
        target: 'ai-risk-assessment',
      },
      {
        id: 'conn-5',
        source: 'income-verification',
        target: 'ai-risk-assessment',
      },
    ],
    variables: [
      {
        id: 'min-credit-score',
        name: 'Minimum Credit Score',
        type: 'number',
        defaultValue: 650,
        description: 'Minimum credit score for loan approval consideration',
        required: true,
      },
      {
        id: 'max-debt-to-income',
        name: 'Maximum Debt-to-Income Ratio',
        type: 'number',
        defaultValue: 0.43,
        description: 'Maximum acceptable debt-to-income ratio',
        required: true,
      },
      {
        id: 'loan-amount-limit',
        name: 'Maximum Loan Amount',
        type: 'number',
        defaultValue: 500000,
        description: 'Maximum loan amount for automated processing',
        required: true,
      },
    ],
    triggers: [
      {
        id: 'application-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/loan-application',
          method: 'POST',
          authentication: 'oauth2',
          rate_limit: '100/hour',
        },
      },
    ],
  },
];

export const LEGAL_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: 'contract-review-automation',
    name: 'AI-Powered Contract Review',
    description: 'Automated contract analysis with clause extraction, risk assessment, and compliance checking',
    category: 'Legal',
    industry: 'Legal',
    tags: ['legal', 'contracts', 'ai-analysis', 'compliance', 'risk-assessment'],
    featured: true,
    difficulty: 'advanced',
    estimatedTime: '40 minutes',
    compliance: ['Attorney-Client Privilege', 'Bar Association Rules'],
    regulations: ['State Bar Regulations', 'ABA Model Rules'],
    integrations: ['docusign', 'adobe_sign', 'lawgeex', 'kira_systems'],
    useCases: [
      'Automated contract clause extraction',
      'Risk identification and flagging',
      'Compliance checking against templates',
      'Approval workflow routing',
      'Contract comparison and analysis',
    ],
    nodes: [
      {
        id: 'contract-upload',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Contract Document Uploaded',
          description: 'New contract document received for review',
          config: {
            type: 'file_upload',
            accepted_types: ['pdf', 'docx', 'doc'],
            max_file_size: '50MB',
            encryption: 'AES-256',
          },
        },
      },
      {
        id: 'document-processing',
        type: 'tool',
        position: { x: 300, y: 100 },
        data: {
          title: 'Extract Contract Text',
          description: 'Convert document to structured text for analysis',
          tool: 'advanced_ocr',
          config: {
            language: 'en',
            preserve_formatting: true,
            extract_tables: true,
            confidence_threshold: 0.95,
          },
        },
      },
      {
        id: 'clause-extraction',
        type: 'agent',
        position: { x: 500, y: 50 },
        data: {
          title: 'AI Clause Extraction',
          description: 'Extract and categorize contract clauses',
          agent: 'legal_clause_extractor',
          config: {
            model: 'legal_gpt_4',
            clause_types: ['payment_terms', 'termination', 'liability', 'intellectual_property', 'confidentiality'],
            extraction_confidence: 0.8,
          },
        },
      },
      {
        id: 'risk-analysis',
        type: 'agent',
        position: { x: 500, y: 150 },
        data: {
          title: 'Legal Risk Assessment',
          description: 'Analyze contract for potential legal risks',
          agent: 'legal_risk_analyzer',
          config: {
            risk_categories: ['financial', 'operational', 'compliance', 'reputation'],
            severity_levels: ['low', 'medium', 'high', 'critical'],
            jurisdiction: 'US',
          },
        },
      },
      {
        id: 'compliance-check',
        type: 'condition',
        position: { x: 700, y: 100 },
        data: {
          title: 'Compliance Verification',
          description: 'Check contract against compliance requirements',
          config: {
            compliance_frameworks: ['SOX', 'GDPR', 'CCPA'],
            required_clauses: ['data_protection', 'audit_rights', 'termination_notice'],
            auto_flag_violations: true,
          },
        },
      },
    ],
    connections: [
      {
        id: 'conn-1',
        source: 'contract-upload',
        target: 'document-processing',
      },
      {
        id: 'conn-2',
        source: 'document-processing',
        target: 'clause-extraction',
      },
      {
        id: 'conn-3',
        source: 'document-processing',
        target: 'risk-analysis',
      },
      {
        id: 'conn-4',
        source: 'clause-extraction',
        target: 'compliance-check',
      },
      {
        id: 'conn-5',
        source: 'risk-analysis',
        target: 'compliance-check',
      },
    ],
    variables: [
      {
        id: 'risk-threshold',
        name: 'Risk Alert Threshold',
        type: 'string',
        defaultValue: 'medium',
        description: 'Minimum risk level to trigger alerts',
        required: true,
      },
      {
        id: 'auto-approval-limit',
        name: 'Auto-Approval Risk Limit',
        type: 'string',
        defaultValue: 'low',
        description: 'Maximum risk level for automatic approval',
        required: true,
      },
    ],
    triggers: [
      {
        id: 'document-upload',
        type: 'file_upload',
        config: {
          endpoint: '/upload/contract',
          max_size: '50MB',
          encryption: 'AES-256',
          virus_scan: true,
        },
      },
    ],
  },
];

export const EDUCATION_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: 'student-enrollment-processing',
    name: 'Automated Student Enrollment',
    description: 'Streamline student applications, document verification, and enrollment workflows',
    category: 'Education',
    industry: 'Education',
    tags: ['education', 'enrollment', 'ferpa', 'student-records'],
    featured: true,
    difficulty: 'intermediate',
    estimatedTime: '35 minutes',
    compliance: ['FERPA', 'COPPA'],
    regulations: ['Family Educational Rights and Privacy Act', 'Section 504'],
    integrations: ['powerschool', 'blackboard', 'canvas', 'schoology'],
    useCases: [
      'Automated application processing',
      'Transcript verification',
      'Course recommendation engine',
      'Financial aid eligibility checking',
      'Enrollment confirmation workflow',
    ],
    nodes: [
      {
        id: 'application-submitted',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Student Application Submitted',
          description: 'New student enrollment application received',
          config: {
            type: 'form_submission',
            form_id: 'student_application_v2',
            required_documents: ['transcript', 'recommendation_letters', 'essay'],
          },
        },
      },
      {
        id: 'document-verification',
        type: 'integration',
        position: { x: 300, y: 100 },
        data: {
          title: 'Verify Academic Documents',
          description: 'Verify transcripts and academic credentials',
          integration: 'national_clearinghouse',
          config: {
            verification_types: ['degree_verification', 'enrollment_verification'],
            turnaround_time: '24_hours',
          },
        },
      },
      {
        id: 'ai-application-review',
        type: 'agent',
        position: { x: 500, y: 100 },
        data: {
          title: 'AI Application Assessment',
          description: 'AI-powered holistic application review',
          agent: 'admissions_ai',
          config: {
            evaluation_criteria: ['academic_performance', 'extracurriculars', 'essay_quality', 'fit_assessment'],
            scoring_model: 'holistic_v2.1',
          },
        },
      },
    ],
    connections: [
      {
        id: 'conn-1',
        source: 'application-submitted',
        target: 'document-verification',
      },
      {
        id: 'conn-2',
        source: 'document-verification',
        target: 'ai-application-review',
        condition: 'documents.verified === true',
      },
    ],
    variables: [
      {
        id: 'gpa-threshold',
        name: 'Minimum GPA Requirement',
        type: 'number',
        defaultValue: 3.0,
        description: 'Minimum GPA for admission consideration',
        required: true,
      },
    ],
    triggers: [
      {
        id: 'application-form',
        type: 'form_submission',
        config: {
          form_id: 'student_application_v2',
          validation_required: true,
          ferpa_compliance: true,
        },
      },
    ],
  },
];

// Export all industry workflow templates
export const INDUSTRY_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  ...HEALTHCARE_WORKFLOW_TEMPLATES,
  ...FINANCE_WORKFLOW_TEMPLATES,
  ...LEGAL_WORKFLOW_TEMPLATES,
  ...EDUCATION_WORKFLOW_TEMPLATES,
];

export const WORKFLOW_INDUSTRY_CATEGORIES = [
  'Healthcare',
  'Finance',
  'Legal',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Retail',
  'Technology',
] as const;

// Helper functions
export function getWorkflowTemplatesByIndustry(industry: string): IndustryWorkflowTemplate[] {
  return INDUSTRY_WORKFLOW_TEMPLATES.filter(template => template.industry === industry);
}

export function getIndustryWorkflowStats() {
  const stats: Record<string, number> = {};
  
  WORKFLOW_INDUSTRY_CATEGORIES.forEach(industry => {
    stats[industry] = INDUSTRY_WORKFLOW_TEMPLATES.filter(t => t.industry === industry).length;
  });
  
  return stats;
}