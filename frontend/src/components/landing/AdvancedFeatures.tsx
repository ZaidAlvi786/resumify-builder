"use client";

import React from "react";
import { motion } from "framer-motion";
import StaggerAnimation from "@/components/StaggerAnimation";
import Link from "next/link";
import { Route, Map, BarChart3, Globe, Sparkles } from "lucide-react";

export default function AdvancedFeatures() {
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
          Advanced Features That Set Us Apart
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Unique capabilities you won't find anywhere else. Powered by cutting-edge AI technology.
        </p>
      </div>

      <StaggerAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        <Link href="/career-path">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-indigo-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Route className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">AI Career Path Predictor</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Discover your next career steps with AI-powered predictions. Get personalized timelines, required skills, and recommended learning paths based on your resume.</p>
            <div className="text-xs text-indigo-600 font-medium">NEW • Exclusive Feature</div>
          </motion.div>
        </Link>
        <Link href="/heatmap">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-red-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Resume Heat Map</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Visualize your resume strength by section with an interactive heat map. Instantly identify which sections are strong, moderate, or need improvement.</p>
            <div className="text-xs text-red-600 font-medium">NEW • Exclusive Feature</div>
          </motion.div>
        </Link>
        <Link href="/benchmark">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-blue-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Industry Benchmarking</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Compare your resume against industry standards. See how you rank in percentiles and get industry-specific insights and recommendations.</p>
            <div className="text-xs text-blue-600 font-medium">NEW • Exclusive Feature</div>
          </motion.div>
        </Link>
        <Link href="/translate">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-green-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Multi-Language Resume Generator</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Translate your resume to 12+ languages with cultural adaptations. Perfect for global job opportunities with proper formatting and local conventions.</p>
            <div className="text-xs text-green-600 font-medium">NEW • Exclusive Feature</div>
          </motion.div>
        </Link>
        <Link href="/analytics">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-purple-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-slate-900">Resume Analytics Dashboard</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Comprehensive analytics including keyword density, readability scores, section completeness, and estimated interview rates. Track metrics over time.</p>
            <div className="text-xs text-purple-600 font-medium">NEW • Exclusive Feature</div>
          </motion.div>
        </Link>
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg border border-slate-700 space-y-3 text-white"
        >
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-display">More Features Coming Soon</h3>
          <p className="text-slate-300 text-sm leading-relaxed">We're constantly innovating and adding new features based on user feedback. Stay tuned for more powerful resume optimization tools!</p>
        </motion.div>
      </StaggerAnimation>
    </motion.section>
  );
}
