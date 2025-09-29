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

// Real Estate Workflow Templates
const REAL_ESTATE_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: 'property-listing-automation',
    name: 'Automated Property Listing & Marketing',
    description: 'Streamline property listing creation, pricing analysis, and multi-channel marketing',
    industry: 'Real Estate',
    category: 'Property Management',
    tags: ['real-estate', 'property', 'marketing', 'automation', 'pricing'],
    featured: true,
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    compliance: ['MLS Standards', 'Fair Housing Act', 'State Disclosure Requirements'],
    integrations: ['mls_systems', 'zillow_api', 'social_media_scheduler', 'email_marketing'],
    useCases: [
      'Automated property description generation',
      'Competitive market analysis',
      'Multi-platform listing distribution',
      'Lead capture and nurturing',
      'Virtual tour scheduling',
    ],
    nodes: [
      {
        id: 'property-data-input',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Property Information Uploaded',
          description: 'New property details and photos uploaded by agent',
          config: {
            type: 'file_upload',
            accepted_files: ['images', 'floor_plans', 'documents'],
            required_fields: ['address', 'price', 'bedrooms', 'bathrooms', 'sqft'],
          },
        },
      },
      {
        id: 'ai-description-generation',
        type: 'agent',
        position: { x: 300, y: 50 },
        data: {
          title: 'Generate Property Description',
          description: 'AI-powered compelling property description creation',
          agent: 'real_estate_copywriter',
          config: {
            style: 'compelling_marketing',
            include_features: ['location_benefits', 'unique_selling_points', 'lifestyle_appeal'],
            word_limit: 200,
          },
        },
      },
      {
        id: 'market-analysis',
        type: 'integration',
        position: { x: 300, y: 150 },
        data: {
          title: 'Comparative Market Analysis',
          description: 'Analyze comparable properties and suggest pricing',
          integration: 'mls_comp_analysis',
          config: {
            radius_miles: 1,
            time_range_months: 6,
            property_type_match: true,
          },
        },
      },
      {
        id: 'multi-platform-listing',
        type: 'integration',
        position: { x: 500, y: 100 },
        data: {
          title: 'Distribute to Multiple Platforms',
          description: 'Automatically post to MLS, Zillow, Realtor.com, social media',
          integration: 'listing_distributor',
          config: {
            platforms: ['mls', 'zillow', 'realtor_com', 'facebook', 'instagram'],
            schedule_optimal_times: true,
          },
        },
      },
    ],
    connections: [
      { id: 'conn-1', source: 'property-data-input', target: 'ai-description-generation' },
      { id: 'conn-2', source: 'property-data-input', target: 'market-analysis' },
      { id: 'conn-3', source: 'ai-description-generation', target: 'multi-platform-listing' },
      { id: 'conn-4', source: 'market-analysis', target: 'multi-platform-listing' },
    ],
    variables: [
      { id: 'property_address', name: 'Property Address', type: 'string', required: true },
      { id: 'listing_price', name: 'Listing Price', type: 'number', required: true },
      { id: 'agent_contact', name: 'Agent Contact Info', type: 'object', required: true },
    ],
    triggers: [
      {
        id: 'property-upload',
        type: 'file_upload',
        config: {
          webhook_endpoint: '/webhooks/property-upload',
          authentication_required: true,
        },
      },
    ],
  },
];

