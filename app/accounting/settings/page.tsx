'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
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

const TAB_ICONS: Record<SettingsTab, React.ElementType> = {
  projects: FolderKanban,
  apartments: Building2,
  currency: DollarSign,
  supervisors: UserCheck,
  team: Users,
  'ops-assignments': Building2,
  system: Database,
};

const TAB_IDS: SettingsTab[] = ['projects', 'apartments', 'currency', 'supervisors', 'team', 'ops-assignments', 'system'];

export default function AccountingSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('projects');
  const t = useTranslation();
  const { language } = useLanguage();

  const tabs = useMemo(() => {
    const tabLabels: Record<SettingsTab, string> = {
      projects: t.accounting.settings.tabs.projects,
      apartments: t.accounting.settings.tabs.apartments,
      currency: t.accounting.settings.tabs.exchangeRate,
      supervisors: t.accounting.settings.tabs.supervisors,
      team: t.accounting.settings.tabs.team,
      'ops-assignments': t.accounting.settings.tabs.apartmentAssign,
      system: t.accounting.settings.tabs.system,
    };
    return TAB_IDS.map(id => ({ id, label: tabLabels[id], icon: TAB_ICONS[id] }));
  }, [t]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
          <h1 className="text-2xl font-bold text-secondary font-dubai">{t.accounting.settings.title}</h1>
          <p className="text-sm text-secondary/60 font-dubai">
            {t.accounting.settings.subtitle}
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
        {tabs.map(tab => {
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
