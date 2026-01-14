
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface FareChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-xl border border-slate-200 rounded-lg backdrop-blur-sm bg-white/95">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-sm flex justify-between gap-4">
            <span className="text-slate-500">PAYG:</span>
            <span className="font-bold text-blue-600">£{payload[0].value.toFixed(2)}</span>
          </p>
          <p className="text-sm flex justify-between gap-4">
            <span className="text-slate-500">Pass:</span>
            <span className="font-bold text-indigo-600">£{payload[1].value.toFixed(2)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const FareChart: React.FC<FareChartProps> = ({ data }) => {
  // Determine tick interval for X axis to prevent crowding
  const interval = data.length > 40 ? Math.floor(data.length / 10) : data.length > 20 ? 4 : 2;

  return (
    <div className="w-full h-[450px] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 leading-tight">Cost Trajectory Comparison</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Cumulative Data</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">PAYG</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            <span className="text-slate-600">Monthly Pass</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{fontSize: 11, fill: '#94a3b8'}} 
            tickMargin={15}
            axisLine={false}
            interval={interval}
          />
          <YAxis 
            tick={{fontSize: 11, fill: '#94a3b8'}} 
            axisLine={false}
            tickFormatter={(value) => `£${value}`}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            name="PAYG Total"
            type="monotone" 
            dataKey="cumulativePayg" 
            stroke="#3b82f6" 
            strokeWidth={4}
            dot={data.length < 45 ? { r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' } : false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1000}
          />
          <Line 
            name="Subscription"
            type="stepAfter" 
            dataKey="subscriptionCost" 
            stroke="#6366f1" 
            strokeWidth={3}
            strokeDasharray="6 6"
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FareChart;
