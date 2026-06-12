import React from 'react';

export default function LocalChargingInfo() {
  const chargers = [
    {
      name: 'Hvidovre C',
      address: 'Laurits Olsens Vej 1',
      distance: '3.0 km',
      network: 'Clever',
      type: 'Lynlader',
      power: '300 kW',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      networkBadge: 'bg-emerald-600 text-white',
      desc: 'Super hurtig opladning. Perfekt til Clever One (inkluderet gratis).'
    },
    {
      name: 'Friheden Station',
      address: 'Ivar Huitfeldts Vej',
      distance: '1.7 km',
      network: 'Spirii',
      type: 'Standardlader',
      power: '22 kW',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      networkBadge: 'bg-indigo-600 text-white',
      desc: 'AC-opladning. Fordelagtigt med en Serviceaftale (fx Spirii).'
    },
    {
      name: 'Hvidovre Torv 11',
      address: 'Hvidovre Torv 11',
      distance: '3.1 km',
      network: 'E.ON',
      type: 'Hurtiglader',
      power: '50 kW',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      networkBadge: 'bg-orange-600 text-white',
      desc: 'DC-opladning med CCS2-stik.'
    }
  ];

  const scores = [
    { name: 'Clever Netværk', rating: '★★★★★', color: 'text-emerald-500', note: '300 kW lynlader tæt på (Hvidovre C).' },
    { name: 'Spirii Netværk', rating: '★★★☆☆', color: 'text-indigo-500', note: '22 kW lader ved Friheden (1.7 km).' },
    { name: 'E.ON Netværk', rating: '★★★☆☆', color: 'text-orange-500', note: '50 kW hurtiglader ved Hvidovre Torv.' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>📍</span> Lokal dækning ved Frydenhøjparken 247
        </h3>
        <p className="text-xs text-slate-500 mt-1">Hvordan ser opladningsmulighederne ud i hendes nærområde?</p>
      </div>

      {/* Convenience Scorecard */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vurdering af Netværk</h4>
        <div className="space-y-2.5">
          {scores.map(score => (
            <div key={score.name} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <div>
                <span className="font-semibold text-slate-800 block">{score.name}</span>
                <span className="text-[10px] text-slate-500">{score.note}</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${score.color}`}>{score.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charging stations list */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nærmeste Ladestandere</h4>
        {chargers.map(charger => (
          <div key={charger.name} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-xs font-bold text-slate-800">{charger.name}</h5>
                <span className="text-[9px] text-slate-400 block mt-0.5">{charger.address}</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{charger.distance}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className={`px-1.5 py-0.5 rounded font-bold ${charger.networkBadge}`}>{charger.network}</span>
              <span className={`px-1.5 py-0.5 rounded border font-semibold ${charger.badgeColor}`}>{charger.type} ({charger.power})</span>
            </div>
            
            <p className="text-[10px] text-slate-500 italic leading-relaxed">{charger.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
