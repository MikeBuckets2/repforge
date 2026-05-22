import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export function VolumeAreaChart({ data }) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="volume" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce2da" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={44} />
          <Tooltip />
          <Area type="monotone" dataKey="volume" stroke="#2a9d8f" strokeWidth={3} fill="url(#volume)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SessionBarChart({ data }) {
  return (
    <div className="chart-frame compact">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce2da" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <Tooltip />
          <Bar dataKey="sessions" fill="#e76f51" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
