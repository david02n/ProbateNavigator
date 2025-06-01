import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Users, 
  PoundSterling,
  ArrowRight,
  Info
} from 'lucide-react';
import type { RoutingState } from '@shared/routing-engine';

interface RoutingStatusProps {
  caseId: number;
  onNavigate?: (section: string) => void;
}

export function RoutingStatus({ caseId, onNavigate }: RoutingStatusProps) {
  const { data: routingState, isLoading, error } = useQuery<RoutingState>({
    queryKey: [`/api/routing-state?caseId=${caseId}`],
    enabled: !!caseId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !routingState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to load status</AlertTitle>
            <AlertDescription>
              There was an issue determining your application status. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (confidence: RoutingState['dataConfidence']) => {
    switch (confidence) {
      case 'declared': return 'bg-blue-100 text-blue-800';
      case 'evaluated': return 'bg-green-100 text-green-800';
      case 'inferred': return 'bg-yellow-100 text-yellow-800';
      case 'incomplete': return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    let completedSteps = 0;
    const totalSteps = 5;

    if (routingState.eligibleToApply) completedSteps++;
    if (!routingState.needsMorePeopleData) completedSteps++;
    if (!routingState.needsMoreEstateData) completedSteps++;
    if (routingState.ihtFormRequired === null || routingState.ihtFormRequired === 'online_declaration') completedSteps++;
    if (routingState.fastTrackEligible) completedSteps++;

    return (completedSteps / totalSteps) * 100;
  };

  const getNextAction = () => {
    if (!routingState.eligibleToApply) {
      return {
        title: 'Eligibility Issue',
        description: 'You may not be eligible to apply for probate yourself',
        action: 'Contact a solicitor',
        severity: 'error' as const
      };
    }

    if (routingState.needsMorePeopleData) {
      return {
        title: 'Add Executor Information',
        description: 'Complete executor details in the People section',
        action: 'Go to People',
        severity: 'warning' as const,
        onClick: () => onNavigate?.('people')
      };
    }

    if (routingState.needsMoreEstateData) {
      return {
        title: 'Complete Estate Valuation',
        description: 'Add asset and liability information',
        action: 'Go to Estate',
        severity: 'warning' as const,
        onClick: () => onNavigate?.('estate')
      };
    }

    if (routingState.ihtFormRequired === 'IHT400') {
      return {
        title: 'IHT400 Required',
        description: 'Complete and submit inheritance tax form before proceeding',
        action: 'View Requirements',
        severity: 'info' as const
      };
    }

    if (routingState.fastTrackEligible) {
      return {
        title: 'Ready for Application',
        description: 'All requirements met - ready to generate probate forms',
        action: 'Generate Forms',
        severity: 'success' as const
      };
    }

    return {
      title: 'Continue Setup',
      description: 'Complete remaining steps to proceed with your application',
      action: 'Continue',
      severity: 'info' as const
    };
  };

  const nextAction = getNextAction();
  const progressPercent = getProgressPercentage();

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Probate Application Status
              </CardTitle>
              <CardDescription>
                {routingState.probateType === 'grant_of_probate' 
                  ? 'Grant of Probate Application' 
                  : 'Letters of Administration Application'}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(routingState.dataConfidence)}>
              {routingState.dataConfidence.charAt(0).toUpperCase() + routingState.dataConfidence.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Application Progress</span>
              <span>{Math.round(progressPercent)}% Complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Key Status Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              {routingState.eligibleToApply ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium text-sm">Eligibility</p>
                <p className="text-xs text-muted-foreground">
                  {routingState.eligibleToApply ? 'Eligible to apply' : 'May need legal advice'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {routingState.estateIsExcepted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-sm">Estate Type</p>
                <p className="text-xs text-muted-foreground">
                  {routingState.estateIsExcepted ? 'Excepted estate' : 'Non-excepted estate'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {routingState.fastTrackEligible ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-sm">Fast Track</p>
                <p className="text-xs text-muted-foreground">
                  {routingState.fastTrackEligible ? 'Eligible' : 'More data needed'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Action Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className={
            nextAction.severity === 'error' ? 'border-red-200 bg-red-50' :
            nextAction.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            nextAction.severity === 'success' ? 'border-green-200 bg-green-50' :
            'border-blue-200 bg-blue-50'
          }>
            <Info className="h-4 w-4" />
            <AlertTitle>{nextAction.title}</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">{nextAction.description}</p>
              {nextAction.onClick ? (
                <Button onClick={nextAction.onClick} size="sm">
                  {nextAction.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" variant="outline">
                  {nextAction.action}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Requirements Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Requirements Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PoundSterling className="h-4 w-4" />
                Inheritance Tax
              </h4>
              <p className="text-sm text-muted-foreground">
                {routingState.ihtFormRequired === 'IHT400' 
                  ? 'IHT400 form required'
                  : routingState.ihtFormRequired === 'online_declaration'
                  ? 'Online declaration sufficient'
                  : 'No IHT forms required'}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Application Type
              </h4>
              <p className="text-sm text-muted-foreground">
                {routingState.probateType === 'grant_of_probate' 
                  ? 'Grant of Probate (will exists)'
                  : 'Letters of Administration (no will)'}
              </p>
            </div>
          </div>

          {(routingState.needsMoreEstateData || routingState.needsMorePeopleData) && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Missing Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {routingState.needsMoreEstateData && (
                  <li>• Complete estate valuation</li>
                )}
                {routingState.needsMorePeopleData && (
                  <li>• Add executor information</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}