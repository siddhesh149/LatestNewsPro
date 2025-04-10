import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BreakingNewsBanner from '@/components/news/breaking-news-banner';
import FeaturedNews from '@/components/news/featured-news';
import LatestNews from '@/components/news/latest-news';
import CategoryNews from '@/components/news/category-news';
import TrendingSection from '@/components/news/trending-section';
import NewsletterSignup from '@/components/news/newsletter-signup';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@shared/schema';
import { Helmet } from 'react-helmet';

export default function HomePage() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <>
      <Helmet>
        <title>LatestNewsMedia - Breaking News, Latest News and Videos</title>
        <meta name="description" content="Get the latest news and videos from around the world. Stay informed with LatestNewsMedia." />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <BreakingNewsBanner />
        
        <FeaturedNews />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <LatestNews limit={4} />
            
            {categories?.slice(0, 2).map((category) => (
              <CategoryNews 
                key={category.id}
                categoryId={category.id}
                categoryName={category.name}
                categorySlug={category.slug}
              />
            ))}
          </div>
          
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
