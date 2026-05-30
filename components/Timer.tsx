'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
  color?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'bar' | 'clock';
}

export const Timer: React.FC<TimerProps> = ({ 
  duration, 
  onTimeUp, 
  isActive, 
  color = "bg-amber-500",
  orientation = 'horizontal',
  variant = 'bar'
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;
    
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const isUrgent = timeLeft <= 5;

  // Convert bg class to text class for SVG stroke
  const strokeColor = isUrgent ? "text-red-500" : color.replace('bg-', 'text-');
  const textColor = isUrgent ? "text-red-600" : "text-slate-700";

  if (variant === 'clock') {
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const dashOffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-full aspect-square max-w-[140px] mx-auto">
        <svg 
          className="w-full h-full" 
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200"
          />
          {/* Progress circle - Rotated -90deg to start from top */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={strokeColor}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: "linear" }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Centered Text: 
              - Normal: ~38% height 
              - Urgent: 90% height (max allowed) 
          */}
          <motion.text
            x="50%"
            y="54%" 
            dominantBaseline="middle"
            textAnchor="middle"
            className={`font-black ${textColor} ${isUrgent ? 'animate-pulse' : ''}`}
            initial={false}
            animate={{ fontSize: isUrgent ? "90px" : "38px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            fill="currentColor"
          >
            {timeLeft}
          </motion.text>
        </svg>
      </div>
    );
  }

  return (
    <>
      {/* Visual Timer Bar */}
      {orientation === 'vertical' ? (
        <div className="h-full flex flex-col items-center gap-3 relative py-2">
          <div className={`text-xl md:text-3xl font-black uppercase tracking-widest vertical-text transition-all ${isUrgent ? "text-red-600 scale-125 animate-pulse" : "text-slate-500"}`}>
            {timeLeft}
          </div>
          <div className={`w-8 md:w-10 flex-1 rounded-full overflow-hidden shadow-inner relative flex flex-col justify-end transition-all border-4 ${isUrgent ? "bg-red-50 border-red-200" : "bg-slate-100 border-slate-200"}`}>
            <motion.div 
              className={`w-full rounded-full ${isUrgent ? "bg-red-500" : color}`}
              initial={{ height: "100%" }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        </div>
      ) : (
        <div className="w-full relative">
          <div className="flex justify-between mb-1 text-[10px] font-black uppercase tracking-widest transition-all">
            <span className="text-slate-400">ÐžÑÑ‚Ð°Ð»Ð¾ÑÑŒ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð¸</span>
            <span className={isUrgent ? "text-red-600 scale-125 font-black animate-pulse" : "text-slate-400"}>{timeLeft}Ñ</span>
          </div>
          <div className={`h-3 w-full rounded-full overflow-hidden shadow-inner transition-all ${isUrgent ? "bg-red-100 ring-2 ring-red-300" : "bg-slate-200"}`}>
            <motion.div 
              className={`h-full ${isUrgent ? "bg-red-500" : color}`}
              initial={{ width: "100%" }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

