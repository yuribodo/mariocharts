"use client";

import { BarChart } from "../../src/components/charts/bar-chart";
import { KPICard } from "../../src/components/ui/kpi-card";
import { TrendingUp, Users, CircleDollarSign, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

const sampleData = [
  { name: 'Jan', receita: 4200, usuarios: 2400, vendas: 340 },
  { name: 'Fev', receita: 3800, usuarios: 1900, vendas: 298 },
  { name: 'Mar', receita: 5200, usuarios: 3100, vendas: 420 },
  { name: 'Abr', receita: 4800, usuarios: 2800, vendas: 380 },
  { name: 'Mai', receita: 6100, usuarios: 3500, vendas: 450 },
  { name: 'Jun', receita: 7200, usuarios: 4100, vendas: 520 },
] as const;

const quickStats = [
  { 
    title: "Receita Total", 
    value: "R$ 178.4K", 
    change: { value: 18.5, type: "increase" as const, period: "vs mês anterior" },
    icon: CircleDollarSign,
    iconColor: "text-chart-2",
    iconBg: "bg-chart-2/10"
  },
  { 
    title: "Usuários Ativos", 
    value: "47.2K", 
    change: { value: 12.3, type: "increase" as const, period: "vs semana anterior" },
    icon: Users,
    iconColor: "text-chart-1",
    iconBg: "bg-chart-1/10"
  },
  { 
    title: "Taxa Conversão", 
    value: "4.8%", 
    change: { value: 0.8, type: "decrease" as const, period: "vs ontem" },
    icon: Activity,
    iconColor: "text-chart-5",
    iconBg: "bg-chart-5/10"
  },
];

export function DashboardDemo() {
  return (
    <div className="h-full w-full bg-background p-4 md:p-8 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Dashboard Analytics</h1>
          <p className="text-muted-foreground">Visão geral em tempo real dos seus dados</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-chart-2/10 text-chart-2 px-3 py-1.5 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse"></div>
          Ao vivo
        </div>
      </div>
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={stat.title} className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.change.type === 'increase' ? 'text-chart-2' : 'text-chart-4'}`}>
                {stat.change.type === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stat.change.value}%
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-card-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change.period}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card rounded-lg border p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">Performance Mensal</h3>
              <p className="text-sm text-muted-foreground">Receita e usuários por mês</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-chart-1 rounded-sm"></div>
                <span className="text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-chart-5 rounded-sm"></div>
                <span className="text-muted-foreground">Usuários</span>
              </div>
            </div>
          </div>
          <BarChart
            data={sampleData}
            xAxis={{ dataKey: 'name' }}
            className="h-48 md:h-56"
          />
        </div>
        
        {/* Side Stats */}
        <div className="space-y-4">
          {/* Top Countries */}
          <div className="bg-card rounded-lg border p-4 md:p-6">
            <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-1" />
              Top Regiões
            </h4>
            <div className="space-y-3">
              {[
                { country: "Brasil", value: "45.2K", percentage: 68 },
                { country: "Argentina", value: "12.1K", percentage: 18 },
                { country: "México", value: "8.4K", percentage: 14 },
              ].map((item) => (
                <div key={item.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">{item.country}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-card-foreground">{item.value}</p>
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-chart-1 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-card rounded-lg border p-4 md:p-6">
            <h4 className="font-semibold text-card-foreground mb-4">Atividade Recente</h4>
            <div className="space-y-3">
              {[
                { action: "Nova venda", time: "2 min", amount: "+R$ 1.2K" },
                { action: "Usuário cadastrado", time: "5 min", amount: "+1 usuário" },
                { action: "Relatório gerado", time: "12 min", amount: "PDF" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time} atrás</p>
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">{item.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}