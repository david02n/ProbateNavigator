import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, getQueryFn, queryClient } from '../lib/queryClient';
import { useToast } from './use-toast';
import type { Executor } from '../../shared/schema';

// Shared hook for people-related operations to reduce redundant code
export function usePeople(activeCaseId?: number) {
  const { toast } = useToast();
  const [isProcessingPerson, setIsProcessingPerson] = useState(false);

  // Get people for the active case with stale-while-revalidate pattern
  const { 
    data: people = [],
    isLoading: isLoadingPeople
  } = useQuery<Executor[]>({
    queryKey: ["/api/executors"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!activeCaseId,
  });

  // Create person mutation with optimized handlers
  const createPerson = useMutation({
    mutationFn: async (personData: Partial<Executor>) => {
      setIsProcessingPerson(true);
      try {
        const res = await apiRequest("POST", "/api/executors", personData);
        return await res.json();
      } finally {
        setIsProcessingPerson(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executors"] });
      toast({
        title: "Person added",
        description: "The person has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding person",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update person mutation
  const updatePerson = useMutation({
    mutationFn: async ({ id, personData }: { id: number, personData: Partial<Executor> }) => {
      setIsProcessingPerson(true);
      try {
        const res = await apiRequest("PUT", `/api/executors/${id}`, personData);
        return await res.json();
      } finally {
        setIsProcessingPerson(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executors"] });
      toast({
        title: "Person updated",
        description: "The person has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating person",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete person mutation
  const deletePerson = useMutation({
    mutationFn: async (personId: number) => {
      const res = await apiRequest("DELETE", `/api/executors/${personId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executors"] });
      toast({
        title: "Person deleted",
        description: "The person has been deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting person",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper to filter people by type
  const getFilteredPeople = (type: 'deceased' | 'normal' | 'legal') => {
    if (!people) return [];
    
    switch (type) {
      case 'deceased':
        return people.filter(p => p.relationshipToDeceased === 'Deceased');
      case 'legal':
        return people.filter(p => p.firstName?.toLowerCase().includes('solicitor') || 
                                 p.lastName?.toLowerCase().includes('solicitor') ||
                                 p.title === 'Legal');
      case 'normal':
        return people.filter(p => p.relationshipToDeceased !== 'Deceased' && 
                                 !p.firstName?.toLowerCase().includes('solicitor') && 
                                 !p.lastName?.toLowerCase().includes('solicitor') &&
                                 p.title !== 'Legal');
      default:
        return people;
    }
  };

  // Get deceased people specifically
  const deceasedPeople = people.filter(p => p.relationshipToDeceased === 'Deceased');

  return {
    people,
    deceasedPeople,
    getFilteredPeople,
    isLoadingPeople,
    isProcessingPerson,
    createPerson,
    updatePerson,
    deletePerson
  };
}