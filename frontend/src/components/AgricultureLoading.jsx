"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";

export default function AgricultureLoading() {
  const leafVariants = {
    animate: {
      y: [0, -15, 0],
      rotate: [0, 15, -15, 0],
      transition: {
        yoyo: Infinity,
        duration: 2,
        ease: "easeInOut",
      },
    },
  };

  // Glow pulse behind seedling
  const glowVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 0.9, 0.6],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut",
      },
    },
  };

  // Floating bubbles around seedling
  const bubbleVariants = {
    animate: {
      y: [-10, -30],
      opacity: [1, 0],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "linear",
      },
    },
  };

  // Loading dots animation
  const dotsVariants = {
    animate: {
      opacity: [0.2, 1, 0.2],
      transition: {
        repeat: Infinity,
        repeatType: "mirror",
        duration: 1.5,
      },
    },
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center h-screen bg-green-50 select-none"
    >
      {/* Glow circle behind seedling */}
      <motion.div
        className="absolute rounded-full bg-green-300 blur-3xl w-36 h-36"
        variants={glowVariants}
        animate="animate"
        aria-hidden="true"
      />

      {/* Container relative for seedling */}
      <div className="relative z-10">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-24 h-24 text-green-700"
          fill="none"
          viewBox="0 0 64 64"
          stroke="currentColor"
          aria-label="Growing seedling"
          role="img"
        >
          {/* Seedling with animated leaves */}
          <motion.path
            variants={leafVariants}
            animate="animate"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M32 54 V40 M32 40 C28 36 28 28 32 24 C36 28 36 36 32 40"
          />
          <motion.path
            variants={leafVariants}
            animate="animate"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M32 40 L24 30"
            style={{ originX: 1, originY: 1 }}
          />
          <motion.path
            variants={leafVariants}
            animate="animate"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M32 40 L40 30"
            style={{ originX: 0, originY: 1 }}
          />
        </motion.svg>

        {/* Floating bubbles */}
        <motion.div
          className="absolute bg-green-400 rounded-full w-3 h-3 left-2 top-12"
          variants={bubbleVariants}
          animate="animate"
          aria-hidden="true"
          style={{ filter: "blur(1px)" }}
        />
        <motion.div
          className="absolute bg-green-300 rounded-full w-2 h-2 right-4 top-8"
          variants={bubbleVariants}
          animate="animate"
          transition={{ delay: 1 }}
          aria-hidden="true"
          style={{ filter: "blur(1px)" }}
        />
        <motion.div
          className="absolute bg-green-500 rounded-full w-2.5 h-2.5 left-16 top-14"
          variants={bubbleVariants}
          animate="animate"
          transition={{ delay: 0.6 }}
          aria-hidden="true"
          style={{ filter: "blur(0.8px)" }}
        />
      </div>

      {/* Text and loading dots */}
      <motion.p
        className="mt-6 text-green-800 font-semibold text-lg flex items-center gap-1"
        animate={{
          scale: [1, 1.05, 1],
          color: ["#166534", "#4ade80", "#166534"],
        }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        Growing your experience
        <motion.span
          className="inline-block"
          variants={dotsVariants}
          animate="animate"
          aria-hidden="true"
        >
          ...
        </motion.span>
      </motion.p>
    </div>
  );
}
