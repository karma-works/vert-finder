import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ElevationPoint } from '../types'

export default function ElevationChart({ data }: { data: ElevationPoint[] }) {
  return <div className="chart"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 298, height: 190 }}><AreaChart data={data} margin={{ top: 8, right: 5, bottom: 0, left: -28 }}>
    <defs><linearGradient id="elevationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8743b" stopOpacity=".55"/><stop offset="1" stopColor="#e8743b" stopOpacity=".03"/></linearGradient></defs>
    <XAxis dataKey="distance" tickFormatter={(v) => `${v}k`} tick={{ fill: '#9a9b91', fontSize: 10 }} axisLine={false} tickLine={false} />
    <YAxis domain={['dataMin - 30', 'dataMax + 30']} tick={{ fill: '#9a9b91', fontSize: 10 }} axisLine={false} tickLine={false} />
    <Tooltip formatter={(value) => [`${value} m`, 'Elevation']} labelFormatter={(value) => `${value} km`} contentStyle={{ background: '#17201c', border: '1px solid #3e4943', color: '#fff' }} />
    <Area type="monotone" dataKey="elevation" stroke="#e8743b" fill="url(#elevationFill)" strokeWidth={2} />
  </AreaChart></ResponsiveContainer></div>
}
