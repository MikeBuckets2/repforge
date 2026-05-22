import {
  Activity,
  BarChart3,
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  Library,
  LogOut,
  PenLine,
  UserRound
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/log', label: 'Log', icon: PenLine },
  { to: '/app/plans', label: 'Plans', icon: Dumbbell },
  { to: '/app/library', label: 'Library', icon: Library },
  { to: '/app/progress', label: 'Progress', icon: BarChart3 },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/profile', label: 'Profile', icon: UserRound }
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/app" className="brand-mark">
          <span className="brand-icon">
            <Activity size={22} />
          </span>
          <span>RepForge</span>
        </NavLink>

        <nav className="side-nav" aria-label="Application">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-item">
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.experienceLevel?.toLowerCase()}</span>
          </div>
          <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
