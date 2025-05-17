import { useState, useEffect, useCallback } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from './use-toast';

// A more efficient form hook that reduces re-renders and improves performance
export function useOptimizedForm<T extends z.ZodType<any, any>, U = z.infer<T>>({
  schema,
  defaultValues,
  onSubmit,
  partialSchema,
}: {
  schema: T;
  defaultValues?: Partial<U>;
  onSubmit: (values: U) => Promise<void> | void;
  partialSchema?: T; // Optional less strict schema for partial saving
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partialSubmitting, setPartialSubmitting] = useState(false);
  
  // Use react-hook-form with performance optimizations
  const form = useForm<U>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onBlur', // Validate fields when they lose focus for better UX
  });

  // Clear form when default values change (e.g., when editing different record)
  useEffect(() => {
    if (defaultValues) {
      // Reset with defaultValues to prevent unnecessary re-renders
      form.reset(defaultValues as any);
    }
  }, [form, defaultValues]);

  // Optimized handler for submitting complete form
  const handleSubmit = useCallback(async (data: U) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error saving data',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, toast]);

  // Handler for saving incomplete data using partial schema
  const handlePartialSubmit = useCallback(async () => {
    setPartialSubmitting(true);
    try {
      // Get current form values
      const currentValues = form.getValues();
      
      if (!partialSchema) {
        console.warn('No partial schema provided for partial submission');
        return;
      }
      
      // Validate with the partial schema
      const result = partialSchema.safeParse(currentValues);
      
      if (!result.success) {
        toast({
          title: 'Validation Error',
          description: 'Some required fields are missing or invalid',
          variant: 'destructive',
        });
        return;
      }
      
      // If validation passes, submit the form
      await onSubmit(currentValues as U);
    } catch (error) {
      console.error('Partial form submission error:', error);
      toast({
        title: 'Error saving data',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setPartialSubmitting(false);
    }
  }, [form, partialSchema, onSubmit, toast]);

  return {
    form,
    isSubmitting,
    partialSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
    handlePartialSubmit,
    reset: form.reset,
  };
}