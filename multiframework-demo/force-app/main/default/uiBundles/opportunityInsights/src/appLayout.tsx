import { Outlet, Link, useLocation } from 'react-router';
import { getAllRoutes } from './router-utils';
import { useState } from 'react';
import { BottomChatBar } from './components/AgentforceChat';

export default function AppLayout() {
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
    <>
      <header className="sticky top-0 z-50 border-b border-[#252525] bg-[#0b0b0b]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-3">
              {/* Harvey wordmark */}
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#f0ece6]">Harvey</span>
                <span className="text-[15px] font-light text-[#c9a96e]">·</span>
                <span className="text-[13px] font-normal text-[#6b6560]">Demo</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {navigationRoutes.length > 1 && (
                <nav className="hidden sm:flex items-center gap-1">
                  {navigationRoutes.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-1.5 rounded text-[13px] transition-colors ${
                        isActive(item.path)
                          ? 'text-[#f0ece6] bg-[#1e1e1e]'
                          : 'text-[#6b6560] hover:text-[#c8c2ba]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}

              {navigationRoutes.length > 1 && (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="sm:hidden p-1.5 text-[#6b6560] hover:text-[#f0ece6] transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d={isOpen ? 'M2 2l14 14M16 2L2 16' : 'M2 5h14M2 9h14M2 13h14'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {isOpen && (
            <div className="sm:hidden pb-3 border-t border-[#252525] pt-2 space-y-0.5">
              {navigationRoutes.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded text-[13px] transition-colors ${
                    isActive(item.path) ? 'text-[#f0ece6] bg-[#1e1e1e]' : 'text-[#6b6560] hover:text-[#c8c2ba]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
      <div style={{ paddingBottom: 56 }}>
        <Outlet />
      </div>
      <BottomChatBar />
    </>
  );
}