// Manufacturing Workflow Templates
const MANUFACTURING_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: 'quality-control-inspection',
    name: 'Automated Quality Control & Inspection',
    description: 'AI-powered quality control with predictive maintenance and compliance reporting',
    industry: 'Manufacturing',
    category: 'Quality Assurance',
    tags: ['manufacturing', 'quality-control', 'inspection', 'automation', 'compliance'],
    featured: true,
    difficulty: 'advanced',
    estimatedTime: '35 minutes',
    compliance: ['ISO 9001', 'ISO 14001', 'OSHA Standards', 'FDA Regulations'],
    integrations: ['iot_sensors', 'computer_vision', 'erp_systems', 'maintenance_management'],
    useCases: [
      'Automated defect detection using computer vision',
      'Predictive maintenance scheduling',
      'Compliance documentation generation',
      'Supply chain quality monitoring',
      'Real-time production analytics',
    ],
    nodes: [
      {
        id: 'sensor-data-stream',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'IoT Sensor Data Stream',
          description: 'Continuous monitoring of production line sensors',
          config: {
            type: 'iot_stream',
            sensors: ['temperature', 'pressure', 'vibration', 'speed'],
            sampling_rate: '1_second',
          },
        },
      },
      {
        id: 'computer-vision-inspection',
        type: 'agent',
        position: { x: 300, y: 50 },
        data: {
          title: 'Visual Quality Inspection',
          description: 'AI-powered visual defect detection',
          agent: 'quality_vision_inspector',
          config: {
            models: ['defect_detection_v3', 'dimensional_analysis_v2'],
            confidence_threshold: 0.95,
            inspection_types: ['surface_defects', 'dimensional_accuracy', 'assembly_completeness'],
          },
        },
      },
      {
        id: 'predictive-maintenance',
        type: 'agent',
        position: { x: 300, y: 150 },
        data: {
          title: 'Predictive Maintenance Analysis',
          description: 'Predict equipment maintenance needs using ML',
          agent: 'maintenance_predictor',
          config: {
            algorithms: ['time_series_analysis', 'anomaly_detection', 'failure_prediction'],
            maintenance_window: '7_days',
          },
        },
      },
      {
        id: 'compliance-reporting',
        type: 'integration',
        position: { x: 500, y: 100 },
        data: {
          title: 'Generate Compliance Reports',
          description: 'Automated quality and compliance documentation',
          integration: 'compliance_reporter',
          config: {
            report_types: ['quality_metrics', 'maintenance_logs', 'incident_reports'],
            schedule: 'daily',
            distribution: ['quality_manager', 'compliance_officer'],
          },
        },
      },
    ],
    connections: [
      { id: 'conn-1', source: 'sensor-data-stream', target: 'computer-vision-inspection' },
      { id: 'conn-2', source: 'sensor-data-stream', target: 'predictive-maintenance' },
      { id: 'conn-3', source: 'computer-vision-inspection', target: 'compliance-reporting' },
      { id: 'conn-4', source: 'predictive-maintenance', target: 'compliance-reporting' },
    ],
    variables: [
      { id: 'production_line_id', name: 'Production Line ID', type: 'string', required: true },
      { id: 'quality_standards', name: 'Quality Standards', type: 'object', required: true },
      { id: 'maintenance_schedule', name: 'Maintenance Schedule', type: 'array', required: true },
    ],
    triggers: [
      {
        id: 'iot-data-stream',
        type: 'iot_stream',
        config: {
          protocol: 'mqtt',
          topics: ['sensors/temperature', 'sensors/pressure', 'cameras/quality'],
        },
      },
    ],
  },
];

// Retail & E-commerce Workflow Templates
const RETAIL_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: 'customer-journey-optimization',
    name: 'AI-Powered Customer Journey Optimization',
    description: 'Personalize customer experience with AI-driven recommendations and automated support',
    industry: 'Retail',
    category: 'Customer Experience',
    tags: ['retail', 'customer-experience', 'personalization', 'ai', 'optimization'],
    featured: true,
    difficulty: 'intermediate',
    estimatedTime: '25 minutes',
    compliance: ['GDPR', 'CCPA', 'PCI DSS', 'Accessibility Standards'],
    integrations: ['ecommerce_platform', 'customer_data_platform', 'email_marketing', 'analytics'],
    useCases: [
      'Personalized product recommendations',
      'Abandoned cart recovery',
      'Dynamic pricing optimization',
      'Customer support automation',
      'Inventory demand forecasting',
    ],
    nodes: [
      {
        id: 'customer-interaction',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Customer Interaction Detected',
          description: 'Track customer behavior across all touchpoints',
          config: {
            type: 'behavioral_tracking',
            events: ['page_view', 'product_view', 'cart_add', 'purchase', 'support_inquiry'],
            real_time: true,
          },
        },
      },
      {
        id: 'ai-personalization',
        type: 'agent',
        position: { x: 300, y: 50 },
        data: {
          title: 'Personalized Recommendations',
          description: 'AI-driven product and content personalization',
          agent: 'recommendation_engine',
          config: {
            algorithms: ['collaborative_filtering', 'content_based', 'deep_learning'],
            recommendation_types: ['products', 'content', 'offers'],
            real_time_scoring: true,
          },
        },
      },
      {
        id: 'dynamic-pricing',
        type: 'agent',
        position: { x: 300, y: 150 },
        data: {
          title: 'Dynamic Pricing Optimization',
          description: 'AI-powered price optimization based on demand and competition',
          agent: 'pricing_optimizer',
          config: {
            factors: ['demand', 'competition', 'inventory', 'customer_segment'],
            update_frequency: 'hourly',
            profit_margin_protection: true,
          },
        },
      },
      {
        id: 'automated-marketing',
        type: 'integration',
        position: { x: 500, y: 100 },
        data: {
          title: 'Trigger Automated Marketing',
          description: 'Send personalized emails, push notifications, and ads',
          integration: 'marketing_automation',
          config: {
            channels: ['email', 'sms', 'push_notification', 'social_ads'],
            personalization_level: 'individual',
            a_b_testing: true,
          },
        },
      },
    ],
    connections: [
      { id: 'conn-1', source: 'customer-interaction', target: 'ai-personalization' },
      { id: 'conn-2', source: 'customer-interaction', target: 'dynamic-pricing' },
      { id: 'conn-3', source: 'ai-personalization', target: 'automated-marketing' },
      { id: 'conn-4', source: 'dynamic-pricing', target: 'automated-marketing' },
    ],
    variables: [
      { id: 'customer_id', name: 'Customer ID', type: 'string', required: true },
      { id: 'session_id', name: 'Session ID', type: 'string', required: true },
      { id: 'product_catalog', name: 'Product Catalog', type: 'array', required: true },
    ],
    triggers: [
      {
        id: 'customer-behavior',
        type: 'behavioral_tracking',
        config: {
          tracking_script: 'customer_journey_v2.js',
          privacy_compliant: true,
        },
      },
    ],
  },
];

