
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  User, 
  Gavel, 
  Calendar, 
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  // Navigation links
  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/players', label: 'Players', icon: User },
    { path: '/auction', label: 'Auction', icon: Gavel },
    { path: '/matches', label: 'Matches', icon: Calendar },
    { path: '/scores', label: 'Scores', icon: BarChart3 },
  ];

  return (
    <aside 
      className={`bg-white border-r border-border h-screen transition-all duration-300 ease-in-out z-20 overflow-hidden
                ${open ? 'w-64' : 'w-0'}`}
    >
      {open && (
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 border-b border-border flex items-center px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-ipl-blue text-white flex items-center justify-center">
                <span className="font-bold">IPL</span>
              </div>
              <h1 className="text-xl font-semibold">Fantasy League</h1>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
