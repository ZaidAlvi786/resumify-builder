"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function StaggerAnimation({ 
  children, 
  className = "",
  delay = 0,
  staggerDelay = 0.1 
}: StaggerAnimationProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={{ transitionDelay: `${delay}s` }}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={itemVariants}>{children}</motion.div>
      )}
    </motion.div>
  );
}

