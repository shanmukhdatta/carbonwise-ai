import { describe, it, expect } from 'vitest';
import { calculateEmissions, calculateOnboardingScore, EMISSION_FACTORS } from '../utils/carbonFormulas';

describe('Carbon Calculation Formulas Unit Tests', () => {
  
  // Test 1: Category: transport gasoline car
  it('correctly calculates emissions for a gasoline car', () => {
    const value = 100; // 100 km
    const expected = parseFloat((value * EMISSION_FACTORS.transport.gas_car).toFixed(2));
    expect(calculateEmissions('transport', 'gas_car', value)).toBe(expected);
  });

  // Test 2: Category: transport EV car
  it('correctly calculates low emissions for an electric vehicle', () => {
    const value = 150;
    const expected = parseFloat((value * EMISSION_FACTORS.transport.electric_car).toFixed(2));
    expect(calculateEmissions('transport', 'electric_car', value)).toBe(expected);
  });

  // Test 3: Zero values logic
  it('returns zero emissions when quantity is zero', () => {
    expect(calculateEmissions('transport', 'gas_car', 0)).toBe(0);
    expect(calculateEmissions('food', 'red_meat', 0)).toBe(0);
    expect(calculateEmissions('energy', 'electricity', 0)).toBe(0);
  });

  // Test 4: Category: food red meat
  it('correctly calculates red meat meals carbon load', () => {
    expect(calculateEmissions('food', 'red_meat', 3)).toBe(10.5); // 3 * 3.5 = 10.5
  });

  // Test 5: Category: food vegan
  it('correctly calculates vegan diet footprint', () => {
    expect(calculateEmissions('food', 'vegan', 10)).toBe(2.0); // 10 * 0.2 = 2.0
  });

  // Test 6: Category: home electricity
  it('correctly calculates utility energy emissions', () => {
    expect(calculateEmissions('energy', 'electricity', 300)).toBe(114.0); // 300 * 0.38 = 114
  });

  // Test 7: Category: waste recycled vs landfill
  it('verify recycling has a fraction of landfill emissions', () => {
    const landfill = calculateEmissions('waste', 'landfill', 5);
    const recycled = calculateEmissions('waste', 'recycled', 5);
    expect(recycled).toBeLessThan(landfill);
  });

  // Test 8: Fallback type handler
  it('returns default fallback factor if type is unknown', () => {
    expect(calculateEmissions('transport', 'rocket_ship', 10)).toBe(5.0); // 10 * 0.5 default = 5
  });

  // Test 9: Onboarding score optimal baseline (vegan, bicyclist, always recycling)
  it('returns high score for low carbon lifestyles', () => {
    const optimalProfile = {
      householdSize: 4,
      transportMode: 'bicycle',
      weeklyKm: 0,
      energyBill: 20, // low per-capita bill
      dietType: 'vegan',
      recycleHabit: 'always'
    };
    const score = calculateOnboardingScore(optimalProfile);
    expect(score).toBeGreaterThan(85); // should be a Sustainability Leader
  });

  // Test 10: Onboarding score high emissions profile (omnivore, heavy single-occupancy gas driver)
  it('returns low score for high carbon lifestyles', () => {
    const heavyProfile = {
      householdSize: 1,
      transportMode: 'gas_car',
      weeklyKm: 400,
      energyBill: 250,
      dietType: 'omnivore',
      recycleHabit: 'rarely'
    };
    const score = calculateOnboardingScore(heavyProfile);
    expect(score).toBeLessThan(40); // should be an Eco Beginner
  });
});
