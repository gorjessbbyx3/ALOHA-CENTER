
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data for demo purposes
const monthlyRevenue = [
  { name: "Jan", total: 5300 },
  { name: "Feb", total: 4800 },
  { name: "Mar", total: 6100 },
  { name: "Apr", total: 5400 },
  { name: "May", total: 7200 },
  { name: "Jun", total: 7800 },
  { name: "Jul", total: 8400 },
  { name: "Aug", total: 6800 },
  { name: "Sep", total: 7900 },
  { name: "Oct", total: 8700 },
  { name: "Nov", total: 7500 },
  { name: "Dec", total: 9200 },
];

const appointmentStats = [
  { name: "Jan", scheduled: 45, completed: 42, canceled: 3 },
  { name: "Feb", scheduled: 50, completed: 45, canceled: 5 },
  { name: "Mar", scheduled: 55, completed: 51, canceled: 4 },
  { name: "Apr", scheduled: 62, completed: 58, canceled: 4 },
  { name: "May", scheduled: 68, completed: 63, canceled: 5 },
  { name: "Jun", scheduled: 74, completed: 70, canceled: 4 },
  { name: "Jul", scheduled: 80, completed: 76, canceled: 4 },
  { name: "Aug", scheduled: 76, completed: 72, canceled: 4 },
  { name: "Sep", scheduled: 82, completed: 77, canceled: 5 },
  { name: "Oct", scheduled: 85, completed: 81, canceled: 4 },
  { name: "Nov", scheduled: 78, completed: 74, canceled: 4 },
  { name: "Dec", scheduled: 73, completed: 69, canceled: 4 },
];

const servicePopularity = [
  { name: "Light Therapy", value: 35 },
  { name: "Massage", value: 25 },
  { name: "Reiki", value: 18 },
  { name: "Acupuncture", value: 12 },
  { name: "Meditation", value: 10 },
];

const dailyRevenue = [
  { name: "Mon", total: 1200 },
  { name: "Tue", total: 1400 },
  { name: "Wed", total: 1800 },
  { name: "Thu", total: 1600 },
  { name: "Fri", total: 2100 },
  { name: "Sat", total: 1900 },
  { name: "Sun", total: 800 },
];

interface EnhancedReportsProps {
  reportData?: {
    revenue?: typeof monthlyRevenue;
    appointments?: typeof appointmentStats;
    services?: typeof servicePopularity;
  };
}

export function EnhancedReports({ reportData }: EnhancedReportsProps) {
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [selectedView, setSelectedView] = React.useState("monthly");
  const [selectedTab, setSelectedTab] = React.useState("overview");

  // Use provided data or fallback to demo data
  const revenueData = reportData?.revenue || monthlyRevenue;
  const appointmentData = reportData?.appointments || appointmentStats;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Enhanced Analytics</CardTitle>
              <CardDescription>
                Detailed financial and operational insights
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal sm:w-[240px]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span>to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal sm:w-[240px]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>End date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Select defaultValue={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          formatter={(value: number) => [`$${value}`, 'Revenue']}
                        />
                        <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Appointments</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={appointmentData}>
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="scheduled"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="#82ca9d"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Revenue:</span>
                        <span className="font-medium">
                          ${revenueData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Revenue/Month:</span>
                        <span className="font-medium">
                          ${Math.round(
                            revenueData.reduce((sum, item) => sum + item.total, 0) / revenueData.length
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Appointments:</span>
                        <span className="font-medium">
                          {appointmentData.reduce((sum, item) => sum + item.scheduled, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completion Rate:</span>
                        <span className="font-medium">
                          {Math.round(
                            (appointmentData.reduce((sum, item) => sum + item.completed, 0) /
                              appointmentData.reduce((sum, item) => sum + item.scheduled, 0)) *
                              100
                          )}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dailyRevenue}>
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          formatter={(value: number) => [`$${value}`, 'Revenue']}
                        />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {servicePopularity.map((service) => (
                        <div key={service.name} className="flex items-center">
                          <div className="w-[60%]">
                            <div className="text-sm font-medium">{service.name}</div>
                          </div>
                          <div className="w-[40%] flex items-center gap-2">
                            <div className="h-2 w-full rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${service.value}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {service.value}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueData}>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`$${value}`, 'Revenue']}
                      />
                      <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Revenue:</span>
                        <span className="font-medium">
                          ${revenueData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Monthly:</span>
                        <span className="font-medium">
                          ${Math.round(
                            revenueData.reduce((sum, item) => sum + item.total, 0) / revenueData.length
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Highest Month:</span>
                        <span className="font-medium">
                          {revenueData.reduce((max, item) => (item.total > max.total ? item : max), revenueData[0]).name}
                          : ${revenueData.reduce((max, item) => (item.total > max.total ? item : max), revenueData[0]).total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Growth Rate (YoY):</span>
                        <span className="font-medium text-green-600">+14.6%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Service Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Light Therapy:</span>
                        <span className="font-medium">$24,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Massage:</span>
                        <span className="font-medium">$18,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reiki:</span>
                        <span className="font-medium">$12,800</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Acupuncture:</span>
                        <span className="font-medium">$9,600</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Other Services:</span>
                        <span className="font-medium">$7,800</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={appointmentData}>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="scheduled"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Scheduled"
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Completed"
                      />
                      <Line
                        type="monotone"
                        dataKey="canceled"
                        stroke="#ff6b6b"
                        strokeWidth={2}
                        name="Canceled"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Appointments:</span>
                        <span className="font-medium">
                          {appointmentData.reduce((sum, item) => sum + item.scheduled, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium">
                          {appointmentData.reduce((sum, item) => sum + item.completed, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Canceled:</span>
                        <span className="font-medium">
                          {appointmentData.reduce((sum, item) => sum + item.canceled, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completion Rate:</span>
                        <span className="font-medium">
                          {Math.round(
                            (appointmentData.reduce((sum, item) => sum + item.completed, 0) /
                              appointmentData.reduce((sum, item) => sum + item.scheduled, 0)) *
                              100
                          )}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cancellation Rate:</span>
                        <span className="font-medium">
                          {Math.round(
                            (appointmentData.reduce((sum, item) => sum + item.canceled, 0) /
                              appointmentData.reduce((sum, item) => sum + item.scheduled, 0)) *
                              100
                          )}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Most Popular Day:</span>
                        <span className="font-medium">Friday</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Most Popular Time:</span>
                        <span className="font-medium">2:00 PM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Appointments/Day:</span>
                        <span className="font-medium">8.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Appointments/Week:</span>
                        <span className="font-medium">42</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Most Common Service:</span>
                        <span className="font-medium">Light Therapy</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
