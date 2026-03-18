'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Skeleton Primitives
// ============================================================================

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** شريحة Skeleton أساسية مع تأثير shimmer */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-secondary/10',
        className,
      )}
      style={style}
    />
  );
}

// ============================================================================
// Skeleton Presets
// ============================================================================

/** بطاقة إحصائية skeleton */
export function SkeletonStatsCard() {
  return (
    <div className="bg-white border border-secondary/[0.08] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-24 h-8" />
      <Skeleton className="w-32 h-3" />
    </div>
  );
}

/** صف جدول skeleton */
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={cn('h-4', i === 0 ? 'w-28' : 'w-20')} />
        </td>
      ))}
    </tr>
  );
}

/** جدول كامل skeleton */
export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-secondary/[0.08] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex gap-6 px-4 py-3 bg-secondary/5 border-b border-primary/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      {/* Rows */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** بطاقة محتوى skeleton */
export function SkeletonCard() {
  return (
    <div className="bg-white border border-secondary/[0.08] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-3/4 h-3" />
    </div>
  );
}

/** رسم بياني skeleton */
export function SkeletonChart({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={cn('bg-white border border-secondary/[0.08] rounded-2xl p-5 space-y-4', height)}>
      <div className="flex items-center justify-between">
        <Skeleton className="w-28 h-5" />
        <Skeleton className="w-20 h-4" />
      </div>
      <div className="flex-1 flex items-end gap-2 pb-4">
        {[40, 65, 50, 80, 55, 70, 45, 90, 60, 75, 50, 85].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

/** صفحة Dashboard skeleton كاملة */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonTable rows={4} cols={3} />
        <SkeletonTable rows={4} cols={3} />
      </div>
    </div>
  );
}

/** صفحة قائمة skeleton */
export function SkeletonListPage() {
  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-36 h-8" />
        <div className="flex gap-3">
          <Skeleton className="w-28 h-10 rounded-xl" />
          <Skeleton className="w-28 h-10 rounded-xl" />
        </div>
      </div>
      {/* Table */}
      <SkeletonTable rows={6} cols={6} />
    </div>
  );
}
