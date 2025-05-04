import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import NewHeader from "@/components/layout/NewHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  Briefcase,
  Users,
  Loader2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Executor, ProbateCase } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ProcessedExecutor extends Executor {
  isPrimary?: boolean;
  isLegalProfessional?: boolean;
}

const ExecutorsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // State to track if we're in adding mode
  const [isAdding, setIsAdding] = useState(false);
  
  // Get the user's probate cases
  const { 
    data: probateCases,
    isLoading: isLoadingCases 
  } = useQuery<ProbateCase[]>({
    queryKey: ["/api/probate-cases"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Get the active case ID (first case for now, could be selected by user later)
  const activeCaseId = probateCases && probateCases.length > 0 ? probateCases[0].id : undefined;
  
  // Get executors for the active case
  const { 
    data: executors = [],
    isLoading: isLoadingExecutors 
  } = useQuery<Executor[]>({
    queryKey: ["/api/executors", activeCaseId],
    queryFn: activeCaseId ? getQueryFn({ on401: "throw" }) : () => Promise.resolve([]),
    enabled: !!activeCaseId,
  });
  
  // Create executor mutation
  const createExecutorMutation = useMutation({
    mutationFn: async (executorData: Partial<Executor>) => {
      const res = await apiRequest("POST", "/api/executors", executorData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executors", activeCaseId] });
      toast({
        title: "Executor added",
        description: "The executor has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding executor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Process executors to identify primary executors
  const processedExecutors: ProcessedExecutor[] = executors.map((executor, index) => {
    return {
      ...executor,
      isPrimary: executor.isApplicant || index === 0, // First executor is primary if none marked as applicant
      isLegalProfessional: executor.relationshipToDeceased === "Legal Professional"
    };
  });
  
  // Filter out legal professionals
  const professionals = processedExecutors.filter(exec => exec.isLegalProfessional);
  const regularExecutors = processedExecutors.filter(exec => !exec.isLegalProfessional);
  
  // Handle add executor
  const handleAddExecutor = () => {
    if (!activeCaseId) {
      toast({
        title: "No probate case",
        description: "Please create a probate case first",
        variant: "destructive",
      });
      return;
    }
    
    // This would usually open a modal for data input
    // For now, we'll create a dummy executor for demonstration
    createExecutorMutation.mutate({
      caseId: activeCaseId,
      userId: user?.id || 0,
      firstName: "New",
      lastName: "Executor",
      email: "executor@example.com",
      isApplicant: regularExecutors.length === 0, // Make first executor the applicant
      relationshipToDeceased: "Family Member",
    });
  };
  
  // Handle add professional
  const handleAddProfessional = () => {
    if (!activeCaseId) {
      toast({
        title: "No probate case",
        description: "Please create a probate case first",
        variant: "destructive",
      });
      return;
    }
    
    // This would usually open a modal for data input
    createExecutorMutation.mutate({
      caseId: activeCaseId,
      userId: user?.id || 0,
      firstName: "Legal",
      lastName: "Representative",
      email: "solicitor@example.com",
      isApplicant: false,
      relationshipToDeceased: "Legal Professional",
    });
  };
  
  const isLoading = isLoadingCases || isLoadingExecutors;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewHeader />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-gray-600">Loading executor information...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!activeCaseId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Executors</h1>
              <p className="text-gray-600">
                Manage executor details and professional representatives
              </p>
            </div>
            
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 mb-4">No probate case found. Please complete the assessment first to create a probate case.</p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => window.location.href = "/"}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NewHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Executors</h1>
            <p className="text-gray-600">
              Manage executor details and professional representatives
            </p>
          </div>
          
          {/* Primary Executor Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Estate Executors
              </CardTitle>
              <CardDescription>
                People legally responsible for administering the estate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {regularExecutors.length > 0 ? (
                  regularExecutors.map((executor) => (
                    <div 
                      key={executor.id} 
                      className={`border rounded-lg p-5 ${
                        executor.isPrimary ? 'border-primary/20 bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-start">
                          <div className={`rounded-full w-10 h-10 flex items-center justify-center mr-4 ${
                            executor.isPrimary ? 'bg-primary text-white' : 'bg-gray-200'
                          }`}>
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-lg">
                                {executor.firstName} {executor.lastName}
                              </h3>
                              {executor.isPrimary && (
                                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Primary Executor
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                              {executor.relationshipToDeceased || "Family member"} of the deceased
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!executor.isPrimary && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Contact Information</p>
                          <div className="space-y-1 mt-1">
                            <p className="text-sm">{executor.email || "No email provided"}</p>
                            <p className="text-sm">{executor.phone || "No phone provided"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-sm mt-1">
                            {executor.address ? (
                              <>
                                {executor.address}
                                {executor.city && <>, {executor.city}</>}
                                {executor.postCode && <>, {executor.postCode}</>}
                              </>
                            ) : (
                              "No address provided"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No executors have been added yet.</p>
                  </div>
                )}
                
                {/* Add Executor Button */}
                <div className="border rounded-lg border-dashed p-5 text-center hover:bg-gray-50 transition cursor-pointer">
                  <UserPlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-3">Add another executor</p>
                  <Button 
                    className="bg-primary hover:bg-primary/90" 
                    onClick={handleAddExecutor}
                    disabled={createExecutorMutation.isPending}
                  >
                    {createExecutorMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Executor"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Legal Professionals Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary" />
                Legal Professionals
              </CardTitle>
              <CardDescription>
                Solicitors or legal representatives assisting with the probate process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {professionals.length > 0 ? (
                <div className="space-y-4">
                  {professionals.map((professional) => (
                    <div key={professional.id} className="border rounded-lg p-5">
                      <div className="flex justify-between">
                        <div className="flex items-start">
                          <div className="rounded-full w-10 h-10 bg-blue-100 flex items-center justify-center mr-4 text-blue-700">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-lg">
                                {professional.firstName} {professional.lastName}
                              </h3>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                Legal Professional
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                              Solicitor
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Contact Information</p>
                          <div className="space-y-1 mt-1">
                            <p className="text-sm">{professional.email || "No email provided"}</p>
                            <p className="text-sm">{professional.phone || "No phone provided"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-sm mt-1">
                            {professional.address ? (
                              <>
                                {professional.address}
                                {professional.city && <>, {professional.city}</>}
                                {professional.postCode && <>, {professional.postCode}</>}
                              </>
                            ) : (
                              "No address provided"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg border-dashed p-5 text-center hover:bg-gray-50 transition cursor-pointer">
                  <Briefcase className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-3">No legal professionals added yet</p>
                  <Button 
                    variant="outline"
                    onClick={handleAddProfessional}
                    disabled={createExecutorMutation.isPending}
                  >
                    {createExecutorMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Legal Professional"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ExecutorsPage;