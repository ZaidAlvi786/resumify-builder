"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/ui/Logo";

function LoginPageContent() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
            options: {
                        data: {
                            full_name: fullName,
                        },
                        emailRedirectTo: `${window.location.origin}/builder`,
            },
        });

                if (signUpError) throw signUpError;
                
                if (data.user) {
                    setSuccess("Account created! Please check your email to verify your account.");
                    setTimeout(() => {
                        setIsSignUp(false);
                        setEmail("");
                        setPassword("");
                        setFullName("");
                    }, 3000);
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;
                
                // Redirect to the page user was trying to access, or builder as default
                const redirectTo = searchParams.get("redirect") || "/builder";
                router.push(redirectTo);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" suppressHydrationWarning>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating orbs with unique animations */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                
                {/* Particle effect */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-20"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6 transform transition-all duration-500 hover:scale-[1.02]">
                    {/* Header with logo */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <Logo size="lg" />
                        </div>
                        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </h1>
                        <p className="text-slate-600 text-sm">
                            {isSignUp 
                                ? "Start building your perfect resume today" 
                                : "Sign in to continue your resume journey"}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => {
                                setIsSignUp(false);
                                setError("");
                                setSuccess("");
                            }}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                                !isSignUp
                                    ? "bg-white text-indigo-600 shadow-md transform scale-105"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => {
                                setIsSignUp(true);
                                setError("");
                                setSuccess("");
                            }}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                                isSignUp
                                    ? "bg-white text-indigo-600 shadow-md transform scale-105"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-shake">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2 animate-fade-in">
                            <CheckCircle2 className="w-4 h-4" />
                            {success}
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-2 animate-slide-down">
                                <Label htmlFor="name" className="text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300"
                                />
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={isSignUp ? "At least 6 characters" : "Enter your password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300"
                            />
                        </div>

                    <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? "Create Account" : "Sign In"}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                    </Button>
                    </form>
                </div>
            </div>

        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Logo size="lg" className="mb-4" />
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}
