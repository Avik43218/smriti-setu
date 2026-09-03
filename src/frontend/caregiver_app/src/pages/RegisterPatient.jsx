import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';

export const RegisterPatient = () => {
  return (
    <div className="space-y-6 font-sans">
      {/* Return to All Patients / Dashboard Button (Exact same styling as in PatientLayout.jsx) */}
      <Link
        to="/dashboard"
        aria-label="Back to all patients dashboard"
        className="inline-flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 bg-surface/90 dark:bg-ink/90 backdrop-blur-md border border-border/80 dark:border-ink-soft/40 rounded-full shadow-md text-xs sm:text-sm font-medium text-ink-soft dark:text-cream/80 hover:text-ink dark:hover:text-cream hover:bg-cream dark:hover:bg-ink-soft/35 active:scale-95 transition-all select-none outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
      >
        <ArrowLeft className="w-4 h-4 text-terracotta shrink-0" />
        <span className="hidden sm:inline">All Patients</span>
      </Link>

      <div className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-card">
        <div className="w-12 h-12 rounded-full bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta mb-4 shadow-xs">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-ink dark:text-cream tracking-tight">
          Register New Patient
        </h1>
        <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 mt-2 leading-relaxed">
          Patient enrollment and tablet pairing form is coming soon.
        </p>
      </div>
    </div>
  );
};

export default RegisterPatient;
