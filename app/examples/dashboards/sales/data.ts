import type { TreeMapNode } from "@/src/components/charts/treemap-chart";
import type { RadarAxis, RadarSeries } from "@/src/components/charts/radar-chart";

// ── KPIs ──────────────────────────────────────────────────────────────
// Each KPI answers: "How is this metric doing compared to last month?"
export const kpiData = [
  {
    label: "Total Revenue",
    value: "$1,284,500",
    previousValue: "$1,142,200",
    change: 12.5,
    context: "Best month of the quarter",
    icon: "currency",
  },
  {
    label: "Closed Sales",
    value: "3,842",
    previousValue: "3,550",
    change: 8.2,
    context: "292 more sales than Feb",
    icon: "cart",
  },
  {
    label: "Average Ticket",
    value: "$334.20",
    previousValue: "$342.40",
    change: -2.4,
    context: "Declining for 2nd straight month",
    icon: "ticket",
  },
  {
    label: "Conversion Rate",
    value: "4.8%",
    previousValue: "4.5%",
    change: 0.6,
    context: "Above the 4.2% average",
    icon: "percent",
  },
] as const;

// ── Revenue vs Target (Line) ─────────────────────────────────────────
// Answers: "Are we consistently hitting targets? What's the trend?"
export const monthlyRevenue = [
  { month: "Jan", revenue: 85000, target: 90000 },
  { month: "Feb", revenue: 92000, target: 90000 },
  { month: "Mar", revenue: 78000, target: 95000 },
  { month: "Apr", revenue: 105000, target: 95000 },
  { month: "May", revenue: 112000, target: 100000 },
  { month: "Jun", revenue: 98000, target: 100000 },
  { month: "Jul", revenue: 115000, target: 105000 },
  { month: "Aug", revenue: 108000, target: 105000 },
  { month: "Sep", revenue: 125000, target: 110000 },
  { month: "Oct", revenue: 118000, target: 110000 },
  { month: "Nov", revenue: 132000, target: 115000 },
  { month: "Dec", revenue: 116500, target: 115000 },
] as const;

// ── Product Revenue (Bar) ────────────────────────────────────────────
// Answers: "Which products drive the most revenue? How concentrated is it?"
export const productSales = [
  { product: "Software Pro", revenue: 482000, sales: 965 },
  { product: "Cloud Suite", revenue: 385000, sales: 720 },
  { product: "Analytics+", revenue: 321000, sales: 890 },
  { product: "Security Kit", revenue: 287000, sales: 410 },
  { product: "DevOps Tool", revenue: 214000, sales: 580 },
  { product: "API Gateway", revenue: 186000, sales: 277 },
] as const;

// ── Customer Segments (Pie) ──────────────────────────────────────────
// Answers: "How dependent are we on a single customer segment?"
export const categoryDistribution = [
  { category: "Enterprise", revenue: 540000 },
  { category: "SMB", revenue: 360000 },
  { category: "Startup", revenue: 193000 },
  { category: "Government", revenue: 128500 },
  { category: "Education", revenue: 63000 },
] as const;

// ── Sales Funnel ─────────────────────────────────────────────────────
// Answers: "Where are we losing the most people in the sales process?"
export const salesFunnel = [
  { stage: "Visitors", count: 12500 },
  { stage: "Leads", count: 5200 },
  { stage: "Proposals", count: 1800 },
  { stage: "Customers", count: 600 },
] as const;

// ── Revenue Target (Gauge) ───────────────────────────────────────────
// Answers: "Are we on track to hit the annual revenue goal?"
export const revenueTarget = {
  value: 78,
  min: 0,
  max: 100,
  zones: [
    { from: 0, to: 40, color: "#ef4444" },
    { from: 40, to: 70, color: "#f59e0b" },
    { from: 70, to: 100, color: "#10b981" },
  ],
} as const;

// ── Seller Performance (Radar) ───────────────────────────────────────
// Answers: "What are each seller's strengths and weaknesses?"
type SellerData = Record<string, number>;

export const sellerPerformanceAxes: RadarAxis[] = [
  { key: "deals", label: "Closed Deals" },
  { key: "revenue", label: "Revenue Generated" },
  { key: "retention", label: "Retention" },
  { key: "satisfaction", label: "Satisfaction" },
  { key: "speed", label: "Sales Cycle" },
];

export const sellerPerformanceSeries: RadarSeries<SellerData>[] = [
  {
    id: "ana",
    name: "Ana Silva",
    data: { deals: 85, revenue: 92, retention: 78, satisfaction: 95, speed: 70 },
  },
  {
    id: "carlos",
    name: "Carlos Lima",
    data: { deals: 72, revenue: 68, retention: 90, satisfaction: 82, speed: 88 },
  },
  {
    id: "maria",
    name: "Maria Santos",
    data: { deals: 90, revenue: 75, retention: 85, satisfaction: 88, speed: 76 },
  },
];

// ── Revenue Breakdown (TreeMap) ──────────────────────────────────────
// Answers: "Where does the money come from, in detail?"
export const revenueBySegment: TreeMapNode[] = [
  {
    name: "Enterprise",
    children: [
      { name: "Licenses", value: 185000 },
      { name: "Consulting", value: 120000 },
      { name: "Support", value: 75000 },
    ],
  },
  {
    name: "SMB",
    children: [
      { name: "SaaS", value: 210000 },
      { name: "Add-ons", value: 85000 },
    ],
  },
  {
    name: "Startup",
    children: [
      { name: "Freemium", value: 45000 },
      { name: "Pro Plan", value: 95000 },
    ],
  },
  {
    name: "Government",
    children: [
      { name: "Contracts", value: 130000 },
      { name: "Projects", value: 55000 },
    ],
  },
];
