import React from "react";
import { motion } from "framer-motion";
import { Shield, Users, Award, Zap } from "lucide-react";

const badges = [
    {
        icon: Users,
        value: "50,000+",
        label: "Active Users",
        color: "from-blue-500 to-indigo-500"
    },
    {
        icon: Award,
        value: "4.9/5",
        label: "User Rating",
        color: "from-yellow-500 to-orange-500"
    },
    {
        icon: Shield,
        value: "100%",
        label: "Secure & Private",
        color: "from-green-500 to-emerald-500"
    },
    {
        icon: Zap,
        value: "30s",
        label: "Resume Creation",
        color: "from-purple-500 to-pink-500"
    }
];

export default function TrustBadges() {
    return (
        <section className="py-12 bg-white border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {badges.map((badge, index) => {
                        const Icon = badge.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} mb-4`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">{badge.value}</div>
                                <div className="text-sm text-slate-600">{badge.label}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

