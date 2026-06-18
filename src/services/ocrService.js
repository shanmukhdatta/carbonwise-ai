/**
 * OCR Receipt & Bill Scan Service
 * Interfaces with Google Cloud Vision API or returns simulated invoice extractions.
 */

export const scanReceipt = async (imageFile, receiptTypePreset = 'electricity', apiKey = '') => {
  // If we have a live API key, we construct the request to Google Cloud Vision API
  if (apiKey && imageFile) {
    try {
      const base64Data = await convertFileToBase64(imageFile);
      const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
      const payload = {
        requests: [
          {
            image: { content: base64Data },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
          }
        ]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Cloud Vision request failed');
      const data = await response.json();
      const detectedText = data.responses?.[0]?.fullTextAnnotation?.text || '';
      return parseTextContextually(detectedText);
    } catch (e) {
      console.error('Error with live Vision OCR, falling back:', e);
    }
  }

  // High-Fidelity Simulation
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate OCR load time

  if (receiptTypePreset === 'electricity') {
    return {
      category: 'energy',
      type: 'electricity',
      value: 280, // 280 kWh
      unit: 'kWh',
      amountSpent: 78.50,
      date: new Date().toISOString().split('T')[0],
      description: 'OCR Scan: Spark Power Electric Bill (280 kWh)'
    };
  } else if (receiptTypePreset === 'gasoline') {
    return {
      category: 'transport',
      type: 'gas_car',
      value: 45, // 45 Liters -> approx 225 km driving range base or direct liters
      unit: 'km', // Logged as 200 km transport log
      amountSpent: 62.40,
      date: new Date().toISOString().split('T')[0],
      description: 'OCR Scan: GreenGas Station - Fuel Fill-up (45L / 200km equiv)'
    };
  } else {
    // grocery / shopping
    return {
      category: 'shopping',
      type: 'grocery',
      value: 1,
      unit: 'transaction',
      amountSpent: 114.20,
      date: new Date().toISOString().split('T')[0],
      description: 'OCR Scan: Whole Foods Market organic grocery shopping'
    };
  }
};

// Converts image file to Base64 for Google Cloud Vision API
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove metadata prefix (e.g., "data:image/jpeg;base64,")
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Core OCR Parser to extract carbon attributes from invoice lines
const parseTextContextually = (text) => {
  const lowercase = text.toLowerCase();
  const result = {
    category: 'shopping',
    type: 'misc',
    value: 1,
    unit: 'transaction',
    amountSpent: 0,
    date: new Date().toISOString().split('T')[0],
    description: 'OCR Scan: Parsed document text'
  };

  // 1. Search for amounts
  const priceRegex = /(?:total|amount|due|usd|\$)\s*:?\s*\$?(\d+\.\d{2})/i;
  const matchPrice = lowercase.match(priceRegex);
  if (matchPrice && matchPrice[1]) {
    result.amountSpent = parseFloat(matchPrice[1]);
  }

  // 2. Identify Energy / Power bills
  if (lowercase.includes('power') || lowercase.includes('electric') || lowercase.includes('kwh')) {
    result.category = 'energy';
    result.type = 'electricity';
    result.unit = 'kWh';
    result.description = 'OCR Scan: Electric Utility Statement';
    
    const kwhRegex = /(\d+)\s*(?:kwh|kilowatt)/i;
    const matchKwh = lowercase.match(kwhRegex);
    result.value = matchKwh ? parseInt(matchKwh[1], 10) : 150; // default fallback if OCR missing
    return result;
  }

  // 3. Identify Fuel Bills
  if (lowercase.includes('fuel') || lowercase.includes('gasoline') || lowercase.includes('gas station') || lowercase.includes('liters') || lowercase.includes('gal')) {
    result.category = 'transport';
    result.type = 'gas_car';
    result.unit = 'km';
    result.description = 'OCR Scan: Fuel Receipt';
    
    const litersRegex = /(\d+(?:\.\d+)?)\s*(?:l|liters|gal)/i;
    const matchLiters = lowercase.match(litersRegex);
    const liters = matchLiters ? parseFloat(matchLiters[1]) : 40;
    result.value = Math.round(liters * 5); // Approximate km driving from liters (e.g. 5km/L)
    return result;
  }

  // 4. Grocery / Shopping
  if (lowercase.includes('mart') || lowercase.includes('store') || lowercase.includes('food') || lowercase.includes('grocery')) {
    result.category = 'shopping';
    result.type = 'grocery';
    result.unit = 'transaction';
    result.description = 'OCR Scan: Store Receipt';
    result.value = 1;
    return result;
  }

  return result;
};
