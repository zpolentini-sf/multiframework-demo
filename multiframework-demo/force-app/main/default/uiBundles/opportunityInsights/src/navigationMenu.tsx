import { Link, useLocation } from 'react-router';
import { getAllRoutes } from './router-utils';
import { useState } from 'react';

export default function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigationRoutes: { path: string; label: string }[] = getAllRoutes()
    .filter(
      route =>
        route.handle?.showInNavigation === true &&
        route.fullPath !== undefined &&
        route.handle?.label !== undefined
    )
    .map(
      route =>
        ({
          path: route.fullPath,
          label: route.handle?.label,
        }) as { path: string; label: string }
    );

  return (
    <nav className="bg-[oklch(0.12_0_0)] border-b border-[oklch(0.22_0_0)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-white">Harvey.ai</span>
            <span className="text-xs text-[oklch(0.58_0_0)] font-normal">Demo</span>
          </Link>
          {navigationRoutes.length > 0 && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded text-[oklch(0.65_0_0)] hover:text-white hover:bg-[oklch(0.20_0_0)] transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <span className={`block h-px w-5 bg-current transition-all ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-px w-5 bg-current transition-all ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-px w-5 bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          )}
        </div>
        {isOpen && (
          <div className="pb-3 border-t border-[oklch(0.22_0_0)]">
            <div className="flex flex-col pt-2 space-y-0.5">
              {navigationRoutes.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-[oklch(0.20_0_0)] text-white'
                      : 'text-[oklch(0.65_0_0)] hover:text-white hover:bg-[oklch(0.18_0_0)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
