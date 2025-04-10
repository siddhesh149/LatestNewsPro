import { Link } from 'wouter';
import { ArticleWithRelations } from '@shared/schema';
import { formatRelativeTime } from '@/lib/utils';

interface ArticleCardProps {
  article: ArticleWithRelations;
  layout?: 'featured' | 'secondary' | 'list' | 'grid';
}

export default function ArticleCard({ article, layout = 'list' }: ArticleCardProps) {
  const getTimeAgo = () => {
    return formatRelativeTime(article.publishedAt);
  };

  if (layout === 'featured') {
    return (
      <article className="border-b pb-4 mb-4">
        <Link href={`/article/${article.slug}`} className="group">
          <img 
            src={article.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image'} 
            alt={article.title} 
            className="w-full h-96 object-cover mb-3 rounded"
          />
          <h1 className="font-heading text-3xl font-bold mb-2 group-hover:text-secondary">{article.title}</h1>
        </Link>
        <p className="text-gray-700 mb-3">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-accent text-sm font-medium">{getTimeAgo()}</span>
          <Link href={`/article/${article.slug}`} className="text-primary-dark hover:text-secondary font-medium">
            Read full article <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>
      </article>
    );
  }

  if (layout === 'secondary') {
    return (
      <article className="border-b pb-4">
        <Link href={`/article/${article.slug}`} className="group">
          <div className="flex flex-col sm:flex-row">
            <img 
              src={article.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
              alt={article.title} 
              className="w-full sm:w-32 h-32 object-cover rounded mr-0 sm:mr-3 mb-2 sm:mb-0"
            />
            <div>
              <h2 className="font-heading text-lg font-bold group-hover:text-secondary">{article.title}</h2>
              <p className="text-gray-700 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-accent text-xs font-medium">{getTimeAgo()}</span>
                <span className="text-primary-dark hover:text-secondary text-sm font-medium">Read full article</span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (layout === 'grid') {
    return (
      <article className="border-b pb-4">
        <Link href={`/article/${article.slug}`} className="group">
          <img 
            src={article.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} 
            alt={article.title} 
            className="w-full h-48 object-cover rounded mb-3"
          />
          <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-secondary">{article.title}</h3>
        </Link>
        <p className="text-gray-700 text-sm mb-2">{article.excerpt}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-accent text-xs font-medium">{getTimeAgo()}</span>
          <Link href={`/article/${article.slug}`} className="text-primary-dark hover:text-secondary text-sm font-medium">
            Read full article
          </Link>
        </div>
      </article>
    );
  }

  // Default list layout
  return (
    <article className="border-b pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Link href={`/article/${article.slug}`}>
            <img 
              src={article.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} 
              alt={article.title} 
              className="w-full h-48 object-cover rounded"
            />
          </Link>
        </div>
        <div className="md:col-span-2">
          <Link href={`/article/${article.slug}`} className="group">
            <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-secondary">{article.title}</h3>
          </Link>
          <p className="text-gray-700 mb-3">{article.excerpt}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-accent text-sm font-medium">{getTimeAgo()}</span>
              {article.category && (
                <>
                  <span className="text-gray-500 mx-2">|</span>
                  <span className="text-gray-500 text-sm">{article.category.name}</span>
                </>
              )}
            </div>
            <Link href={`/article/${article.slug}`} className="text-primary-dark hover:text-secondary font-medium">
              Read full article <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
