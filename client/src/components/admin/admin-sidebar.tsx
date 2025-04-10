import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

export default function AdminSidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  const menuItems = [
    { icon: LayoutDashboard, name: 'Dashboard', path: '/admin' },
    { icon: FileText, name: 'Articles', path: '/admin/articles' },
    { icon: FolderOpen, name: 'Categories', path: '/admin/categories' },
    { icon: Image, name: 'Media Library', path: '/admin/media' },
    { icon: Users, name: 'Users', path: '/admin/users' },
    { icon: Settings, name: 'Settings', path: '/admin/settings' }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="w-64 bg-white shadow-md p-4 space-y-2 h-full">
      {menuItems.map(item => {
        const Icon = item.icon;
        return (
          <Link 
            key={item.path} 
            href={item.path}
          >
            <a className={cn(
              "flex items-center py-2 px-4 rounded transition-colors",
              isActive(item.path) 
                ? "bg-primary-light text-white" 
                : "hover:bg-gray-100 text-gray-700"
            )}>
              <Icon className="h-5 w-5 mr-2" />
              <span>{item.name}</span>
            </a>
          </Link>
        );
      })}
      
      <button 
        onClick={handleLogout}
        className="flex items-center w-full text-left py-2 px-4 hover:bg-red-100 text-red-600 rounded transition-colors"
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
