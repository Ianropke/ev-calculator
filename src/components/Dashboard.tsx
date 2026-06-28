"use client";

import React, { useState, useEffect } from 'react';
import { CalculatorInputs, DEFAULT_INPUTS, calculateCosts, generateBreakevenData, findBreakevenPointBetween } from '@/lib/calculator';
import { fetchCurrentAverageSpotPrice } from '@/lib/api';
import InputForm from './InputForm';
import ResultsDisplay from './ResultsDisplay';
import CostComparisonChart from './CostComparisonChart';
import BreakevenChart from './BreakevenChart';
import LocalChargingInfo from './LocalChargingInfo';
import { BatteryCharging } from 'lucide-react';

export default function Dashboard() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [useLiveSpotPrice, setUseLiveSpotPrice] = useState(true);
  const [liveSpotPrice, setLiveSpotPrice] = useState<number | null>(null);

  useEffect(() => {
    async function loadSpotPrice() {
      const price = await fetchCurrentAverageSpotPrice();
      setLiveSpotPrice(price);
      if (useLiveSpotPrice) {
        setInputs(prev => ({ ...prev, homeSpotPrice: price }));
      }
    }
    loadSpotPrice();
  }, []);

  useEffect(() => {
    if (useLiveSpotPrice && liveSpotPrice !== null) {
      setInputs(prev => ({ ...prev, homeSpotPrice: liveSpotPrice }));
    }
  }, [useLiveSpotPrice, liveSpotPrice]);

  const result = calculateCosts(inputs);
  const breakevenData = generateBreakevenData(inputs);
  
  // Calculate breakeven points
  const breakevenCleverVsPaygo = findBreakevenPointBetween(inputs, 'modelACost', 'modelBCost');
  const breakevenCleverVsService = findBreakevenPointBetween(inputs, 'modelACost', 'modelCCost');

  return (
    <div className="min-h-screen bg-slate-100 font-sans selection:bg-blue-200">
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-100/50 to-transparent -z-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <header className="mb-10 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/30">
               <BatteryCharging size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Ladeberegneren</h1>
          </div>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0">
            Find den billigste ladeløsning. Fuld sammenligning af Clever One, Serviceaftale, E.ON Drive Plus og Pay-As-You-Go.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <InputForm 
              inputs={inputs} 
              setInputs={setInputs} 
              useLiveSpotPrice={useLiveSpotPrice}
              setUseLiveSpotPrice={setUseLiveSpotPrice}
              liveSpotPrice={liveSpotPrice}
            />
          </div>
          
          <div className="lg:col-span-8 space-y-8">
            <ResultsDisplay result={result} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CostComparisonChart result={result} />
              
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 flex flex-col justify-center">
                 <h3 className="text-lg font-semibold text-slate-800 mb-2">Breakeven-punkter</h3>
                 <p className="text-slate-500 text-xs mb-4">Årligt kørselsbehov (km) før Clever One bliver billigere end:</p>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                      <span className="text-slate-600 text-xs">Pay-As-You-Go / Spotpris</span>
                      <span className="font-bold text-slate-900 text-xs">{breakevenCleverVsPaygo ? `${breakevenCleverVsPaygo.toLocaleString('da-DK')} km` : 'Aldrig'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                      <span className="text-slate-600 text-xs">Serviceaftale (Spirii/OK/Looad)</span>
                      <span className="font-bold text-slate-900 text-xs">{breakevenCleverVsService ? `${breakevenCleverVsService.toLocaleString('da-DK')} km` : 'Aldrig'}</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <BreakevenChart data={breakevenData} />
              </div>
              <div className="lg:col-span-5">
                <LocalChargingInfo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
