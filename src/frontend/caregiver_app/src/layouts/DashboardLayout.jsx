import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopControls } from '../components/TopControls';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-cream dark:bg-ink text-ink dark:text-cream font-sans transition-colors duration-200 flex flex-col relative">
      {/* Persistent Top-Right Controls: Theme Toggle + Settings */}
      <TopControls showSettings={true} />

      {/* Main Content Area: Clears TopControls with natural breathing room */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
