import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="bg-surface dark:bg-ink-soft/20 border border-border dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream tracking-tight">
              Analytics & Trends
            </h1>
            <p className="text-sm text-ink-soft dark:text-cream/70 mt-1.5 max-w-xl leading-relaxed">
              Historical activity tracking, cognitive drift indices, and longitudinal chart visualizers powered by Smriti Setu clinical metrics will be available here.
            </p>
          </div>

          <div className="w-12 h-12 rounded-card bg-cream dark:bg-ink-soft/30 border border-border dark:border-ink-soft/40 flex items-center justify-center text-gold shrink-0 shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
