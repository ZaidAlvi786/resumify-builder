"use client"

import { Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  onSelect: () => void
  billingCycle: 'monthly' | 'yearly'
}

export function PricingCard({
  title,
  price,
  description,
  features,
  isPopular,
  onSelect,
  billingCycle
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`relative flex flex-col h-full border-2 ${isPopular ? 'border-primary shadow-xl scale-105' : 'border-border'} overflow-hidden bg-card/50 backdrop-blur-md`}>
        {isPopular && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-bold rounded-bl-lg">
            Best Value
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="mb-6">
            <span className="text-4xl font-extrabold">{price}</span>
            <span className="text-muted-foreground ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
          </div>
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onSelect} 
            variant={isPopular ? "default" : "outline"} 
            className="w-full font-bold py-6 group"
          >
            {title === "Basic" ? "Get Started" : "Upgrade Now"}
            <motion.span 
              className="ml-2 inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
            >
              →
            </motion.span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
