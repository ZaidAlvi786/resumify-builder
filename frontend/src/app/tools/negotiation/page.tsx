"use client";

import React from "react";
import SalaryNegotiationSimulator from "@/components/SalaryNegotiationSimulator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SalaryNegotiationPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto mb-8">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>
            </div>
            <SalaryNegotiationSimulator />
        </div>
    );
}
