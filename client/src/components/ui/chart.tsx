import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  TooltipProps,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartProps {
  className?: string;
  data: Record<string, any>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  yAxisWidth?: number;
  stack?: boolean;
  layout?: "vertical" | "horizontal";
}

export function LineChart({
  className,
  data,
  index,
  categories,
  colors = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#6366f1"],
  valueFormatter = (value: number) => value.toString(),
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  yAxisWidth = 50,
}: ChartProps) {
  const formatTooltip = (value: number) => {
    return valueFormatter(value);
  };

  return (
    <div className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          {showXAxis && <XAxis dataKey={index} />}
          {showYAxis && <YAxis width={yAxisWidth} />}
          <Tooltip formatter={formatTooltip} />
          {showLegend && <Legend />}
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i % colors.length]}
              activeDot={{ r: 8 }}
              connectNulls
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({
  className,
  data,
  index,
  categories,
  colors = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#6366f1"],
  valueFormatter = (value: number) => value.toString(),
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  yAxisWidth = 50,
  stack = false,
  layout = "horizontal",
}: ChartProps) {
  const formatTooltip = (value: number) => {
    return valueFormatter(value);
  };

  return (
    <div className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          {showXAxis && <XAxis dataKey={index} hide={!showXAxis} />}
          {showYAxis && <YAxis width={yAxisWidth} hide={!showYAxis} />}
          <Tooltip formatter={formatTooltip} />
          {showLegend && <Legend />}
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[i % colors.length]}
              stackId={stack ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps extends Omit<ChartProps, 'categories'> {
  category: string;
}

export function PieChart({
  className,
  data,
  index,
  category,
  colors = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#6366f1"],
  valueFormatter = (value: number) => value.toString(),
  showLegend = false,
}: PieChartProps) {
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataEntry = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{dataEntry[index]}</p>
          <p>{`${valueFormatter(dataEntry[category])}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={category}
            nameKey={index}
          >
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}