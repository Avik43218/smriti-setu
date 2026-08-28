import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserCheck } from 'lucide-react';

export const PatientDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-cream font-sans p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cream border border-border flex items-center justify-center text-terracotta">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">
                Patient Profile: {id}
              </h1>
              <p className="text-xs text-ink-soft mt-0.5">
                Detailed care analytics and profile management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
