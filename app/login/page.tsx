"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MobileContainer from "@/components/mobile-container"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  if (user) {
    router.push("/dashboard")
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithPopup(auth, googleProvider)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error signing in with Google:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MobileContainer>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">KeuanganKu</CardTitle>
            <CardDescription>Aplikasi Keuangan Pribadi</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                "Login dengan Google"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  )
}
