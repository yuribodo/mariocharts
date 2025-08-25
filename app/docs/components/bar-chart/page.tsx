"use client";

import { Breadcrumbs } from "../../../../components/site/breadcrumbs";

export default function BarChartPage() {
  return (
    <div className="max-w-none space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs />
      
      {/* Hero Section */}
      <div>
        <div className="flex flex-col space-y-2 pb-8 pt-6">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Bar Chart
          </h1>
          <p className="text-xl text-muted-foreground leading-7">
            Responsive and customizable bar chart component for displaying categorical data.
          </p>
        </div>
      </div>

      {/* Content Coming Soon */}
      <div>
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Coming Soon
          </h3>
          <p className="text-muted-foreground">
            The Bar Chart component is currently in development. Documentation, usage examples, and API reference will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}