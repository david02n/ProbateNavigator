import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, FileText, PoundSterling, Users, Clock } from 'lucide-react';
import { deriveRoutingState, getDecisionSummary, type EvaluationAnswers, type RoutingDecision } from '@shared/evaluation-routing';

interface EvaluationResultsProps {
  answers: EvaluationAnswers;
  onContinue: () => void;
  onRetakeEvaluation: () => void;
}

export function EvaluationResults({ answers, onContinue, onRetakeEvaluation }: EvaluationResultsProps) {
  const routingDecision = deriveRoutingState(answers);
  const summary = getDecisionSummary(routingDecision);

  const getComplexityColor = (complexity: RoutingDecision['complexity']) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
    }
  };

  const getComplexityIcon = (complexity: RoutingDecision['complexity']) => {
    switch (complexity) {
      case 'simple': return <CheckCircle className="h-4 w-4" />;
      case 'moderate': return <Clock className="h-4 w-4" />;
      case 'complex': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEstateTypeDescription = (estateType: RoutingDecision['estateType']) => {
    switch (estateType) {
      case 'excepted':
        return 'Your estate qualifies as an excepted estate, which means simplified probate procedures may apply.';
      case 'non_excepted':
        return 'Your estate is classified as non-excepted, requiring standard probate procedures and IHT forms.';
      case 'complex':
        return 'Your estate has complex characteristics that may require professional legal guidance.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Probate Path
          </CardTitle>
          <CardDescription>{summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge className={getComplexityColor(routingDecision.complexity)}>
                {getComplexityIcon(routingDecision.complexity)}
                {routingDecision.complexity.charAt(0).toUpperCase() + routingDecision.complexity.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <PoundSterling className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Threshold: £{routingDecision.totalThreshold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {routingDecision.ihtForm === 'none' ? 'No IHT form required' : routingDecision.ihtForm}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blockers (if any) */}
      {routingDecision.blockers.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {routingDecision.blockers.map((blocker, index) => (
                <li key={index}>{blocker}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings (if any) */}
      {routingDecision.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Considerations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {routingDecision.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Estate Details */}
      <Card>
        <CardHeader>
          <CardTitle>Estate Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Estate Type: {routingDecision.estateType.replace('_', ' ').toUpperCase()}</h4>
            <p className="text-sm text-muted-foreground">
              {getEstateTypeDescription(routingDecision.estateType)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-sm">Probate Application Type</h5>
              <p className="text-sm text-muted-foreground capitalize">
                {routingDecision.probateType.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <h5 className="font-medium text-sm">IHT Requirements</h5>
              <p className="text-sm text-muted-foreground">
                {routingDecision.requiresIht 
                  ? `${routingDecision.ihtForm} form required`
                  : 'No inheritance tax forms required'
                }
              </p>
            </div>
          </div>

          {/* Threshold breakdown */}
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium text-sm">Inheritance Tax Thresholds</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Nil Rate Band:</span>
                <span>£{routingDecision.nilRateBandThreshold.toLocaleString()}</span>
              </div>
              {routingDecision.residenceNilRateBand > 0 && (
                <div className="flex justify-between">
                  <span>Residence Nil Rate Band:</span>
                  <span>£{routingDecision.residenceNilRateBand.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total Threshold:</span>
                <span>£{routingDecision.totalThreshold.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Your Next Steps</CardTitle>
          <CardDescription>
            Complete these tasks to progress your probate application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routingDecision.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <p className="text-sm">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onContinue} 
          className="flex-1"
          disabled={routingDecision.blockers.length > 0}
        >
          Continue to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onRetakeEvaluation}>
          Retake Evaluation
        </Button>
      </div>

      {/* Additional Information */}
      <div className="text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg">
        <p>
          This assessment is based on the information you provided. Estate requirements can be complex, 
          and this guidance should not replace professional legal or tax advice. If you're unsure about 
          any aspect of your probate application, consider consulting with a qualified professional.
        </p>
      </div>
    </div>
  );
}