'use client';

import { motion } from 'framer-motion';

interface TurnTransitionProps {
  teamName: string;
  visible: boolean;
  label: string;
}

export function TurnTransition({ teamName, visible, label }: TurnTransitionProps) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-modal flex items-center justify-center bg-fg/40"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="rounded-card border-2 border-primary bg-surface px-6 py-4 text-center shadow-card"
      >
        <div className="mb-2 text-sm font-bold text-fg-muted">{label}</div>
        <div className="whitespace-nowrap text-2xl font-extrabold text-fg md:text-3xl">{teamName}</div>
      </motion.div>
    </motion.div>
  );
}
