'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Loader2,
  Check,
  RefreshCw,
} from 'lucide-react';

const CurrencyRateManager: React.FC = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [inputRate, setInputRate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/accounting/currency-rate?from=USD&to=EGP');
      const json = await res.json();
      if (res.ok && json.rate) {
        setRate(json.rate.rate);
        setInputRate(String(json.rate.rate));
        setLastUpdated(json.rate.updatedAt);
      } else {
        setRate(null);
        setInputRate('50');
      }
    } catch { /* silent */ } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  const handleSave = async () => {
    const newRate = parseFloat(inputRate);
    if (isNaN(newRate) || newRate <= 0) {
      setError('سعر الصرف يجب أن يكون رقماً موجباً');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/accounting/currency-rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCurrency: 'USD',
          toCurrency: 'EGP',
          rate: newRate,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'حدث خطأ'); return; }
      setRate(newRate);
      setLastUpdated(json.rate.updatedAt);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('فشل الاتصال');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = rate !== null && parseFloat(inputRate) !== rate;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-secondary font-dubai flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        سعر الصرف
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="bg-primary/5 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border-2 border-primary/20">
                <span className="text-xs font-bold text-secondary font-dubai">1 USD</span>
                <span className="text-secondary/30">=</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={inputRate}
                  onChange={e => setInputRate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl
                    focus:outline-none focus:border-primary font-dubai font-bold text-secondary"
                />
              </div>
              <span className="text-xs font-bold text-secondary font-dubai">EGP</span>
            </div>

            {lastUpdated && (
              <p className="text-[10px] text-secondary/50 font-dubai">
                آخر تحديث: {new Date(lastUpdated).toLocaleDateString('ar-EG', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 font-dubai">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanged}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold
                bg-secondary text-white rounded-xl hover:bg-secondary/90 transition
                disabled:opacity-50 font-dubai"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : null}
              {isSaving ? 'جاري الحفظ...' : saved ? 'تم الحفظ' : 'حفظ التغييرات'}
            </button>
            <button
              onClick={fetchRate}
              disabled={isLoading}
              className="p-2 text-secondary/40 hover:text-secondary transition rounded-lg hover:bg-primary/5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CurrencyRateManager;
