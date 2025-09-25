import * as React from "react"

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

export const Accordion: React.FC<AccordionProps> = ({ children, className }) => (
  <div className={className}>{children}</div>
)

export const AccordionItem: React.FC<AccordionProps & { value: string }> = ({ children, className }) => (
  <div className={`border-b ${className}`}>{children}</div>
)

export const AccordionTrigger: React.FC<AccordionProps> = ({ children, className }) => (
  <button className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline ${className}`}>
    {children}
  </button>
)

export const AccordionContent: React.FC<AccordionProps> = ({ children, className }) => (
  <div className={`overflow-hidden text-sm transition-all ${className}`}>
    <div className="pb-4 pt-0">{children}</div>
  </div>
)
