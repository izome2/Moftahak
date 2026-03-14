'use client';

import React from 'react';
import { toWesternNumerals } from '@/lib/utils';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currency?: string;
  suffix?: string;
}

export default function NumberInput({ onChange, currency, suffix, className, ...rest }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = toWesternNumerals(e.target.value);
    // Allow only digits, one decimal point, and optional leading minus
    val = val.replace(/[^\d.\-]/g, '');
    // Remove all dots except the first one
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    // Only allow minus at the beginning
    if (val.indexOf('-') > 0) {
      val = val.replace(/-/g, '');
    }
    // Limit length to prevent extremely large numbers
    if (val.replace(/[.\-]/g, '').length > 12) return;

    e.target.value = val;
    onChange?.(e);
  };

  if (currency || suffix) {
    return (
      <div className="relative flex items-center">
        <input
          {...rest}
          type="text"
          inputMode="decimal"
          onChange={handleChange}
          className={`${className} ${currency || suffix ? 'pe-12' : ''}`}
        />
        {(currency || suffix) && (
          <span className="absolute end-3 text-xs text-secondary/40 font-dubai pointer-events-none">
            {currency || suffix}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      onChange={handleChange}
      className={className}
    />
  );
}
