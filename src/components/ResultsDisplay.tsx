import React from 'react';
import { CalculationResult, findCheapestModel } from '@/lib/calculator';

interface ResultsDisplayProps {
  result: CalculationResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const cheapest = findCheapestModel(result);
  
  const modelsList = [
    { name: 'Clever One', cost: result.modelACost },
    { name: 'Pay-As-You-Go / Spotpris', cost: result.modelBCost },
    { name: 'Serviceaftale (Spirii/OK/Looad)', cost: result.modelCCost },
    { name: 'E.ON Drive / OK Unlimited', cost: result.modelDCost }
  ].sort((a, b) => a.cost - b.cost);

  return (
    <div className="space-y-6">
      {/* Dynamic Recommendation Banner */}
      <div className="p-6 md:p-8 rounded-3xl shadow-xl transition-all duration-500 bg-emerald-500 text-white shadow-emerald-500/20 border border-emerald-400">
        <h3 className="text-sm font-medium opacity-85 uppercase tracking-wider mb-2">Den Billigste Løsning</h3>
        <div className="text-3xl md:text-4xl font-extrabold leading-tight">
          {cheapest.name} er billigst!
        </div>
        <p className="mt-2 text-sm opacity-90">
          Med dine indstillinger koster denne løsning ca. <strong className="underline decoration-2">{Math.round(cheapest.cost).toLocaleString('da-DK')} kr.</strong> pr. måned.
        </p>
      </div>

      {/* Complete Overview Card */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Det Komplette Overblik (Månedlige Priser)</h3>
        
        <div className="space-y-3">
          {modelsList.map((model, idx) => {
            const isCheapest = model.name === cheapest.name;
            return (
              <div 
                key={model.name} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isCheapest 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-bold scale-[1.02] shadow-sm' 
                    : 'bg-slate-50/50 border-slate-100 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isCheapest ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {idx + 1}
                  </span>
                  <span>{model.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg">{Math.round(model.cost).toLocaleString('da-DK')} kr.</span>
                  <span className="block text-[10px] opacity-75 font-normal">/ md</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
