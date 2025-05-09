
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, LineChart, BarChart, PieChart, Users, DollarSign, BadgePercent } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function EnhancedReports() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  // Revenue data query
  const { 
    data: revenueData = [], 
    isLoading: isRevenueLoading 
  } = useQuery({
    queryKey: [
      "/api/reports/revenue", 
      dateRange.from.toISOString(), 
      dateRange.to.toISOString(), 
      groupBy
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/revenue?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}&groupBy=${groupBy}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch revenue data");
      }
      return response.json();
    },
  });

  // Services data query
  const { 
    data: servicesData = [], 
    isLoading: isServicesLoading 
  } = useQuery({
    queryKey: [
      "/api/reports/services", 
      dateRange.from.toISOString(), 
      dateRange.to.toISOString()
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/services?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch services data");
      }
      return response.json();
    },
    enabled: activeTab === "services",
  });

  // Retention data query
  const { 
    data: retentionData, 
    isLoading: isRetentionLoading 
  } = useQuery({
    queryKey: ["/api/reports/retention", 6],
    queryFn: async () => {
      const response = await fetch(`/api/reports/retention?months=6`);
      if (!response.ok) {
        throw new Error("Failed to fetch retention data");
      }
      return response.json();
    },
    enabled: activeTab === "retention",
  });

  // Staff productivity query
  const { 
    data: staffData = [], 
    isLoading: isStaffLoading 
  } = useQuery({
    queryKey: [
      "/api/reports/staff", 
      dateRange.from.toISOString(), 
      dateRange.to.toISOString()
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/staff?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch staff data");
      }
      return response.json();
    },
    enabled: activeTab === "staff",
  });

  // Quick date range setters
  const setLast7Days = () => {
    setDateRange({
      from: subDays(new Date(), 7),
      to: new Date(),
    });
  };

  const setLast30Days = () => {
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date(),
    });
  };

  const setThisMonth = () => {
    const now = new Date();
    setDateRange({
      from: startOfMonth(now),
      to: endOfMonth(now),
    });
  };

  const setLastMonth = () => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    setDateRange({
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth),
    });
  };

  // Calculate total revenue
  const totalRevenue = revenueData.reduce((sum: number, item: any) => {
    return sum + parseFloat(item.revenue);
  }, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            Enhanced Analytics & Reports
          </div>
          <div className="text-sm font-normal flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={setLast7Days}>
              Last 7 Days
            </Button>
            <Button variant="outline" size="sm" onClick={setLast30Days}>
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" onClick={setThisMonth}>
              This Month
            </Button>
            <Button variant="outline" size="sm" onClick={setLastMonth}>
              Last Month
            </Button>
          </div>
        </CardTitle>

        <div className="flex justify-between items-center pt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{
                  from: dateRange?.from || new Date(),
                  to: dateRange?.to || new Date(),
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({
                      from: range.from,
                      to: range.to,
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {activeTab === "revenue" && (
            <div className="flex items-center gap-2">
              <Label>Group By:</Label>
              <select
                className="p-2 rounded-md border"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="revenue">
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="services">
              <BarChart className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="retention">
              <BadgePercent className="h-4 w-4 mr-2" />
              Retention
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalRevenue.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Daily Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(totalRevenue / Math.max(revenueData.length, 1)).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Date Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                  </div>
                </CardContent>
              </Card>
            </div>

            {isRevenueLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse">Loading revenue data...</div>
              </div>
            ) : revenueData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available for the selected period
              </div>
            ) : (
              <div className="h-[400px] border rounded-md p-4 relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Here a line chart would display the revenue data over time
                </div>
                <div className="mt-4 space-y-2">
                  {revenueData.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between border-b pb-1">
                      <span>{item.period}</span>
                      <span>${parseFloat(item.revenue).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            {isServicesLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse">Loading services data...</div>
              </div>
            ) : servicesData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No services data available for the selected period
              </div>
            ) : (
              <>
                <div className="h-[300px] border rounded-md p-4 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Here a pie chart would display the service popularity distribution
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/50 font-medium">
                    <div>Service</div>
                    <div>Count</div>
                    <div>Revenue</div>
                    <div>Avg. Revenue</div>
                  </div>
                  <div className="divide-y">
                    {servicesData.map((service: any) => (
                      <div key={service.id} className="grid grid-cols-4 gap-4 p-4">
                        <div>{service.name}</div>
                        <div>{service.count} appointments</div>
                        <div>${parseFloat(service.revenue || 0).toFixed(2)}</div>
                        <div>
                          ${(parseFloat(service.revenue || 0) / parseInt(service.count)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            {isRetentionLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse">Loading retention data...</div>
              </div>
            ) : !retentionData ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No retention data available
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Patients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {retentionData.total_patients}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Returning Patients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {retentionData.returning_patients}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Retention Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {retentionData.retention_rate}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Retention Analysis (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Here a chart would display retention trends over time
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            {isStaffLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse">Loading staff data...</div>
              </div>
            ) : staffData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No staff productivity data available for the selected period
              </div>
            ) : (
              <div className="border rounded-md">
                <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/50 font-medium">
                  <div>Staff Member</div>
                  <div>Appointments</div>
                  <div>Hours</div>
                  <div>Revenue</div>
                  <div>Revenue/Hour</div>
                </div>
                <div className="divide-y">
                  {staffData.map((staff: any) => (
                    <div key={staff.id} className="grid grid-cols-5 gap-4 p-4">
                      <div>{staff.name}</div>
                      <div>{staff.appointment_count || 0}</div>
                      <div>{((parseInt(staff.total_minutes) || 0) / 60).toFixed(1)}</div>
                      <div>${parseFloat(staff.revenue || 0).toFixed(2)}</div>
                      <div>
                        ${(parseFloat(staff.revenue || 0) / Math.max(parseInt(staff.total_minutes) / 60, 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Data range: {format(dateRange.from, "MMM d, yyyy")} to {format(dateRange.to, "MMM d, yyyy")}
        </div>
        <Button variant="outline">
          Export Report
        </Button>
      </CardFooter>
    </Card>
  );
}
