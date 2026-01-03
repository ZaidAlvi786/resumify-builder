
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { ArrowRight, FileText, CheckCircle, Sparkles, Zap, Target, TrendingUp, Star, Map, BarChart3, Globe, Route, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import StaggerAnimation from "@/components/StaggerAnimation";
import Testimonials from "@/components/Testimonials";
import TrustBadges from "@/components/TrustBadges";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen overflow-x-hidden" suppressHydrationWarning>
      <Sidebar />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-4 py-24 text-center lg:ml-64 w-full min-w-0"
      >
        <motion.div variants={itemVariants} className="max-w-4xl space-y-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>The World's Most Advanced AI Resume Builder</span>
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              The Best AI Resume Builder{" "}
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                You'll Ever Need
              </motion.span>
            </h1>
            
            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            >
              Resumify AI supercharges your career prospects with AI – from resume building, review, and interview prep, we make you the perfect candidate. 
              <span className="font-semibold text-slate-900"> Trusted by 50,000+ professionals worldwide.</span>
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-4 justify-center pt-4"
          >
            {/* Quick Action Buttons - Enhanced like competitor */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Link href="/ai-agent">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Resume Agent
                  </Button>
                </motion.div>
              </Link>
              <Link href="/reviewer">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Improve My Resume Score
                  </Button>
                </motion.div>
              </Link>
              <Link href="/builder">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="h-12 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Target My Resume
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                  onClick={() => alert("Job search feature coming soon!")}
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Find Jobs
                </Button>
              </motion.div>
            </div>

            {/* Main CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/builder">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/50">
                    Make My Resume for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/reviewer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-white border-2 hover:bg-slate-50">
                    Review My Resume <CheckCircle className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 pt-8 text-sm text-slate-600"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-slate-900">4.9/5</span>
              <span>Rating</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div>
              <span className="font-semibold text-slate-900">50,000+</span> Users
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <div>
              <span className="font-semibold text-slate-900">100%</span> Free to Start
            </div>
          </motion.div>
        </motion.div>

        {/* Key Features Section */}
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

        {/* Advanced Features Section */}
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

      {/* Trust Badges */}
      <TrustBadges />

      {/* Testimonials */}
      <Testimonials />

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
          className="py-6 text-center text-slate-500 text-sm border-t bg-white w-full"
      >
        © 2024 Resumify AI. Built with Next.js & OpenAI.
      </motion.footer>
      </motion.main>
    </div>
  );
}
