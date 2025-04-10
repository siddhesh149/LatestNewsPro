import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import AdminSidebar from '@/components/admin/admin-sidebar';
import ArticleEditor from '@/components/admin/article-editor';
import { Helmet } from 'react-helmet';

export default function EditArticle() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const isNewArticle = location === '/admin/articles/new';
  
  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <>
      <Helmet>
        <title>
          {isNewArticle ? 'Create New Article' : 'Edit Article'} - Admin Dashboard - LatestNewsMedia
        </title>
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
              <h1 className="text-2xl font-bold">
                {isNewArticle ? 'Create New Article' : 'Edit Article'}
              </h1>
            </div>
            
            <ArticleEditor />
          </main>
        </div>
      </div>
    </>
  );
}
