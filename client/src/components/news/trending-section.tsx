import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArticleWithRelations } from '@shared/schema';
import { formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function TrendingSection() {
  const { data: trendingArticles, isLoading } = useQuery<ArticleWithRelations[]>({
    queryKey: ['/api/articles/latest', { limit: 5 }],
  });
  
  if (isLoading) {
    return <TrendingSkeleton />;
  }
  
  if (!trendingArticles || trendingArticles.length === 0) {
    return null;
  }
  
  return (
    <section className="bg-neutral-gray rounded-lg p-4 mb-6">
      <h3 className="text-xl font-heading font-bold mb-4 border-b pb-2">Trending Now</h3>
      <ul className="space-y-4">
        {trendingArticles.map((article, index) => (
          <li key={article.id} className="flex items-start">
            <span className="bg-primary-dark text-white font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
              {index + 1}
            </span>
            <Link href={`/article/${article.slug}`} className="hover:text-secondary">
              <h4 className="font-medium">{article.title}</h4>
              <span className="text-xs text-accent">{formatRelativeTime(article.publishedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TrendingSkeleton() {
  return (
    <section className="bg-neutral-gray rounded-lg p-4 mb-6">
      <Skeleton className="h-7 w-40 mb-4" />
      <ul className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="flex items-start">
            <div className="bg-primary-dark text-white font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
              {i}
            </div>
            <div className="flex-1">
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
