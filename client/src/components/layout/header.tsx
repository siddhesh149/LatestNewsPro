import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Category } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logoSvg from "@assets/image_1744271751032.png";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, navigate] = useLocation();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const { user, logoutMutation } = useAuth();
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="shadow-md sticky top-0 bg-white z-50">
      {/* Top Bar */}
      <div className="bg-primary-dark text-white py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center text-xs space-x-4">
            <span>{currentDate}</span>
            <a href="#" className="hover:underline">E-Paper</a>
            {!user ? (
              <Link href="/auth" className="hover:underline">Sign In</Link>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Welcome, {user.username}</span>
                {user.isAdmin && (
                  <Link href="/admin" className="hover:underline">Admin</Link>
                )}
                <button onClick={handleLogout} className="hover:underline">Logout</button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
      
      {/* Logo and Search */}
      <div className="py-3 border-b">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <img src={logoSvg} alt="LatestNewsMedia Logo" className="h-14" />
          </Link>
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex">
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md py-1 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-light"
                  autoFocus
                />
                <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
                  <Search className="h-4 w-4 text-gray-500" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-4 w-4 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <ul className="flex space-x-4 overflow-x-auto text-sm font-medium py-2">
              <li>
                <Link 
                  href="/" 
                  className={`px-2 py-1 hover:text-secondary whitespace-nowrap ${location === '/' ? 'text-secondary' : ''}`}
                >
                  Home
                </Link>
              </li>
              
              {categories?.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/category/${category.slug}`} 
                    className={`px-2 py-1 hover:text-secondary whitespace-nowrap ${location === `/category/${category.slug}` ? 'text-secondary' : ''}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            <button className="lg:hidden focus:outline-none">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
