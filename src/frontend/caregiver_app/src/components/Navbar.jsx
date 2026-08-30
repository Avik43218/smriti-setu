import React, { useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
} from 'lucide-react';

const DOCK_ITEMS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    path: '/analytics',
    icon: TrendingUp,
  },
  {
    id: 'care-plan',
    name: 'Care Plan',
    path: '/care-plan',
    icon: CalendarCheck,
  },
];

export const Navbar = () => {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const dockRef = useRef(null);

  const getScale = (index) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.35;
    if (distance === 1) return 1.15;
    return 1;
  };

  return (
    <nav
      ref={dockRef}
      aria-label="Top Navigation Dock"
      onMouseLeave={() => setHoveredIndex(null)}
      className="fixed top-3.5 sm:top-5 left-1/2 -translate-x-1/2 z-40 flex items-end gap-4 sm:gap-6 px-4 py-2 sm:px-6 sm:py-2.5 bg-surface/90 dark:bg-ink/90 backdrop-blur-md border border-border/80 dark:border-ink-soft/40 rounded-full shadow-xl transition-colors duration-200 select-none"
    >
      {DOCK_ITEMS.map((item, index) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        const scale = getScale(index);

        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(index)}
            className="relative flex flex-col items-center group"
          >
            {/* Magnified Dock Icon Button: Anchored at origin-bottom so it grows upward away from the dot */}
            <NavLink
              to={item.path}
              aria-label={item.name}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 ease-out origin-bottom outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta ${
                isActive
                  ? 'bg-cream dark:bg-ink-soft/40 text-terracotta border border-terracotta/40 dark:border-terracotta/40 shadow-xs'
                  : 'bg-cream/60 dark:bg-ink-soft/20 text-ink-soft dark:text-cream/80 border border-border/70 dark:border-ink-soft/30 hover:text-ink dark:hover:text-cream hover:bg-cream dark:hover:bg-ink-soft/35'
              }`}
              style={{
                transform: `scale(${scale})`,
              }}
            >
              <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-200" />
            </NavLink>

            {/* Static Active Page Indicator Dot: Fixed size & position, pure opacity fade */}
            <div className="w-full h-1.5 mt-1 flex items-center justify-center pointer-events-none">
              <span
                className={`w-1.5 h-1.5 rounded-full bg-terracotta transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

            {/* macOS Dock Tooltip Label appearing BELOW each icon */}
            <div
              role="tooltip"
              className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-ink/90 dark:bg-surface/95 text-surface dark:text-ink text-[11px] font-medium rounded-full shadow-md whitespace-nowrap opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 pointer-events-none z-50"
            >
              {item.name}
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default Navbar;
