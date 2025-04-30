import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Calendar, Users, CreditCard, Settings, Menu, BarChart4, ShoppingBag, LayoutDashboard } from "lucide-react";

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
      <div className="flex flex-col w-72">
        <div className="flex flex-col h-full bg-gradient-to-b from-blue-900 to-blue-950 shadow-lg">
          {/* Brand Header */}
          <div className="px-6 py-8">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <div className="ml-3">
                <h2 className="text-white text-xl font-bold">Aloha Healing</h2>
                <p className="text-blue-200 text-xs font-medium">Admin Dashboard</p>
              </div>
            </div>
          </div>
          
          {/* Main Navigation */}
          <div className="px-4 py-4">
            <div className="flex items-center py-2 px-4 mb-6 bg-white/10 backdrop-blur-sm rounded-lg">
              <Menu className="h-5 w-5 text-blue-200 mr-3" />
              <span className="text-blue-100 font-medium">Main Menu</span>
            </div>
            
            <nav className="space-y-1">
              <Link href="/">
                <div className={cn(
                  "group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200",
                  isActive("/") 
                    ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white font-medium shadow-md" 
                    : "text-blue-100 hover:bg-white/10 font-medium"
                )}>
                  <LayoutDashboard className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive("/") ? "text-white" : "text-blue-300 group-hover:text-blue-100"
                  )} />
                  <span>Dashboard</span>
                </div>
              </Link>
              
              <Link href="/appointments">
                <div className={cn(
                  "group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200",
                  isActive("/appointments") 
                    ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white font-medium shadow-md" 
                    : "text-blue-100 hover:bg-white/10 font-medium"
                )}>
                  <Calendar className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive("/appointments") ? "text-white" : "text-blue-300 group-hover:text-blue-100"
                  )} />
                  <span>Appointments</span>
                </div>
              </Link>
              
              <Link href="/patients">
                <div className={cn(
                  "group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200",
                  isActive("/patients") 
                    ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white font-medium shadow-md" 
                    : "text-blue-100 hover:bg-white/10 font-medium"
                )}>
                  <Users className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive("/patients") ? "text-white" : "text-blue-300 group-hover:text-blue-100"
                  )} />
                  <span>Patients</span>
                </div>
              </Link>
              
              <Link href="/payments">
                <div className={cn(
                  "group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200",
                  isActive("/payments") 
                    ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white font-medium shadow-md" 
                    : "text-blue-100 hover:bg-white/10 font-medium"
                )}>
                  <CreditCard className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive("/payments") ? "text-white" : "text-blue-300 group-hover:text-blue-100"
                  )} />
                  <span>Payments</span>
                </div>
              </Link>
            </nav>
          </div>
          
          {/* Secondary Navigation */}
          <div className="px-4 py-4 mt-2">
            <div className="flex items-center py-2 px-4 mb-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <BarChart4 className="h-5 w-5 text-blue-200 mr-3" />
              <span className="text-blue-100 font-medium">Management</span>
            </div>
            
            <nav className="space-y-1">
              <Link href="/services">
                <div className={cn(
                  "group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200",
                  isActive("/services") 
                    ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white font-medium shadow-md" 
                    : "text-blue-100 hover:bg-white/10 font-medium"
                )}>
                  <ShoppingBag className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive("/services") ? "text-white" : "text-blue-300 group-hover:text-blue-100"
                  )} />
                  <span>Products</span>
                </div>
              </Link>
              
              <Link href="/reports">
                <div className={cn(
                  "group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200",
                  isActive("/reports") 
                    ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white font-medium shadow-md" 
                    : "text-blue-100 hover:bg-white/10 font-medium"
                )}>
                  <BarChart4 className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive("/reports") ? "text-white" : "text-blue-300 group-hover:text-blue-100"
                  )} />
                  <span>Reports</span>
                </div>
              </Link>
              
              <Link href="/settings">
                <div className={cn(
                  "group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200",
                  isActive("/settings") 
                    ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white font-medium shadow-md" 
                    : "text-blue-100 hover:bg-white/10 font-medium"
                )}>
                  <Settings className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive("/settings") ? "text-white" : "text-blue-300 group-hover:text-blue-100"
                  )} />
                  <span>Settings</span>
                </div>
              </Link>
            </nav>
          </div>
          
          {/* User Profile Section */}
          <div className="mt-auto">
            <div className="px-4 py-4 border-t border-blue-800/50">
              <div className="flex items-center bg-blue-800/30 p-3 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                    CC
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Chris Cooper</p>
                  <p className="text-xs font-medium text-blue-300">Administrator</p>
                </div>
                <button className="ml-auto bg-blue-600/50 p-1.5 rounded-md hover:bg-blue-600 transition-colors">
                  <Settings className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}