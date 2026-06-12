import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { CalculationResult } from '@/lib/calculator';

interface CostComparisonChartProps {
  result: CalculationResult;
}

export default function CostComparisonChart({ result }: CostComparisonChartProps) {
  const data = [
    {
      name: 'Clever One',
      cost: Math.round(result.modelACost),
      fill: '#10b981' // emerald-500
    },
    {
      name: 'Pay-As-You-Go',
      cost: Math.round(result.modelBCost),
      fill: '#2563eb' // blue-600
    },
    {
      name: 'Serviceaftale',
      cost: Math.round(result.modelCCost),
      fill: '#6366f1' // indigo-500
    },
    {
      name: 'E.ON / OK',
      cost: Math.round(result.modelDCost),
      fill: '#f97316' // orange-500
    }
  ].sort((a, b) => a.cost - b.cost); // order by price

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Månedlig Omkostning (DKK)</h3>
      <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-medium text-slate-600" />
              <YAxis axisLine={false} tickLine={false} className="text-xs font-medium text-slate-600" />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList 
                  dataKey="cost" 
                  position="top" 
                  formatter={(val: any) => `${val} kr.`} 
                  className="fill-slate-700 text-[10px] font-bold" 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
