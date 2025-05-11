import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Upload, FileText, CheckCircle, BrainCircuit } from "lucide-react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SwiftLogoWithText } from "@/components/ui/SwiftLogo";

const Hero: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:flex items-center">
        <div className="md:w-1/2 mb-8 md:mb-0 pr-0 md:pr-12">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-inter leading-tight mb-4">
              Simplify the probate process <span className="text-primary">when you need it most</span>
            </h1>
            <p className="text-lg md:text-xl text-charcoal/80 mb-8 max-w-xl">
              ProbateSwift guides you through every step of the probate journey with clarity and compassion, saving you time, stress, and legal fees.
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="mb-8 space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Upload Documents Once</h3>
                <p className="text-sm text-charcoal/70">
                  Death certificates, bank statements, property deeds - we'll extract the data for you
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">AI-Powered Information Extraction</h3>
                <p className="text-sm text-charcoal/70">
                  Our system automatically identifies and extracts key information from your documents
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Auto-Organized Estate Details</h3>
                <p className="text-sm text-charcoal/70">
                  Assets and liabilities are automatically categorized and valued based on your documents
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#assessment" aria-label="Start your probate assessment">
              <Button className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 flex items-center">
                <span>Start Your Assessment</span>
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </a>
            <a href="#how-it-works" aria-label="Learn how the probate process works">
              <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-muted flex items-center">
                <PlayCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>See How It Works</span>
              </Button>
            </a>
          </div>
{/* Testimonials hidden as requested */}
        </div>
        
        <div className="md:w-1/2">
          <Card className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
            <h4 className="font-medium mb-3 text-center text-lg">Already know probate is required?</h4>
            <p className="text-charcoal/80 mb-5 text-center">
              Register to start using our advanced document processing and estate management tools
            </p>
            <a href="/auth" className="block">
              <Button className="w-full bg-primary text-white hover:bg-primary/90 py-3 flex items-center justify-center">
                <span className="font-medium">Get Started</span>
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;
