import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Search, User, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNewAppointment?: () => void;
  showExportBtn?: boolean;
  onExport?: () => void;
  className?: string;
}

export function Header({ 
  title, 
  subtitle, 
  onNewAppointment, 
  showExportBtn = true,
  onExport,
  className 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-sidebar-background border-b border-sidebar-border">
        <button 
          type="button" 
          className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-sidebar-accent focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Top Header - Meevo Style */}
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-sidebar-background border-b border-sidebar-border">
        <div className="flex-1 px-4 flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 flex">
            <div className="w-full flex md:ml-0">
              <label htmlFor="search-field" className="sr-only">Search</label>
              <div className="relative w-full text-gray-400 focus-within:text-gray-300">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 ml-3 text-gray-400" />
                </div>
                <input 
                  id="search-field" 
                  className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-white placeholder-gray-400 bg-sidebar-accent/50 rounded-md focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" 
                  placeholder="Search..." 
                  type="search"
                />
              </div>
            </div>
          </div>
          
          {/* User Area */}
          <div className="ml-4 flex items-center md:ml-6">
            <button type="button" className="p-1 rounded-full text-gray-300 hover:text-white focus:outline-none">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>
            
            <div className="relative ml-3 flex items-center">
              <div>
                <button type="button" className="flex items-center text-sm rounded-full focus:outline-none">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary/80 flex items-center justify-center text-white mr-2">
                    CC
                  </div>
                  <span className="text-white">Chris C.</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between mb-6", className)}>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          {/* 2x2 Grid for buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Top row */}
            <div>
              {showExportBtn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export
                </Button>
              )}
            </div>
            
            <div>
              {onNewAppointment && (
                <Button
                  size="sm"
                  onClick={onNewAppointment}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Appt
                </Button>
              )}
            </div>
            
            {/* Bottom row - Adding two more buttons for a complete 2x2 layout */}
            <div>
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.location.assign("/patients")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Patients
              </Button>
            </div>
            
            <div>
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.location.assign("/settings")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
