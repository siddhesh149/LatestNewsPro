import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArticleWithRelations } from '@shared/schema';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import TrendingSection from '@/components/news/trending-section';
import NewsletterSignup from '@/components/news/newsletter-signup';
import ArticleCard from '@/components/news/article-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  
  const { data: article, isLoading, error } = useQuery<ArticleWithRelations>({
    queryKey: [`/api/articles/${slug}`],
  });
  
  const { data: relatedArticles } = useQuery<ArticleWithRelations[]>({
    queryKey: ['/api/articles/latest', { limit: 3, categoryId: article?.categoryId }],
    enabled: !!article?.categoryId,
  });
  
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <ArticleSkeleton />
        </main>
        <Footer />
      </>
    );
  }
  
  if (error || !article) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-gray-600">The article you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{article.title} - LatestNewsMedia</title>
        <meta name="description" content={article.excerpt} />
        {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-8">
            <header className="mb-6">
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{article.title}</h1>
              
              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
                {article.author && (
                  <span className="mr-4">By {article.author.username}</span>
                )}
                <time dateTime={new Date(article.publishedAt).toISOString()} className="mr-4">
                  {formatDate(article.publishedAt)}
                </time>
                {article.category && (
                  <a 
                    href={`/category/${article.category.slug}`} 
                    className="mr-4 text-primary-dark hover:text-secondary"
                  >
                    {article.category.name}
                  </a>
                )}
                <span className="text-accent font-medium">
                  {formatRelativeTime(article.publishedAt)}
                </span>
              </div>
            </header>
            
            {article.imageUrl && (
              <figure className="mb-6">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full max-h-96 object-cover rounded"
                />
              </figure>
            )}
            
            <div 
              className="prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="border-t pt-6 mt-8">
                <h3 className="text-xl font-heading font-bold mb-4">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map(relatedArticle => (
                    <div key={relatedArticle.id}>
                      <a 
                        href={`/article/${relatedArticle.slug}`} 
                        className="block group"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img 
                          src={relatedArticle.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                          alt={relatedArticle.title} 
                          className="w-full h-40 object-cover rounded mb-2"
                        />
                        <h4 className="font-medium group-hover:text-secondary line-clamp-2">
                          {relatedArticle.title}
                        </h4>
                      </a>
                      <span className="text-accent text-xs font-medium">
                        {formatRelativeTime(relatedArticle.publishedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
          
          <div className="lg:col-span-4">
            <TrendingSection />
            <NewsletterSignup />
            
            <div className="bg-neutral-gray rounded-lg p-4 text-center mb-6">
              <p className="text-sm text-gray-500 mb-2">Advertisement</p>
              <div className="bg-white py-8 px-4 border border-gray-200 rounded">
                <p className="text-lg font-bold mb-2">Your Ad Could Be Here</p>
                <p className="text-sm mb-3">Reach our engaged audience of news readers</p>
                <a href="#" className="inline-block bg-secondary hover:bg-orange-600 text-white text-sm font-medium py-1 px-4 rounded transition duration-300">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <Skeleton className="h-14 w-full mb-4" />
        <div className="flex items-center mb-6">
          <Skeleton className="h-4 w-24 mr-4" />
          <Skeleton className="h-4 w-32 mr-4" />
          <Skeleton className="h-4 w-20 mr-4" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        <Skeleton className="w-full h-80 rounded mb-6" />
        
        <div className="space-y-4 mb-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      <div className="lg:col-span-4">
        <Skeleton className="w-full h-64 mb-6 rounded" />
        <Skeleton className="w-full h-64 mb-6 rounded" />
      </div>
    </div>
  );
}
