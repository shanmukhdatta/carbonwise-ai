import React, { createContext, useState, useEffect } from 'react';
import { EMISSION_FACTORS, calculateEmissions } from '../utils/carbonFormulas';

export const CarbonContext = createContext();

// Generate 7 days of realistic history for a user to show beautiful charts immediately
const generateMockHistory = () => {
  const list = [];
  const now = new Date();
  
  // Categories configurations
  const transportTypes = ['gas_car', 'bus', 'train', 'walk'];
  const dietTypes = ['red_meat', 'poultry_fish', 'vegetarian', 'vegan'];
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // 1. Food entries (3 per day)
    list.push({
      id: `m-food-1-${i}`,
      date: dateString,
      category: 'food',
      type: dietTypes[i % 4],
      value: 1,
      unit: 'meal',
      description: `Meal: ${dietTypes[i % 4].replace('_', ' ')}`,
      co2e: EMISSION_FACTORS.food[dietTypes[i % 4]]
    });
    list.push({
      id: `m-food-2-${i}`,
      date: dateString,
      category: 'food',
      type: dietTypes[(i + 1) % 4],
      value: 1,
      unit: 'meal',
      description: `Meal: ${dietTypes[(i + 1) % 4].replace('_', ' ')}`,
      co2e: EMISSION_FACTORS.food[dietTypes[(i + 1) % 4]]
    });

    // 2. Transport (commuting - except Sundays)
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0) { // Not Sunday
      const dist = 10 + (i % 5) * 5; // 10 to 30 km
      const tType = i % 3 === 0 ? 'bus' : 'gas_car';
      list.push({
        id: `m-trans-${i}`,
        date: dateString,
        category: 'transport',
        type: tType,
        value: dist,
        unit: 'km',
        description: `Commuted ${dist} km by ${tType.replace('_', ' ')}`,
        co2e: parseFloat((dist * EMISSION_FACTORS.transport[tType]).toFixed(2))
      });
    }

    // 3. Energy (weekly billing items spread out or daily averages)
    // We log daily base electricity and water usage
    const powerKwh = 12 + (i % 4) * 2;
    list.push({
      id: `m-energy-p-${i}`,
      date: dateString,
      category: 'energy',
      type: 'electricity',
      value: powerKwh,
      unit: 'kWh',
      description: `Daily home power usage (${powerKwh} kWh)`,
      co2e: parseFloat((powerKwh * EMISSION_FACTORS.energy.electricity).toFixed(2))
    });

    // 4. Occasional Shopping
    if (i % 5 === 2) {
      list.push({
        id: `m-shop-${i}`,
        date: dateString,
        category: 'shopping',
        type: 'grocery',
        value: 1,
        unit: 'items',
        description: 'Grocery shopping',
        co2e: EMISSION_FACTORS.shopping.grocery
      });
    }
    
    // 5. Waste (twice a week)
    if (i % 6 === 1) {
      list.push({
        id: `m-waste-l-${i}`,
        date: dateString,
        category: 'waste',
        type: 'landfill',
        value: 1,
        unit: 'bag',
        description: 'Disposed landfill waste bag',
        co2e: EMISSION_FACTORS.waste.landfill
      });
      list.push({
        id: `m-waste-r-${i}`,
        date: dateString,
        category: 'waste',
        type: 'recycled',
        value: 2,
        unit: 'bags',
        description: 'Sorted recycling bags',
        co2e: EMISSION_FACTORS.waste.recycled * 2
      });
    }
  }
  return list;
};

export const CarbonProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('carbonwise_activities');
    if (saved) {
      return JSON.parse(saved);
    } else {
      const initialHistory = generateMockHistory();
      localStorage.setItem('carbonwise_activities', JSON.stringify(initialHistory));
      return initialHistory;
    }
  });

  const [carbonBudget, setCarbonBudget] = useState(() => {
    // Standard target budget per person per day (kg CO2e)
    // Average US footprint is ~45kg/day. Target is to reduce it under 20-25kg/day.
    const saved = localStorage.getItem('carbonwise_budget');
    return saved ? parseFloat(saved) : 22.0; 
  });

  useEffect(() => {
    localStorage.setItem('carbonwise_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('carbonwise_budget', carbonBudget.toString());
  }, [carbonBudget]);

  // Log activity
  const addActivity = (category, type, value, unit, description, dateOverride = null) => {
    const co2e = calculateEmissions(category, type, value);
    
    const newActivity = {
      id: `act-${Date.now()}`,
      date: dateOverride || new Date().toISOString().split('T')[0],
      category,
      type,
      value: parseFloat(value),
      unit,
      description: description || `${category.charAt(0).toUpperCase() + category.slice(1)}: ${type.replace('_', ' ')}`,
      co2e
    };

    setActivities((prev) => [newActivity, ...prev]);
    return newActivity;
  };

  // Delete activity
  const deleteActivity = (id) => {
    setActivities((prev) => prev.filter((a) => gId(a) !== id));
  };
  
  const gId = (item) => item.id;

  // Clear all data
  const clearHistory = () => {
    setActivities([]);
    localStorage.removeItem('carbonwise_activities');
  };

  // Get total emissions for a specific date range
  const getEmissionsForPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return activities
      .filter((act) => {
        const d = new Date(act.date);
        return d >= start && d <= end;
      })
      .reduce((total, act) => total + act.co2e, 0);
  };

  // Get category totals for a range of dates
  const getCategoryTotalsForPeriod = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const breakdown = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
      waste: 0
    };

    activities
      .filter((act) => {
        const d = new Date(act.date);
        return d >= start && d <= end;
      })
      .forEach((act) => {
        if (breakdown[act.category] !== undefined) {
          breakdown[act.category] += act.co2e;
        }
      });

    // Return as array of { name, value, color } for ease of plotting
    return [
      { name: 'Transport', value: parseFloat(breakdown.transport.toFixed(1)), key: 'transport', color: 'var(--primary-700)' },
      { name: 'Diet & Food', value: parseFloat(breakdown.food.toFixed(1)), key: 'food', color: 'var(--primary-500)' },
      { name: 'Home Utilities', value: parseFloat(breakdown.energy.toFixed(1)), key: 'energy', color: 'var(--primary-300)' },
      { name: 'Shopping', value: parseFloat(breakdown.shopping.toFixed(1)), key: 'shopping', color: 'var(--info)' },
      { name: 'Waste Management', value: parseFloat(breakdown.waste.toFixed(1)), key: 'waste', color: 'var(--warning)' }
    ];
  };

  // Helper: Get list of emissions aggregated by date for the last 7 days
  const getLast7DaysEmissions = () => {
    const results = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const displayDay = date.toLocaleDateString(undefined, { weekday: 'short' });
      
      const total = activities
        .filter((act) => act.date === dateStr)
        .reduce((sum, act) => sum + act.co2e, 0);

      results.push({
        date: dateStr,
        day: displayDay,
        co2e: parseFloat(total.toFixed(2))
      });
    }
    return results;
  };

  // Current Day Total
  const getTodayEmissions = () => {
    const today = new Date().toISOString().split('T')[0];
    return activities
      .filter((act) => act.date === today)
      .reduce((sum, act) => sum + act.co2e, 0);
  };

  return (
    <CarbonContext.Provider
      value={{
        activities,
        addActivity,
        deleteActivity,
        clearHistory,
        carbonBudget,
        setCarbonBudget,
        getEmissionsForPeriod,
        getCategoryTotalsForPeriod,
        getLast7DaysEmissions,
        getTodayEmissions
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
};
