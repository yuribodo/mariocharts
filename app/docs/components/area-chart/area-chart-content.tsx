"use client";

import { useState } from "react";
import { AreaChart } from "@/src/components/charts/area-chart";

const monthlyData = [
  { month: "Jan", revenue: 4500, costs: 2800, profit: 1700 },
  { month: "Feb", revenue: 5200, costs: 3100, profit: 2100 },
  { month: "Mar", revenue: 4800, costs: 2900, profit: 1900 },
  { month: "Apr", revenue: 6100, costs: 3400, profit: 2700 },
  { month: "May", revenue: 5900, costs: 3200, profit: 2700 },
  { month: "Jun", revenue: 7200, costs: 3800, profit: 3400 },
] as const;

const simpleData = [
  { date: "Mon", value: 30 },
  { date: "Tue", value: 45 },
  { date: "Wed", value: 38 },
  { date: "Thu", value: 52 },
  { date: "Fri", value: 48 },
  { date: "Sat", value: 61 },
  { date: "Sun", value: 55 },
] as const;

export function AreaChartContent() {
  const [clickInfo, setClickInfo] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Area Chart QA</h1>
        <p className="text-muted-foreground">Visual QA page for the AreaChart component.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Basic (single series, default gradient)</h2>
        <div className="border rounded-lg p-4 bg-card">
          <AreaChart data={simpleData} x="date" y="value" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Multiple series</h2>
        <div className="border rounded-lg p-4 bg-card">
          <AreaChart data={monthlyData} x="month" y={["revenue", "costs", "profit"]} showLegend />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. Stacked areas</h2>
        <div className="border rounded-lg p-4 bg-card">
          <AreaChart data={monthlyData} x="month" y={["revenue", "costs"]} stacked showLegend />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Solid fill (gradient=false)</h2>
        <div className="border rounded-lg p-4 bg-card">
          <AreaChart data={simpleData} x="date" y="value" gradient={false} areaOpacity={0.4} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Dots + Grid + Legend</h2>
        <div className="border rounded-lg p-4 bg-card">
          <AreaChart data={monthlyData} x="month" y={["revenue", "costs"]} showDots showGrid showLegend />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">6. Curve types</h2>
        <div className="grid grid-cols-2 gap-4">
          {(["linear", "monotone", "natural", "step"] as const).map((curveType) => (
            <div key={curveType} className="border rounded-lg p-4 bg-card">
              <p className="text-sm text-muted-foreground mb-2 font-mono">{curveType}</p>
              <AreaChart data={simpleData} x="date" y="value" curve={curveType} height={200} animation={false} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">7. Click interaction</h2>
        <div className="border rounded-lg p-4 bg-card">
          <AreaChart
            data={simpleData}
            x="date"
            y="value"
            showDots
            onPointClick={(data, index, series) => {
              setClickInfo(`Clicked: ${String(data.date)} = ${data.value} (index ${index}, series: ${series})`);
            }}
          />
          {clickInfo && <p className="mt-2 text-sm text-muted-foreground">{clickInfo}</p>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">8. States</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-card">
            <p className="text-sm text-muted-foreground mb-2">Loading</p>
            <AreaChart data={simpleData} x="date" y="value" loading />
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <p className="text-sm text-muted-foreground mb-2">Error</p>
            <AreaChart data={simpleData} x="date" y="value" error="Failed to load data" />
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <p className="text-sm text-muted-foreground mb-2">Empty</p>
            <AreaChart data={[]} x="date" y="value" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">9. Area opacity comparison</h2>
        <div className="grid grid-cols-3 gap-4">
          {[0.1, 0.3, 0.7].map((opacity) => (
            <div key={opacity} className="border rounded-lg p-4 bg-card">
              <p className="text-sm text-muted-foreground mb-2">opacity={opacity}</p>
              <AreaChart data={simpleData} x="date" y="value" areaOpacity={opacity} height={200} animation={false} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">10. Custom height (500px) + custom colors</h2>
        <div className="border rounded-lg p-4 bg-card">
          <AreaChart
            data={monthlyData}
            x="month"
            y={["revenue", "costs"]}
            height={500}
            colors={["#e11d48", "#7c3aed"]}
            showGrid
            gridStyle="dotted"
            showLegend
          />
        </div>
      </section>
    </div>
  );
}
