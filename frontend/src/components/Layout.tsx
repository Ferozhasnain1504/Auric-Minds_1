import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Mic, 
  History, 
  Bell, 
  User, 
  Users,
  Activity
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/voice', icon: Mic, label: 'Voice Analytics' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/admin', icon: Users, label: 'Admin' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1d3a] to-[#0a0e1a]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#3A7AFE] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#B517FF] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-[#00E676] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 glass-card border-r border-white/10 z-50 rounded-none">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3A7AFE] to-[#B517FF] flex items-center justify-center neon-glow">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl">MindGuard</h1>
              <p className="text-xs text-gray-400">Health AI Platform</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#3A7AFE] to-[#B517FF] text-white'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass-card rounded-2xl p-4 border border-[#00E676]/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
              <span className="text-xs text-gray-300">System Status</span>
            </div>
            <p className="text-xs text-[#00E676]">All sensors connected</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 min-h-screen p-8">
        <div className="max-w-[1600px] mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
