"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoLoader from "@/components/ui/LogoLoader";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);

            if (!session) {
                // Redirect to login with return URL
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            }
        };

        checkSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) {
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, pathname]);

    if (loading) {
        return <LogoLoader message="Checking authentication" />;
    }

    if (!session) {
        return null; // Will redirect
    }

    return <>{children}</>;
}


