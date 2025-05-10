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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col md:pl-72">
        <Header 
          title={title} 
          subtitle={subtitle}
          onNewAppointment={onNewAppointment}
          showExportBtn={showExportBtn}
          onExport={onExport}
          className={headerClassName}
        />

        <main className="flex-1 p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}