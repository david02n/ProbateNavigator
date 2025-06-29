import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/AuthPage";

import { AppFallback } from "@/components/AppFallback";

// New redesigned pages
import NewDashboardPage from "@/pages/new-dashboard";
import DashboardPage from "@/pages/dashboard-page";
import PeoplePage from "@/pages/people-page";
import EstatePage from "@/pages/estate-page";
import DocumentsPage from "@/pages/documents-page";
import DocumentUploadPage from "@/pages/document-upload-page";
import DeceasedDetailsPage from "@/pages/deceased-details-page";
import EvaluationPage from "@/pages/evaluation-page";

import { useEffect } from "react";
import AuthCallback from '@/pages/AuthCallback';

// Enhanced router component that handles mobile navigation better
function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Clean up URL fragments and handle routing
  useEffect(() => {
    // Clean up any hash fragments
    if (window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Authentication callback route */}
      <Route path="/auth/callback">
        <AuthCallback />
      </Route>
      
      {/* Public routes - accessible without authentication */}
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      {/* Redirect to auth if not authenticated */}
      {!user && <Redirect to="/auth" />}
      
      {/* Protected routes - require authentication */}
      {user && (
        <>
          <Route path="/">
            <Home />
          </Route>
          <Route path="/dashboard">
            <DashboardPage />
          </Route>
          <Route path="/new-dashboard">
            <NewDashboardPage />
          </Route>
          <Route path="/people">
            <PeoplePage />
          </Route>
          <Route path="/estate">
            <EstatePage />
          </Route>
          <Route path="/documents">
            <DocumentsPage />
          </Route>
          <Route path="/documents/upload">
            <DocumentUploadPage />
          </Route>
          <Route path="/deceased-details/:personId?">
            <DeceasedDetailsPage />
          </Route>
          <Route path="/evaluation">
            <EvaluationPage />
          </Route>
        </>
      )}
      
      {/* 404 route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;