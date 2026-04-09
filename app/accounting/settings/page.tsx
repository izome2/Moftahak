'use client';

import { useState, useMemo } from 'react';
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
    <div className="flex-1 flex flex-col gap-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
      {/* Title */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center shrink-0">
          <Settings size={16} className="text-white sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-secondary font-dubai tracking-tight truncate">{t.accounting.settings.title}</h1>
          <p className="text-xs text-secondary/75 font-dubai mt-0.5 hidden sm:block">
            {t.accounting.settings.subtitle}
          </p>
        </div>
      </div>

      {/* Tab Navigation - always horizontal, wrapping */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-1.5 sm:gap-2"
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isSystem = tab.id === 'system';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] sm:text-xs font-bold font-dubai
                rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-secondary text-white shadow-sm'
                  : isSystem
                    ? 'bg-white border border-rose-200/60 text-rose-400/70 hover:bg-rose-50/50 hover:text-rose-500'
                    : 'bg-white border border-secondary/[0.08] text-secondary/75 hover:text-secondary hover:border-secondary/15'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </motion.nav>
      </div>

      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 overflow-y-auto">
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
