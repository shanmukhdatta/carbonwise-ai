/**
 * Carbon Calculation Utilities
 * Pure functions based on IPCC / EPA standards.
 */

export const EMISSION_FACTORS = {
  transport: {
    gas_car: 0.22,      // per km
    hybrid_car: 0.12,   // per km
    electric_car: 0.05, // per km
    bus: 0.08,          // per km
    train: 0.04,        // per km
    flight: 0.15,       // per km
    bicycle: 0,
    walk: 0
  },
  food: {
    red_meat: 3.5,      // per meal
    poultry_fish: 1.2,  // per meal
    vegetarian: 0.5,    // per meal
    vegan: 0.2          // per meal
  },
  energy: {
    electricity: 0.38,  // per kWh
    gas: 1.85,          // per m3
    water: 0.002        // per Liter
  },
  shopping: {
    clothing: 14.5,     // per item
    electronics: 95.0,  // per item
    grocery: 2.1,       // per transaction
    misc: 5.4           // per transaction
  },
  waste: {
    landfill: 1.8,      // per bag
    recycled: 0.1,      // per bag
    composted: 0.05     // per bag
  }
};

/**
 * Computes emissions in kg CO2e for a given category and subtype value
 * @param {string} category - Category (transport, food, energy, shopping, waste)
 * @param {string} type - Subtype (e.g. gas_car, red_meat)
 * @param {number} value - Input volume (km, meals, kWh, items, bags)
 * @returns {number} kg CO2e
 */
export const calculateEmissions = (category, type, value) => {
  const factorGroup = EMISSION_FACTORS[category];
  if (!factorGroup) return 0;
  
  const factor = factorGroup[type] !== undefined ? factorGroup[type] : 0.5;
  return parseFloat((value * factor).toFixed(2));
};

/**
 * Calculates user's baseline sustainability score (0-100) from questionnaire
 * @param {object} p - User onboarding profile values
 * @returns {number} sustainability score
 */
export const calculateOnboardingScore = (p) => {
  let score = 100;

  // Transport deduction
  if (p.transportMode === 'gas_car') {
    score -= Math.min(35, p.weeklyKm * 0.15);
  } else if (p.transportMode === 'hybrid_car') {
    score -= Math.min(20, p.weeklyKm * 0.08);
  } else if (p.transportMode === 'electric_car') {
    score -= Math.min(8, p.weeklyKm * 0.03);
  } else if (p.transportMode === 'bus' || p.transportMode === 'train') {
    score -= Math.min(12, p.weeklyKm * 0.04);
  }

  // Energy deduction
  const perCapitaEnergyBill = p.energyBill / (p.householdSize || 1);
  if (perCapitaEnergyBill > 150) score -= 25;
  else if (perCapitaEnergyBill > 80) score -= 15;
  else if (perCapitaEnergyBill > 40) score -= 8;

  // Diet score
  if (p.dietType === 'omnivore') score -= 20;
  else if (p.dietType === 'poultry_fish') score -= 12;
  else if (p.dietType === 'vegetarian') score -= 5;
  else if (p.dietType === 'vegan') score -= 1;

  // Recycling additions/deductions
  if (p.recycleHabit === 'always') score += 5;
  else if (p.recycleHabit === 'rarely') score -= 8;

  return Math.max(10, Math.min(100, Math.round(score)));
};
