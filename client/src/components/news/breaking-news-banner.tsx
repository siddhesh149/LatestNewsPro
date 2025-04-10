import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Article } from '@shared/schema';

interface BreakingNewsProps {
  limit?: number;
}

export default function BreakingNewsBanner({ limit = 3 }: BreakingNewsProps) {
  const { data: latestArticles } = useQuery<Article[]>({
    queryKey: ['/api/articles/latest', { limit }],
  });

  const [breakingNews, setBreakingNews] = useState<string[]>([]);

  useEffect(() => {
    if (latestArticles?.length) {
      const headlines = latestArticles.map(article => article.title);
      setBreakingNews(headlines);
    }
  }, [latestArticles]);

  if (!breakingNews.length) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white py-2 px-4 mb-6 rounded flex items-center">
      <span className="font-bold mr-3">BREAKING:</span>
      <div className="overflow-hidden whitespace-nowrap flex-1">
        <div className="animate-marquee inline-block">
          {breakingNews.join(' | ')}
        </div>
      </div>
    </div>
  );
}

// Add this to your global CSS
// @keyframes marquee {
//   0% { transform: translateX(0); }
//   100% { transform: translateX(-100%); }
// }
// .animate-marquee {
//   animation: marquee 30s linear infinite;
// }
