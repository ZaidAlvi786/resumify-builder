import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
    name: string;
    role: string;
    content: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        name: "Sarah Chen",
        role: "Software Engineer at Google",
        content: "Resumify AI transformed my job search. The AI suggestions helped me land 3x more interviews. The resume improvement feature is a game-changer!",
        rating: 5
    },
    {
        name: "Michael Rodriguez",
        role: "Marketing Director",
        content: "I've tried multiple resume builders, but Resumify AI stands out. The skill gap visualizer helped me identify exactly what I was missing. Highly recommend!",
        rating: 5
    },
    {
        name: "Emily Johnson",
        role: "Product Manager",
        content: "The version history feature saved me so much time. I can compare different versions and see exactly what changed. This is the best resume tool I've used.",
        rating: 5
    },
    {
        name: "David Kim",
        role: "Data Scientist",
        content: "The AI cover letter generator is incredible. It creates personalized letters that actually match the job description. Got my dream job thanks to this!",
        rating: 5
    },
    {
        name: "Lisa Wang",
        role: "UX Designer",
        content: "The templates are beautiful and the AI suggestions are spot-on. My resume went from average to exceptional. Worth every moment!",
        rating: 5
    },
    {
        name: "James Thompson",
        role: "Business Analyst",
        content: "The interview prep feature helped me ace my interviews. The personalized questions based on my resume were exactly what I needed to practice.",
        rating: 5
    }
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">
                        Trusted by Thousands of Job Seekers
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Join over 50,000+ professionals who have landed their dream jobs with Resumify AI
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <span className="text-2xl font-bold text-slate-900 ml-2">4.9</span>
                        <span className="text-slate-600">/ 5.0</span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900">{testimonial.name}</h3>
                                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                                <Quote className="w-6 h-6 text-blue-200 flex-shrink-0" />
                            </div>
                            <p className="text-slate-700 leading-relaxed">{testimonial.content}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

