import React from "react";
import { Upload, BrainCircuit, FileText, CheckCircle } from "lucide-react";

const KeyFeatures: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-inter mb-4">Key Features</h2>
          <p className="text-lg text-charcoal/80 max-w-2xl mx-auto">
            Streamline your probate journey with intelligent tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">One-and-done uploads</h3>
            <p className="text-charcoal/70">
              Snap or drag in death certificates, bank statements and deeds—once is all it takes.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Auto-filled forms</h3>
            <p className="text-charcoal/70">
              Every field populated from your documents. Review, tweak and approve—no manual entry.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Guided journey</h3>
            <p className="text-charcoal/70">
              Clear prompts and progress indicators keep you moving forward with confidence.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant valuation</h3>
            <p className="text-charcoal/70">
              Total and net worth calculated for inheritance-tax purposes—no spreadsheets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;