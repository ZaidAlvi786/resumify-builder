"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DataLoaderProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
}

const fadeInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      staggerChildren: 0.05,
    },
  },
};

const skeletonVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export default function DataLoader({ 
  isLoading, 
  children, 
  skeleton,
  className = "" 
}: DataLoaderProps) {
  const defaultSkeleton = (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"
          style={{
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          }}
        />
      ))}
    </div>
  );

  return (
    <div className={className}>
      {isLoading ? (
        <motion.div
          key="skeleton"
          variants={skeletonVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {skeleton || defaultSkeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

