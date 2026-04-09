'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SelectOption {
  value: string;
  label: string;
  image?: string | null;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

type OptionItem = SelectOption | SelectGroup;

function isGroup(o: OptionItem): o is SelectGroup {
  return 'options' in o;
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  placeholder?: string;
  icon?: React.ReactNode;
  variant?: 'filter' | 'form';
  className?: string;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
  variant = 'form',
  className = '',
  disabled = false,
  required = false,
  emptyMessage,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /* ---- resolve selected option ---- */
  const selectedOption = useMemo(() => {
    for (const item of options) {
      if (isGroup(item)) {
        const f = item.options.find(o => o.value === value);
        if (f) return f;
      } else if (item.value === value) return item;
    }
    return null;
  }, [options, value]);

  const text = selectedOption?.label ?? placeholder ?? '';
  const showPlaceholder = !selectedOption && !!placeholder;

  /* ---- dropdown position (fixed, portal-safe) ---- */
  const calc = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const above = r.top;
    const down = below >= 200 || below >= above;
    setPos({
      position: 'fixed',
      ...(down ? { top: r.bottom + 6 } : { bottom: window.innerHeight - r.top + 6 }),
      right: window.innerWidth - r.right,
      width: Math.max(r.width, 180),
      maxHeight: Math.min(down ? below - 12 : above - 12, 280),
      zIndex: 9999,
    });
  }, []);

  const toggle = useCallback(() => {
    if (disabled) return;
    if (!open) calc();
    setOpen(o => !o);
  }, [disabled, calc, open]);

  const doClose = useCallback(() => setOpen(false), []);

  /* ---- close on outside click / resize ---- */
  useEffect(() => {
    if (!open) return;
    const onResize = () => doClose();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, doClose]);

  /* ---- select handler ---- */
  const pick = useCallback((v: string) => { onChange(v); doClose(); }, [onChange, doClose]);

  /* ---- variant styles ---- */
  const btnCls = variant === 'filter'
    ? 'ps-1 pe-2 h-[42px] rounded-xl border-2 border-primary/20 bg-white hover:border-primary/40'
    : 'ps-1 pe-2 h-[46px] rounded-xl border-2 border-primary/20 bg-accent/20 hover:border-primary/40';

  /* ---- avatar helper ---- */
  const Avatar = ({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return src ? (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-lg object-cover shrink-0 border border-primary/15"
        style={{ width: size, height: size }}
      />
    ) : (
      <span
        className="rounded-lg bg-primary/15 text-secondary/60 flex items-center justify-center shrink-0 font-dubai font-bold border border-primary/15"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >{initials}</span>
    );
  };

  /* ---- render one option row ---- */
  const optBtn = (o: SelectOption, indent = false) => (
    <button
      key={o.value || '__empty__'}
      type="button"
      onClick={() => pick(o.value)}
      className={`w-full flex items-center justify-between gap-2 text-sm font-dubai text-right
        transition-all duration-150 rounded-xl
        ${indent ? 'ps-1.5 pe-2.5 h-[44px]' : 'ps-1 pe-2 h-[44px]'}
        ${o.value === value
          ? 'bg-primary/12 text-secondary font-medium'
          : 'text-secondary/70 hover:bg-primary/[0.06] hover:text-secondary'}`}
    >
      <span className="flex items-center gap-1.5 truncate">
        {o.image !== undefined && <Avatar src={o.image} name={o.label} />}
        <span className="truncate">{o.label}</span>
      </span>
      {o.value === value && <Check size={13} className="text-primary shrink-0" />}
    </button>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 cursor-pointer font-dubai text-secondary text-sm
          transition-all duration-200
          ${btnCls}
          ${open ? 'border-primary shadow-[0_0_0_3px_rgba(237,191,140,0.15)]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          {selectedOption?.image !== undefined && selectedOption?.image !== null && (
            <Avatar src={selectedOption.image} name={selectedOption.label} size={36} />
          )}
          <span className={showPlaceholder ? 'text-secondary/40' : ''}>
            {text}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-secondary/40 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Hidden input for native form validation */}
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={() => {}}
          required
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Dropdown portal */}
      {open && mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={doClose}
          />

          {/* Dropdown panel */}
          <div
            ref={dropRef}
            style={pos}
            className="bg-white rounded-2xl border-2 border-primary/25 overflow-hidden
              shadow-[0_8px_32px_rgba(237,191,140,0.20)]"
          >
            <div className="overflow-y-auto p-1.5" style={{ maxHeight: 'inherit' }}>
              {options.length === 0 && emptyMessage ? (
                <div className="px-3 py-4 text-center text-sm text-secondary/40 font-dubai">
                  {emptyMessage}
                </div>
              ) : options.map((item, i) =>
                isGroup(item) ? (
                  <div key={`grp-${i}`}>
                    {i > 0 && <div className="mx-2 my-1.5 border-t border-primary/8" />}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-secondary/35 font-dubai uppercase tracking-wider">
                      {item.label}
                    </div>
                    {item.options.map(o => optBtn(o, true))}
                  </div>
                ) : optBtn(item)
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
