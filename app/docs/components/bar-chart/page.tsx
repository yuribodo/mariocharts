"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { BarChart } from "@/components";

// Sample data
const sampleData = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 }
];

export default function BarChartPage() {
  const [selectedBar, setSelectedBar] = useState<any>(null);

  return (
    <div className="max-w-none space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs />
      
      {/* Hero Section */}
      <div className="flex flex-col space-y-2 pb-8 pt-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Bar Chart
        </h1>
        <p className="text-xl text-muted-foreground leading-7">
          Responsive and customizable bar chart component for displaying categorical data.
        </p>
      </div>

      {/* Basic Example */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Basic Usage</h2>
          <div className="rounded-lg border p-6 bg-card">
            <BarChart
              data={sampleData}
              xAxis={{ dataKey: 'month' }}
              yAxis={{ dataKey: 'revenue', label: 'Revenue ($)' }}
              onBarClick={(data: any, index: any) => {
                setSelectedBar(data);
                console.log('Clicked:', data, index);
              }}
              onBarHover={(data: any, index: any) => {
                console.log('Hovered:', data, index);
              }}
            />
            {selectedBar && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm">
                  Selected: <strong>{selectedBar.month}</strong> - ${selectedBar.revenue.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Loading & Error States */}
        <div>
          <h3 className="text-lg font-semibold mb-4">States</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-6 bg-card">
              <h4 className="font-medium mb-2">Loading State</h4>
              <BarChart
                data={sampleData}
                xAxis={{ dataKey: 'month' }}
                yAxis={{ dataKey: 'revenue' }}
                loading={true}
              />
            </div>
            <div className="rounded-lg border p-6 bg-card">
              <h4 className="font-medium mb-2">Error State</h4>
              <BarChart
                data={sampleData}
                xAxis={{ dataKey: 'month' }}
                yAxis={{ dataKey: 'revenue' }}
                error="Failed to load chart data"
              />
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Code Example</h3>
          <div className="rounded-lg bg-gray-900 p-4 overflow-x-auto">
            <pre className="text-gray-100 text-sm">
              <code>{`import { BarChart } from '@/components/charts/bar-chart';

const data = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Feb', revenue: 5200 },
  { month: 'Mar', revenue: 4800 }
];

function Dashboard() {
  return (
    <BarChart
      data={data}
      xAxis={{ dataKey: 'month' }}
      yAxis={{ dataKey: 'revenue', label: 'Revenue ($)' }}
      onBarClick={(data, index) => {
        console.log('Clicked:', data, index);
      }}
    />
  );
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}