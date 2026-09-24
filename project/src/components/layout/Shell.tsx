import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  ScanLine,
  History,
  Map as MapIcon,
  FileText,
  Cpu,
  Waves,
  Menu,
  X,
  CircleDot,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export type Route = 'landing' | 'dashboard' | 'analysis' | 'history' | 'map' | 'reports' | 'model';

interface NavItem {
  route: Route;
  label: string;
  icon: typeof LayoutDashboard;
}

const nav: NavItem[] = [
  { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'analysis', label: 'Sonar Analysis', icon: ScanLine },
  { route: 'history', label: 'Scan History', icon: History },
  { route: 'map', label: 'Survey Map', icon: MapIcon },
  { route: 'reports', label: 'Reports', icon: FileText },
  { route: 'model', label: 'Model Performance', icon: Cpu },
];

interface Props {
  current: Route;
  onNavigate: (r: Route) => void;
  children: ReactNode;
}

export function Shell({ current, onNavigate, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/5">
        <button onClick={() => onNavigate('landing')} className="hover:opacity-80 transition">
          <Logo />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = current === item.route;
          return (
            <button
              key={item.route}
              onClick={() => {
                onNavigate(item.route);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-sonar-500/15 text-sonar-300 border border-sonar-500/30 shadow-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/5 space-y-3">
        <div className="glass p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CircleDot size={14} className="text-bio-400" />
            <span className="text-xs text-slate-300 font-medium">System Status</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-500">
            <div className="flex justify-between"><span>AI Engine</span><span className="text-bio-400">Demo Mode</span></div>
            <div className="flex justify-between"><span>Model Version</span><span className="text-slate-400">v0.3-demo</span></div>
            <div className="flex justify-between"><span>Backend</span><span className="text-warn-400">Simulated</span></div>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 text-center">Prototype Demo / Simulated Output</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 bg-abyss-900/50 backdrop-blur-md flex-col">
        {sidebar}
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-abyss-900/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 py-3">
        <button onClick={() => onNavigate('landing')}>
          <Logo sub={false} />
        </button>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-300 hover:text-white">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-abyss-900 border-r border-white/5">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon: typeof Waves; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-sonar-500/10 border border-sonar-500/20 flex items-center justify-center shrink-0">
          <Icon size={22} className="text-sonar-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
