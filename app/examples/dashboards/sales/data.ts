import type { TreeMapNode } from "@/src/components/charts/treemap-chart";
import type { RadarAxis, RadarSeries } from "@/src/components/charts/radar-chart";

// ── KPIs ──────────────────────────────────────────────────────────────
// Each KPI answers: "How is this metric doing compared to last month?"
export const kpiData = [
  {
    label: "Receita Total",
    value: "R$ 1.284.500",
    previousValue: "R$ 1.142.200",
    change: 12.5,
    context: "Melhor mês do trimestre",
    icon: "currency",
  },
  {
    label: "Vendas Fechadas",
    value: "3.842",
    previousValue: "3.550",
    change: 8.2,
    context: "292 vendas a mais que fev",
    icon: "cart",
  },
  {
    label: "Ticket Médio",
    value: "R$ 334,20",
    previousValue: "R$ 342,40",
    change: -2.4,
    context: "Queda pelo 2o mês seguido",
    icon: "ticket",
  },
  {
    label: "Taxa de Conversão",
    value: "4.8%",
    previousValue: "4.5%",
    change: 0.6,
    context: "Acima da média de 4.2%",
    icon: "percent",
  },
] as const;

// ── Revenue vs Target (Line) ─────────────────────────────────────────
// Answers: "Are we consistently hitting targets? What's the trend?"
export const monthlyRevenue = [
  { month: "Jan", receita: 85000, meta: 90000 },
  { month: "Fev", receita: 92000, meta: 90000 },
  { month: "Mar", receita: 78000, meta: 95000 },
  { month: "Abr", receita: 105000, meta: 95000 },
  { month: "Mai", receita: 112000, meta: 100000 },
  { month: "Jun", receita: 98000, meta: 100000 },
  { month: "Jul", receita: 115000, meta: 105000 },
  { month: "Ago", receita: 108000, meta: 105000 },
  { month: "Set", receita: 125000, meta: 110000 },
  { month: "Out", receita: 118000, meta: 110000 },
  { month: "Nov", receita: 132000, meta: 115000 },
  { month: "Dez", receita: 116500, meta: 115000 },
] as const;

// ── Product Revenue (Bar) ────────────────────────────────────────────
// Answers: "Which products drive the most revenue? How concentrated is it?"
export const productSales = [
  { product: "Software Pro", receita: 482000, vendas: 965 },
  { product: "Cloud Suite", receita: 385000, vendas: 720 },
  { product: "Analytics+", receita: 321000, vendas: 890 },
  { product: "Security Kit", receita: 287000, vendas: 410 },
  { product: "DevOps Tool", receita: 214000, vendas: 580 },
  { product: "API Gateway", receita: 186000, vendas: 277 },
] as const;

// ── Customer Segments (Pie) ──────────────────────────────────────────
// Answers: "How dependent are we on a single customer segment?"
export const categoryDistribution = [
  { category: "Enterprise", receita: 540000 },
  { category: "PME", receita: 360000 },
  { category: "Startup", receita: 193000 },
  { category: "Governo", receita: 128500 },
  { category: "Educação", receita: 63000 },
] as const;

// ── Sales Funnel ─────────────────────────────────────────────────────
// Answers: "Where are we losing the most people in the sales process?"
export const salesFunnel = [
  { etapa: "Visitantes", quantidade: 12500 },
  { etapa: "Leads", quantidade: 5200 },
  { etapa: "Propostas", quantidade: 1800 },
  { etapa: "Clientes", quantidade: 600 },
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
  { key: "deals", label: "Negócios Fechados" },
  { key: "revenue", label: "Receita Gerada" },
  { key: "retention", label: "Retenção" },
  { key: "satisfaction", label: "Satisfação" },
  { key: "speed", label: "Ciclo de Venda" },
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
      { name: "Licenças", value: 185000 },
      { name: "Consultoria", value: 120000 },
      { name: "Suporte", value: 75000 },
    ],
  },
  {
    name: "PME",
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
    name: "Governo",
    children: [
      { name: "Contratos", value: 130000 },
      { name: "Projetos", value: 55000 },
    ],
  },
];
