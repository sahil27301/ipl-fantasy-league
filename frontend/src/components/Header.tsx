
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const location = useLocation();
  
  // Get the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-border flex items-center justify-between z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="focus:outline-none"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>

      <div className="relative hidden md:block">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="search"
          placeholder="Search..."
          className="bg-secondary py-2 pl-10 pr-4 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
    </header>
  );
};

export default Header;
