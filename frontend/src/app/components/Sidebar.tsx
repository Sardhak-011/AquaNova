import { Waves, Activity, Brain, Settings, TrendingUp } from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const navItems = [
    { id: "live", label: "Live Monitor", icon: Activity },
    { id: "predictive", label: "Predictive Analytics", icon: TrendingUp },
  ];

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-950 border-r border-teal-500/20 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-teal-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-lg flex items-center justify-center">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-lg">AquaNova</h1>
            <p className="text-xs text-teal-400">Smart Aquaculture</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* SDG-14 Badge */}
      <div className="p-6 border-t border-teal-500/20">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 rounded-lg text-center">
          <div className="text-white font-bold text-sm">SDG - 14</div>
          <div className="text-blue-100 text-xs mt-1">Life Below Water</div>
        </div>
      </div>
    </aside>
  );
}