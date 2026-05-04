// Emission factors (kg of CO2 per km)
export const EMISSION_FACTORS = {
  car_petrol: 0.17,   // The "Baseline" (Standard car)
  train: 0.035,      // Sustainable choice
  bus: 0.08,         // Public transport
  bicycle: 0,        // Zero emissions
  walking: 0         // Zero emissions
};

/**
 * Calculates how much carbon is saved by NOT driving a petrol car.
 * Formula: (Baseline - Actual) * Distance
 */
export const calculateCarbonSaved = (distance: number, transportType: keyof typeof EMISSION_FACTORS) => {
  const baseline = EMISSION_FACTORS.car_petrol;
  const actual = EMISSION_FACTORS[transportType];
  
  const saved = (baseline - actual) * distance;
  return saved.toFixed(2); // Returns number with 2 decimal places
};