"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";

interface LogoLoaderProps {
    message?: string;
    progress?: number;
}

export default function LogoLoader({ message = "Processing", progress }: LogoLoaderProps) {
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        if (progress !== undefined) {
            setPercentage(progress);
        } else {
            // Simulate smooth progress
            const interval = setInterval(() => {
                setPercentage((prev) => {
                    if (prev >= 90) {
                        return 90; // Don't complete until actual progress is set
                    }
                    return prev + Math.random() * 2;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [progress]);

    // Floating particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 backdrop-blur-md">
            {/* Animated background gradient */}
            <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                    background: [
                        "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
                        "radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
                    ],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40"
                        initial={{
                            x: `${particle.x}vw`,
                            y: `${particle.y}vh`,
                            scale: 0,
                        }}
                        animate={{
                            y: [`${particle.y}vh`, `${particle.y - 20}vh`, `${particle.y}vh`],
                            x: [`${particle.x}vw`, `${particle.x + 5}vw`, `${particle.x}vw`],
                            scale: [0, 1, 0],
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <div className="relative w-full max-w-lg px-8">
                <div className="text-center space-y-8">
                    {/* Logo Container with multiple animation layers */}
                    <div className="flex justify-center relative">
                        {/* Outer glow ring */}
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                width: "200px",
                                height: "200px",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-blue-400/20"
                                animate={{
                                    scale: [1, 1.3, 1.6],
                                    opacity: [0.5, 0.2, 0],
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-indigo-400/20"
                                animate={{
                                    scale: [1, 1.2, 1.4],
                                    opacity: [0.4, 0.15, 0],
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    delay: 0.5,
                                    ease: "easeOut",
                                }}
                            />
                        </motion.div>

                        {/* Logo with floating animation */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <motion.div
                                animate={{
                                    y: [0, -8, 0],
                                    rotate: [0, 1, -1, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="relative"
                            >
                                {/* Gradient overlay on logo */}
                                <div className="relative inline-block">
                                    <Logo size="lg" showText={true} className="text-slate-900" />
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                                        animate={{
                                            x: ["-100%", "100%"],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        style={{
                                            mixBlendMode: "overlay",
                                        }}
                                    />
                                </div>

                                {/* Sparkle effects around logo */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 bg-blue-400 rounded-full"
                                        style={{
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                        }}
                                        animate={{
                                            x: [
                                                0,
                                                Math.cos((i * Math.PI * 2) / 6) * 80,
                                                Math.cos((i * Math.PI * 2) / 6) * 100,
                                            ],
                                            y: [
                                                0,
                                                Math.sin((i * Math.PI * 2) / 6) * 80,
                                                Math.sin((i * Math.PI * 2) / 6) * 100,
                                            ],
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Message with fade animation */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={message}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            <motion.h3
                                className="text-2xl font-semibold text-slate-900"
                                animate={{
                                    opacity: [1, 0.7, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                {message}
                            </motion.h3>

                            {/* Enhanced Progress Bar */}
                            <div className="w-full max-w-md mx-auto space-y-3">
                                <div className="relative w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden backdrop-blur-sm">
                                    {/* Animated background shimmer */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-slate-200/0 via-slate-300/40 to-slate-200/0"
                                        animate={{
                                            x: ["-100%", "100%"],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />
                                    
                                    {/* Progress fill with gradient */}
                                    <motion.div
                                        className="relative h-full rounded-full overflow-hidden"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, percentage)}%` }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        {/* Gradient background */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                                        
                                        {/* Animated shine effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            animate={{
                                                x: ["-100%", "100%"],
                                            }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Percentage with pulse */}
                                {progress !== undefined && (
                                    <motion.p
                                        className="text-sm font-medium text-slate-600"
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        {Math.round(percentage)}%
                                    </motion.p>
                                )}
                            </div>

                            {/* Enhanced animated dots */}
                            <div className="flex justify-center gap-2 mt-6">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50"
                                        animate={{
                                            y: [0, -12, 0],
                                            scale: [1, 1.2, 1],
                                            opacity: [0.6, 1, 0.6],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
