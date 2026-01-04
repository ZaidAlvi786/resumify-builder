import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

export default function Logo({ className, size = "md", showText = true }: LogoProps) {
    const sizeClasses = {
        sm: "text-xl",
        md: "text-2xl",
        lg: "text-4xl",
    };

    return (
        <div className={cn("flex items-center gap-2", className)} style={{ fontFamily: "'Balldoug', serif" }}>
            <div className="relative">
                <span className={cn("text-slate-800 font-normal", sizeClasses[size])} style={{ fontFamily: "'Balldoug', serif" }}>RESUM</span>
                <span className={cn("text-slate-800 relative inline-block font-normal", sizeClasses[size])} style={{ fontFamily: "'Balldoug', serif" }}>
                    I
                    {/* Yellow accent on the I */}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 transform rotate-45 -translate-y-1/2" />
                </span>
                <span className={cn("text-slate-800 font-normal", sizeClasses[size])} style={{ fontFamily: "'Balldoug', serif" }}>FY</span>
            </div>
            {showText && (
                <span className={cn("text-slate-600 font-normal ml-1", size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-xl")}>
                    AI
                </span>
            )}
        </div>
    );
}

