'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface SupervisorSelectProps {
  bookingId: string;
  field: 'receptionSupervisor' | 'deliverySupervisor';
  value: string | null;
  onSaved?: (bookingId: string, field: string, value: string) => void;
}



const SupervisorSelect: React.FC<SupervisorSelectProps> = ({
  bookingId,
  field,
  value,
  onSaved,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animState, setAnimState] = useState<'idle' | 'entering' | 'open' | 'leaving'>('idle');
  const [current, setCurrent] = useState<string>(value || '');
  const [saving, setSaving] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [pos, setPos] = useState<React.CSSProperties>({});
  const [openDir, setOpenDir] = useState<'down' | 'up'>('down');
  const btnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [supervisors, setSupervisors] = useState<string[]>([]);
  const t = useTranslation();

  // Fetch supervisors from settings API
  useEffect(() => {
    fetch('/api/accounting/settings/supervisors')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.supervisors) setSupervisors(d.supervisors); })
      .catch(() => {});
  }, []);

  const isAnimIn = animState === 'entering';
  const isAnimOut = animState === 'leaving';

  useEffect(() => setMounted(true), []);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  /* ---- dropdown position (portal-safe) ---- */
  const calcPos = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const above = r.top;
    const down = below >= 280 || below >= above;
    setOpenDir(down ? 'down' : 'up');
    setPos({
      position: 'fixed',
      ...(down ? { top: r.bottom + 4 } : { bottom: window.innerHeight - r.top + 4 }),
      right: window.innerWidth - r.right,
      width: Math.max(r.width, 160),
      maxHeight: Math.min(down ? below - 12 : above - 12, 300),
      zIndex: 9999,
    });
  }, []);

  const doClose = useCallback(() => {
    setAnimState('leaving');
    setIsOpen(false);
    closeTimer.current = setTimeout(() => {
      setVisible(false);
      setAnimState('idle');
    }, 180);
  }, []);

  const openDropdown = useCallback(() => {
    calcPos();
    setVisible(true);
    setAnimState('entering');
    setIsOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimState('open'));
    });
  }, [calcPos]);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => doClose();
    const onScroll = () => calcPos();
    window.addEventListener('resize', onResize);
    document.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, calcPos, doClose]);

  const handleSelect = useCallback(async (name: string) => {
    if (name === current) {
      doClose();
      return;
    }

    setSaving(true);
    doClose();

    try {
      const res = await fetch(`/api/accounting/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: name }),
      });

      if (res.ok) {
        setCurrent(name);
        onSaved?.(bookingId, field, name);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }, [bookingId, field, current, onSaved, doClose]);

  const handleCustomSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed) {
      handleSelect(trimmed);
      setCustomInput('');
    }
  }, [customInput, handleSelect]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => isOpen ? doClose() : openDropdown()}
        disabled={saving}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
          border transition-all duration-200 min-w-[120px] justify-between
          ${current
            ? 'bg-secondary/[0.04] border-secondary/[0.08] text-secondary hover:bg-secondary/[0.06]'
            : 'bg-secondary/[0.03] border-secondary/[0.06] text-secondary/60 hover:bg-secondary/[0.05] hover:text-secondary/70'
          }
          ${isOpen ? 'border-secondary/20 shadow-[0_0_0_3px_rgba(16,48,43,0.06)]' : ''}
          ${saving ? 'opacity-60 cursor-wait' : 'cursor-pointer'}
        `}
      >
        <span className="flex items-center gap-1.5">
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
          <span className="truncate max-w-[80px]">
            {saving ? t.accounting.common.saving : current || t.accounting.daily.selectSupervisor}
          </span>
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {visible && mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={doClose}
          />

          {/* Dropdown */}
          <div
            style={{
              ...pos,
              transformOrigin: openDir === 'down' ? 'top center' : 'bottom center',
              opacity: (isAnimIn || isAnimOut) ? 0 : 1,
              transform: (isAnimIn || isAnimOut)
                ? `scale(0.96) translateY(${openDir === 'down' ? '-4px' : '4px'})`
                : 'scale(1) translateY(0)',
              transition: 'opacity 180ms cubic-bezier(0.16,1,0.3,1), transform 180ms cubic-bezier(0.16,1,0.3,1)',
            }}
            className="bg-white rounded-2xl border border-secondary/[0.08] overflow-hidden
              shadow-lg"
          >
            <div className="overflow-y-auto p-1.5" style={{ maxHeight: 'inherit' }}>
              {supervisors.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSelect(name)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 text-sm
                    transition-all duration-150 text-right rounded-xl
                    ${name === current
                      ? 'bg-primary/12 text-secondary font-medium'
                      : 'text-secondary/70 hover:bg-primary/[0.06] hover:text-secondary'
                    }
                  `}
                >
                  <span>{name}</span>
                  {name === current && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>

            {/* Custom supervisor input */}
            <form onSubmit={handleCustomSubmit} className="border-t border-secondary/[0.06] p-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={t.accounting.daily.customName}
                className="w-full px-2.5 py-1.5 text-sm border border-secondary/[0.08] rounded-xl
                  focus:outline-none focus:border-secondary/20
                  placeholder:text-secondary/30 text-right"
                dir="rtl"
              />
            </form>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default SupervisorSelect;
