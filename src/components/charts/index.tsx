"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#f97316", "#0a0a0a", "#737373", "#fb923c", "#404040", "#a3a3a3"];

interface ChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

export function StatusPieChart({ data, title }: ChartProps) {
  if (!data.length) return null;
  return (
    <div>
      {title && <h4 className="text-sm font-medium text-brand-gray-700 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ServiceBarChart({ data, title }: ChartProps) {
  if (!data.length) return null;
  return (
    <div>
      {title && <h4 className="text-sm font-medium text-brand-gray-700 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProgressLineChart({ data, title }: { data: { name: string; progress: number }[]; title?: string }) {
  if (!data.length) return null;
  return (
    <div>
      {title && <h4 className="text-sm font-medium text-brand-gray-700 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="progress" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
