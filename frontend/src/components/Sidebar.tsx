"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";
import { 
  LogOut, 
  Menu, 
  X, 
  Home,
  FileText,
  CheckCircle2,
  Mail,
  FileX,
  MessageSquare,
  Route,
  Map,
  BarChart3,
  Globe,
  TrendingUp,
  LayoutDashboard,
  Target,
  Wrench,
  User,
  Settings,
  CreditCard,
  DollarSign
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const mainLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/ai-agent", label: "AI Resume Agent", icon: MessageSquare },
    { href: "/builder", label: "Build Resume", icon: FileText },
    { href: "/job-tailor", label: "Job Tailor", icon: Target },
    { href: "/reviewer", label: "Review Resume", icon: CheckCircle2 },
    { href: "/cover-letter", label: "Cover Letter", icon: Mail },
    { href: "/resignation-letter", label: "Resignation Letter", icon: FileX },
    { href: "/interview-prep", label: "Interview Prep", icon: MessageSquare },
    { href: "/salary-negotiation", label: "Salary Negotiation", icon: DollarSign },
  ];

  const advancedLinks = [
    { href: "/tools", label: "AI Tools", icon: Wrench },
    { href: "/career-path", label: "Career Path", icon: Route },
    { href: "/career-trends", label: "Career Trends", icon: TrendingUp },
    { href: "/heatmap", label: "Heat Map", icon: Map },
    { href: "/benchmark", label: "Benchmark", icon: BarChart3 },
    { href: "/translate", label: "Translate", icon: Globe },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/pricing", label: "Billing & Plans", icon: CreditCard },
  ];

  const NavLink = ({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: any; onClick?: () => void }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-50 text-indigo-600"
            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span>{label}</span>
      </Link>
    );
  };

  // Sidebar always renders now

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-40 transition-transform duration-300 ease-in-out flex-shrink-0 overflow-y-auto",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Main Links */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
                Main
              </div>
              <div className="space-y-1">
                {session ? (
                  mainLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      icon={link.icon}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))
                ) : (
                  <NavLink
                    href="/"
                    label="Home"
                    icon={Home}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                )}
              </div>
            </div>

            {/* Advanced Features */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
                Advanced
              </div>
              <div className="space-y-1">
                {session ? (
                  advancedLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      icon={link.icon}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))
                ) : (
                  <NavLink
                    href="/pricing"
                    label="Pricing"
                    icon={CreditCard}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                )}
              </div>
            </div>
          </nav>

          {/* User Profile / Auth */}
          <div className="p-4 border-t border-slate-200 space-y-1">
            {session ? (
              <>
                <NavLink
                    href="/settings"
                    label="Settings"
                    icon={Settings}
                    onClick={() => setMobileMenuOpen(false)}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-slate-700 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/login" className="block w-full">
                <Button className="w-full justify-start gap-3 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Login / Sign Up</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer for sidebar on desktop - will be handled by layout */}
    </>
  );
}

