import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-cream dark:bg-ink text-ink dark:text-cream font-sans transition-colors duration-200 flex flex-col">
      {/* Floating Pill Top Navbar */}
      <Navbar />

      {/* Main Content Area with generous breathing room */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16 sm:pb-20">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
