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
  Users
} from "lucide-react";

const ExecutorsPage: React.FC = () => {
  const { user } = useAuth();
  
  // Sample executor data - would be replaced with actual API calls
  const [executors, setExecutors] = useState<any[]>([
    {
      id: 1,
      isPrimary: true,
      firstName: user?.firstName || "Primary",
      lastName: user?.lastName || "Executor",
      email: user?.email || "executor@example.com",
      phone: "07712 345678",
      relationship: "Child",
      address: "123 Example Street, London, EC1A 1BB",
      isLegalProfessional: false
    }
  ]);
  
  const [professionals, setProfessionals] = useState<any[]>([
    // This would be populated with legal professionals later
  ]);
  
  // State to track if we're in adding mode
  const [isAdding, setIsAdding] = useState(false);
  
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
                {executors.map((executor) => (
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
                            {executor.isLegalProfessional && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                Legal Professional
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mt-1">
                            {executor.relationship} of the deceased
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
                          <p className="text-sm">{executor.email}</p>
                          <p className="text-sm">{executor.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-sm mt-1">{executor.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Executor Button */}
                <div className="border rounded-lg border-dashed p-5 text-center hover:bg-gray-50 transition cursor-pointer">
                  <UserPlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-3">Add another executor</p>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAdding(true)}>
                    Add Executor
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
                  {/* Map through professionals here */}
                  <p>Professional list will appear here</p>
                </div>
              ) : (
                <div className="border rounded-lg border-dashed p-5 text-center hover:bg-gray-50 transition cursor-pointer">
                  <Briefcase className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-3">No legal professionals added yet</p>
                  <Button variant="outline">
                    Add Legal Professional
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