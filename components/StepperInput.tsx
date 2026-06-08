'use client';

import React from 'react';

interface StepperInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export const StepperInput: React.FC<StepperInputProps> = ({ label, value, min, max, step, onChange }) => {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase mb-2">{label}</label>
      <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          aria-label={`Уменьшить ${label}`}
          className="w-11 h-12 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-black shrink-0"
        >
          −
        </button>
        <span className="flex-1 text-center font-black text-slate-700 text-lg select-none tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          aria-label={`Увеличить ${label}`}
          className="w-11 h-12 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-black shrink-0"
        >
          +
        </button>
      </div>
    </div>
  );
};
