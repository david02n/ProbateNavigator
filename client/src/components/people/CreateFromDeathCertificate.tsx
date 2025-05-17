import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, UserPlus } from 'lucide-react';
import { Document } from '@shared/schema';

interface CreateFromDeathCertificateProps {
  caseId: number;
  userId: number;
}

export const CreateFromDeathCertificate: React.FC<CreateFromDeathCertificateProps> = ({ caseId, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all death certificate documents for this case
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    enabled: isOpen,
  });
  
  // Filter for death certificates only
  const deathCertificates = documents.filter(doc => doc.type === 'death_certificate');
  
  // Mutation to create a person from death certificate
  const createPersonMutation = useMutation({
    mutationFn: async (personData: any) => {
      const res = await apiRequest('POST', '/api/executors', personData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/executors'] });
      toast({
        title: 'Success',
        description: 'Deceased person created from death certificate',
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create person from death certificate',
        variant: 'destructive',
      });
    },
  });
  
  // Helper function to extract data from document notes
  const extractDataFromNotes = (document: Document) => {
    try {
      if (!document.notes) {
        toast({
          title: 'No data available',
          description: 'This document does not contain any extracted data',
          variant: 'destructive',
        });
        return null;
      }
      
      console.log("Processing document notes:", document.notes);
      
      // Try to parse the notes as JSON
      const notesObj = JSON.parse(document.notes);
      
      // Handle different formats of the data
      
      // Format 1: Direct object with fields
      if (notesObj.firstName || notesObj.surname || notesObj.type === "Death Certificate") {
        console.log("Found direct JSON format with fields");
        return notesObj;
      }
      
      // Format 2: Nested under webhookResponse.content
      if (notesObj && notesObj.webhookResponse && notesObj.webhookResponse.content) {
        console.log("Found nested webhookResponse.content format");
        
        // Try to extract JSON from markdown code block
        const match = notesObj.webhookResponse.content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (match && match[1]) {
          return JSON.parse(match[1]);
        }
        
        // Try direct parsing of content if it's a JSON string
        try {
          const contentObj = JSON.parse(notesObj.webhookResponse.content);
          console.log("Parsed webhookResponse content as direct JSON:", contentObj);
          return contentObj;
        } catch (e) {
          console.error('Error parsing content as JSON:', e);
        }
      }
      
      // Format 3: Generic fields in the notes object
      // Check if there are any usable fields directly in the notes object
      if (notesObj.documentType === "death_certificate" && notesObj.message) {
        console.log("Found generic format with document type");
        return notesObj;
      }
      
      return notesObj;
    } catch (error) {
      console.error('Error extracting data from notes:', error);
      toast({
        title: 'Data extraction failed',
        description: 'Unable to parse the document data',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  // Handle document selection
  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    const data = extractDataFromNotes(document);
    setExtractedData(data);
  };
  
  // Handle person creation from extracted data
  const handleCreatePerson = () => {
    if (!selectedDocument || !extractedData) return;
    
    // Split first name if it contains multiple words
    let firstName = '';
    let middleNames = '';
    
    // Get the actual data, which might be nested in webhookResponse.content
    const personData = extractedData.type === "Death Certificate" ? 
      extractedData : 
      (extractedData.webhookResponse?.content ? JSON.parse(extractedData.webhookResponse.content) : extractedData);
    
    // Try to get first name from any possible location in the data structure
    const rawFirstName = personData.firstName || 
                         personData.first_name || 
                         personData.firstname || 
                         personData.givenName || 
                         '';
    
    if (rawFirstName) {
      const nameParts = rawFirstName.trim().split(/\s+/);
      firstName = nameParts[0];
      if (nameParts.length > 1) {
        // If middleName is explicitly provided, use that instead of splitting
        if (!personData.middleName && !personData.middle_name) {
          middleNames = nameParts.slice(1).join(' ');
        }
      }
    }
    
    // Try to get middle name from any possible field name
    const rawMiddleName = personData.middleName || 
                          personData.middle_name || 
                          personData.middlenames || 
                          middleNames || 
                          '';
    
    // Try to get last name from any possible field name
    const rawLastName = personData.lastName || 
                        personData.last_name || 
                        personData.lastname || 
                        personData.surname || 
                        personData.familyName || 
                        'Unknown';
    
    // Get address details from any possible field names
    const street = personData.street || 
                   personData.addressLine1 || 
                   personData.address_line_1 || 
                   personData.address || 
                   '';
                   
    const city = personData.city || 
                 personData.town_or_city || 
                 personData.town || 
                 '';
                 
    const county = personData.county || 
                   personData.region || 
                   personData.state || 
                   '';
                   
    const postcode = personData.postcode || 
                     personData.postCode || 
                     personData.post_code || 
                     personData.postal_code || 
                     personData.zip || 
                     '';
    
    console.log("Creating person with extracted data:", {
      firstName,
      middleNames: rawMiddleName,
      lastName: rawLastName,
      street,
      city,
      county,
      postcode
    });
    
    // Create person from extracted data
    createPersonMutation.mutate({
      caseId,
      userId,
      firstName: firstName || 'Unknown',
      middleNames: rawMiddleName,
      lastName: rawLastName,
      addressLine1: street,
      city: city,
      county: county,
      postCode: postcode,
      isExecutor: false,
      isApplicant: false,
      isNotifying: false,
      needsMoreInfo: true, // Always mark as needing more info for manual verification
      relationshipToDeceased: 'Deceased',
      documentId: selectedDocument.id,
    });
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2 border-dashed border-primary/50 hover:bg-primary/5" 
        onClick={() => setIsOpen(true)}
      >
        <FileText className="h-5 w-5 text-primary" />
        <span>Create from Death Certificate</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create Person from Death Certificate</DialogTitle>
            <DialogDescription>
              Select a death certificate and create a deceased person record automatically using the extracted data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {deathCertificates.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p>No death certificates found. Please upload a death certificate first.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <Label htmlFor="document">Select a Death Certificate</Label>
                  <div className="space-y-2">
                    {deathCertificates.map((doc) => (
                      <Card 
                        key={doc.id} 
                        className={`cursor-pointer ${selectedDocument?.id === doc.id ? 'border-primary' : ''}`}
                        onClick={() => handleDocumentSelect(doc)}
                      >
                        <CardHeader className="py-2 px-3">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-gray-600" />
                            <CardTitle className="text-sm">{doc.filename}</CardTitle>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {extractedData && (
                  <div className="mt-4">
                    <h3 className="font-medium text-md mb-2">Extracted Information</h3>
                    <div className="bg-gray-50 p-4 rounded-md text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Get data from any possible location in the structure */}
                        {(() => {
                          // Determine the actual data object, which might be nested
                          const personData = extractedData.type === "Death Certificate" ? 
                            extractedData : 
                            (extractedData.webhookResponse?.content ? 
                              (typeof extractedData.webhookResponse.content === 'string' ? 
                                JSON.parse(extractedData.webhookResponse.content) : 
                                extractedData.webhookResponse.content) : 
                              extractedData);
                          
                          // Find all name parts
                          const firstName = personData.firstName || personData.first_name || personData.firstname || '';
                          const middleName = personData.middleName || personData.middle_name || personData.middlenames || '';
                          const lastName = personData.lastName || personData.last_name || personData.lastname || personData.surname || '';
                          
                          // Find address components
                          const street = personData.street || personData.addressLine1 || personData.address_line_1 || personData.address || '';
                          const city = personData.city || personData.town_or_city || personData.town || '';
                          const county = personData.county || personData.region || personData.state || '';
                          const postcode = personData.postcode || personData.postCode || personData.post_code || '';
                          
                          // Find dates
                          const dob = personData.dateOfBirth || personData.date_of_birth || personData.birthDate || '';
                          const dod = personData.dateOfDeath || personData.date_of_death || personData.deathDate || '';
                          
                          // Return the data presentation
                          return (
                            <>
                              <div>
                                <span className="font-medium">Name:</span> {firstName} {middleName} {lastName}
                              </div>
                              
                              {dob && (
                                <div>
                                  <span className="font-medium">Date of Birth:</span> {dob}
                                </div>
                              )}
                              
                              {dod && (
                                <div>
                                  <span className="font-medium">Date of Death:</span> {dod}
                                </div>
                              )}
                              
                              {street && (
                                <div>
                                  <span className="font-medium">Address:</span> {street}
                                </div>
                              )}
                              
                              {city && (
                                <div>
                                  <span className="font-medium">City:</span> {city}
                                </div>
                              )}
                              
                              {county && (
                                <div>
                                  <span className="font-medium">County:</span> {county}
                                </div>
                              )}
                              
                              {postcode && (
                                <div>
                                  <span className="font-medium">Postcode:</span> {postcode}
                                </div>
                              )}
                              
                              {/* Additional information that might be available */}
                              {personData.applicationNumber && (
                                <div>
                                  <span className="font-medium">Application Number:</span> {personData.applicationNumber}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button 
              disabled={!selectedDocument || !extractedData || createPersonMutation.isPending}
              onClick={handleCreatePerson}
              className="flex items-center gap-2"
            >
              {createPersonMutation.isPending && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              Create Deceased Person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateFromDeathCertificate;