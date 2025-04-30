import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, CheckCircle, X } from "lucide-react";

// Common Vercel error types
type VercelErrorType = 
  | "FUNCTION_INVOCATION_FAILED" 
  | "DEPLOYMENT_NOT_FOUND" 
  | "FUNCTION_INVOCATION_TIMEOUT" 
  | "FUNCTION_PAYLOAD_TOO_LARGE"
  | "DEPLOYMENT_NOT_READY_REDIRECTING"
  | "DNS_HOSTNAME_NOT_FOUND"
  | "NOT_FOUND"
  | "INTERNAL_FUNCTION_INVOCATION_FAILED"
  | "INTERNAL_CACHE_ERROR"
  | "INTERNAL_DEPLOYMENT_FETCH_FAILED"
  | "INTERNAL_FUNCTION_NOT_READY";

interface VercelErrorInfo {
  type: VercelErrorType;
  title: string;
  description: string;
  solution: string;
}

const VERCEL_ERRORS: Record<VercelErrorType, VercelErrorInfo> = {
  FUNCTION_INVOCATION_FAILED: {
    type: "FUNCTION_INVOCATION_FAILED",
    title: "Server Function Error",
    description: "A serverless function has failed during execution.",
    solution: "Check server logs for errors. Common causes include missing environment variables, database connection issues, or API failures."
  },
  DEPLOYMENT_NOT_FOUND: {
    type: "DEPLOYMENT_NOT_FOUND",
    title: "Deployment Not Found",
    description: "The requested deployment could not be found.",
    solution: "Verify deployment status in Vercel dashboard and ensure the deployment URL is correct."
  },
  FUNCTION_INVOCATION_TIMEOUT: {
    type: "FUNCTION_INVOCATION_TIMEOUT",
    title: "Function Timeout",
    description: "A serverless function has exceeded its execution time limit.",
    solution: "Optimize database queries, reduce external API calls, or consider using Edge Functions for performance-critical operations."
  },
  FUNCTION_PAYLOAD_TOO_LARGE: {
    type: "FUNCTION_PAYLOAD_TOO_LARGE",
    title: "Payload Too Large",
    description: "The request or response payload exceeds size limits.",
    solution: "Reduce the size of request/response data. Consider pagination for large datasets or client-side filtering."
  },
  DEPLOYMENT_NOT_READY_REDIRECTING: {
    type: "DEPLOYMENT_NOT_READY_REDIRECTING",
    title: "Deployment Not Ready",
    description: "The deployment is still being prepared.",
    solution: "Wait for the deployment to complete. Check build logs in Vercel dashboard for any issues."
  },
  DNS_HOSTNAME_NOT_FOUND: {
    type: "DNS_HOSTNAME_NOT_FOUND",
    title: "DNS Hostname Not Found",
    description: "The requested hostname could not be resolved.",
    solution: "Verify DNS configuration for your domain. Check nameservers and DNS propagation status."
  },
  NOT_FOUND: {
    type: "NOT_FOUND",
    title: "Resource Not Found",
    description: "The requested resource could not be found.",
    solution: "Check file paths and API routes. Ensure static files are in the correct directory and API endpoints are properly defined."
  },
  INTERNAL_FUNCTION_INVOCATION_FAILED: {
    type: "INTERNAL_FUNCTION_INVOCATION_FAILED",
    title: "Internal Function Error",
    description: "A Vercel internal function has failed during execution.",
    solution: "This is a Vercel platform error. Check your deployment logs and contact Vercel support if the issue persists."
  },
  INTERNAL_CACHE_ERROR: {
    type: "INTERNAL_CACHE_ERROR",
    title: "Cache Error",
    description: "There was an issue with Vercel's caching system.",
    solution: "Try manually invalidating the build cache by redeploying. If the issue persists, contact Vercel support."
  },
  INTERNAL_DEPLOYMENT_FETCH_FAILED: {
    type: "INTERNAL_DEPLOYMENT_FETCH_FAILED",
    title: "Deployment Fetch Failed",
    description: "Vercel was unable to fetch your deployment.",
    solution: "This is usually a temporary issue. Try redeploying your application. If the issue persists, contact Vercel support."
  },
  INTERNAL_FUNCTION_NOT_READY: {
    type: "INTERNAL_FUNCTION_NOT_READY",
    title: "Function Not Ready",
    description: "A serverless function is not yet ready to serve requests.",
    solution: "This typically happens during cold starts or when a deployment is still being prepared. Wait a few minutes and try again."
  }
};

