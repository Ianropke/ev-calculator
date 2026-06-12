import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { BreakevenDataPoint } from '@/lib/calculator';

interface BreakevenChartProps {
  data: BreakevenDataPoint[];
}

export default function BreakevenChart({ data }: BreakevenChartProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Breakeven Analyse</h3>
      <p className="text-sm text-slate-500 mb-6">Omkostninger baseret på kørte kilometer pr. måned</p>
      
      <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="kmPerMonth" 
                axisLine={false} 
                tickLine={false} 
                className="text-xs font-medium text-slate-600"
                tickFormatter={(val) => `${val} km`}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                className="text-xs font-medium text-slate-600"
                tickFormatter={(val) => `${val} kr`}
              />
              <Tooltip 
                 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 formatter={(value: any, name: any) => {
                    const labelMap: Record<string, string> = {
                      modelACost: 'Clever One',
                      modelBCost: 'Pay-As-You-Go / Spotpris',
                      modelCCost: 'Serviceaftale (Spirii/OK/Looad)',
                      modelDCost: 'E.ON Drive / OK Unlimited'
                    };
                    return [`${value} kr.`, labelMap[name] || name];
                 }}
                 labelFormatter={(label) => `${label} km/md`}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="modelACost" 
                name="Clever One" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
              />
              <Line 
                type="monotone" 
                dataKey="modelBCost" 
                name="Pay-As-You-Go / Spotpris" 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} 
              />
              <Line 
                type="monotone" 
                dataKey="modelCCost" 
                name="Serviceaftale (Spirii/OK/Looad)" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} 
              />
              <Line 
                type="monotone" 
                dataKey="modelDCost" 
                name="E.ON Drive / OK Unlimited" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
