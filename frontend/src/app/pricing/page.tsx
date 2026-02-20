"use client"

import { useState } from "react"
import { PricingCard } from "@/components/PricingCard"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import Navigation from "@/components/Navigation"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [coupon, setCoupon] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)

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

  const handleApplyCoupon = () => {
    if (coupon.toLowerCase() === "welcome10") {
      setDiscountApplied(true)
      // Logic to actually apply discount in checkout session
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Choose the plan that's right for you and take your career to the next level.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
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
                onSelect={() => console.log(`Selected ${plan.title}`)}
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
