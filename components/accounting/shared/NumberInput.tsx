'use client';

import React from 'react';
import { toWesternNumerals } from '@/lib/utils';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export default function NumberInput({ onChange, ...rest }: Props) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      onChange={(e) => {
        e.target.value = toWesternNumerals(e.target.value).replace(/[^\d.\-]/g, '');
        onChange?.(e);
      }}
    />
  );
}
