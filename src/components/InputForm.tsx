import React from 'react';
import { CalculatorInputs } from '@/lib/calculator';

interface InputFormProps {
  inputs: CalculatorInputs;
  setInputs: (inputs: CalculatorInputs) => void;
  useLiveSpotPrice: boolean;
  setUseLiveSpotPrice: (val: boolean) => void;
  liveSpotPrice: number | null;
}

export default function InputForm({ inputs, setInputs, useLiveSpotPrice, setUseLiveSpotPrice, liveSpotPrice }: InputFormProps) {
  const handleChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs({ ...inputs, [field]: value });
  };

  const handleDistributionChange = (field: 'homeChargingPercent' | 'publicChargingPercent' | 'workChargingPercent', value: number) => {
    let newVal = Math.max(0, Math.min(100, value));
    
    // Auto balance the other two
    const otherFields = (['homeChargingPercent', 'publicChargingPercent', 'workChargingPercent'] as const).filter(f => f !== field);
    const sumOthers = inputs[otherFields[0]] + inputs[otherFields[1]];
    
    let newInputs = { ...inputs, [field]: newVal };
    
    if (newVal + sumOthers !== 100) {
        const remaining = 100 - newVal;
        if (sumOthers === 0) {
            newInputs[otherFields[0]] = remaining;
            newInputs[otherFields[1]] = 0;
        } else {
            newInputs[otherFields[0]] = Math.round((inputs[otherFields[0]] / sumOthers) * remaining);
            newInputs[otherFields[1]] = 100 - newVal - newInputs[otherFields[0]];
        }
    }
    
    // Automatically adjust Clever One default price based on whether they have home charging
    if (field === 'homeChargingPercent') {
      if (newVal === 0 && inputs.cleverSubscriptionCost === 849) {
        newInputs.cleverSubscriptionCost = 999; // Clever One Uden ladeboks
      } else if (newVal > 0 && inputs.cleverSubscriptionCost === 999) {
        newInputs.cleverSubscriptionCost = 849; // Clever One Med ladeboks
      }
    }
    
    setInputs(newInputs);
  };

  return (
    <div className="space-y-6 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight mb-2">Dine Kørevaner</h2>
        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-2xl border border-blue-100 text-xs font-medium leading-relaxed">
          <span>🚗</span>
          <span>Forudindstillet til <strong>BMW iX1 (eDrive20)</strong>:<br/>64,7 kWh batteri & 16,8 kWh/100 km forbrug (WLTP).</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
            <span>Årligt kørselsbehov</span>
            <span className="font-bold text-slate-900">{inputs.annualDistanceKm.toLocaleString('da-DK')} km</span>
          </label>
          <input 
            type="range" min="5000" max="50000" step="1000"
            value={inputs.annualDistanceKm}
            onChange={(e) => handleChange('annualDistanceKm', parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
            <span>Bilens forbrug (kWh/100 km)</span>
            <span className="font-bold text-slate-900">{inputs.efficiencyKwhPer100Km}</span>
          </label>
          <input 
            type="range" min="10" max="35" step="0.5"
            value={inputs.efficiencyKwhPer100Km}
            onChange={(e) => handleChange('efficiencyKwhPer100Km', parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
            <span>Batterikapacitet (kWh)</span>
            <span className="font-bold text-slate-900">{inputs.batteryCapacityKwh}</span>
          </label>
          <input 
            type="range" min="30" max="120" step="1"
            value={inputs.batteryCapacityKwh}
            onChange={(e) => handleChange('batteryCapacityKwh', parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      <div className="h-px bg-slate-200 my-6" />

      <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Opladningsfordeling</h2>
      <div className="space-y-4">
         <div>
          <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
            <span>Hjemmeopladning (%)</span>
            <span className="font-bold text-slate-900">{inputs.homeChargingPercent}%</span>
          </label>
          <input 
            type="range" min="0" max="100" step="1"
            value={inputs.homeChargingPercent}
            onChange={(e) => handleDistributionChange('homeChargingPercent', parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
         <div>
          <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
            <span>Offentlig lynladning (%)</span>
            <span className="font-bold text-slate-900">{inputs.publicChargingPercent}%</span>
          </label>
          <input 
            type="range" min="0" max="100" step="1"
            value={inputs.publicChargingPercent}
            onChange={(e) => handleDistributionChange('publicChargingPercent', parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
         <div>
          <label className="flex justify-between text-sm font-medium text-slate-600 mb-1">
            <span>På arbejde (Gratis) (%)</span>
            <span className="font-bold text-slate-900">{inputs.workChargingPercent}%</span>
          </label>
          <input 
            type="range" min="0" max="100" step="1"
            value={inputs.workChargingPercent}
            onChange={(e) => handleDistributionChange('workChargingPercent', parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <div className="h-px bg-slate-200 my-6" />

      <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Manuelle Indstillinger</h2>
      
      <div className="space-y-4">
         <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">Brug live spotpris (DK2)</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={useLiveSpotPrice} onChange={(e) => setUseLiveSpotPrice(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>

        {!useLiveSpotPrice && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Gns. Spotpris Hjemme (DKK/kWh)</label>
              <input type="number" step="0.01" value={inputs.homeSpotPrice} onChange={(e) => handleChange('homeSpotPrice', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
            </div>
        )}
        {useLiveSpotPrice && (
            <div className="text-sm text-slate-500 italic p-2">
                Henter live pris... {liveSpotPrice ? `${liveSpotPrice.toFixed(2)} DKK/kWh` : ''}
            </div>
        )}

        <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tariffer & Afgifter (kr/kWh)</label>
              <input type="number" step="0.01" value={inputs.homeTariffs} onChange={(e) => handleChange('homeTariffs', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Offentlig standardpris (kr/kWh)</label>
              <input type="number" step="0.1" value={inputs.publicChargingPrice} onChange={(e) => handleChange('publicChargingPrice', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" />
            </div>
        </div>

        <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Clever One (Sept 2026 priser)</h4>
            <span className="text-[9px] text-slate-500 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              {inputs.homeChargingPercent === 0 ? 'Uden ladeboks' : 'Med ladeboks'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Abonn. (kr/md)</label>
                <input type="number" value={inputs.cleverSubscriptionCost} onChange={(e) => handleChange('cleverSubscriptionCost', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1.5 border text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Refusion (kr/kWh)</label>
                <input type="number" step="0.01" value={inputs.cleverRefundRate} onChange={(e) => handleChange('cleverRefundRate', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1.5 border text-sm" />
              </div>
          </div>
        </div>

        <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-3">
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Serviceaftale (Spirii/OK/Looad)</h4>
          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Abonn. (kr/md)</label>
                <input type="number" value={inputs.serviceSubscriptionCost} onChange={(e) => handleChange('serviceSubscriptionCost', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1.5 border text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Afgiftsrefusion (kr/kWh)</label>
                <input type="number" step="0.01" value={inputs.taxRefundRate} onChange={(e) => handleChange('taxRefundRate', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1.5 border text-sm" />
              </div>
          </div>
        </div>

        <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 space-y-3">
          <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider">E.ON Drive Plus</h4>
          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Abonn. (kr/md)</label>
                <input type="number" value={inputs.competitorSubscriptionCost} onChange={(e) => handleChange('competitorSubscriptionCost', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1.5 border text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Offentlig DC (kr/kWh)</label>
                <input type="number" step="0.01" value={inputs.competitorPublicPrice} onChange={(e) => handleChange('competitorPublicPrice', parseFloat(e.target.value))} className="w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1.5 border text-sm" />
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
