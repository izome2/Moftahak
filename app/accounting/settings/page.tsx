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
  MapPin,
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
  'ops-assignments': MapPin,
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center">
          <Settings size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-secondary font-dubai tracking-tight">{t.accounting.settings.title}</h1>
          <p className="text-xs text-secondary/50 font-dubai mt-0.5">
            {t.accounting.settings.subtitle}
          </p>
        </div>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: language === 'ar' ? 12 : -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:w-52 shrink-0"
        >
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:hidden items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold font-dubai
                    rounded-xl whitespace-nowrap transition-all duration-200
                    ${isActive
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-white border border-secondary/[0.08] text-secondary/50 hover:text-secondary hover:border-secondary/15'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop: vertical list */}
          <div className="hidden lg:flex flex-col gap-0.5 bg-white border border-secondary/[0.08] rounded-2xl p-2 shadow-sm">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isSystem = tab.id === 'system';
              return (
                <React.Fragment key={tab.id}>
                  {isSystem && <div className="border-t border-secondary/[0.06] my-1" />}
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-bold font-dubai
                      rounded-xl transition-all duration-200 text-start
                      ${isActive
                        ? 'bg-secondary text-white shadow-sm'
                        : isSystem
                          ? 'text-rose-400/70 hover:bg-rose-50/50 hover:text-rose-500'
                          : 'text-secondary/45 hover:bg-secondary/[0.04] hover:text-secondary/70'
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </motion.nav>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0 bg-white border border-secondary/[0.08] rounded-2xl p-5 shadow-sm"
        >
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'apartments' && <ApartmentsManager />}
          {activeTab === 'currency' && <CurrencyRateManager />}
          {activeTab === 'supervisors' && <SupervisorsManager />}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <InvitationManager />
              <div className="border-t border-secondary/[0.06] pt-6">
                <TeamManager />
              </div>
            </div>
          )}
          {activeTab === 'ops-assignments' && <OpsApartmentAssignments />}
          {activeTab === 'system' && <SystemManager />}
        </motion.div>
      </div>
    </div>
  );
}
