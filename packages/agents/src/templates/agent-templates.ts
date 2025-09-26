// Pre-built Agent Templates - Complete template marketplace
import { AgentConfig } from '../types'

export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  icon: string
  config: AgentConfig
  variables?: Record<string, any>
  examples?: Array<{ name: string; input: any; expectedOutput: string }>
  rating: number
  downloads: number
  featured: boolean
  author: { name: string; verified: boolean }
  createdAt: Date
  updatedAt: Date
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Professional content writer for blogs, articles, and marketing copy',
    category: 'content',
    tags: ['writing', 'marketing', 'content', 'seo'],
    icon: 'edit-icon',
    config: {
      type: 'text',
      name: 'Content Writer',
      description: 'Writes high-quality content for various purposes',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a professional content writer with expertise in creating engaging, SEO-optimized content.',
      capabilities: ['writing', 'seo', 'research', 'editing']
    },
    rating: 4.8,
    downloads: 15420,
    featured: true,
    author: { name: 'Lamatic Team', verified: true },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'Intelligent customer support agent for handling inquiries',
    category: 'support',
    tags: ['support', 'customer service', 'helpdesk'],
    icon: 'support-icon',
    config: {
      type: 'chat',
      name: 'Customer Support Agent',  
      description: 'Provides helpful customer support responses',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000,
      systemPrompt: 'You are a helpful customer support agent. Always be polite, empathetic, and solution-focused.',
      capabilities: ['conversation', 'problem-solving', 'escalation']
    },
    rating: 4.9,
    downloads: 23150,
    featured: true,
    author: { name: 'Lamatic Team', verified: true },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'sales-assistant',
    name: 'Sales Assistant',
    description: 'AI-powered sales assistant for lead qualification and outreach',
    category: 'sales',
    tags: ['sales', 'lead-generation', 'outreach', 'qualification'],
    icon: 'sales-icon',
    config: {
      type: 'chat',
      name: 'Sales Assistant',
      description: 'Helps with lead qualification and sales outreach',
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 1500,
      systemPrompt: 'You are an expert sales assistant. Focus on qualifying leads, understanding customer needs, and providing value-driven solutions.',
      capabilities: ['lead-qualification', 'objection-handling', 'proposal-generation']
    },
    rating: 4.7,
    downloads: 18900,
    featured: true,
    author: { name: 'Lamatic Team', verified: true },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Automated code review agent for quality assurance and best practices',
    category: 'development',
    tags: ['code-review', 'programming', 'quality-assurance', 'best-practices'],
    icon: 'code-icon',
    config: {
      type: 'code',
      name: 'Code Reviewer',
      description: 'Reviews code for quality, security, and best practices',
      model: 'gpt-4',
      temperature: 0.2,
      maxTokens: 2000,
      systemPrompt: 'You are an expert code reviewer. Analyze code for bugs, security issues, performance problems, and adherence to best practices. Provide constructive feedback.',
      capabilities: ['security-analysis', 'performance-review', 'best-practices', 'bug-detection']
    },
    rating: 4.9,
    downloads: 12750,
    featured: true,
    author: { name: 'DevOps Team', verified: true },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'AI data analyst for insights, visualization recommendations, and reporting',
    category: 'analytics',
    tags: ['data-analysis', 'insights', 'reporting', 'visualization'],
    icon: 'chart-icon',
    config: {
      type: 'analysis',
      name: 'Data Analyst',
      description: 'Analyzes data and provides actionable insights',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2500,
      systemPrompt: 'You are a professional data analyst. Analyze data patterns, identify trends, and provide clear, actionable insights. Suggest appropriate visualizations and highlight key findings.',
      capabilities: ['data-analysis', 'trend-identification', 'visualization-recommendations', 'statistical-analysis']
    },
    rating: 4.8,
    downloads: 9800,
    featured: true,
    author: { name: 'Analytics Team', verified: true },
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-26')
  },
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    description: 'Creates engaging social media content and manages posting schedules',
    category: 'marketing',
    tags: ['social-media', 'content-creation', 'engagement', 'marketing'],
    icon: 'social-icon',
    config: {
      type: 'content',
      name: 'Social Media Manager',
      description: 'Creates and optimizes social media content',
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 1000,
      systemPrompt: 'You are a creative social media manager. Create engaging, platform-specific content that drives engagement and builds brand awareness. Include relevant hashtags and calls-to-action.',
      capabilities: ['content-creation', 'hashtag-optimization', 'engagement-strategy', 'brand-voice']
    },
    rating: 4.6,
    downloads: 14200,
    featured: false,
    author: { name: 'Marketing Team', verified: true },
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-24')
  },
  {
    id: 'legal-document-reviewer',
    name: 'Legal Document Reviewer',
    description: 'Reviews legal documents for key terms, risks, and compliance issues',
    category: 'legal',
    tags: ['legal', 'document-review', 'compliance', 'contracts'],
    icon: 'legal-icon',
    config: {
      type: 'analysis',
      name: 'Legal Document Reviewer',
      description: 'Analyzes legal documents for risks and compliance',
      model: 'gpt-4',
      temperature: 0.1,
      maxTokens: 3000,
      systemPrompt: 'You are a legal document reviewer. Analyze contracts and legal documents for key terms, potential risks, compliance issues, and unusual clauses. Provide clear summaries and flag important items.',
      capabilities: ['contract-analysis', 'risk-assessment', 'compliance-checking', 'term-extraction']
    },
    rating: 4.9,
    downloads: 6500,
    featured: false,
    author: { name: 'Legal Team', verified: true },
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-27')
  },
  {
    id: 'hr-recruiter',
    name: 'HR Recruiter Assistant',
    description: 'Screens resumes, schedules interviews, and manages candidate communications',
    category: 'hr',
    tags: ['hr', 'recruiting', 'resume-screening', 'interviews'],
    icon: 'hr-icon',
    config: {
      type: 'chat',
      name: 'HR Recruiter Assistant',
      description: 'Assists with recruitment and candidate management',
      model: 'gpt-4',
      temperature: 0.4,
      maxTokens: 1500,
      systemPrompt: 'You are an HR recruiting assistant. Help screen candidates, evaluate resumes against job requirements, schedule interviews, and maintain professional communication with candidates.',
      capabilities: ['resume-screening', 'candidate-evaluation', 'interview-scheduling', 'communication-management']
    },
    rating: 4.7,
    downloads: 8900,
    featured: false,
    author: { name: 'HR Team', verified: true },
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-29')
  },
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    description: 'Analyzes financial data, creates reports, and provides investment insights',
    category: 'finance',
    tags: ['finance', 'analysis', 'reporting', 'investments'],
    icon: 'finance-icon',
    config: {
      type: 'analysis',
      name: 'Financial Analyst',
      description: 'Provides financial analysis and insights',
      model: 'gpt-4',
      temperature: 0.2,
      maxTokens: 2000,
      systemPrompt: 'You are a financial analyst. Analyze financial data, create comprehensive reports, identify trends, and provide investment recommendations. Focus on accuracy and clear explanations.',
      capabilities: ['financial-modeling', 'risk-analysis', 'investment-research', 'report-generation']
    },
    rating: 4.8,
    downloads: 7200,
    featured: false,
    author: { name: 'Finance Team', verified: true },
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'product-manager',
    name: 'Product Manager Assistant',
    description: 'Helps with product strategy, roadmap planning, and feature prioritization',
    category: 'product',
    tags: ['product-management', 'strategy', 'roadmap', 'prioritization'],
    icon: 'product-icon',
    config: {
      type: 'strategy',
      name: 'Product Manager Assistant',
      description: 'Assists with product management tasks and strategy',
      model: 'gpt-4',
      temperature: 0.6,
      maxTokens: 2000,
      systemPrompt: 'You are a product management assistant. Help with product strategy, feature prioritization, roadmap planning, and stakeholder communication. Focus on user value and business impact.',
      capabilities: ['strategy-planning', 'feature-prioritization', 'roadmap-creation', 'stakeholder-management']
    },
    rating: 4.7,
    downloads: 5800,
    featured: false,
    author: { name: 'Product Team', verified: true },
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: 'email-marketer',
    name: 'Email Marketing Specialist',
    description: 'Creates compelling email campaigns with personalization and optimization',
    category: 'marketing',
    tags: ['email-marketing', 'campaigns', 'personalization', 'automation'],
    icon: 'email-icon',
    config: {
      type: 'marketing',
      name: 'Email Marketing Specialist',
      description: 'Creates and optimizes email marketing campaigns',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1500,
      systemPrompt: 'You are an email marketing specialist. Create compelling subject lines, personalized email content, and optimized campaigns that drive engagement and conversions.',
      capabilities: ['campaign-creation', 'personalization', 'subject-line-optimization', 'a-b-testing']
    },
    rating: 4.6,
    downloads: 11300,
    featured: false,
    author: { name: 'Marketing Team', verified: true },
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-26')
  },
  {
    id: 'seo-specialist',
    name: 'SEO Specialist',
    description: 'Optimizes content for search engines and provides SEO recommendations',
    category: 'marketing',
    tags: ['seo', 'optimization', 'content', 'search-engines'],
    icon: 'seo-icon',
    config: {
      type: 'optimization',
      name: 'SEO Specialist',
      description: 'Provides SEO optimization and recommendations',
      model: 'gpt-4',
      temperature: 0.4,
      maxTokens: 2000,
      systemPrompt: 'You are an SEO specialist. Analyze content for search engine optimization, suggest improvements, identify keywords, and provide technical SEO recommendations.',
      capabilities: ['keyword-research', 'content-optimization', 'technical-seo', 'competitor-analysis']
    },
    rating: 4.8,
    downloads: 9600,
    featured: false,
    author: { name: 'Marketing Team', verified: true },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-27')
  },
  {
    id: 'translation-specialist',
    name: 'Translation Specialist',
    description: 'Provides accurate translations while maintaining context and cultural nuances',
    category: 'language',
    tags: ['translation', 'localization', 'multilingual', 'cultural-adaptation'],
    icon: 'translate-icon',
    config: {
      type: 'translation',
      name: 'Translation Specialist',
      description: 'Provides professional translation services',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2000,
      systemPrompt: 'You are a professional translator. Provide accurate translations that maintain the original meaning, tone, and cultural context. Consider localization needs and cultural nuances.',
      capabilities: ['translation', 'localization', 'cultural-adaptation', 'context-preservation']
    },
    rating: 4.7,
    downloads: 8400,
    featured: false,
    author: { name: 'Localization Team', verified: true },
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Conducts comprehensive research on topics and synthesizes findings',
    category: 'research',
    tags: ['research', 'analysis', 'synthesis', 'fact-checking'],
    icon: 'research-icon',
    config: {
      type: 'research',
      name: 'Research Assistant',
      description: 'Conducts thorough research and analysis',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 3000,
      systemPrompt: 'You are a research assistant. Conduct comprehensive research on given topics, synthesize findings from multiple sources, and present information in a clear, structured format.',
      capabilities: ['research-methodology', 'source-evaluation', 'synthesis', 'fact-checking']
    },
    rating: 4.8,
    downloads: 10200,
    featured: false,
    author: { name: 'Research Team', verified: true },
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-29')
  },
  {
    id: 'meeting-assistant',
    name: 'Meeting Assistant',
    description: 'Takes meeting notes, creates action items, and manages follow-ups',
    category: 'productivity',
    tags: ['meetings', 'notes', 'action-items', 'productivity'],
    icon: 'meeting-icon',
    config: {
      type: 'productivity',
      name: 'Meeting Assistant',
      description: 'Manages meeting notes and action items',
      model: 'gpt-4',
      temperature: 0.2,
      maxTokens: 2000,
      systemPrompt: 'You are a meeting assistant. Take detailed notes, identify action items, track decisions, and create summaries. Focus on clarity and actionable outcomes.',
      capabilities: ['note-taking', 'action-item-extraction', 'summary-creation', 'follow-up-management']
    },
    rating: 4.9,
    downloads: 16500,
    featured: true,
    author: { name: 'Productivity Team', verified: true },
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-30')
  },
  {
    id: 'project-coordinator',
    name: 'Project Coordinator',
    description: 'Manages project timelines, resources, and stakeholder communications',
    category: 'project-management',
    tags: ['project-management', 'coordination', 'timelines', 'stakeholders'],
    icon: 'project-icon',
    config: {
      type: 'management',
      name: 'Project Coordinator',
      description: 'Coordinates project activities and communications',
      model: 'gpt-4',
      temperature: 0.4,
      maxTokens: 2000,
      systemPrompt: 'You are a project coordinator. Help manage project timelines, coordinate resources, communicate with stakeholders, and ensure project deliverables are met.',
      capabilities: ['timeline-management', 'resource-coordination', 'stakeholder-communication', 'risk-management']
    },
    rating: 4.7,
    downloads: 7800,
    featured: false,
    author: { name: 'Project Team', verified: true },
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-31')
  },

  // Healthcare AI Agents
  {
    id: 'medical-diagnosis-assistant',
    name: 'Medical Diagnosis Assistant',
    description: 'AI-powered medical diagnosis support with symptom analysis and differential diagnosis suggestions',
    category: 'healthcare',
    tags: ['medical', 'diagnosis', 'symptoms', 'healthcare', 'clinical-decision-support'],
    icon: 'medical-icon',
    config: {
      type: 'medical-ai',
      name: 'Medical Diagnosis Assistant',
      description: 'Provides clinical decision support for medical professionals',
      model: 'gpt-4-medical',
      temperature: 0.1,
      maxTokens: 2000,
      systemPrompt: 'You are a medical AI assistant designed to support healthcare professionals. Analyze symptoms, suggest differential diagnoses, and provide evidence-based medical information. Always emphasize the need for professional medical evaluation and never provide definitive diagnoses.',
      capabilities: ['symptom-analysis', 'differential-diagnosis', 'medical-research', 'clinical-guidelines']
    },
    rating: 4.9,
    downloads: 12500,
    featured: true,
    author: { name: 'Healthcare AI Team', verified: true },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'pharmaceutical-research-agent',
    name: 'Pharmaceutical Research Agent',
    description: 'Specialized in drug discovery, clinical trial analysis, and pharmaceutical research',
    category: 'healthcare',
    tags: ['pharmaceutical', 'drug-discovery', 'clinical-trials', 'research', 'fda'],
    icon: 'pharmacy-icon',
    config: {
      type: 'pharma-research',
      name: 'Pharmaceutical Research Agent',
      description: 'Advanced pharmaceutical and drug discovery research assistant',
      model: 'gpt-4',
      temperature: 0.2,
      maxTokens: 3000,
      systemPrompt: 'You are a pharmaceutical research specialist AI. Analyze drug compounds, clinical trial data, regulatory requirements, and provide insights on drug development, safety profiles, and market analysis.',
      capabilities: ['drug-analysis', 'clinical-data-interpretation', 'regulatory-compliance', 'market-research']
    },
    rating: 4.8,
    downloads: 8900,
    featured: true,
    author: { name: 'Pharma Research Team', verified: true },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-29')
  },

  // Financial AI Agents
  {
    id: 'quantitative-trading-agent',
    name: 'Quantitative Trading Agent',
    description: 'Advanced algorithmic trading strategies with risk management and market analysis',
    category: 'finance',
    tags: ['trading', 'quantitative-analysis', 'risk-management', 'algorithmic-trading', 'market-data'],
    icon: 'trading-icon',
    config: {
      type: 'quant-trading',
      name: 'Quantitative Trading Agent',
      description: 'Sophisticated quantitative trading and market analysis',
      model: 'gpt-4',
      temperature: 0.1,
      maxTokens: 2500,
      systemPrompt: 'You are a quantitative trading specialist. Analyze market data, develop trading strategies, assess risk metrics, and provide algorithmic trading insights. Focus on data-driven decisions and risk management.',
      capabilities: ['market-analysis', 'strategy-development', 'risk-assessment', 'backtesting', 'portfolio-optimization']
    },
    rating: 4.9,
    downloads: 15600,
    featured: true,
    author: { name: 'FinTech Team', verified: true },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-02-02')
  },
  {
    id: 'credit-risk-analyst',
    name: 'Credit Risk Analyst',
    description: 'AI-powered credit risk assessment with fraud detection and compliance monitoring',
    category: 'finance',
    tags: ['credit-risk', 'fraud-detection', 'compliance', 'banking', 'lending'],
    icon: 'risk-icon',
    config: {
      type: 'credit-risk',
      name: 'Credit Risk Analyst',
      description: 'Advanced credit risk assessment and fraud detection',
      model: 'gpt-4',
      temperature: 0.1,
      maxTokens: 2000,
      systemPrompt: 'You are a credit risk specialist AI. Analyze creditworthiness, detect potential fraud patterns, ensure regulatory compliance, and provide risk scoring with detailed justifications.',
      capabilities: ['credit-scoring', 'fraud-detection', 'compliance-checking', 'risk-modeling', 'regulatory-reporting']
    },
    rating: 4.8,
    downloads: 11200,
    featured: true,
    author: { name: 'Risk Management Team', verified: true },
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-30')
  },

  // Legal AI Agents
  {
    id: 'contract-analysis-specialist',
    name: 'Contract Analysis Specialist',
    description: 'Advanced contract review, clause extraction, and legal risk assessment',
    category: 'legal',
    tags: ['contract-analysis', 'legal-review', 'risk-assessment', 'compliance', 'clause-extraction'],
    icon: 'legal-icon',
    config: {
      type: 'legal-contract',
      name: 'Contract Analysis Specialist',
      description: 'Expert contract analysis and legal document review',
      model: 'gpt-4-legal',
      temperature: 0.1,
      maxTokens: 3000,
      systemPrompt: 'You are a legal contract specialist AI. Analyze contracts, extract key clauses, identify potential risks, ensure compliance with relevant laws, and provide detailed legal insights. Always recommend human legal review for final decisions.',
      capabilities: ['contract-parsing', 'clause-analysis', 'risk-identification', 'compliance-verification', 'legal-research']
    },
    rating: 4.9,
    downloads: 13800,
    featured: true,
    author: { name: 'Legal Tech Team', verified: true },
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'ip-research-agent',
    name: 'Intellectual Property Research Agent',
    description: 'Patent research, trademark analysis, and IP portfolio management',
    category: 'legal',
    tags: ['intellectual-property', 'patent-research', 'trademark', 'ip-portfolio', 'prior-art'],
    icon: 'ip-icon',
    config: {
      type: 'ip-research',
      name: 'IP Research Agent',
      description: 'Comprehensive intellectual property research and analysis',
      model: 'gpt-4',
      temperature: 0.2,
      maxTokens: 2500,
      systemPrompt: 'You are an intellectual property research specialist. Conduct patent searches, analyze trademark conflicts, assess IP portfolios, and provide strategic IP insights. Focus on prior art analysis and competitive intelligence.',
      capabilities: ['patent-search', 'trademark-analysis', 'prior-art-research', 'ip-valuation', 'competitive-analysis']
    },
    rating: 4.7,
    downloads: 7600,
    featured: false,
    author: { name: 'IP Law Team', verified: true },
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-28')
  },

  // Real Estate AI Agents
  {
    id: 'property-valuation-agent',
    name: 'Property Valuation Agent',
    description: 'AI-powered property valuation with market analysis and investment insights',
    category: 'real-estate',
    tags: ['property-valuation', 'market-analysis', 'investment', 'appraisal', 'real-estate'],
    icon: 'property-icon',
    config: {
      type: 'property-valuation',
      name: 'Property Valuation Agent',
      description: 'Advanced property valuation and market analysis',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2000,
      systemPrompt: 'You are a real estate valuation specialist. Analyze property values using comparable sales, market trends, location factors, and investment metrics. Provide detailed valuation reports with supporting data.',
      capabilities: ['market-analysis', 'comparable-sales', 'investment-analysis', 'location-assessment', 'trend-forecasting']
    },
    rating: 4.6,
    downloads: 9400,
    featured: false,
    author: { name: 'Real Estate Team', verified: true },
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-27')
  },

  // Manufacturing AI Agents
  {
    id: 'quality-control-inspector',
    name: 'Quality Control Inspector',
    description: 'AI-powered quality control with defect detection and process optimization',
    category: 'manufacturing',
    tags: ['quality-control', 'defect-detection', 'process-optimization', 'manufacturing', 'inspection'],
    icon: 'quality-icon',
    config: {
      type: 'quality-control',
      name: 'Quality Control Inspector',
      description: 'Advanced quality control and manufacturing optimization',
      model: 'gpt-4',
      temperature: 0.1,
      maxTokens: 2000,
      systemPrompt: 'You are a quality control specialist AI. Analyze production data, detect defects, optimize manufacturing processes, and ensure compliance with quality standards. Provide actionable insights for process improvement.',
      capabilities: ['defect-analysis', 'process-monitoring', 'quality-metrics', 'compliance-verification', 'optimization-recommendations']
    },
    rating: 4.8,
    downloads: 6800,
    featured: false,
    author: { name: 'Manufacturing Team', verified: true },
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-26')
  },

  // Technology AI Agents
  {
    id: 'code-security-auditor',
    name: 'Code Security Auditor',
    description: 'Advanced security code analysis with vulnerability detection and remediation suggestions',
    category: 'technology',
    tags: ['security', 'code-analysis', 'vulnerability-detection', 'penetration-testing', 'secure-coding'],
    icon: 'security-icon',
    config: {
      type: 'security-audit',
      name: 'Code Security Auditor',
      description: 'Comprehensive security analysis and vulnerability assessment',
      model: 'gpt-4-security',
      temperature: 0.1,
      maxTokens: 2500,
      systemPrompt: 'You are a cybersecurity specialist focused on code security. Analyze code for vulnerabilities, security flaws, and compliance issues. Provide detailed remediation strategies and security best practices.',
      capabilities: ['vulnerability-scanning', 'security-analysis', 'compliance-checking', 'threat-modeling', 'remediation-planning']
    },
    rating: 4.9,
    downloads: 14200,
    featured: true,
    author: { name: 'Security Team', verified: true },
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-02-03')
  },
  {
    id: 'devops-automation-specialist',
    name: 'DevOps Automation Specialist',
    description: 'CI/CD pipeline optimization, infrastructure automation, and deployment strategies',
    category: 'technology',
    tags: ['devops', 'automation', 'ci-cd', 'infrastructure', 'deployment', 'monitoring'],
    icon: 'devops-icon',
    config: {
      type: 'devops-automation',
      name: 'DevOps Automation Specialist',
      description: 'Advanced DevOps automation and infrastructure management',
      model: 'gpt-4',
      temperature: 0.2,
      maxTokens: 2000,
      systemPrompt: 'You are a DevOps automation expert. Design CI/CD pipelines, optimize infrastructure, implement monitoring solutions, and provide automation strategies for deployment and operations.',
      capabilities: ['pipeline-design', 'infrastructure-automation', 'monitoring-setup', 'deployment-strategies', 'performance-optimization']
    },
    rating: 4.8,
    downloads: 10600,
    featured: true,
    author: { name: 'DevOps Team', verified: true },
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-31')
  }
]

export class AgentTemplateManager {
  private templates: Map<string, AgentTemplate> = new Map()

  constructor() {
    AGENT_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  getTemplate(id: string): AgentTemplate | undefined {
    return this.templates.get(id)
  }

  listTemplates(category?: string): AgentTemplate[] {
    let templates = Array.from(this.templates.values())
    if (category) {
      templates = templates.filter(t => t.category === category)
    }
    return templates.sort((a, b) => b.rating - a.rating)
  }

  createAgentFromTemplate(templateId: string, customizations?: Record<string, any>): AgentConfig {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    return { ...template.config }
  }
}