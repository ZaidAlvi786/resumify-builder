"use client";

import { useEffect, useState } from "react";

interface NeuralLoaderProps {
    message?: string;
    progress?: number;
}

export default function NeuralLoader({ message = "Initializing Neural Net", progress }: NeuralLoaderProps) {
    const [percentage, setPercentage] = useState(0);
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (progress !== undefined) {
            setPercentage(progress);
        } else {
            // Simulate progress
            const interval = setInterval(() => {
                setPercentage((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + Math.random() * 15;
                });
            }, 200);
            return () => clearInterval(interval);
        }
    }, [progress]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => {
                if (prev === "...") return "";
                return prev + ".";
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Generate neural network nodes
    const nodes = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="relative w-full max-w-2xl px-8">
                {/* Neural Network Visualization */}
                <div className="relative h-64 mb-8 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                        {/* Connections */}
                        {nodes.slice(0, 10).map((node, i) => {
                            const targetNode = nodes[10 + (i % 10)];
                            return (
                                <line
                                    key={`line-${i}`}
                                    x1={`${node.x}%`}
                                    y1={`${node.y}%`}
                                    x2={`${targetNode.x}%`}
                                    y2={`${targetNode.y}%`}
                                    stroke="rgba(99, 102, 241, 0.3)"
                                    strokeWidth="1"
                                    className="animate-pulse"
                                    style={{
                                        animationDelay: `${node.delay}s`,
                                    }}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map((node) => (
                            <g key={node.id}>
                                <circle
                                    cx={`${node.x}%`}
                                    cy={`${node.y}%`}
                                    r="4"
                                    fill="rgba(99, 102, 241, 0.6)"
                                    className="animate-pulse"
                                    style={{
                                        animationDelay: `${node.delay}s`,
                                    }}
                                />
                                <circle
                                    cx={`${node.x}%`}
                                    cy={`${node.y}%`}
                                    r="2"
                                    fill="rgba(167, 139, 250, 1)"
                                    className="animate-ping"
                                    style={{
                                        animationDelay: `${node.delay}s`,
                                    }}
                                />
                            </g>
                        ))}
                    </svg>

                    {/* Animated grid overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `
                                    linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                                `,
                                backgroundSize: "20px 20px",
                            }}
                        />
                    </div>
                </div>

                {/* Progress and Message */}
                <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-white mb-2">
                        {Math.min(100, Math.round(percentage))}%
                    </div>
                    <div className="text-xl text-slate-300 font-medium">
                        {message}
                        {dots}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                    </div>

                    {/* Loading dots animation */}
                    <div className="flex justify-center gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

