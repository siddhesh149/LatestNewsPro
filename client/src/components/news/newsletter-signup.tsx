import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to receive news updates',
  }),
});

type NewsletterData = z.infer<typeof newsletterSchema>;

export default function NewsletterSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      consent: false,
    },
  });
  
  const onSubmit = async (data: NewsletterData) => {
    setIsSubmitting(true);
    
    // In a real implementation, this would submit to a newsletter API
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Successfully subscribed!',
        description: 'Thank you for subscribing to our newsletter.',
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: 'An error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="bg-primary-dark text-white rounded-lg p-6 mb-6">
      <h3 className="text-xl font-heading font-bold mb-3">Get Daily Updates</h3>
      <p className="mb-4">Stay informed with our daily newsletter delivering the most important stories directly to your inbox.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Your email address"
                    className="w-full px-3 py-2 text-gray-900 rounded focus:outline-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-300 text-sm" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="consent"
                  />
                </FormControl>
                <FormLabel htmlFor="consent" className="text-sm">
                  I agree to receive news updates
                </FormLabel>
                <FormMessage className="text-red-300 text-sm" />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary hover:bg-orange-600 text-white font-medium py-2 rounded transition duration-300"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
          </Button>
        </form>
      </Form>
    </section>
  );
}
