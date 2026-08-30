import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientById, getCareStatusConfig } from '../services/patientService';
import {
  ShieldCheck,
  HeartPulse,
  Clock,
  Phone,
  Tablet,
  AlertCircle,
  Calendar,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPatientById(id);
        if (isMounted) {
          setPatient(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load patient profile details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Initials generator for fallback avatar
  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="bg-surface/60 dark:bg-ink-soft/10 border border-border/60 dark:border-ink-soft/30 rounded-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cream dark:bg-ink-soft/30 shrink-0" />
            <div className="space-y-2.5 flex-1">
              <div className="h-6 w-48 bg-cream dark:bg-ink-soft/30 rounded" />
              <div className="h-4 w-72 bg-cream/70 dark:bg-ink-soft/20 rounded" />
              <div className="h-4 w-56 bg-cream/60 dark:bg-ink-soft/20 rounded" />
            </div>
          </div>
        </div>

        {/* Info Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 bg-surface/60 dark:bg-ink-soft/10 border border-border/60 dark:border-ink-soft/30 rounded-card p-6" />
          <div className="h-44 bg-surface/60 dark:bg-ink-soft/10 border border-border/60 dark:border-ink-soft/30 rounded-card p-6" />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-cream dark:bg-ink-soft/30 flex items-center justify-center text-terracotta mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-ink dark:text-cream">
          {error || 'Patient profile not found.'}
        </p>
      </div>
    );
  }

  const initials = getInitials(patient.name);
  const careStatusConfig = getCareStatusConfig(patient.careStatus);

  return (
    <div className="space-y-6">
      {/* 1. Profile Header Card */}
      <section
        aria-label="Patient Profile Overview"
        className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-sm transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
            {/* Large Circular Photo / Avatar with Initials Fallback */}
            <div className="relative shrink-0">
              {patient.avatarUrl ? (
                <img
                  src={patient.avatarUrl}
                  alt={patient.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-border/80 dark:border-ink-soft/40 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cream dark:bg-ink-soft/40 border-2 border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta shadow-xs font-bold text-xl sm:text-2xl select-none tracking-tight">
                  {initials}
                </div>
              )}

              {/* Status Dot Ring reading same careStatus */}
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ${careStatusConfig.dotColor} ring-2 ring-surface dark:ring-ink`}
                aria-label={`Status: ${careStatusConfig.label}`}
              />
            </div>

            {/* Core Patient Identity */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-cream dark:bg-ink-soft/40 text-terracotta text-xs font-semibold uppercase tracking-wider">
                  Patient ID • {patient.id}
                </span>

                {/* Patient Care Status Badge (Canonical) */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${careStatusConfig.badgeBg} ${careStatusConfig.badgeText} border ${careStatusConfig.badgeBorder}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${careStatusConfig.dotColor}`} />
                  <span>{careStatusConfig.label}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream tracking-tight truncate">
                {patient.name}
              </h1>

              {/* Demographics bar: Age, Gender, DOB */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-ink-soft dark:text-cream/70">
                <span>{patient.age} years old</span>
                <span>•</span>
                <span>{patient.gender || 'Not specified'}</span>
                {patient.dateOfBirth && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-terracotta/80" />
                      <span>DOB: {patient.dateOfBirth}</span>
                    </span>
                  </>
                )}
              </div>

              {/* Diagnosis / Health Issue Tag */}
              <div className="mt-3 flex items-start gap-1.5">
                <Activity className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium text-ink dark:text-cream/90 leading-snug">
                  {patient.healthIssue || patient.diagnosis || 'Cognitive Support Routine Active'}
                </p>
              </div>
            </div>
          </div>

          {/* Unchanged Separate Device Sync Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage/15 text-sage border border-sage/30 text-xs font-semibold self-start sm:self-auto shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Profile Synced</span>
          </div>
        </div>
      </section>

      {/* 2 & 3. Secondary Info Section: Emergency Contact & Device Pairing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contact Section */}
        <section
          aria-label="Emergency Contact"
          className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-sm transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border/60 dark:border-ink-soft/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cream dark:bg-ink-soft/30 flex items-center justify-center text-terracotta">
                <Phone className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-ink dark:text-cream">
                Emergency Contact
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cream dark:bg-ink-soft/40 text-terracotta border border-border/60 dark:border-ink-soft/30">
              Primary
            </span>
          </div>

          {patient.emergencyContact ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/60 mb-0.5">
                  Contact Name & Relationship
                </p>
                <p className="text-sm sm:text-base font-bold text-ink dark:text-cream">
                  {patient.emergencyContact.name}
                </p>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70">
                  {patient.emergencyContact.relationship}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/60 mb-1">
                  Phone Number
                </p>
                <a
                  href={`tel:${patient.emergencyContact.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:text-terracotta-dark transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{patient.emergencyContact.phone}</span>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70">
              No emergency contact configured yet.
            </p>
          )}
        </section>

        {/* Pairing / Device Status Section */}
        <section
          aria-label="Device Pairing Status"
          className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-sm transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border/60 dark:border-ink-soft/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cream dark:bg-ink-soft/30 flex items-center justify-center text-sage">
                <Tablet className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-ink dark:text-cream">
                Pairing & Device Status
              </h2>
            </div>
            {patient.deviceStatus?.linked ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-sage/15 text-sage border border-sage/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>Linked</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                Unpaired
              </span>
            )}
          </div>

          {patient.deviceStatus ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/60 mb-0.5">
                  Linked Hardware Unit
                </p>
                <p className="text-sm sm:text-base font-bold text-ink dark:text-cream">
                  {patient.deviceStatus.deviceName || 'Patient Tablet'}
                </p>
                <p className="text-xs text-ink-soft dark:text-cream/70 font-mono mt-0.5">
                  ID: {patient.deviceStatus.deviceId || 'DEV-UNSET'}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-xs text-ink-soft dark:text-cream/70">
                <Clock className="w-3.5 h-3.5 text-terracotta/80 shrink-0" />
                <span>Last Synced: {patient.deviceStatus.lastSynced || patient.lastCheckIn || 'Recent'}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70">
              No tablet unit paired yet.
            </p>
          )}
        </section>
      </div>

      {/* 4. Preserved Recent Activity & Schedule Placeholder Cards (As-is) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface dark:bg-ink-soft/20 border border-border dark:border-ink-soft/40 rounded-card p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-cream dark:bg-ink-soft/30 flex items-center justify-center text-terracotta">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-ink dark:text-cream">
              Recent Activity Summary
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 leading-relaxed">
            Detailed patient cognitive exercises, check-in history, and tablet interaction metrics for patient {id} will appear in this section.
          </p>
        </div>

        <div className="bg-surface dark:bg-ink-soft/20 border border-border dark:border-ink-soft/40 rounded-card p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-cream dark:bg-ink-soft/30 flex items-center justify-center text-gold">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-ink dark:text-cream">
              Schedule & Reminders
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 leading-relaxed">
            Upcoming medication and hydration routines configured for patient {id}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
