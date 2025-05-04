import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import NewHeader from "@/components/layout/NewHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home,
  PoundSterling,
  CreditCard,
  Landmark,
  Plus,
  Car,
  Banknote,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const EstatePage: React.FC = () => {
  const { user } = useAuth();
  
  // Sample estate data - would be replaced with API calls
  const [estateData, setEstateData] = useState({
    totalAssets: 450000,
    totalLiabilities: 35000,
    netEstate: 415000,
    ihtThreshold: 325000,
    taxableAmount: 90000,
    taxRate: 0.4,
    taxDue: 36000,
    assets: [
      {
        id: 1,
        type: "property",
        name: "Main Residence",
        value: 320000,
        description: "123 Example Road, London",
        icon: <Home className="h-5 w-5" />
      },
      {
        id: 2,
        type: "bank",
        name: "Savings Account",
        value: 85000,
        description: "Barclays Bank",
        icon: <Landmark className="h-5 w-5" />
      },
      {
        id: 3,
        type: "investment",
        name: "Stocks & Shares",
        value: 45000,
        description: "Investment portfolio",
        icon: <TrendingUp className="h-5 w-5" />
      }
    ],
    liabilities: [
      {
        id: 1,
        type: "mortgage",
        name: "Mortgage",
        value: 25000,
        description: "Outstanding balance",
        icon: <Home className="h-5 w-5" />
      },
      {
        id: 2,
        type: "loan",
        name: "Personal Loan",
        value: 10000,
        description: "Bank loan",
        icon: <CreditCard className="h-5 w-5" />
      }
    ]
  });
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NewHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Estate</h1>
            <p className="text-gray-600">
              Manage the assets and liabilities of the estate
            </p>
          </div>
          
          {/* Estate Summary Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PoundSterling className="h-5 w-5 mr-2 text-primary" />
                Estate Value Summary
              </CardTitle>
              <CardDescription>
                Total value of the estate and inheritance tax estimate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Assets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600">Total Assets</span>
                    <span className="font-medium text-lg">{formatCurrency(estateData.totalAssets)}</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>Assets</span>
                  </div>
                </div>
                
                {/* Liabilities */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600">Total Liabilities</span>
                    <span className="font-medium text-lg">{formatCurrency(estateData.totalLiabilities)}</span>
                  </div>
                  <div className="flex items-center text-sm text-red-600">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    <span>Debts</span>
                  </div>
                </div>
                
                {/* Net Estate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600">Net Estate Value</span>
                    <span className="font-medium text-lg">{formatCurrency(estateData.netEstate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <PoundSterling className="h-4 w-4 mr-1" />
                    <span>After debts</span>
                  </div>
                </div>
              </div>
              
              {/* IHT Section */}
              <div className="mt-8 border-t pt-6">
                <h3 className="font-medium mb-3">Inheritance Tax Estimate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tax-free threshold</span>
                        <span>{formatCurrency(estateData.ihtThreshold)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Taxable amount</span>
                        <span>{formatCurrency(estateData.taxableAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tax rate</span>
                        <span>{estateData.taxRate * 100}%</span>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-gray-800">Estimated tax due</span>
                        <span>{formatCurrency(estateData.taxDue)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      This is an estimate only. The final tax calculation will depend on various factors including exemptions and reliefs.
                    </p>
                    <Button variant="outline" className="w-full">
                      View Tax Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Assets and Liabilities Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Assets Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpRight className="h-5 w-5 mr-2 text-green-600" />
                  Assets
                </CardTitle>
                <CardDescription>
                  Property, financial accounts, and other assets owned by the deceased
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estateData.assets.map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                      <div className="flex justify-between">
                        <div className="flex">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
                            {asset.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{asset.name}</h4>
                            <p className="text-sm text-gray-500">{asset.description}</p>
                          </div>
                        </div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(asset.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Asset Button */}
                  <div className="border rounded-lg border-dashed p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                    <Plus className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-2">Add another asset</p>
                    <Button variant="outline" size="sm">
                      Add Asset
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <span className="text-gray-600">Total Assets</span>
                <span className="font-medium">{formatCurrency(estateData.totalAssets)}</span>
              </CardFooter>
            </Card>
            
            {/* Liabilities Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowDownRight className="h-5 w-5 mr-2 text-red-600" />
                  Liabilities
                </CardTitle>
                <CardDescription>
                  Mortgages, loans, credit cards, and other debts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estateData.liabilities.map((liability) => (
                    <div key={liability.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                      <div className="flex justify-between">
                        <div className="flex">
                          <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center text-red-600 mr-3">
                            {liability.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{liability.name}</h4>
                            <p className="text-sm text-gray-500">{liability.description}</p>
                          </div>
                        </div>
                        <div className="font-medium text-red-600">
                          {formatCurrency(liability.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Liability Button */}
                  <div className="border rounded-lg border-dashed p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                    <Plus className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-2">Add another liability</p>
                    <Button variant="outline" size="sm">
                      Add Liability
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <span className="text-gray-600">Total Liabilities</span>
                <span className="font-medium">{formatCurrency(estateData.totalLiabilities)}</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EstatePage;