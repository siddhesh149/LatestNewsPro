import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import AdminSidebar from '@/components/admin/admin-sidebar';
import ArticleList from '@/components/admin/article-list';
import { Helmet } from 'react-helmet';

export default function Articles() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <>
      <Helmet>
        <title>Manage Articles - Admin Dashboard - LatestNewsMedia</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-primary-dark text-white py-3 px-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.username}</span>
          </div>
        </header>
        
        <div className="flex h-[calc(100vh-60px)]">
          {/* Sidebar */}
          <AdminSidebar />
          
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Articles</h1>
            </div>
            
            <ArticleList />
          </main>
        </div>
      </div>
    </>
  );
}
