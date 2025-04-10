import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import LatestNews from '@/components/news/latest-news';
import TrendingSection from '@/components/news/trending-section';
import NewsletterSignup from '@/components/news/newsletter-signup';
import { Category } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: category, isLoading: isCategoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
  });
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  if (isCategoryLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-4 border-b border-gray-300 pb-2">
            <Skeleton className="h-8 w-40" />
          </div>
          <CategorySkeleton />
        </main>
        <Footer />
      </>
    );
  }
  
  if (!category) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-gray-600">The category you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{category.name} News - LatestNewsMedia</title>
        <meta name="description" content={`Latest ${category.name} news and updates. Stay informed with LatestNewsMedia.`} />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6 border-b border-gray-300 pb-2">
          <h1 className="text-3xl font-heading font-bold">{category.name}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <LatestNews categoryId={category.id} limit={10} />
          </div>
          
          <div className="lg:col-span-4">
            <TrendingSection />
            <NewsletterSignup />
            
            <div className="bg-neutral-gray rounded-lg p-4 mb-6">
              <h3 className="text-xl font-heading font-bold mb-4 border-b pb-2">Categories</h3>
              <ul className="space-y-2">
                {categories?.map((cat) => (
                  <li key={cat.id} className="py-1 border-b border-gray-200 last:border-0">
                    <a 
                      href={`/category/${cat.slug}`} 
                      className={`hover:text-secondary ${cat.id === category.id ? 'text-secondary font-bold' : ''}`}
                    >
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Skeleton className="w-full h-48 rounded" />
                </div>
                <div className="md:col-span-2">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:col-span-4">
        <Skeleton className="w-full h-64 mb-6 rounded" />
        <Skeleton className="w-full h-64 mb-6 rounded" />
      </div>
    </div>
  );
}