// Technology & SaaS Workflow Templates
const TECHNOLOGY_WORKFLOW_TEMPLATES: IndustryWorkflowTemplate[] = [
  {
    id: 'devops-ci-cd-pipeline',
    name: 'Intelligent DevOps CI/CD Pipeline',
    description: 'AI-enhanced continuous integration and deployment with security scanning and performance monitoring',
    industry: 'Technology',
    category: 'Software Development',
    tags: ['devops', 'ci-cd', 'security', 'automation', 'deployment'],
    featured: true,
    difficulty: 'advanced',
    estimatedTime: '45 minutes',
    compliance: ['SOC 2', 'ISO 27001', 'GDPR', 'Security Standards'],
    integrations: ['github', 'docker', 'kubernetes', 'security_scanners', 'monitoring_tools'],
    useCases: [
      'Automated code quality analysis',
      'Security vulnerability scanning',
      'Intelligent deployment decisions',
      'Performance regression detection',
      'Automated rollback on issues',
    ],
    nodes: [
      {
        id: 'code-commit',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Code Commit Detected',
          description: 'New code pushed to repository triggers pipeline',
          config: {
            type: 'git_webhook',
            branches: ['main', 'develop', 'feature/*'],
            events: ['push', 'pull_request'],
          },
        },
      },
      {
        id: 'ai-code-review',
        type: 'agent',
        position: { x: 300, y: 50 },
        data: {
          title: 'AI Code Quality Analysis',
          description: 'Automated code review using AI',
          agent: 'code_reviewer_ai',
          config: {
            analysis_types: ['code_quality', 'security_vulnerabilities', 'performance_issues'],
            languages: ['typescript', 'python', 'go', 'java'],
            quality_gate_threshold: 0.8,
          },
        },
      },
      {
        id: 'security-scanning',
        type: 'integration',
        position: { x: 300, y: 150 },
        data: {
          title: 'Security Vulnerability Scan',
          description: 'Comprehensive security analysis of code and dependencies',
          integration: 'security_scanner',
          config: {
            scan_types: ['sast', 'dast', 'dependency_check', 'container_scan'],
            severity_threshold: 'medium',
            fail_on_critical: true,
          },
        },
      },
      {
        id: 'intelligent-deployment',
        type: 'agent',
        position: { x: 500, y: 100 },
        data: {
          title: 'Intelligent Deployment Decision',
          description: 'AI decides optimal deployment strategy and timing',
          agent: 'deployment_strategist',
          config: {
            deployment_types: ['blue_green', 'canary', 'rolling_update'],
            factors: ['code_quality', 'security_score', 'system_load', 'business_hours'],
            rollback_triggers: ['error_rate_increase', 'performance_degradation'],
          },
        },
      },
    ],
    connections: [
      { id: 'conn-1', source: 'code-commit', target: 'ai-code-review' },
      { id: 'conn-2', source: 'code-commit', target: 'security-scanning' },
      { id: 'conn-3', source: 'ai-code-review', target: 'intelligent-deployment', condition: 'quality_score >= 0.8' },
      { id: 'conn-4', source: 'security-scanning', target: 'intelligent-deployment', condition: 'security_score >= 0.9' },
    ],
    variables: [
      { id: 'repository_url', name: 'Repository URL', type: 'string', required: true },
      { id: 'deployment_environment', name: 'Deployment Environment', type: 'string', required: true },
      { id: 'quality_thresholds', name: 'Quality Thresholds', type: 'object', required: true },
    ],
    triggers: [
      {
        id: 'git-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/git-commit',
          authentication: 'token_based',
          retry_policy: 'exponential_backoff',
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
  ...REAL_ESTATE_WORKFLOW_TEMPLATES,
  ...MANUFACTURING_WORKFLOW_TEMPLATES,
  ...RETAIL_WORKFLOW_TEMPLATES,
  ...TECHNOLOGY_WORKFLOW_TEMPLATES,
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