import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className={cn("hidden md:flex md:flex-shrink-0", className)}>
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-sidebar-background border-r border-sidebar-border">
          {/* Meevo Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <span className="text-xl font-bold text-white">Meevo</span>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary text-white rounded-md">Provider</span>
          </div>
          
          {/* Top Navigation with colored backgrounds */}
          <div className="px-4 space-y-2 mb-6">
            <div className="flex space-x-1">
              <div className="flex-1">
                <Link href="/">
                  <div className={cn(
                    "flex items-center justify-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive("/") 
                      ? "bg-primary text-white" 
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  )}>
                    Home
                  </div>
                </Link>
              </div>
              <div className="flex-1">
                <Link href="/appointments">
                  <div className={cn(
                    "flex items-center justify-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive("/appointments") 
                      ? "bg-primary text-white" 
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  )}>
                    Register
                  </div>
                </Link>
              </div>
              <div className="flex-1">
                <Link href="/services">
                  <div className={cn(
                    "flex items-center justify-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive("/services") 
                      ? "bg-primary text-white" 
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  )}>
                    Products
                  </div>
                </Link>
              </div>
              <div className="flex-1">
                <Link href="/reports">
                  <div className={cn(
                    "flex items-center justify-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive("/reports") 
                      ? "bg-primary text-white" 
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  )}>
                    Reports
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main navigation with icons */}
          <nav className="flex-1 space-y-1 px-2">
            <Link href="/">
              <a className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md group",
                isActive("/") 
                  ? "text-white bg-primary" 
                  : "text-white hover:bg-sidebar-accent"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className={cn("mr-3 h-5 w-5", isActive("/") ? "text-white" : "text-gray-300")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                Dashboard
              </a>
            </Link>
            
            <Link href="/appointments">
              <a className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md group",
                isActive("/appointments") 
                  ? "text-white bg-primary" 
                  : "text-white hover:bg-sidebar-accent"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className={cn("mr-3 h-5 w-5", isActive("/appointments") ? "text-white" : "text-gray-300")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Appointments
              </a>
            </Link>
            
            <Link href="/patients">
              <a className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md group",
                isActive("/patients") 
                  ? "text-white bg-primary" 
                  : "text-white hover:bg-sidebar-accent"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className={cn("mr-3 h-5 w-5", isActive("/patients") ? "text-white" : "text-gray-300")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Patients
              </a>
            </Link>
            
            <Link href="/payments">
              <a className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md group",
                isActive("/payments") 
                  ? "text-white bg-primary" 
                  : "text-white hover:bg-sidebar-accent"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className={cn("mr-3 h-5 w-5", isActive("/payments") ? "text-white" : "text-gray-300")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Payments
              </a>
            </Link>
            
            <Link href="/settings">
              <a className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md group",
                isActive("/settings") 
                  ? "text-white bg-primary" 
                  : "text-white hover:bg-sidebar-accent"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className={cn("mr-3 h-5 w-5", isActive("/settings") ? "text-white" : "text-gray-300")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </a>
            </Link>
          </nav>
          
          <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                  CC
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Chris C.</p>
                <p className="text-xs font-medium text-gray-400">View Profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
