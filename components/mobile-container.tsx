import type React from "react"
import Header from "./header"

export default function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <Header />
      {children}
    </div>
  )
}
