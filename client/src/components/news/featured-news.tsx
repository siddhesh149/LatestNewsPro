import { useQuery } from '@tanstack/react-query';
import { ArticleWithRelations } from '@shared/schema';
import ArticleCard from './article-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedNews() {
  const { data: featuredArticles, isLoading } = useQuery<ArticleWithRelations[]>({
    queryKey: ['/api/articles/featured'],
  });
  
  if (isLoading) {
    return <FeaturedNewsSkeleton />;
  }
  
  if (!featuredArticles || featuredArticles.length === 0) {
    return null;
  }
  
  const mainArticle = featuredArticles[0];
  const secondaryArticles = featuredArticles.slice(1, 4);
  
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured Article */}
        <div className="lg:col-span-2">
          <ArticleCard article={mainArticle} layout="featured" />
        </div>
        
        {/* Secondary Featured Articles */}
        <div className="space-y-4">
          {secondaryArticles.map((article) => (
            <ArticleCard key={article.id} article={article} layout="secondary" />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedNewsSkeleton() {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured Article Skeleton */}
        <div className="lg:col-span-2">
          <div className="border-b pb-4 mb-4">
            <Skeleton className="w-full h-96 mb-3 rounded" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        
        {/* Secondary Featured Articles Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b pb-4">
              <div className="flex flex-col sm:flex-row">
                <Skeleton className="w-full sm:w-32 h-32 rounded mr-0 sm:mr-3 mb-2 sm:mb-0" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <div className="flex justify-between mt-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
