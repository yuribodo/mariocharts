import { BarChart } from "@/components/charts/bar-chart";

// Sample data for different examples
const revenueData = [
  { month: "Jan", revenue: 1000, target: 1200 },
  { month: "Feb", revenue: 1500, target: 1300 },
  { month: "Mar", revenue: 1200, target: 1400 },
  { month: "Apr", revenue: 1800, target: 1600 },
  { month: "May", revenue: 2000, target: 1800 },
  { month: "Jun", revenue: 1700, target: 1900 },
] as const;

const categoryData = [
  { category: "Desktop", users: 8500 },
  { category: "Mobile", users: 12000 },
  { category: "Tablet", users: 3500 },
  { category: "Other", users: 1200 },
] as const;

const performanceData = [
  { metric: "Page Load", score: 85 },
  { metric: "First Paint", score: 92 },
  { metric: "Largest Paint", score: 78 },
  { metric: "First Input", score: 94 },
  { metric: "Layout Shift", score: 88 },
] as const;

export function BarChartDemo() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Bar Chart Examples</h2>
        
        {/* Basic Vertical Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          <div className="border rounded-lg p-6">
            <BarChart
              data={revenueData}
              x="month"
              y="revenue"
              height={300}
              onBarClick={(data, index) => {
                alert(`${data.month}: $${data.revenue.toLocaleString()}`);
              }}
            />
          </div>
        </div>

        {/* Horizontal Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">User Distribution by Device</h3>
          <div className="border rounded-lg p-6">
            <BarChart
              data={categoryData}
              x="category"
              y="users"
              orientation="horizontal"
              height={250}
              colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}
            />
          </div>
        </div>

        {/* Outline Variant */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Performance Scores (Outline)</h3>
          <div className="border rounded-lg p-6">
            <BarChart
              data={performanceData}
              x="metric"
              y="score"
              variant="outline"
              height={280}
              colors={["#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ec4899"]}
            />
          </div>
        </div>

        {/* Loading State */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Loading State</h3>
          <div className="border rounded-lg p-6">
            <BarChart
              data={[]}
              x="name"
              y="value"
              loading={true}
              height={300}
            />
          </div>
        </div>

        {/* Error State */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Error State</h3>
          <div className="border rounded-lg p-6">
            <BarChart
              data={[]}
              x="name"
              y="value"
              error="Failed to load chart data. Please try again."
              height={300}
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Empty State</h3>
          <div className="border rounded-lg p-6">
            <BarChart
              data={[]}
              x="name"
              y="value"
              height={300}
            />
          </div>
        </div>

        {/* Small Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Compact Chart</h3>
            <div className="border rounded-lg p-4">
              <BarChart
                data={categoryData.slice(0, 4)}
                x="category"
                y="users"
                height={200}
                colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">No Animation</h3>
            <div className="border rounded-lg p-4">
              <BarChart
                data={performanceData.slice(0, 3)}
                x="metric"
                y="score"
                height={200}
                animation={false}
                variant="outline"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}