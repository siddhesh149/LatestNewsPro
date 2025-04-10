import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ArticleForm from './article-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArticleEditor() {
  const params = useParams<{ id: string }>();
  const articleId = params.id ? parseInt(params.id) : undefined;
  
  const { isLoading } = useQuery({
    queryKey: ['/api/articles', articleId],
    enabled: !!articleId,
  });

  if (isLoading && articleId) {
    return <EditorSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">
        {articleId ? 'Edit Article' : 'Create New Article'}
      </h2>
      
      <ArticleForm articleId={articleId} />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
