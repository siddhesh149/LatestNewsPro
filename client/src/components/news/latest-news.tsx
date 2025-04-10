import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArticleWithRelations } from '@shared/schema';
import ArticleCard from './article-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface LatestNewsProps {
  categoryId?: number;
  limit?: number;
}

export default function LatestNews({ categoryId, limit = 4 }: LatestNewsProps) {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuery({
    queryKey: ['/api/articles/latest', { limit, categoryId, page }],
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length + 1;
    },
  });
  
  const articles = data?.pages?.flat() || [];
  
  const loadMore = async () => {
    setLoadingMore(true);
    await fetchNextPage();
    setPage(prev => prev + 1);
    setLoadingMore(false);
  };
  
  if (isLoading) {
    return <LatestNewsSkeleton count={limit} />;
  }
  
  if (!articles || articles.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center mb-4 border-b border-gray-300 pb-2">
          <h2 className="text-2xl font-heading font-bold">Latest News</h2>
        </div>
        <p className="text-gray-500 italic text-center py-6">No articles found</p>
      </section>
    );
  }
  
  return (
    <section className="mb-8">
      <div className="flex items-center mb-4 border-b border-gray-300 pb-2">
        <h2 className="text-2xl font-heading font-bold">Latest News</h2>
        <div className="ml-auto">
          <a href="#" className="text-primary-dark hover:text-secondary text-sm font-medium">View All</a>
        </div>
      </div>
      
      <div className="space-y-6">
        {articles.map((article: ArticleWithRelations) => (
          <ArticleCard key={article.id} article={article} layout="list" />
        ))}
      </div>
      
      {(hasNextPage || isFetchingNextPage) && (
        <div className="mt-6 text-center">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-primary-dark hover:bg-primary-light text-white font-medium py-2 px-6 rounded transition duration-300"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </section>
  );
}

function LatestNewsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="mb-8">
      <div className="flex items-center mb-4 border-b border-gray-300 pb-2">
        <Skeleton className="h-8 w-40" />
        <div className="ml-auto">
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      
      <div className="space-y-6">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className="border-b pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Skeleton className="w-full h-48 rounded" />
              </div>
              <div className="md:col-span-2">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-20 mr-2" />
                    <Skeleton className="h-4 w-2 mx-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
