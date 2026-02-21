"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"

export default function CancelPage() {
  const router = useRouter()

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
          <XCircle className="h-20 w-20 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-8">
          The payment process was cancelled. No charges were made to your account.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push('/pricing')} className="w-full py-6 text-lg">
            Try Again
          </Button>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full py-6 text-lg">
            Back to Home
          </Button>
        </div>
      </motion.div>
      </main>
    </div>
  )
}
