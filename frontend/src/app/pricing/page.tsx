"use client"

import { useState, useEffect } from "react"
import { PricingCard } from "@/components/PricingCard"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [coupon, setCoupon] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let retries = 0;
    const MAX_RETRIES = 10;

    async function getProfile(isRetry = false) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          const fetchedPlan = profile.plan?.toLowerCase() || 'free'
          setUserPlan(fetchedPlan)
          
          if (fetchedPlan === 'free' && isRetry) {
            retries++;
            if (retries >= MAX_RETRIES) {
              if (interval) clearInterval(interval)
            }
          } else if (fetchedPlan !== 'free') {
            if (interval) clearInterval(interval)
          }
        }
      }
    }
    
    getProfile()
    
    // Check if we just came back from a checkout success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_id')) {
      interval = setInterval(() => getProfile(true), 3000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const plans = [
    {
      title: "Basic",
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
    if (plan.title === "Basic") {
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
          success_url: `${window.location.origin}/builder?session_id={CHECKOUT_SESSION_ID}`,
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
            className="flex items-center justify-center gap-4 mt-12 mb-8"
          >
            <Label className={`text-lg cursor-pointer ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`} onClick={() => setBillingCycle('monthly')}>Monthly</Label>
            <Switch 
              checked={billingCycle === 'yearly'} 
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} 
            />
            <div className="flex flex-col items-start gap-1">
                <Label className={`text-lg cursor-pointer ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`} onClick={() => setBillingCycle('yearly')}>Yearly</Label>
                <motion.span 
                  animate={{ scale: billingCycle === 'yearly' ? 1.05 : 1 }}
                  className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full"
                >
                  Save 10%
                </motion.span>
            </div>
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
