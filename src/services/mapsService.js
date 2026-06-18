/**
 * Google Maps Platform API Wrapper
 * Implements geocoding, green locations, and route-carbon calculations.
 */

// Simulated green hubs near the user's selected location
export const getNearbyGreenLocations = (locationName = 'New York') => {
  const norm = locationName.toLowerCase();
  
  const nycLocations = [
    { id: 'nyc-1', name: 'Manhattan Eco Recycling Hub', type: 'recycling', address: '120 E 14th St, New York', lat: 40.7335, lng: -73.9886, distance: '1.2 km' },
    { id: 'nyc-2', name: 'ChargePoint EV Charging Station', type: 'ev_charger', address: '450 Lexington Ave, New York', lat: 40.7525, lng: -73.9748, distance: '0.8 km' },
    { id: 'nyc-3', name: 'Union Square Organic Greenmarket', type: 'grocery', address: 'Union Square W, New York', lat: 40.7359, lng: -73.9911, distance: '1.5 km' },
    { id: 'nyc-4', name: 'Lower East Side Composting Center', type: 'compost', address: 'FDR Dr & E Grand St, New York', lat: 40.7135, lng: -73.9785, distance: '2.4 km' }
  ];

  const genericLocations = [
    { id: 'gen-1', name: 'Community Conservation Recycle Center', type: 'recycling', address: '100 Green Lane, Center City', lat: 0, lng: 0, distance: '2.3 km' },
    { id: 'gen-2', name: 'Public Grid Fast EV Charging Node', type: 'ev_charger', address: '75 Energy Boulevard, Center City', lat: 0, lng: 0, distance: '1.1 km' },
    { id: 'gen-3', name: 'Harvest Fresh Eco Cooperatives', type: 'grocery', address: '12 Market Square, Center City', lat: 0, lng: 0, distance: '3.0 km' }
  ];

  if (norm.includes('new york') || norm.includes('nyc') || norm.includes('manhattan')) {
    return nycLocations;
  }
  
  return genericLocations;
};

// Calculate alternate route carbon footprints (Gas Car vs Transit vs Biking)
export const calculateRouteEmissions = (origin, destination, distanceKm = 10) => {
  const dist = parseFloat(distanceKm) || 10;
  
  // Calculate emissions using standard Carbon constants
  const gasEmissions = parseFloat((dist * 0.22).toFixed(1));     // 0.22 kg/km
  const transitEmissions = parseFloat((dist * 0.08).toFixed(1)); // 0.08 kg/km (Bus average)
  const activeEmissions = 0.0;                                   // Zero carbon!

  return {
    distance: dist,
    routes: [
      {
        mode: 'Gasoline Driving',
        co2e: gasEmissions,
        timeMinutes: Math.round(dist * 2.5),
        savingsPercent: 0,
        color: 'var(--danger)',
        icon: '🚗'
      },
      {
        mode: 'Public Bus Transit',
        co2e: transitEmissions,
        timeMinutes: Math.round(dist * 3.5),
        savingsPercent: Math.round(((gasEmissions - transitEmissions) / gasEmissions) * 100),
        color: 'var(--primary-600)',
        icon: '🚌'
      },
      {
        mode: 'Bicycle / Walking',
        co2e: activeEmissions,
        timeMinutes: Math.round(dist * 5),
        savingsPercent: 100,
        color: 'var(--success)',
        icon: '🚲'
      }
    ]
  };
};
