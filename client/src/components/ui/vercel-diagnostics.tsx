import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// This component specifically looks for Vercel deployment issues
// and provides diagnostic information and solutions
export function VercelDeploymentDiagnostics() {
  const [isVercel, setIsVercel] = useState<boolean>(false);
  const [apiHealth, setApiHealth] = useState<'unknown' | 'ok' | 'error'>('unknown');
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Check if we're running on Vercel
  useEffect(() => {
    // The easiest way to detect Vercel is to check the hostname
    const isVercelDomain = window.location.hostname.endsWith('.vercel.app') || 
                          window.location.hostname.endsWith('.vercel-insights.com');
    setIsVercel(isVercelDomain);

    // Only run diagnostics if on Vercel
    if (isVercelDomain) {
      runDiagnostics();
    }
  }, []);

  const runDiagnostics = async () => {
    setChecking(true);
    try {
      // Try to hit the health check endpoint
      const healthResponse = await fetch('/api/health-check')
        .then(res => {
          if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
          return res.json();
        })
        .catch(err => {
          setApiHealth('error');
          setErrorDetail(err.message);
          return null;
        });
      
      if (healthResponse) {
        setApiHealth('ok');
        setDiagnosticInfo(healthResponse);
      }
    } catch (error: any) {
      setApiHealth('error');
      setErrorDetail(error.message);
    } finally {
      setChecking(false);
    }
  };

  // If not on Vercel, don't show anything
  if (!isVercel) return null;

  if (apiHealth === 'unknown') {
    return (
      <Alert className="mb-4 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-600">Checking Vercel Deployment</AlertTitle>
        <AlertDescription className="text-blue-700">
          Checking API connectivity and deployment health...
        </AlertDescription>
      </Alert>
    );
  }

  if (apiHealth === 'error') {
    return (
      <Alert className="mb-4 bg-amber-50" variant="destructive">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-600">API Connection Issue</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p>Unable to connect to the API. This may indicate a Vercel deployment issue.</p>
          <p className="mt-2 font-mono text-xs bg-amber-100 p-2 rounded">{errorDetail}</p>
          <div className="mt-3">
            <strong>Possible solutions:</strong>
            <ul className="list-disc ml-5 mt-1">
              <li>Check environment variables in Vercel dashboard</li>
              <li>Verify database connection settings</li>
              <li>Review Function logs in Vercel dashboard</li>
              <li>Ensure API routes are correctly defined</li>
            </ul>
          </div>
          <Button 
            className="mt-3 bg-amber-600 hover:bg-amber-700"
            onClick={runDiagnostics}
            disabled={checking}
          >
            {checking ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Check Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (apiHealth === 'ok') {
    return (
      <Alert className="mb-4 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-600">Vercel Deployment Healthy</AlertTitle>
        <AlertDescription className="text-green-700">
          <p>API connectivity confirmed. Your Vercel deployment is operating correctly.</p>
          {diagnosticInfo && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">View Diagnostic Information</summary>
              <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto">
                {JSON.stringify(diagnosticInfo, null, 2)}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}