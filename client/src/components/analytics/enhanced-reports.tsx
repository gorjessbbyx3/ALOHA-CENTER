import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { BarChartIcon, LineChartIcon, PieChartIcon } from 'lucide-react';

export const EnhancedReports = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Enhanced Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Revenue Report</h3>
            <BarChartIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p>View detailed revenue breakdown by service type, time period, and more.</p>
            <Button variant="outline" className="w-full">View Report</Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Patient Analytics</h3>
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p>Analyze patient demographics, retention rates, and referral sources.</p>
            <Button variant="outline" className="w-full">View Report</Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Growth Trends</h3>
            <LineChartIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p>Track business growth metrics over time with customizable date ranges.</p>
            <Button variant="outline" className="w-full">View Report</Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <Card className="p-4 flex-1">
          <h3 className="text-lg font-medium mb-4">Date Range Selection</h3>
          <div className="flex justify-center">
            <Calendar
              mode="range"
              className="rounded-md border"
            />
          </div>
        </Card>

        <Card className="p-4 flex-1">
          <h3 className="text-lg font-medium mb-4">Report Options</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full">Daily Report</Button>
            <Button variant="outline" className="w-full">Weekly Report</Button>
            <Button variant="outline" className="w-full">Monthly Report</Button>
            <Button variant="outline" className="w-full">Custom Report</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedReports;