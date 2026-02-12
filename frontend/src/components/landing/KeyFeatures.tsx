"use client";

import React from "react";
import { motion } from "framer-motion";
import StaggerAnimation from "@/components/StaggerAnimation";
import { Target, FileText, Zap, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

export default function KeyFeatures() {
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
          More Than Just a Resume Builder
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Resumify AI makes your job search easier and helps you perform better in interviews, 
          increasing your chances of landing coveted positions at desirable companies.
        </p>
      </div>

      <StaggerAnimation className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-blue-300 transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-display text-slate-900">AI Keyword Targeting</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Instantly improve your interview rate by targeting keywords that recruiters look for. Get personalized keyword suggestions based on job descriptions.</p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-purple-300 transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-display text-slate-900">AI Cover Letter Generator</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Generate personalized cover letters and resignation letters that perfectly match your resume and job description. Multiple professional templates included.</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-green-300 transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-display text-slate-900">AI Mock Interview Prep</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Practice and ace the most common questions for your target position. Get personalized interview questions with AI-suggested answers based on your resume.</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-indigo-300 transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-display text-slate-900">Advanced Resume Scoring</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Get detailed resume analysis across 25+ criteria points. See your ATS score improve in real-time with instant feedback on keyword optimization, formatting, and content quality.</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-pink-300 transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-display text-slate-900">Smart Version History</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Track all your resume versions, compare changes side-by-side, and never lose your work. Full history with one-click restore and AI-powered improvement suggestions.</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="p-6 bg-white rounded-xl shadow-sm border space-y-3 hover:shadow-lg hover:border-yellow-300 transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <ArrowRight className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-display text-slate-900">Multi-Format Export</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Export your resume in PDF, Word, HTML, or plain text. Perfect formatting for any ATS system. Professional templates included.</p>
        </motion.div>
      </StaggerAnimation>
    </motion.section>
  );
}
