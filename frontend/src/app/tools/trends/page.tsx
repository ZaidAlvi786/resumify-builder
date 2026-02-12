"use client";

import React from "react";
import CareerTrendAnalyzer from "@/components/CareerTrendAnalyzer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CareerTrendsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto mb-8">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>
            </div>
            <CareerTrendAnalyzer />
        </div>
    );
}
