// ── KPIs ──────────────────────────────────────────────────────────────
// Each KPI answers: "How is this metric doing compared to last month?"
export const kpiData = [
  {
    label: "Page Views",
    value: "1.24M",
    previousValue: "1.08M",
    change: 15.3,
    context: "Highest month since launch",
    icon: "eye",
  },
  {
    label: "Unique Visitors",
    value: "342K",
    previousValue: "314K",
    change: 8.7,
    context: "Organic search up 22%",
    icon: "users",
  },
  {
    label: "Bounce Rate",
    value: "38.2%",
    previousValue: "41.3%",
    change: -3.1,
    context: "New landing pages performing well",
    icon: "bounce",
  },
  {
    label: "Avg. Session Duration",
    value: "4m 32s",
    previousValue: "4m 02s",
    change: 12.4,
    context: "Docs revamp driving engagement",
    icon: "clock",
  },
] as const;

// ── Daily Traffic (Line) ─────────────────────────────────────────────
// Answers: "What's the daily traffic trend? Any spikes or dips?"
export const dailyTraffic = [
  { day: "Mar 1", visitors: 10200, pageViews: 28500 },
  { day: "Mar 2", visitors: 9800, pageViews: 26400 },
  { day: "Mar 3", visitors: 8400, pageViews: 21800 },
  { day: "Mar 4", visitors: 11500, pageViews: 31200 },
  { day: "Mar 5", visitors: 12800, pageViews: 35600 },
  { day: "Mar 6", visitors: 13200, pageViews: 37100 },
  { day: "Mar 7", visitors: 12100, pageViews: 33800 },
  { day: "Mar 8", visitors: 11400, pageViews: 30900 },
  { day: "Mar 9", visitors: 9600, pageViews: 25200 },
  { day: "Mar 10", visitors: 10800, pageViews: 29400 },
  { day: "Mar 11", visitors: 13500, pageViews: 38200 },
  { day: "Mar 12", visitors: 14200, pageViews: 40500 },
  { day: "Mar 13", visitors: 13800, pageViews: 39100 },
  { day: "Mar 14", visitors: 12900, pageViews: 36200 },
  { day: "Mar 15", visitors: 11100, pageViews: 30100 },
  { day: "Mar 16", visitors: 9200, pageViews: 24600 },
  { day: "Mar 17", visitors: 11800, pageViews: 32400 },
  { day: "Mar 18", visitors: 14800, pageViews: 42300 },
  { day: "Mar 19", visitors: 15200, pageViews: 43800 },
  { day: "Mar 20", visitors: 14600, pageViews: 41200 },
  { day: "Mar 21", visitors: 13100, pageViews: 36800 },
  { day: "Mar 22", visitors: 11800, pageViews: 32100 },
  { day: "Mar 23", visitors: 9900, pageViews: 26800 },
  { day: "Mar 24", visitors: 12400, pageViews: 34500 },
  { day: "Mar 25", visitors: 15600, pageViews: 44800 },
  { day: "Mar 26", visitors: 16100, pageViews: 46200 },
  { day: "Mar 27", visitors: 15400, pageViews: 43900 },
  { day: "Mar 28", visitors: 14200, pageViews: 39800 },
  { day: "Mar 29", visitors: 12600, pageViews: 34900 },
  { day: "Mar 30", visitors: 10400, pageViews: 28200 },
] as const;

// ── Traffic Sources (Pie) ────────────────────────────────────────────
// Answers: "Where are visitors coming from?"
export const trafficSources = [
  { source: "Organic Search", visitors: 142800 },
  { source: "Direct", visitors: 89200 },
  { source: "Social Media", visitors: 52400 },
  { source: "Referral", visitors: 38600 },
  { source: "Email", visitors: 19000 },
] as const;

// ── Heatmap: Traffic by Day × Hour ──────────────────────────────────
// Answers: "When are users most active?"
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const hours = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm", "10pm"] as const;

// Realistic traffic pattern: weekday peaks at 10am-2pm, lower weekends
const heatmapValues: Record<string, Record<string, number>> = {
  Mon: { "6am": 120, "8am": 580, "10am": 1240, "12pm": 1380, "2pm": 1290, "4pm": 980, "6pm": 640, "8pm": 420, "10pm": 180 },
  Tue: { "6am": 140, "8am": 620, "10am": 1350, "12pm": 1520, "2pm": 1410, "4pm": 1050, "6pm": 690, "8pm": 460, "10pm": 200 },
  Wed: { "6am": 135, "8am": 610, "10am": 1380, "12pm": 1560, "2pm": 1440, "4pm": 1080, "6pm": 710, "8pm": 470, "10pm": 190 },
  Thu: { "6am": 130, "8am": 590, "10am": 1310, "12pm": 1480, "2pm": 1360, "4pm": 1020, "6pm": 670, "8pm": 440, "10pm": 185 },
  Fri: { "6am": 110, "8am": 520, "10am": 1180, "12pm": 1300, "2pm": 1150, "4pm": 860, "6pm": 540, "8pm": 380, "10pm": 210 },
  Sat: { "6am": 60, "8am": 180, "10am": 420, "12pm": 520, "2pm": 480, "4pm": 390, "6pm": 340, "8pm": 460, "10pm": 280 },
  Sun: { "6am": 50, "8am": 150, "10am": 380, "12pm": 460, "2pm": 440, "4pm": 360, "6pm": 310, "8pm": 490, "10pm": 260 },
};

export const trafficHeatmap = days.flatMap((day) =>
  hours.map((hour) => ({
    day,
    hour,
    visitors: heatmapValues[day]![hour]!,
  }))
);

// ── Content by Device (Stacked Bar) ─────────────────────────────────
// Answers: "What content do users engage with, and on which devices?"
export const contentByDevice = [
  { category: "Blog", desktop: 45200, mobile: 38400, tablet: 8600 },
  { category: "Docs", desktop: 62100, mobile: 21800, tablet: 12400 },
  { category: "Product", desktop: 38900, mobile: 42600, tablet: 6800 },
  { category: "Landing", desktop: 28400, mobile: 35200, tablet: 5100 },
  { category: "Pricing", desktop: 18600, mobile: 22100, tablet: 3800 },
] as const;

// ── Conversion Funnel ────────────────────────────────────────────────
// Answers: "Where do we lose users in the conversion journey?"
export const conversionFunnel = [
  { stage: "Visitors", count: 342000 },
  { stage: "Sign Up", count: 48200 },
  { stage: "Onboarding", count: 31400 },
  { stage: "Active User", count: 18600 },
  { stage: "Paid Subscriber", count: 6200 },
] as const;