export function VercelCompatibilityCheck() {
  const [showDialog, setShowDialog] = useState(false);
  const [isVercel, setIsVercel] = useState(false);
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([]);
  const [detectedErrors, setDetectedErrors] = useState<VercelErrorInfo[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Check if running on Vercel
    const isVercelPlatform = 
      window.location.hostname.includes('vercel') || 
      !!document.cookie.includes('__vercel') ||
      !!window.location.hostname.endsWith('.vercel.app');
    
    setIsVercel(isVercelPlatform);
    
    // Only run checks if we're on Vercel
    if (isVercelPlatform) {
      // Check for missing environment variables
      const requiredEnvVars = ['VITE_STRIPE_PUBLIC_KEY'];
      const missing = requiredEnvVars.filter(
        (envVar) => !import.meta.env[envVar]
      );
      setMissingEnvVars(missing);

      // Check for API connectivity issues that might indicate Vercel errors
      const checkApiEndpoints = async () => {
        try {
          const response = await fetch('/api/health-check', { 
            method: 'HEAD',
            headers: { 'Cache-Control': 'no-cache' }
          });
          if (!response.ok) {
            // Add potential errors based on response status
            if (response.status === 404) {
              setDetectedErrors(prev => [...prev, VERCEL_ERRORS.NOT_FOUND]);
            } else if (response.status === 500) {
              setDetectedErrors(prev => [...prev, VERCEL_ERRORS.FUNCTION_INVOCATION_FAILED]);
            } else if (response.status === 504) {
              setDetectedErrors(prev => [...prev, VERCEL_ERRORS.FUNCTION_INVOCATION_TIMEOUT]);
            }
          }
        } catch (error) {
          // Network error likely indicates deployment issues
          setDetectedErrors(prev => [...prev, VERCEL_ERRORS.DEPLOYMENT_NOT_READY_REDIRECTING]);
        }
      };

      checkApiEndpoints();

      // Parse URL for potential error information
      const urlParams = new URLSearchParams(window.location.search);
      const errorCode = urlParams.get('error');
      
      if (errorCode && Object.keys(VERCEL_ERRORS).includes(errorCode)) {
        setDetectedErrors(prev => [
          ...prev, 
          VERCEL_ERRORS[errorCode as VercelErrorType]
        ]);
      }

      // Show dialog if there are issues
      if (missing.length > 0 || detectedErrors.length > 0) {
        setShowDialog(true);
      }
    }
  }, []);

  if (!isVercel) {
    return null;
  }

  const hasIssues = missingEnvVars.length > 0 || detectedErrors.length > 0;

  return (
    <>
      {hasIssues && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowDialog(true)}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Vercel Deployment Issues
          </Button>
        </div>
      )}

      {!hasIssues && !expanded && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setExpanded(true)}
            variant="outline"
            className="flex items-center gap-2 bg-white bg-opacity-80 hover:bg-opacity-100"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            Vercel Compatible
          </Button>
        </div>
      )}

      {!hasIssues && expanded && (
        <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Vercel Compatibility
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setExpanded(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Your application appears to be properly configured for Vercel deployment.
          </p>
          <p className="text-xs text-gray-500">
            For advanced deployment options, view the VERCEL_DEPLOYMENT.md file.
          </p>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs w-full"
              onClick={() => window.open('/vercel-info', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Deployment Guide
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Vercel Deployment Issues Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              The following issues may affect your application when deployed on Vercel:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 my-4">
            {missingEnvVars.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Missing Environment Variables</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    The following environment variables are required but not configured:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {missingEnvVars.map((envVar) => (
                      <li key={envVar}>{envVar}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm">
                    Set these environment variables in your Vercel project settings.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {detectedErrors.map((error) => (
              <Alert key={error.type} variant="destructive">
                <AlertTitle>
                  {error.title} ({error.type})
                </AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{error.description}</p>
                  <p className="font-medium mt-1">Solution:</p>
                  <p>{error.solution}</p>
                </AlertDescription>
              </Alert>
            ))}
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => window.open('/vercel-info', '_blank')}
              className="inline-flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Deployment Guide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}