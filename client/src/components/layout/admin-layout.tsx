import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { HelpButton } from "@/components/help/help-button";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onNewAppointment?: () => void;
  showExportBtn?: boolean;
  onExport?: () => void;
}

export function AdminLayout({ 
  children,
  title,
  subtitle,
  onNewAppointment,
  showExportBtn = true,
  onExport
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar className={mobileMenuOpen ? "block" : ""} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header 
          title={title}
          subtitle={subtitle}
          onNewAppointment={onNewAppointment}
          showExportBtn={showExportBtn}
          onExport={onExport}
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6"
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
