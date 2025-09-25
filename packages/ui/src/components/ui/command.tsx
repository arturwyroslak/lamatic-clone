import * as React from "react"

interface CommandProps {
  children: React.ReactNode
  className?: string
}

export const Command: React.FC<CommandProps> = ({ children, className }) => (
  <div className={`flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground ${className}`}>
    {children}
  </div>
)
export const CommandDialog: React.FC<CommandProps> = ({ children }) => <div>{children}</div>
export const CommandInput: React.FC<{ placeholder?: string; className?: string }> = ({ placeholder, className }) => (
  <input 
    className={`flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground ${className}`}
    placeholder={placeholder}
  />
)
export const CommandList: React.FC<CommandProps> = ({ children, className }) => (
  <div className={`max-h-[300px] overflow-y-auto overflow-x-hidden ${className}`}>{children}</div>
)
export const CommandEmpty: React.FC<CommandProps> = ({ children, className }) => (
  <div className={`py-6 text-center text-sm ${className}`}>{children}</div>
)
export const CommandGroup: React.FC<CommandProps> = ({ children, className }) => (
  <div className={`overflow-hidden p-1 text-foreground ${className}`}>{children}</div>
)
export const CommandItem: React.FC<CommandProps> = ({ children, className }) => (
  <div className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent ${className}`}>
    {children}
  </div>
)
export const CommandShortcut: React.FC<CommandProps> = ({ children, className }) => (
  <span className={`ml-auto text-xs tracking-widest text-muted-foreground ${className}`}>{children}</span>
)
export const CommandSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`-mx-1 my-1 h-px bg-border ${className}`} />
)
