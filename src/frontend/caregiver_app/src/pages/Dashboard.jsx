import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPatients } from '../services/patientService';
import { PatientCard } from '../components/PatientCard';
import {
  Users,
  Sparkles,
  RefreshCw,
  AlertCircle,
  UserPlus,
} from 'lucide-react';

export const Dashboard = () => {
  const { caregiver } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPatients();
      setPatients(data || []);
    } catch (err) {
      setError(err?.message || 'Unable to load patient records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Card */}
      <section
        aria-label="Welcome Overview"
        className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-sm transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream dark:bg-ink-soft/40 text-terracotta text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smriti Setu Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream tracking-tight">
              Welcome, {caregiver?.name || 'Caregiver'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 mt-1.5 max-w-xl leading-relaxed">
              Monitor active patient cognitive routines, longitudinal trends, and tablet synchronization status from your dashboard roster.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
            <div className="w-12 h-12 rounded-card bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta shadow-xs">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Patient Roster Section */}
      <section aria-label="Assigned Patients Roster" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-cream dark:bg-ink-soft/30 flex items-center justify-center text-terracotta">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink dark:text-cream">
              Assigned Patients
            </h2>
            {!loading && !error && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cream dark:bg-ink-soft/40 text-ink-soft dark:text-cream/80 border border-border/70 dark:border-ink-soft/30">
                {patients.length}
              </span>
            )}
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={loadPatients}
            disabled={loading}
            aria-label="Refresh patient roster"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ink-soft dark:text-cream/80 hover:text-ink dark:hover:text-cream bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 hover:bg-cream dark:hover:bg-ink-soft/35 active:scale-95 transition-all outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-terracotta ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* STATE 1: Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-pulse">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-surface/60 dark:bg-ink-soft/10 border border-border/60 dark:border-ink-soft/30 rounded-card p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cream dark:bg-ink-soft/30" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-cream dark:bg-ink-soft/30 rounded" />
                    <div className="h-3 w-48 bg-cream/70 dark:bg-ink-soft/20 rounded" />
                  </div>
                </div>
                <div className="pt-3 border-t border-border/40 dark:border-ink-soft/20 flex justify-between">
                  <div className="h-3 w-28 bg-cream dark:bg-ink-soft/20 rounded" />
                  <div className="h-3 w-20 bg-cream dark:bg-ink-soft/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATE 2: Error State */}
        {!loading && error && (
          <div className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 sm:p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-cream dark:bg-ink-soft/30 flex items-center justify-center text-terracotta mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm text-ink dark:text-cream font-medium">
              {error}
            </p>
            <button
              type="button"
              onClick={loadPatients}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta text-cream rounded-full text-xs font-semibold hover:bg-terracotta-dark active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* STATE 3: Empty State */}
        {!loading && !error && patients.length === 0 && (
          <div className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-8 sm:p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-cream dark:bg-ink-soft/30 flex items-center justify-center text-ink-soft dark:text-cream/60 mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink dark:text-cream">
              No Patients Assigned
            </h3>
            <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 max-w-sm mx-auto leading-relaxed">
              Pair a patient tablet via device pairing to begin monitoring care metrics and cognitive routines.
            </p>
          </div>
        )}

        {/* STATE 4: Success Grid of Patient Cards */}
        {!loading && !error && patients.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
