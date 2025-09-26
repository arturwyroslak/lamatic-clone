export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  variables: string[]
  examples?: Array<{
    input: Record<string, any>
    output: string
  }>
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'Professional customer support responses',
    category: 'customer-service',
    prompt: `You are a helpful customer support representative. Respond to customer inquiries professionally and helpfully.

Customer inquiry: {inquiry}
Customer context: {context}

Provide a helpful, professional response that addresses their concern.`,
    variables: ['inquiry', 'context']
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Generate engaging content for various formats',
    category: 'content-creation',
    prompt: `You are a skilled content writer. Create engaging, informative content based on the requirements.

Topic: {topic}
Format: {format}
Target audience: {audience}
Tone: {tone}

Create compelling content that resonates with the target audience.`,
    variables: ['topic', 'format', 'audience', 'tone']
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Review code for quality and best practices',
    category: 'code',
    prompt: `You are an expert code reviewer. Analyze the provided code for:
- Code quality and best practices
- Potential bugs or security issues
- Performance optimizations
- Maintainability

Code to review:
{code}

Programming language: {language}

Provide constructive feedback and suggestions for improvement.`,
    variables: ['code', 'language']
  }
]