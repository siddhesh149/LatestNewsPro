import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { RichTextEditor } from '@/lib/tiptap';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { generateSlug } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Category, Article } from '@shared/schema';
import { Loader2 } from 'lucide-react';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(300, 'Excerpt should be less than 300 characters'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().optional(),
  categoryId: z.number().optional(),
  status: z.enum(['published', 'draft', 'scheduled']),
  featured: z.boolean().default(false),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  articleId?: number;
}

export default function ArticleForm({ articleId }: ArticleFormProps) {
  const [content, setContent] = useState('');
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch categories for the dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch article data if editing an existing article
  const { data: article, isLoading: isLoadingArticle } = useQuery<Article>({
    queryKey: ['/api/articles', articleId],
    enabled: !!articleId,
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      status: 'draft',
      featured: false,
    },
  });

  // Update form when article data is loaded
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.imageUrl || '',
        categoryId: article.categoryId || undefined,
        status: article.status as any,
        featured: article.featured,
      });
      setContent(article.content);
    }
  }, [article, form]);

  // Handle form submission
  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const res = await apiRequest('POST', '/api/articles', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article created',
        description: 'The article has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      navigate('/admin/articles');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create article: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const res = await apiRequest('PUT', `/api/articles/${articleId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article updated',
        description: 'The article has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      navigate('/admin/articles');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update article: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: ArticleFormData) => {
    const formData = {
      ...data,
      content,
      categoryId: data.categoryId || null,
    };

    if (articleId) {
      updateArticleMutation.mutate(formData);
    } else {
      createArticleMutation.mutate(formData);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('title', e.target.value);
    
    if (!form.getValues('slug') || isGeneratingSlug) {
      setIsGeneratingSlug(true);
      const generatedSlug = generateSlug(e.target.value);
      form.setValue('slug', generatedSlug);
    }
  };

  const handleContentChange = (htmlContent: string) => {
    setContent(htmlContent);
    form.setValue('content', htmlContent);
  };

  if (isLoadingArticle && articleId) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter article title" 
                      {...field} 
                      onChange={handleTitleChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="article-slug" 
                      {...field} 
                      onChange={(e) => {
                        setIsGeneratingSlug(false);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The URL-friendly version of the title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief summary of the article" 
                      {...field} 
                      className="min-h-24"
                    />
                  </FormControl>
                  <FormDescription>
                    A short summary that appears in article listings. Max 300 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label htmlFor="content">Content</Label>
              <RichTextEditor 
                content={content} 
                onChange={handleContentChange} 
                placeholder="Write your article content here..."
              />
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Uncategorized</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Paste a direct URL to the featured image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Featured Article
                    </FormLabel>
                    <FormDescription>
                      Featured articles appear prominently on the homepage.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/articles')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                className="bg-secondary hover:bg-orange-600 text-white"
              >
                {(createArticleMutation.isPending || updateArticleMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {articleId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  articleId ? 'Update Article' : 'Publish Article'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
