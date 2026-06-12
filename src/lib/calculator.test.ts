import { describe, it, expect } from 'vitest';
import { calculateCosts, generateBreakevenData, findBreakevenPointBetween, findCheapestModel, CalculatorInputs } from './calculator';

describe('EV Charging Cost Calculator Test Suite (10+ Use Cases)', () => {
  const baselineInputs: CalculatorInputs = {
    annualDistanceKm: 20000,
    efficiencyKwhPer100Km: 18,
    batteryCapacityKwh: 75,
    homeChargingPercent: 80,
    publicChargingPercent: 15,
    workChargingPercent: 5,
    cleverSubscriptionCost: 849, // Med ladeboks (Sept 2026 priser)
    cleverEnergySupplement: 0,
    cleverRefundRate: 1.10,
    homeSpotPrice: 0.85,
    homeTariffs: 0.90,
    publicChargingPrice: 4.50,
    serviceSubscriptionCost: 79,
    taxRefundRate: 0.95,
    competitorSubscriptionCost: 99,
    competitorPublicPrice: 3.45,
  };

  // USE CASE 1: Beregning af månedligt kWh-forbrug
  it('Use Case 1: Skal beregne det korrekte månedlige kWh-forbrug', () => {
    const result = calculateCosts(baselineInputs);
    // (20000 km / 100) * 18 kWh/100km = 3600 kWh/år -> 300 kWh/måned
    expect(result.totalMonthlyKwh).toBe(300);
  });

  // USE CASE 2: Pris for Clever One (Model A) under standardbetingelser
  it('Use Case 2: Skal beregne korrekt pris for Clever One', () => {
    const result = calculateCosts(baselineInputs);
    // Månedlig kWh = 300, Hjemmeladning: 240 kWh
    // Strømudgift: 240 * 1.75 = 420 kr.
    // Clever refusion: 240 * 1.10 = 264 kr.
    // Clever One: 849 + (420 - 264) = 1005 kr.
    expect(result.modelACost).toBeCloseTo(1005, 2);
  });

  // USE CASE 3: Pris for Pay-As-You-Go (Model B) under standardbetingelser
  it('Use Case 3: Skal beregne korrekt pris for Pay-As-You-Go', () => {
    const result = calculateCosts(baselineInputs);
    // Hjemmeladning: 240 * 1.75 = 420 kr.
    // Offentlig ladning: 45 * 4.50 = 202.5 kr.
    // Total: 420 + 202.5 = 622.5 kr.
    expect(result.modelBCost).toBeCloseTo(622.5, 2);
  });

  // USE CASE 4: Pris for Serviceaftale (Model C) under standardbetingelser
  it('Use Case 4: Skal beregne korrekt pris for Serviceaftale', () => {
    const result = calculateCosts(baselineInputs);
    // Abonn: 79 kr.
    // Hjemmeladning: 240 kWh * (1.75 - 0.95) = 192 kr.
    // Offentlig ladning: 45 * 4.50 = 202.5 kr.
    // Total: 79 + 192 + 202.5 = 473.5 kr.
    expect(result.modelCCost).toBeCloseTo(473.5, 2);
  });

  // USE CASE 5: Pris for E.ON Drive Plus (Model D) under standardbetingelser
  it('Use Case 5: Skal beregne korrekt pris for E.ON Drive Plus', () => {
    const result = calculateCosts(baselineInputs);
    // Abonn: 99 kr.
    // Hjemmeladning: 240 * 1.75 = 420 kr.
    // Offentlig ladning: 45 * 3.45 = 155.25 kr.
    // Total: 99 + 420 + 155.25 = 674.25 kr.
    expect(result.modelDCost).toBeCloseTo(674.25, 2);
  });

  // USE CASE 6: Identifikation af den absolut billigste model under standardbetingelser
  it('Use Case 6: Skal finde den billigste model under standardbetingelser', () => {
    const result = calculateCosts(baselineInputs);
    const cheapest = findCheapestModel(result);
    expect(cheapest.id).toBe('service'); // Serviceaftale er billigst til 473.5 kr
  });

  // USE CASE 7: Breakeven Clever One vs Pay-As-You-Go
  it('Use Case 7: Skal beregne breakeven-punktet mellem Clever One og Pay-As-You-Go', () => {
    const breakeven = findBreakevenPointBetween(baselineInputs, 'modelACost', 'modelBCost');
    expect(breakeven).not.toBeNull();
    if (breakeven !== null) {
      // Model A skal være dyrere end Model B før breakeven
      const before = calculateCosts({ ...baselineInputs, annualDistanceKm: breakeven - 1000 });
      expect(before.modelACost).toBeGreaterThan(before.modelBCost);

      // Model A skal være billigere efter breakeven
      const after = calculateCosts({ ...baselineInputs, annualDistanceKm: breakeven + 1000 });
      expect(after.modelACost).toBeLessThan(after.modelBCost);
    }
  });

  // USE CASE 8: Breakeven Clever One vs Serviceaftale
  it('Use Case 8: Skal beregne breakeven-punktet mellem Clever One og Serviceaftale', () => {
    const breakeven = findBreakevenPointBetween(baselineInputs, 'modelACost', 'modelCCost');
    expect(breakeven).not.toBeNull();
  });

  // USE CASE 9: Ingen breakeven (ved 100% gratis opladning på arbejde)
  it('Use Case 9: Skal returnere null for breakeven, hvis priserne aldrig krydser', () => {
    const workOnlyInputs: CalculatorInputs = {
      ...baselineInputs,
      homeChargingPercent: 0,
      publicChargingPercent: 0,
      workChargingPercent: 100,
    };
    const breakeven = findBreakevenPointBetween(workOnlyInputs, 'modelACost', 'modelBCost');
    expect(breakeven).toBeNull();
  });

  // USE CASE 10: Lav-kilometer scenarie (Serviceaftale / Pay-As-You-Go vinder)
  it('Use Case 10: Serviceaftale eller Pay-As-You-Go skal være billigst ved et lavt kørselsbehov', () => {
    const lowMileageInputs: CalculatorInputs = {
      ...baselineInputs,
      annualDistanceKm: 5000, // Kun 5.000 km om året
    };
    const result = calculateCosts(lowMileageInputs);
    const cheapest = findCheapestModel(result);
    
    expect(['service', 'paygo']).toContain(cheapest.id);
    expect(result.modelCCost).toBeLessThan(result.modelACost);
  });

  // USE CASE 11: Høj-kilometer scenarie og 100% udeladning (Clever One vinder markant)
  it('Use Case 11: Clever One skal være billigst for høj-kilometer-brugere uden hjemmeladning', () => {
    const highMileageNoHomeCharging: CalculatorInputs = {
      ...baselineInputs,
      annualDistanceKm: 35000,
      homeChargingPercent: 0,
      publicChargingPercent: 95,
      workChargingPercent: 5,
      cleverSubscriptionCost: 999, // Uden ladeboks
    };
    const result = calculateCosts(highMileageNoHomeCharging);
    const cheapest = findCheapestModel(result);

    expect(cheapest.id).toBe('clever'); // Clever skal være absolut billigst ved udelukkende offentlig ladning
  });
});
