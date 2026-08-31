import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronRight, Clock } from 'lucide-react';
import { getCareStatusConfig } from '../services/patientService';

/**
 * PatientCard Component
 * 
 * Renders a patient summary card for the caregiver dashboard roster.
 * Navigates directly to /patients/:id/details.
 * 
 * Features:
 * - Photo / Avatar with Initials/Icon fallback
 * - Name & Age
 * - Colored care status dot with interactive hover tooltip (Single Source of Truth)
 * - "Last active" stat line
 * - Smooth subtle scale lift on card hover
 */
export const PatientCard = ({ patient }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  if (!patient) return null;

  const statusConfig = getCareStatusConfig(patient.careStatus);

  return (
    <Link
      to={`/patients/${patient.id}/details`}
      className="group block bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-5 sm:p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            {patient.avatarUrl ? (
              <img
                src={patient.avatarUrl}
                alt={patient.name}
                className="w-12 h-12 rounded-full object-cover border border-border/80 dark:border-ink-soft/40 group-hover:scale-105 transition-transform duration-200 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-cream dark:bg-ink-soft/40 border border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <User className="w-6 h-6" />
              </div>
            )}

            {/* Colored Status Dot with Single Custom Hover Tooltip (Bottom-Right) */}
            <div
              className="absolute -bottom-0.5 -right-0.5 p-0.5"
              onMouseEnter={(e) => {
                e.stopPropagation();
                setIsTooltipOpen(true);
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setIsTooltipOpen(false);
              }}
            >
              <span
                className={`block w-3.5 h-3.5 rounded-full ${statusConfig.dotColor} ring-2 ring-surface dark:ring-ink transition-transform hover:scale-110`}
                aria-label={`Status: ${statusConfig.label}`}
              />

              {/* Single Custom Tooltip positioned below-right of the dot */}
              {isTooltipOpen && (
                <div
                  role="tooltip"
                  className="absolute top-full left-0 mt-1 px-2.5 py-0.5 bg-ink/95 dark:bg-surface text-surface dark:text-ink text-xs font-medium rounded-full shadow-lg whitespace-nowrap z-50 pointer-events-none animate-in fade-in duration-150"
                >
                  {statusConfig.label}
                </div>
              )}
            </div>
          </div>

          {/* Patient Details: Name, Age, Diagnosis */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-ink dark:text-cream group-hover:text-terracotta transition-colors truncate">
                {patient.name}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 mt-0.5 truncate">
              {patient.age ? `Age ${patient.age}` : ''}
              {patient.age && patient.diagnosis ? ' • ' : ''}
              {patient.diagnosis || 'Care Routine Active'}
            </p>
          </div>
        </div>

        {/* Action Affordance */}
        <div className="w-8 h-8 rounded-full bg-cream/60 dark:bg-ink-soft/20 border border-border/60 dark:border-ink-soft/30 flex items-center justify-center text-ink-soft dark:text-cream/70 group-hover:text-terracotta group-hover:bg-cream dark:group-hover:bg-ink-soft/40 group-hover:translate-x-0.5 transition-all shrink-0">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* "Last active" Stat Line */}
      <div className="mt-4 pt-3.5 border-t border-border/60 dark:border-ink-soft/30 flex items-center justify-between gap-2 text-xs text-ink-soft dark:text-cream/60">
        <div className="flex items-center gap-1.5 truncate">
          <Clock className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="truncate">Last active: {patient.lastCheckIn || 'Recent'}</span>
        </div>

        <div className="flex items-center gap-1 text-terracotta font-medium group-hover:underline shrink-0">
          <span>View Profile</span>
        </div>
      </div>
    </Link>
  );
};

export default PatientCard;
