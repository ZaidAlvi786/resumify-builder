"use client"

import { Check, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  onSelect: () => void
  billingCycle: 'monthly' | 'yearly'
  isLoading?: boolean
  isCurrentPlan?: boolean
}

export function PricingCard({
  title,
  price,
  description,
  features,
  isPopular,
  onSelect,
  billingCycle,
  isLoading,
  isCurrentPlan
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: isPopular ? 1.06 : 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="h-full"
    >
      <Card className={cn(
        "relative flex flex-col h-full border-0 overflow-hidden transition-all duration-500",
        "bg-white/10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5",
        "shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20",
        isPopular && "ring-2 ring-indigo-500/50 shadow-indigo-500/20 shadow-2xl",
        isCurrentPlan && "ring-2 ring-green-500/50 border-green-500/30 bg-green-50/5"
      )}>
        {/* Decorative Background Glow */}
        {isPopular && (
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-[64px] rounded-full" />
        )}
        
        {isPopular && (
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-bl-xl shadow-lg">
            Best Value
          </div>
        )}
        
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">
            {title}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow pt-4">
          <div className="mb-8 flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tight text-slate-900">{price}</span>
            <span className="text-slate-500 font-semibold">{billingCycle === 'monthly' ? '/mo' : '/yr'}</span>
          </div>
          
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Features</p>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Check className="h-3 w-3 text-indigo-600" />
                  </div>
                  <span className="text-sm text-slate-600 leading-relaxed font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="pt-6">
          <Button 
            onClick={onSelect} 
            variant={isPopular ? "default" : "outline"} 
            className={cn(
              "w-full font-bold py-7 text-base rounded-xl transition-all duration-300 shadow-lg",
              isPopular ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25" : "border-slate-200 hover:bg-slate-50 hover:border-indigo-200",
              isCurrentPlan && "bg-green-600 hover:bg-green-700 cursor-default shadow-none border-none text-white ring-4 ring-green-100/50"
            )}
            disabled={isLoading || isCurrentPlan}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isCurrentPlan ? (
              <motion.span 
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.95, 1, 0.95] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center justify-center gap-3 w-full"
              >
                <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                </div>
                YOUR CURRENT PLAN
              </motion.span>
            ) : title === "Free" ? (
              "Get Started for Free"
            ) : (
              "Upgrade to " + title
            )}
            {!isLoading && !isCurrentPlan && (
              <motion.span 
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
