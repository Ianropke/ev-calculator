export interface CalculatorInputs {
  annualDistanceKm: number;
  efficiencyKwhPer100Km: number;
  batteryCapacityKwh: number;
  
  homeChargingPercent: number;
  publicChargingPercent: number;
  workChargingPercent: number;
  
  // Clever One (Model A)
  cleverSubscriptionCost: number;
  cleverEnergySupplement: number;
  cleverRefundRate: number;
  
  // Pay as you go (Model B)
  homeSpotPrice: number;
  homeTariffs: number;
  publicChargingPrice: number;

  // Serviceaftale (Model C)
  serviceSubscriptionCost: number;
  taxRefundRate: number;

  // E.ON Drive Plus (Model D)
  competitorSubscriptionCost: number;
  competitorPublicPrice: number; // discounted public rate for E.ON Plus
}

export const DEFAULT_INPUTS: CalculatorInputs = {
  annualDistanceKm: 20000,
  efficiencyKwhPer100Km: 16.8, // BMW iX1 WLTP
  batteryCapacityKwh: 64.7, // BMW iX1
  homeChargingPercent: 0, // Default no home charging
  publicChargingPercent: 90,
  workChargingPercent: 10,
  cleverSubscriptionCost: 999, // Clever One Uden Ladeboks (Sept 2026 pris)
  cleverEnergySupplement: 0,
  cleverRefundRate: 1.10, // DKK/kWh (not used if home charging is 0)
  homeSpotPrice: 0.85, // DKK/kWh
  homeTariffs: 0.90, // DKK/kWh
  publicChargingPrice: 4.50, // DKK/kWh standard price
  
  // Serviceaftale defaults (f.eks. Spirii/OK/Looad)
  serviceSubscriptionCost: 79, // DKK/md
  taxRefundRate: 0.95, // DKK/kWh

  // E.ON Drive Plus defaults (99 kr/md + 3.45 kr/kWh for DC lynladning)
  competitorSubscriptionCost: 99, 
  competitorPublicPrice: 3.45,
};

export interface CalculationResult {
  totalMonthlyKwh: number;
  modelACost: number; // Clever One
  modelBCost: number; // Pay-as-you-go
  modelCCost: number; // Serviceaftale
  modelDCost: number; // E.ON Drive Plus
}

export function calculateCosts(inputs: CalculatorInputs): CalculationResult {
  const {
    annualDistanceKm,
    efficiencyKwhPer100Km,
    homeChargingPercent,
    publicChargingPercent,
    workChargingPercent,
    cleverSubscriptionCost,
    cleverEnergySupplement,
    cleverRefundRate,
    homeSpotPrice,
    homeTariffs,
    publicChargingPrice,
    serviceSubscriptionCost,
    taxRefundRate,
    competitorSubscriptionCost,
    competitorPublicPrice
  } = inputs;

  const totalAnnualKwh = (annualDistanceKm / 100) * efficiencyKwhPer100Km;
  const totalMonthlyKwh = totalAnnualKwh / 12;

  const homeKwh = totalMonthlyKwh * (homeChargingPercent / 100);
  const publicKwh = totalMonthlyKwh * (publicChargingPercent / 100);

  // Model A: Clever One (Flatrate)
  const modelAHomeElectricityCost = homeKwh * (homeSpotPrice + homeTariffs);
  const modelACleverRefund = homeKwh * cleverRefundRate;
  const modelACost = cleverSubscriptionCost + cleverEnergySupplement + (modelAHomeElectricityCost - modelACleverRefund);

  // Model B: Pay As You Go (No subscription)
  const modelBHomeCost = homeKwh * (homeSpotPrice + homeTariffs);
  const modelBPublicCost = publicKwh * publicChargingPrice;
  const modelBCost = modelBHomeCost + modelBPublicCost;

  // Model C: Serviceaftale (Skatte-refusion)
  const modelCHomeCost = homeKwh * (homeSpotPrice + homeTariffs - taxRefundRate);
  const modelCPublicCost = publicKwh * publicChargingPrice;
  const modelCCost = serviceSubscriptionCost + modelCHomeCost + modelCPublicCost;

  // Model D: E.ON Drive Plus (Discounted public rates)
  const modelDHomeCost = homeKwh * (homeSpotPrice + homeTariffs);
  const modelDPublicCost = publicKwh * competitorPublicPrice;
  const modelDCost = competitorSubscriptionCost + modelDHomeCost + modelDPublicCost;

  return {
    totalMonthlyKwh,
    modelACost,
    modelBCost,
    modelCCost,
    modelDCost
  };
}

export interface BreakevenDataPoint {
  kmPerMonth: number;
  modelACost: number;
  modelBCost: number;
  modelCCost: number;
  modelDCost: number;
}

export function generateBreakevenData(inputs: CalculatorInputs): BreakevenDataPoint[] {
  const data: BreakevenDataPoint[] = [];
  
  for (let annualKm = 0; annualKm <= 50000; annualKm += 3000) {
    const testInputs = { ...inputs, annualDistanceKm: annualKm };
    const result = calculateCosts(testInputs);
    data.push({
      kmPerMonth: Math.round(annualKm / 12),
      modelACost: Math.round(result.modelACost),
      modelBCost: Math.round(result.modelBCost),
      modelCCost: Math.round(result.modelCCost),
      modelDCost: Math.round(result.modelDCost)
    });
  }
  
  return data;
}

export function findCheapestModel(result: CalculationResult): { name: string; cost: number; id: string } {
  const models = [
    { id: 'clever', name: 'Clever One', cost: result.modelACost },
    { id: 'paygo', name: 'Pay-As-You-Go / Spotpris', cost: result.modelBCost },
    { id: 'service', name: 'Serviceaftale (Spirii/OK/Looad)', cost: result.modelCCost },
    { id: 'competitor', name: 'E.ON Drive Plus', cost: result.modelDCost }
  ];
  
  models.sort((a, b) => a.cost - b.cost);
  return models[0];
}

export function findBreakevenPointBetween(
  inputs: CalculatorInputs,
  modelKey1: keyof Omit<CalculationResult, 'totalMonthlyKwh'>,
  modelKey2: keyof Omit<CalculationResult, 'totalMonthlyKwh'>
): number | null {
  const startCost1 = calculateCosts({ ...inputs, annualDistanceKm: 0 })[modelKey1];
  const startCost2 = calculateCosts({ ...inputs, annualDistanceKm: 0 })[modelKey2];
  let is1CheaperAtStart = startCost1 < startCost2;
  
  for (let annualKm = 0; annualKm <= 100000; annualKm += 100) {
    const result = calculateCosts({ ...inputs, annualDistanceKm: annualKm });
    const is1CheaperNow = result[modelKey1] < result[modelKey2];
    
    if (is1CheaperNow !== is1CheaperAtStart) {
      return annualKm;
    }
  }
  return null;
}
