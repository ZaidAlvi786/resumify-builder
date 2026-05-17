// src/components/ExtensionTokenSync.tsx
"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { syncExtensionCookie } from "@/services/extensionApi";

/**
 * Keeps the `resumify_ext` cookie fresh so the Chrome extension can
 * authenticate. Mounted once in the root layout. Renders nothing.
 */
export default function ExtensionTokenSync() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void syncExtensionCookie();
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void syncExtensionCookie();
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}
