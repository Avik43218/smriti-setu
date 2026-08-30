import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { TopControls } from '../components/TopControls';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-cream dark:bg-ink text-ink dark:text-cream font-sans transition-colors duration-200 flex flex-col relative">
      {/* Top Floating macOS Navigation Dock */}
      <Navbar />

      {/* Persistent Top-Right Controls: Theme Toggle + Settings */}
      <TopControls showSettings={true} />

      {/* Main Content Area: generous, intentional top breathing room clearing dock, tooltips, and magnification */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-12 sm:pb-16">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
