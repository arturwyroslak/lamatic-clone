// Template System for AI Agents and Workflows
export * from './agent-templates'
export * from './workflow-templates'
export * from './advanced-workflow-templates'
export * from './prompt-templates'
export * from './integration-templates'
export * from './marketplace'
export * from './industry-templates'

// Re-export key functions and types for workflow templates (avoiding conflicts)
export type { WorkflowTemplate, WorkflowNode, WorkflowVariable, WorkflowTrigger } from './workflow-templates'
export { 
  WORKFLOW_TEMPLATES, 
  WORKFLOW_CATEGORIES,
  getTemplatesByCategory,
  getFeaturedTemplates,
  getTemplatesByDifficulty,
  searchTemplates
} from './workflow-templates'

// Re-export advanced workflow templates
export { ADVANCED_WORKFLOW_TEMPLATES } from './advanced-workflow-templates'

// Re-export industry template functions
export {
  INDUSTRY_TEMPLATES,
  INDUSTRY_CATEGORIES,
  HEALTHCARE_TEMPLATES,
  FINANCE_TEMPLATES,
  LEGAL_TEMPLATES,
  EDUCATION_TEMPLATES,
  REAL_ESTATE_TEMPLATES,
  MANUFACTURING_TEMPLATES,
  getTemplatesByIndustry,
  getIndustryStats
} from './industry-templates'