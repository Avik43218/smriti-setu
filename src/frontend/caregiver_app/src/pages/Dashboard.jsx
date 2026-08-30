import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Sparkles } from 'lucide-react';

export const Dashboard = () => {
  const { caregiver } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-surface dark:bg-ink-soft/20 border border-border dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream dark:bg-ink-soft/40 text-terracotta text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smriti Setu Shell Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream tracking-tight">
              Welcome, {caregiver?.name || 'Caregiver'}
            </h1>
            <p className="text-sm text-ink-soft dark:text-cream/70 mt-1.5 max-w-xl leading-relaxed">
              Smriti Setu dashboard shell and navigation are active. The multi-patient overview, activity logs, and real-time status cards will be integrated here next.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
            <div className="w-12 h-12 rounded-card bg-cream dark:bg-ink-soft/30 border border-border dark:border-ink-soft/40 flex items-center justify-center text-terracotta shadow-xs">
              <LayoutDashboard className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Section Placeholder */}
      <div className="bg-surface dark:bg-ink-soft/20 border border-border dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-terracotta" />
          <h2 className="text-lg font-bold text-ink dark:text-cream">
            Patient Management
          </h2>
        </div>
        <p className="text-sm text-ink-soft dark:text-cream/70 leading-relaxed">
          The top-level patient switcher will load patient-specific records, reminders, and longitudinal metrics across all three tabs.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
