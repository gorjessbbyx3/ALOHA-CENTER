import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BarChart, LineChart, PieChart } from "../ui/chart";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { CalendarIcon, DownloadIcon, FileTextIcon, RefreshCcwIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";

export function EnhancedReports() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Advanced Analytics</CardTitle>
          <CardDescription>Detailed performance metrics and insights</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-[260px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon">
            <RefreshCcwIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 grid-cols-2 mt-4">
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Revenue</SelectItem>
                  <SelectItem value="sessions">Session Revenue</SelectItem>
                  <SelectItem value="products">Product Revenue</SelectItem>
                  <SelectItem value="packages">Package Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <BarChart
              className="h-[300px] mt-4"
              data={[
                { name: 'Jan', total: 4000 },
                { name: 'Feb', total: 4900 },
                { name: 'Mar', total: 6800 },
                { name: 'Apr', total: 8700 },
                { name: 'May', total: 7500 },
                { name: 'Jun', total: 9000 },
              ]}
              index="name"
              categories={['total']}
              colors={['#2563eb']}
              valueFormatter={(value) => `$${value}`}
            />
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue by Service Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    className="h-[200px]"
                    data={[
                      { name: 'Energy Healing', value: 45 },
                      { name: 'Light Therapy', value: 30 },
                      { name: 'Sound Therapy', value: 15 },
                      { name: 'Other', value: 10 },
                    ]}
                    index="name"
                    valueFormatter={(value) => `${value}%`}
                    category="value"
                    colors={['#2563eb', '#4ade80', '#f59e0b', '#64748b']}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    className="h-[200px]"
                    data={[
                      { date: '2023-01', actual: 5000, forecast: 4500 },
                      { date: '2023-02', actual: 5500, forecast: 5000 },
                      { date: '2023-03', actual: 6000, forecast: 5500 },
                      { date: '2023-04', actual: 7000, forecast: 6500 },
                      { date: '2023-05', actual: 7500, forecast: 7000 },
                      { date: '2023-06', actual: null, forecast: 8000 },
                      { date: '2023-07', actual: null, forecast: 8500 },
                    ]}
                    index="date"
                    categories={['actual', 'forecast']}
                    colors={['#2563eb', '#64748b']}
                    valueFormatter={(value) => `$${value}`}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="patients" className="space-y-4">
            <div className="grid gap-4 grid-cols-2 mt-4">
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="new">New Patients</SelectItem>
                  <SelectItem value="returning">Returning Patients</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <LineChart
              className="h-[300px] mt-4"
              data={[
                { month: 'Jan', new: 45, returning: 75 },
                { month: 'Feb', new: 52, returning: 80 },
                { month: 'Mar', new: 48, returning: 92 },
                { month: 'Apr', new: 61, returning: 105 },
                { month: 'May', new: 55, returning: 110 },
                { month: 'Jun', new: 67, returning: 118 },
              ]}
              index="month"
              categories={['new', 'returning']}
              colors={['#2563eb', '#10b981']}
              valueFormatter={(value) => `${value}`}
            />
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Patient Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    className="h-[200px]"
                    data={[
                      { age: '18-24', value: 10 },
                      { age: '25-34', value: 25 },
                      { age: '35-44', value: 30 },
                      { age: '45-54', value: 20 },
                      { age: '55+', value: 15 },
                    ]}
                    index="age"
                    valueFormatter={(value) => `${value}%`}
                    category="value"
                    colors={['#2563eb', '#4ade80', '#f59e0b', '#ec4899', '#8b5cf6']}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Referral Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    className="h-[200px]"
                    data={[
                      { source: 'Social', value: 35 },
                      { source: 'Word of Mouth', value: 25 },
                      { source: 'Website', value: 20 },
                      { source: 'Events', value: 12 },
                      { source: 'Other', value: 8 },
                    ]}
                    index="source"
                    categories={['value']}
                    colors={['#2563eb']}
                    valueFormatter={(value) => `${value}%`}
                    layout="vertical"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="treatments" className="space-y-4">
            <div className="grid gap-4 grid-cols-2 mt-4">
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                Export Report
              </Button>
            </div>
            <BarChart
              className="h-[300px] mt-4"
              data={[
                { month: 'Jan', energy: 28, light: 18, sound: 12 },
                { month: 'Feb', energy: 25, light: 20, sound: 15 },
                { month: 'Mar', energy: 33, light: 22, sound: 18 },
                { month: 'Apr', energy: 35, light: 26, sound: 22 },
                { month: 'May', energy: 30, light: 28, sound: 24 },
                { month: 'Jun', energy: 42, light: 32, sound: 28 },
              ]}
              index="month"
              categories={['energy', 'light', 'sound']}
              colors={['#2563eb', '#f59e0b', '#8b5cf6']}
              stack={true}
              valueFormatter={(value) => `${value}`}
            />
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Popular Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Energy Healing</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Light Therapy</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sound Therapy</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Session Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    className="h-[130px]"
                    data={[
                      { duration: '30 min', value: 15 },
                      { duration: '60 min', value: 55 },
                      { duration: '90 min', value: 30 },
                    ]}
                    index="duration"
                    valueFormatter={(value) => `${value}%`}
                    category="value"
                    colors={['#4ade80', '#2563eb', '#f59e0b']}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Room Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    className="h-[130px]"
                    data={[
                      { room: 'Room 1', usage: 78 },
                      { room: 'Room 2', usage: 65 },
                      { room: 'Room 3', usage: 82 },
                    ]}
                    index="room"
                    categories={['usage']}
                    colors={['#2563eb']}
                    valueFormatter={(value) => `${value}%`}
                    layout="vertical"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="retention" className="space-y-4">
            <div className="grid gap-4 grid-cols-2 mt-4">
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Patient Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="high-value">High Value</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="occasional">Occasional</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="6m">
                <SelectTrigger>
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <LineChart
              className="h-[300px] mt-4"
              data={[
                { month: 'Jan', rate: 82 },
                { month: 'Feb', rate: 78 },
                { month: 'Mar', rate: 80 },
                { month: 'Apr', rate: 85 },
                { month: 'May', rate: 88 },
                { month: 'Jun', rate: 92 },
              ]}
              index="month"
              categories={['rate']}
              colors={['#2563eb']}
              valueFormatter={(value) => `${value}%`}
            />
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-bold text-blue-600">78%</div>
                  <p className="text-xs text-gray-500 mt-1">Patients returning within 30 days</p>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <span className="inline-block mr-1">↑</span> 5% increase from last period
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Days Between Visits</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-bold">18.5</div>
                  <p className="text-xs text-gray-500 mt-1">Days on average between appointments</p>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <span className="inline-block mr-1">↓</span> 2.3 days decrease from last period
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Subscription Renewals</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-bold text-amber-500">92%</div>
                  <p className="text-xs text-gray-500 mt-1">Monthly package renewal rate</p>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <span className="inline-block mr-1">↑</span> 3% increase from last period
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}