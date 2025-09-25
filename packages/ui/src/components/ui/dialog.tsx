import * as React from "react"

export interface DialogProps {
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ children }) => <div>{children}</div>
export const DialogPortal: React.FC<DialogProps> = ({ children }) => <div>{children}</div>
export const DialogOverlay: React.FC<DialogProps> = ({ children }) => <div>{children}</div>
export const DialogClose: React.FC<DialogProps> = ({ children }) => <button>{children}</button>
export const DialogTrigger: React.FC<DialogProps> = ({ children }) => <button>{children}</button>
export const DialogContent: React.FC<DialogProps> = ({ children }) => <div>{children}</div>
export const DialogHeader: React.FC<DialogProps> = ({ children }) => <div>{children}</div>
export const DialogFooter: React.FC<DialogProps> = ({ children }) => <div>{children}</div>
export const DialogTitle: React.FC<DialogProps> = ({ children }) => <h2>{children}</h2>
export const DialogDescription: React.FC<DialogProps> = ({ children }) => <p>{children}</p>
