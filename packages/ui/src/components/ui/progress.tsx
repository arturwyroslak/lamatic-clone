import * as React from "react"

interface ProgressProps {
  value?: number
  className?: string
}

export const Progress: React.FC<ProgressProps> = ({ value = 0, className }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div 
      className="bg-blue-600 h-2.5 rounded-full" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    ></div>
  </div>
)
