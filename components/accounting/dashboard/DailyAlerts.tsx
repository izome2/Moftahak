'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface CheckInItem {
  id: string;
  clientName: string;
  apartment: string;
  arrivalTime?: string | null;
  checkIn: string;
  checkOut: string;
}

interface CheckOutItem {
  id: string;
  clientName: string;
  apartment: string;
  checkOut: string;
}

interface DailyAlertsProps {
  checkIns: CheckInItem[];
  checkOuts: CheckOutItem[];
  isLoading?: boolean;
}

const formatTime = (time?: string | null) => {
  if (!time) return '—';
  return time;
};

const DailyAlerts: React.FC<DailyAlertsProps> = ({ checkIns, checkOuts, isLoading }) => {
  const t = useTranslation();
  const total = checkIns.length + checkOuts.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white border border-secondary/[0.08] rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-secondary/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
            <AlertTriangle size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-secondary font-dubai">{t.accounting.dashboard.todayAlerts}</h3>
        </div>
        {!isLoading && total > 0 && (
          <span className="text-xs bg-secondary/[0.04] text-secondary/70 px-2.5 py-1 rounded-full font-dubai font-bold">
            {total} {t.accounting.dashboard.event}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[350px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle size={40} className="text-secondary/20 mx-auto mb-2" />
            <p className="text-secondary/50 font-dubai text-sm">{t.accounting.dashboard.noEventsToday}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Check-Ins */}
            {checkIns.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <LogIn size={14} className="text-primary" />
                  <span className="text-xs font-bold text-secondary font-dubai">
                    {t.accounting.dashboard.checkIn} ({checkIns.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {checkIns.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 bg-primary/8 rounded-xl border border-primary/15"
                    >
                      <div className="p-1.5 rounded-lg bg-primary/15">
                        <LogIn size={14} className="text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary font-dubai text-sm truncate">
                          {item.clientName}
                        </p>
                        <p className="text-xs text-secondary/50 font-dubai truncate">
                          {item.apartment}
                        </p>
                      </div>
                      {item.arrivalTime && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Clock size={12} className="text-primary" />
                          <span className="text-xs text-secondary font-dubai font-bold">
                            {formatTime(item.arrivalTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Check-Outs */}
            {checkOuts.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <LogOut size={14} className="text-secondary/60" />
                  <span className="text-xs font-bold text-secondary/60 font-dubai">
                    {t.accounting.dashboard.checkOut} ({checkOuts.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {checkOuts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 bg-secondary/5 rounded-xl border border-secondary/10"
                    >
                      <div className="p-1.5 rounded-lg bg-secondary/10">
                        <LogOut size={14} className="text-secondary/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary font-dubai text-sm truncate">
                          {item.clientName}
                        </p>
                        <p className="text-xs text-secondary/50 font-dubai truncate">
                          {item.apartment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyAlerts;
