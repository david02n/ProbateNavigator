import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileUp, 
  Upload,
  File,
  FileCheck, 
  Loader2,
  X
} from 'lucide-react';
import { uploadDocument, DocumentUploadProgress, DocumentAnalysisResult } from '@/lib/documentService';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploaderProps {
  caseId: number;
  category?: string;
  onUploadComplete?: (result: DocumentAnalysisResult) => void;
  onUploadError?: (error: string) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ 
  caseId, 
  category,
  onUploadComplete,
  onUploadError 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress>({
    status: 'uploading',
    progress: 0,
    message: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  // Handle drag over event (prevents default browser behavior)
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  // Reset file selection
  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Upload the selected file
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress({
      status: 'uploading',
      progress: 0,
      message: 'Preparing upload...'
    });
    
    try {
      // Upload the file
      const result = await uploadDocument(
        selectedFile,
        caseId,
        category || 'general',
        (progress: DocumentUploadProgress) => {
          setUploadProgress(progress);
        }
      );
      
      if (result.success && result.documentId) {
        setUploadProgress({
          status: 'complete',
          progress: 100,
          message: 'Upload complete! Processing document...',
          documentId: result.documentId
        });
        
        toast({
          title: 'Upload successful',
          description: 'Your document has been uploaded and is being processed',
        });
        
        // Reset form after successful upload
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Notify parent component of successful upload and processing
        if (onUploadComplete) {
          // For now, we'll create a simple result since we're waiting for processing
          const analysisResult: DocumentAnalysisResult = {
            documentId: result.documentId,
            documentType: category || 'general',
            extractedData: {},
            status: 'processed',
            message: 'Document uploaded successfully'
          };
          onUploadComplete(analysisResult);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed'
      });
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
      
      if (onUploadError) {
        onUploadError(error instanceof Error ? error.message : 'Upload failed');
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="w-full">
      {!isUploading ? (
        <div>
          {selectedFile ? (
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                    <File className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearFile}
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                onClick={handleUpload} 
                className="w-full bg-[#002B49] hover:bg-[#002B49]/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </Card>
          ) : (
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">Upload Document</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                Drag and drop your file here, or click to select
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (max 10MB)
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <Button variant="outline" size="sm">
                Select File
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">
                {uploadProgress.status === 'uploading' ? 'Uploading...' : 
                 uploadProgress.status === 'processing' ? 'Processing...' : 
                 uploadProgress.status === 'complete' ? 'Upload Complete' : 'Upload Failed'}
              </h3>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                {uploadProgress.status === 'uploading' || uploadProgress.status === 'processing' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : uploadProgress.status === 'complete' ? (
                  <FileCheck className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </div>
            </div>
            
            <Progress value={uploadProgress.progress} className="h-2 mb-2" />
            
            <p className="text-sm text-gray-500">
              {uploadProgress.message || 'Uploading your document...'}
            </p>
            
            {selectedFile && (
              <div className="mt-3 text-xs text-gray-500">
                {selectedFile.name} • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            )}
          </div>
          
          {uploadProgress.status === 'error' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsUploading(false)}
            >
              Try Again
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default DocumentUploader;