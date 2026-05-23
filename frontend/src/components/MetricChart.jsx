import { useEffect, useState } from 'react';
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
  const [leftMargin, setLeftMargin] = useState(0);
  const [yAxisWidth, setYAxisWidth] = useState(44);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 720;
      setLeftMargin(mobile ? 28 : 0);
      setYAxisWidth(mobile ? 56 : 44);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={260} style={{ overflow: 'visible' }}>
        <AreaChart data={data} margin={{ left: leftMargin, right: 12, top: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="volume" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce2da" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={yAxisWidth} />
          <Tooltip />
          <Area type="monotone" dataKey="volume" stroke="#2a9d8f" strokeWidth={3} fill="url(#volume)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SessionBarChart({ data }) {
  const [leftMarginBar, setLeftMarginBar] = useState(0);
  const [yAxisWidthBar, setYAxisWidthBar] = useState(32);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 720;
      setLeftMarginBar(mobile ? 20 : 0);
      setYAxisWidthBar(mobile ? 42 : 32);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <div className="chart-frame compact">
      <ResponsiveContainer width="100%" height={220} style={{ overflow: 'visible' }}>
        <BarChart data={data} margin={{ left: leftMarginBar, right: 12, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce2da" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={yAxisWidthBar} />
          <Tooltip />
          <Bar dataKey="sessions" fill="#e76f51" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
