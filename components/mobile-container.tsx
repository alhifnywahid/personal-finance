import type React from "react"
export default function MobileContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">{children}</div>
}
