import * as React from "react"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuTrigger: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuContent: React.FC<DropdownMenuProps> = ({ children, className }) => (
  <div className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}>
    {children}
  </div>
)
export const DropdownMenuItem: React.FC<DropdownMenuProps> = ({ children, className }) => (
  <div className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent ${className}`}>
    {children}
  </div>
)
export const DropdownMenuCheckboxItem: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuRadioItem: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuLabel: React.FC<DropdownMenuProps> = ({ children, className }) => (
  <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>{children}</div>
)
export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`-mx-1 my-1 h-px bg-muted ${className}`} />
)
export const DropdownMenuShortcut: React.FC<DropdownMenuProps> = ({ children, className }) => (
  <span className={`ml-auto text-xs tracking-widest opacity-60 ${className}`}>{children}</span>
)
export const DropdownMenuGroup: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuPortal: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuSub: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuSubContent: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuSubTrigger: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
export const DropdownMenuRadioGroup: React.FC<DropdownMenuProps> = ({ children }) => <div>{children}</div>
