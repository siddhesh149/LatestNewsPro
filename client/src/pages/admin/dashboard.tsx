import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart } from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { Activity, FileText, Users, Eye, TrendingUp, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const { data: articlesData, isLoading: isLoadingArticles } = useQuery({
    queryKey: ['/api/articles', { limit: 1 }],
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const totalArticles = articlesData?.pagination?.total || 0;
  const totalCategories = categories?.length || 0;
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const month = (currentMonth - i + 12) % 12;
    return monthNames[month];
  }).reverse();
  
  // Sample data for charts - in a real app this would come from API
  const viewsData = [
    { name: last6Months[0], value: 2400 },
    { name: last6Months[1], value: 4200 },
    { name: last6Months[2], value: 5800 },
    { name: last6Months[3], value: 8000 },
    { name: last6Months[4], value: 6800 },
    { name: last6Months[5], value: 9200 },
  ];
  
  const categoryData = [
    { name: 'Politics', value: 25 },
    { name: 'Business', value: 20 },
    { name: 'Technology', value: 15 },
    { name: 'Sports', value: 18 },
    { name: 'Entertainment', value: 12 },
    { name: 'Health', value: 10 },
  ];
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - LatestNewsMedia</title>
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
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  <FileText className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingArticles ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{totalArticles}</div>
                  )}
                  <p className="text-xs text-gray-500">Published on the platform</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingCategories ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{totalCategories}</div>
                  )}
                  <p className="text-xs text-gray-500">Active content categories</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28.4K</div>
                  <p className="text-xs text-gray-500">+14% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Readers</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2K</div>
                  <p className="text-xs text-gray-500">Active registered users</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Article Views</CardTitle>
                  <CardDescription>
                    Traffic overview for the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Chart 
                      type="bar"
                      data={viewsData}
                      categories={['value']}
                      index="name"
                      colors={['#2196f3']}
                      valueFormatter={(value) => `${value.toLocaleString()}`}
                      showXAxis
                      showYAxis
                      showLegend={false}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>
                    Articles by category (percentage)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Chart 
                      type="pie"
                      data={categoryData}
                      categories={['value']}
                      index="name"
                      colors={['#1a237e', '#2196f3', '#4caf50', '#ff5722', '#9c27b0', '#ff9800']}
                      valueFormatter={(value) => `${value}%`}
                      showLegend
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest actions taken in the admin panel
                  </CardDescription>
                </div>
                <Activity className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary-light rounded-full p-2 mr-3">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">New article published</p>
                      <p className="text-sm text-gray-500">G20 Summit wraps up with major climate agreements</p>
                      <p className="text-xs text-gray-400">Today at 10:35 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-secondary rounded-full p-2 mr-3">
                      <BarChart className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Category added</p>
                      <p className="text-sm text-gray-500">New 'Environment' category created</p>
                      <p className="text-xs text-gray-400">Yesterday at 3:12 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-500 rounded-full p-2 mr-3">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">New admin user</p>
                      <p className="text-sm text-gray-500">Editor access granted to John Smith</p>
                      <p className="text-xs text-gray-400">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
}
