'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  FolderKanban,
  Building2,
  DollarSign,
  UserCheck,
  Users,
  Database,
} from 'lucide-react';
import ProjectsManager from '@/components/accounting/settings/ProjectsManager';
import ApartmentsManager from '@/components/accounting/settings/ApartmentsManager';
import CurrencyRateManager from '@/components/accounting/settings/CurrencyRateManager';
import SupervisorsManager from '@/components/accounting/settings/SupervisorsManager';
import TeamManager from '@/components/accounting/settings/TeamManager';
import InvitationManager from '@/components/accounting/settings/InvitationManager';
import OpsApartmentAssignments from '@/components/accounting/settings/OpsApartmentAssignments';
import SystemManager from '@/components/accounting/settings/SystemManager';

type SettingsTab = 'projects' | 'apartments' | 'currency' | 'supervisors' | 'team' | 'ops-assignments' | 'system';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'projects', label: 'المشاريع', icon: FolderKanban },
  { id: 'apartments', label: 'الشقق', icon: Building2 },
  { id: 'currency', label: 'سعر الصرف', icon: DollarSign },
  { id: 'supervisors', label: 'المشرفين', icon: UserCheck },
  { id: 'team', label: 'الفريق', icon: Users },
  { id: 'ops-assignments', label: 'تعيين الشقق', icon: Building2 },
  { id: 'system', label: 'النظام', icon: Database },
];

export default function AccountingSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('projects');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
          <Settings size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary font-dubai">الإعدادات</h1>
          <p className="text-sm text-secondary/60 font-dubai">
            إدارة المشاريع، الشقق، سعر الصرف، المشرفين، والفريق
          </p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none"
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-dubai
                rounded-xl whitespace-nowrap transition-all duration-200
                ${isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-primary/5 text-secondary/50 hover:bg-primary/10 hover:text-secondary'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border-2 border-primary/20 rounded-2xl p-5 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
      >
        {activeTab === 'projects' && <ProjectsManager />}
        {activeTab === 'apartments' && <ApartmentsManager />}
        {activeTab === 'currency' && <CurrencyRateManager />}
        {activeTab === 'supervisors' && <SupervisorsManager />}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <InvitationManager />
            <div className="border-t-2 border-primary/10 pt-6">
              <TeamManager />
            </div>
          </div>
        )}
        {activeTab === 'ops-assignments' && <OpsApartmentAssignments />}
        {activeTab === 'system' && <SystemManager />}
      </motion.div>
    </div>
  );
}
