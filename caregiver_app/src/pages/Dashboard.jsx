import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { caregiver, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream font-sans p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top bar */}
        <header className="bg-surface border border-border rounded-card p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
              Caregiver Portal
            </span>
            <h1 className="text-2xl font-bold text-ink tracking-tight mt-0.5">
              Welcome back, {caregiver?.name || 'Caregiver'}
            </h1>
            <p className="text-sm text-ink-soft mt-1">
              Logged in as {caregiver?.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-cream hover:bg-surface border border-border rounded-lg text-sm font-medium text-ink transition-colors focus:outline-none focus:ring-1 focus:ring-terracotta"
          >
            <LogOut className="w-4 h-4 text-ink-soft" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Multi-patient switcher / demo links */}
        <section className="bg-surface border border-border rounded-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-terracotta" />
            <h2 className="text-lg font-bold text-ink">
              Managed Patients
            </h2>
          </div>
          <p className="text-sm text-ink-soft mb-6">
            Select a patient profile to view detailed history, activity logs, and settings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/patients/p1"
              className="p-4 bg-cream hover:bg-surface border border-border rounded-card transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-terracotta group-hover:border-terracotta transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Amina Begum
                </h3>
                <p className="text-xs text-ink-soft">
                  ID: p1 • Last check-in 10m ago
                </p>
              </div>
            </Link>

            <Link
              to="/patients/p2"
              className="p-4 bg-cream hover:bg-surface border border-border rounded-card transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-terracotta group-hover:border-terracotta transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Rohan Sharma
                </h3>
                <p className="text-xs text-ink-soft">
                  ID: p2 • Last check-in 1h ago
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
