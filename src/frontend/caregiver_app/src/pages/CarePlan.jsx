import React from 'react';
import { CalendarCheck, Clock } from 'lucide-react';

export const CarePlan = () => {
  return (
    <div className="space-y-6">
      <div className="bg-surface dark:bg-ink-soft/20 border border-border dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/15 text-sage border border-sage/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream tracking-tight">
              Care Plan & Customization
            </h1>
            <p className="text-sm text-ink-soft dark:text-cream/70 mt-1.5 max-w-xl leading-relaxed">
              Custom reminder schedules, medication alerts, and emergency contact registries synchronized with the Smriti Setu patient tablet will be configurable here.
            </p>
          </div>

          <div className="w-12 h-12 rounded-card bg-cream dark:bg-ink-soft/30 border border-border dark:border-ink-soft/40 flex items-center justify-center text-sage shrink-0 shadow-xs">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarePlan;
