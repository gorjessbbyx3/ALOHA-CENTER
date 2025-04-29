import { BarChart, PieChart, AreaChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const AnalyticsTile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg col-span-1 md:col-span-2 cursor-pointer flex items-center h-36 hover:opacity-90 transition-opacity">
            <div className="p-4 flex flex-col w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Analytics & Reports</h3>
                <BarChart className="text-white" size={28} />
              </div>
              <p className="text-white/90 mb-2">View business performance metrics</p>
              <div className="mt-auto flex justify-between">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white"
                  size="sm"
                >
                  View Analytics
                </Button>
                <div className="flex space-x-6 text-white">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-white/70">Today</span>
                    <span className="text-lg font-medium">${stats?.todayRevenue || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-white/70">Week</span>
                    <span className="text-lg font-medium">${stats?.weeklyRevenue || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Analytics & Reports</DialogTitle>
            <DialogDescription>
              Review key performance metrics and generate reports
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 h-[calc(80vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">
                  <BarChart className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="revenue">
                  <AreaChart className="h-4 w-4 mr-2" />
                  Revenue
                </TabsTrigger>
                <TabsTrigger value="services">
                  <PieChart className="h-4 w-4 mr-2" />
                  Services
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="h-full flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-muted-foreground text-sm">Today's Revenue</span>
                      <span className="text-3xl font-bold">${stats?.todayRevenue || 0}</span>
                      <span className="text-xs text-muted-foreground mt-1">From {stats?.todayAppointments || 0} appointments</span>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-muted-foreground text-sm">Weekly Revenue</span>
                      <span className="text-3xl font-bold">${stats?.weeklyRevenue || 0}</span>
                      <span className="text-xs text-muted-foreground mt-1">Last 7 days</span>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-muted-foreground text-sm">New Patients</span>
                      <span className="text-3xl font-bold">{stats?.newPatients || 0}</span>
                      <span className="text-xs text-muted-foreground mt-1">Last 7 days</span>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex-1 mt-4 border rounded-md flex items-center justify-center text-center p-8">
                  <div>
                    <BarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground max-w-lg">
                      Visualize your clinic's performance with interactive charts and metrics. 
                      Track revenue, appointments, service popularity, and more.
                    </p>
                    <div className="mt-6">
                      <Button>Generate Monthly Report</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="revenue" className="h-full flex-1 flex flex-col items-center justify-center">
                <div className="text-center">
                  <AreaChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Revenue Analytics</h3>
                  <p className="text-muted-foreground max-w-lg">
                    Track your revenue streams, compare performance over time, and identify 
                    growth opportunities with detailed revenue reports.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="h-full flex-1 flex flex-col items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Services Analytics</h3>
                  <p className="text-muted-foreground max-w-lg">
                    Analyze your most popular services, track usage patterns, and optimize 
                    your service offerings based on customer demand.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};