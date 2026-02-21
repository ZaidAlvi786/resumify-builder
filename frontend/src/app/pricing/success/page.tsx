"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Optionally verify the session on the backend here
  }, [sessionId])

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:ml-64">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full bg-card p-8 rounded-2xl border shadow-xl"
        >
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for upgrading to Pro. Your AI credits have been added to your account and premium features are now unlocked.
          </p>
          <Button onClick={() => router.push('/builder')} className="w-full py-6 text-lg">
            Start Building Your Resume
          </Button>
        </motion.div>
      </main>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
