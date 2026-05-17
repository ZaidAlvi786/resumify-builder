"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { PricingCard } from "@/components/PricingCard"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, X } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [coupon, setCoupon] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const fetchInterval = useRef<NodeJS.Timeout | null>(null)
  const retries = useRef(0)
  const MAX_RETRIES = 15

  const getProfile = useCallback(async (isRetry = false) => {
    if (isRetry) setIsSyncing(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          const fetchedPlan = profile.plan?.toLowerCase().trim() || 'free'
          console.log("Current plan in DB:", fetchedPlan)
          setUserPlan(fetchedPlan)
          
          if (fetchedPlan !== 'free') {
            setIsSyncing(false)
            if (fetchInterval.current) {
              clearInterval(fetchInterval.current)
              fetchInterval.current = null
            }
          } else if (isRetry) {
            retries.current++;
            if (retries.current >= MAX_RETRIES) {
              setIsSyncing(false)
              if (fetchInterval.current) {
                clearInterval(fetchInterval.current)
                fetchInterval.current = null
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
    }
  }, [])

  useEffect(() => {
    getProfile()
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setShowSuccess(true)
      getProfile(true) 
      fetchInterval.current = setInterval(() => getProfile(true), 3000)
    }
    
    return () => {
      if (fetchInterval.current) clearInterval(fetchInterval.current)
    }
  }, [getProfile])

  const plans = [
    {
      title: "Free",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      description: "Perfect for students and beginners",
      features: [
        "Limited access to templates",
        "PDF exports",
        "Community support",
        "5 AI Resume generations",
      ],
      isPopular: false,
    },
    {
      title: "Pro",
      monthlyPrice: "$20",
      yearlyPrice: "$18",
      description: "Ideal for serious job seekers",
      features: [
        "1,000 AI Credits",
        "Unlimited templates",
        "Priority support",
        "ATS optimization tools",
        "Cover letter generator",
      ],
      isPopular: true,
    },
    {
      title: "Ultra",
      monthlyPrice: "$50",
      yearlyPrice: "$45",
      description: "For professionals wanting the edge",
      features: [
        "Unlimited AI Credits",
        "Real-time networking tools",
        "Career path prediction",
        "1-on-1 resume review",
        "Everything in Pro",
      ],
      isPopular: false,
    },
  ]

  const handleSelectPlan = async (plan: any) => {
    if (plan.title === "Free") {
      router.push("/builder")
      return
    }

    setLoading(plan.title)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login?redirect=/pricing")
        return
      }

      // Map plans to environment variables
      const priceId = billingCycle === 'monthly' 
        ? plan.title === "Pro" 
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY 
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTRA_MONTHLY
        : plan.title === "Pro" 
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY 
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTRA_YEARLY

      if (!priceId || priceId.startsWith('price_placeholder')) {
        alert("Stripe Price IDs are not configured. Please add them to your environment variables.")
        setLoading(null)
        return
      }

      const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace("/api/resume", "")
      const response = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
          cancel_url: `${window.location.origin}/pricing`,
          user_id: user.id,
          promo_code: discountApplied ? coupon : undefined
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.detail || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error redirecting to checkout:", error)
      alert("Something went wrong. Please try again later.")
    } finally {
      setLoading(null)
    }
  }

  const handleApplyCoupon = () => {
    if (coupon.toLowerCase() === "welcome10") {
      setDiscountApplied(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-purple-200/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full" />
      </div>

      <Sidebar />
      
      <main className="flex-1 container mx-auto px-4 py-20 lg:ml-64 relative z-10">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4"
            >
              <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-green-500">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">Payment Successful!</p>
                    <p className="text-xs text-green-50 opacity-90">
                      {isSyncing ? "Syncing your new plan status... please wait" : "Your account has been upgraded successfully!"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={() => getProfile(true)}
                    disabled={isSyncing}
                  >
                    {isSyncing ? "Checking..." : "Check Status"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('success');
                      url.searchParams.delete('session_id');
                      window.history.replaceState({}, '', url);
                      router.refresh();
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100"
          >
            Pricing & Plans
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900"
          >
            Ready to <span className="text-indigo-600">level up</span>?
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Unlock the full power of AI to build, edit, and tailor your professional resume in seconds.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6 mt-12 mb-8"
          >
            <div className="relative p-1.5 bg-slate-100 rounded-2xl flex items-center w-full max-w-xs sm:w-72 h-16 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200">
              <motion.div
                className="absolute h-[calc(100%-12px)] rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 w-[calc(50%-6px)]"
                animate={{ x: billingCycle === 'monthly' ? 0 : '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "relative flex-1 text-sm font-black transition-colors duration-300 h-full rounded-xl z-10",
                  billingCycle === 'monthly' ? "text-white" : "text-slate-500 hover:text-slate-700"
                )}
              >
                MONTHLY
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "relative flex-1 text-sm font-black transition-colors duration-300 h-full rounded-xl z-10",
                  billingCycle === 'yearly' ? "text-white" : "text-slate-500 hover:text-slate-700"
                )}
              >
                YEARLY
              </button>
            </div>
            
            {billingCycle === 'yearly' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/20 border border-green-400"
              >
                <Check className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Save 10% With Yearly</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 pb-12">
          <AnimatePresence mode="wait">
            {plans.map((plan, index) => (
              <PricingCard
                key={`${plan.title}-${billingCycle}`}
                title={plan.title}
                price={billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                description={plan.description}
                features={plan.features}
                isPopular={plan.isPopular}
                billingCycle={billingCycle}
                onSelect={() => handleSelectPlan(plan)}
                isLoading={loading === plan.title}
                isCurrentPlan={userPlan?.toLowerCase() === plan.title.toLowerCase()}
              />
            ))}
          </AnimatePresence>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-20 max-w-md mx-auto text-center p-8 border rounded-2xl bg-card/30 backdrop-blur-sm"
        >
          <Label className="text-xl font-semibold mb-4 block">Have a coupon code?</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter code" 
              value={coupon} 
              onChange={(e) => setCoupon(e.target.value)} 
              className="font-mono text-lg"
            />
            <Button onClick={handleApplyCoupon} variant="secondary">Apply</Button>
          </div>
          {discountApplied && (
            <motion.p 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-green-500 mt-4 font-medium flex items-center justify-center gap-2"
            >
                <Check className="h-4 w-4" /> Coupon applied! Extra 10% off.
            </motion.p>
          )}
        </motion.div>
      </main>
    </div>
  )
}
