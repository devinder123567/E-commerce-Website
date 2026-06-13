'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

export function AnalyticsChart({ data }: { data: { date: string; sales: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-muted bg-muted/10 rounded-2xl text-xs text-muted-foreground">
        No sales data available. Complete test orders to populate the chart.
      </div>
    )
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: 'rgba(15,15,20,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
          <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
