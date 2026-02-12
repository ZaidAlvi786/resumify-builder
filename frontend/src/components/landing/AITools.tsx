"use client";

import React from "react";
import { motion } from "framer-motion";
import StaggerAnimation from "@/components/StaggerAnimation";
import Link from "next/link";
import { BarChart3, Sparkles, Zap, Briefcase, Target, TrendingUp, DollarSign } from "lucide-react";

export default function AITools() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-32 w-full max-w-7xl mx-auto px-4"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">
          New AI Power Tools
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Experience our latest standalone AI tools designed to specific aspects of your career journey.
        </p>
      </div>

      <StaggerAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        <Link href="/tools/quantifier">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-emerald-100 space-y-3 hover:shadow-lg hover:border-emerald-300 transition-all group cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Achievement Quantifier</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Transform vague bullet points into measurable achievements with specific metrics and numbers.</p>
          </motion.div>
        </Link>

        <Link href="/tools/summary">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-blue-100 space-y-3 hover:shadow-lg hover:border-blue-300 transition-all group cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Summary Generator</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Generate tailored professional summaries in different styles - from creative to executive.</p>
          </motion.div>
        </Link>

        <Link href="/tools/keywords">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-purple-100 space-y-3 hover:shadow-lg hover:border-purple-300 transition-all group cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Keyword Expander</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Discover powerful synonyms and related keywords to beat ATS filters without stuffing.</p>
          </motion.div>
        </Link>

        <Link href="/tools/portfolio">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-orange-100 space-y-3 hover:shadow-lg hover:border-orange-300 transition-all group cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Multi-Resume Portfolio</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Automatically generate multiple versions of your resume tailored for different roles and industries.</p>
          </motion.div>
        </Link>

        <Link href="/tools/gap-analyzer">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-cyan-100 space-y-3 hover:shadow-lg hover:border-cyan-300 transition-all group cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Skill Gap Analyzer</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Identify missing skills for your target role and get a personalized learning roadmap to bridge the gap.</p>
          </motion.div>
        </Link>

        <Link href="/tools/trends">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-indigo-100 space-y-3 hover:shadow-lg hover:border-indigo-300 transition-all group cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Career Trend Analyzer</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Discover market demand, salary insights, and future-proof your career with AI-driven market analysis.</p>
          </motion.div>
        </Link>

        <Link href="/tools/negotiation">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border border-green-100 space-y-3 hover:shadow-lg hover:border-green-300 transition-all group cursor-pointer h-full"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Salary Negotiator</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Practice real-time salary negotiation with an AI hiring manager to maximize your offer.</p>
          </motion.div>
        </Link>
      </StaggerAnimation>
    </motion.section>
  );
}
