import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArticleWithRelations } from '@shared/schema';
import ArticleCard from './article-card';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryNewsProps {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  limit?: number;
}

export default function CategoryNews({ categoryId, categoryName, categorySlug, limit = 2 }: CategoryNewsProps) {
  const { data: articles, isLoading } = useQuery<ArticleWithRelations[]>({
    queryKey: ['/api/articles/latest', { limit, categoryId }],
  });
  
  if (isLoading) {
    return <CategoryNewsSkeleton title={categoryName} />;
  }
  
  if (!articles || articles.length === 0) {
    return null;
  }
  
  return (
    <section className="mb-8">
      <div className="flex items-center mb-4 border-b border-gray-300 pb-2">
        <h2 className="text-2xl font-heading font-bold">{categoryName}</h2>
        <div className="ml-auto">
          <Link 
            href={`/category/${categorySlug}`} 
            className="text-primary-dark hover:text-secondary text-sm font-medium"
          >
            More {categoryName} News
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} layout="grid" />
        ))}
      </div>
    </section>
  );
}

function CategoryNewsSkeleton({ title }: { title: string }) {
  return (
    <section className="mb-8">
      <div className="flex items-center mb-4 border-b border-gray-300 pb-2">
        <h2 className="text-2xl font-heading font-bold">{title}</h2>
        <div className="ml-auto">
          <Skeleton className="h-5 w-36" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="w-full h-48 rounded mb-3" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
