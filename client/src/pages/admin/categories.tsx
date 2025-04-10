import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { generateSlug } from '@/lib/utils';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function Categories() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  
  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });
  
  // Update form values when editing a category
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        slug: editingCategory.slug,
      });
    } else {
      form.reset({
        name: '',
        slug: '',
      });
    }
  }, [editingCategory, form]);
  
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await apiRequest('POST', '/api/categories', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Category created',
        description: 'The category has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create category: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: CategoryFormData }) => {
      const res = await apiRequest('PUT', `/api/categories/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Category updated',
        description: 'The category has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditingCategory(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update category: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Category deleted',
        description: 'The category has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setCategoryToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete category: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('name', e.target.value);
    
    if (!form.getValues('slug') || isGeneratingSlug) {
      setIsGeneratingSlug(true);
      const generatedSlug = generateSlug(e.target.value);
      form.setValue('slug', generatedSlug);
    }
  };
  
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };
  
  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
  };
  
  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  };
  
  const cancelEdit = () => {
    setEditingCategory(null);
    form.reset();
  };
  
  return (
    <>
      <Helmet>
        <title>Manage Categories - Admin Dashboard - LatestNewsMedia</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-primary-dark text-white py-3 px-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.username}</span>
          </div>
        </header>
        
        <div className="flex h-[calc(100vh-60px)]">
          {/* Sidebar */}
          <AdminSidebar />
          
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Categories</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Category Form */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter category name" 
                                  {...field} 
                                  onChange={handleNameChange}
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
                                  placeholder="category-slug" 
                                  {...field} 
                                  onChange={(e) => {
                                    setIsGeneratingSlug(false);
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                URL-friendly version of the name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-3 pt-2">
                          {editingCategory && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          )}
                          
                          <Button
                            type="submit"
                            disabled={
                              createCategoryMutation.isPending || 
                              updateCategoryMutation.isPending
                            }
                            className={editingCategory 
                              ? "bg-primary-dark hover:bg-primary-light" 
                              : "bg-secondary hover:bg-orange-600"
                            }
                          >
                            {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                              'Saving...'
                            ) : (
                              <>
                                {editingCategory ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                {editingCategory ? 'Update Category' : 'Add Category'}
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
              
              {/* Categories List */}
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Categories List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="flex items-center justify-between p-2">
                            <Skeleton className="h-5 w-32" />
                            <div className="flex space-x-2">
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {categories && categories.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Slug</TableHead>
                                  <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {categories.map((category) => (
                                  <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-gray-600">{category.slug}</TableCell>
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEdit(category)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-red-600 border-red-200 hover:bg-red-50"
                                              onClick={() => handleDelete(category)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          {categoryToDelete && categoryToDelete.id === category.id && (
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  This will permanently delete the "{categoryToDelete.name}" category. 
                                                  This action cannot be undone.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                                                  Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={confirmDelete}
                                                  className="bg-red-600 hover:bg-red-700"
                                                >
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          )}
                                        </AlertDialog>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No categories found. Create your first category!</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
