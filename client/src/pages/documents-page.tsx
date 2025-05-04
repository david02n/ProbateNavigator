import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import NewHeader from "@/components/layout/NewHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  File, 
  FilePlus2,
  FileCheck,
  FileX,
  Download,
  Search,
  Trash2,
  Eye
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  
  // Sample documents (would be replaced with API calls)
  const [documents, setDocuments] = useState<any[]>([
    // Empty to start
  ]);
  
  const documentCategories = [
    { 
      id: "identification", 
      name: "Identification", 
      description: "ID, passport, proof of address", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      id: "death_certificate", 
      name: "Death Certificate",
      description: "Official death certificate", 
      icon: <FileCheck className="h-5 w-5" /> 
    },
    { 
      id: "will", 
      name: "Will & Codicils", 
      description: "Original will and amendments", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      id: "property", 
      name: "Property Documents", 
      description: "Title deeds, valuations", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      id: "financial", 
      name: "Financial Documents", 
      description: "Bank statements, investments", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      id: "tax", 
      name: "Tax Documents", 
      description: "Tax returns, IHT forms", 
      icon: <FileText className="h-5 w-5" /> 
    }
  ];
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This would be replaced with actual upload logic
    console.log("Files selected:", event.target.files);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NewHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Documents</h1>
            <p className="text-gray-600">
              Upload and manage important documents for your probate application
            </p>
          </div>
          
          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="required">Required Documents</TabsTrigger>
              <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-4">
              {/* Main Upload Area */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  {/* Upload Area */}
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center hover:bg-gray-50 transition cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      console.log("Files dropped:", e.dataTransfer.files);
                    }}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Drag & Drop Files</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Upload PDFs, images, or document files (max 10MB)
                    </p>
                    
                    <div className="flex justify-center">
                      <div className="text-center flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-2">drag & drop file</p>
                        <p className="text-sm text-gray-500 mb-4">OR</p>
                      </div>
                    </div>
                    
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      multiple 
                      onChange={handleFileUpload} 
                    />
                    <Button 
                      className="bg-[#002B49] hover:bg-[#002B49]/90" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      choose file
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Document Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {documentCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
                          {category.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-xs text-gray-500">{category.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Upload
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Document List */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Documents</CardTitle>
                  <CardDescription>
                    Documents you've uploaded for your probate application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <div className="space-y-4">
                      {/* Document list would go here */}
                      <p>Documents will appear here once uploaded</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Documents you upload will appear here. Start by uploading required documents for your probate application.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Upload Your First Document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="required" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Required Documents</CardTitle>
                  <CardDescription>
                    Documents needed for your probate application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Death Certificate */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="flex">
                          <div className="h-10 w-10 rounded-md bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                            <FileX className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">Death Certificate</h4>
                            <p className="text-sm text-gray-500">Required for probate application</p>
                          </div>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full h-fit">
                          Not Uploaded
                        </span>
                      </div>
                      <div className="mt-3 ml-13">
                        <Button 
                          size="sm"
                          className="bg-[#002B49] hover:bg-[#002B49]/90"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                    
                    {/* Will Document */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="flex">
                          <div className="h-10 w-10 rounded-md bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                            <FileX className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">Will</h4>
                            <p className="text-sm text-gray-500">Original will and any codicils</p>
                          </div>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full h-fit">
                          Not Uploaded
                        </span>
                      </div>
                      <div className="mt-3 ml-13">
                        <Button 
                          size="sm"
                          className="bg-[#002B49] hover:bg-[#002B49]/90"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                    
                    {/* ID Verification */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="flex">
                          <div className="h-10 w-10 rounded-md bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                            <FileX className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">ID Verification</h4>
                            <p className="text-sm text-gray-500">Passport or driving license</p>
                          </div>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full h-fit">
                          Not Uploaded
                        </span>
                      </div>
                      <div className="mt-3 ml-13">
                        <Button 
                          size="sm"
                          className="bg-[#002B49] hover:bg-[#002B49]/90"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="uploaded" className="pt-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Documents Uploaded Yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    All documents you upload will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pending" className="pt-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Documents</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Documents pending review will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;