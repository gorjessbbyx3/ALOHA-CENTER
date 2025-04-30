import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle, AlertTriangle } from 'lucide-react';

/**
 * This component detects when running on Vercel and helps troubleshoot common issues
 * that might occur in the deployment environment.
 */
export function VercelCompatibilityCheck() {
  const [isVercel, setIsVercel] = useState(false);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're running on Vercel
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('.vercel.app')) {
      setIsVercel(true);
      
      // Check API connectivity on Vercel
      fetch('/api/services')
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`API responded with ${res.status}: ${text}`);
          }
          return res.json();
        })
        .then(() => {
          setApiStatus('success');
        })
        .catch((err) => {
          setApiStatus('error');
          setErrorMessage(err.message);
        });
    }
  }, []);

  if (!isVercel || apiStatus === 'success') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      {apiStatus === 'loading' ? (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-800">Vercel Deployment</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Checking API connectivity... This message will disappear once connectivity is confirmed.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-800">API Connection Issue</AlertTitle>
          <AlertDescription className="text-red-700">
            <p className="mb-2">Unable to connect to the API. This may indicate a Vercel deployment issue.</p>
            {errorMessage && (
              <p className="mb-2 text-xs font-mono bg-red-100 p-2 rounded overflow-auto">
                {errorMessage}
              </p>
            )}
            <div className="flex flex-col space-y-2 mt-3">
              <Button size="sm" variant="outline" className="justify-start" asChild>
                <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Check Vercel Dashboard
                </a>
              </Button>
              <Button size="sm" variant="outline" className="justify-start" asChild>
                <a href="/VERCEL_DEPLOYMENT.md" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Deployment Guide
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}