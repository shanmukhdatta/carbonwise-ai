/**
 * Speech-to-Text Voice Service
 * Transcribes audio blobs using Google Cloud Speech API or parses voice presets contextually.
 */

export const transcribeAudio = async (audioBlob, presetTextSelected = '', apiKey = '') => {
  if (apiKey && audioBlob) {
    try {
      const base64Audio = await convertBlobToBase64(audioBlob);
      const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;
      const payload = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US'
        },
        audio: {
          content: base64Audio
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Speech API request failed');
      const data = await response.json();
      return data.results?.[0]?.alternatives?.[0]?.transcript || '';
    } catch (e) {
      console.error('Error with live Speech API, running fallback:', e);
    }
  }

  // High-Fidelity Simulation
  await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate speech network delay
  return presetTextSelected || 'I drove 15 kilometers in a hybrid car';
};

const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
  });
};

// Conversational parser to convert natural language commands to structured carbon entries
export const parseNaturalLanguage = (text) => {
  const lowercase = text.toLowerCase();
  
  // Default values
  const parsed = {
    category: 'transport',
    type: 'gas_car',
    value: 10,
    unit: 'km',
    description: `Voice Log: "${text}"`
  };

  // 1. Check Category: TRANSPORT
  if (/\b(drive|drove|car|ride|km|kilometers|miles|commute)\b/i.test(lowercase)) {
    parsed.category = 'transport';
    parsed.unit = 'km';
    
    // Check type
    if (/\b(electric|ev|tesla)\b/i.test(lowercase)) {
      parsed.type = 'electric_car';
    } else if (/\b(hybrid|prius)\b/i.test(lowercase)) {
      parsed.type = 'hybrid_car';
    } else if (/\b(bus)\b/i.test(lowercase)) {
      parsed.type = 'bus';
    } else if (/\b(train|metro|subway)\b/i.test(lowercase)) {
      parsed.type = 'train';
    } else {
      parsed.type = 'gas_car';
    }

    // Extract distance (number)
    const numMatch = lowercase.match(/(\d+)\s*(?:km|kilometer|mile|mtr|mi|k)/);
    parsed.value = numMatch ? parseInt(numMatch[1], 10) : 15;
    return parsed;
  }

  // 2. Check Category: UTILITY/ENERGY (Checked before diet to avoid substring conflicts)
  if (/\b(power|electric|kwh|water|shower)\b/i.test(lowercase)) {
    parsed.category = 'energy';
    
    if (/\b(water|shower)\b/i.test(lowercase)) {
      parsed.type = 'water';
      parsed.unit = 'Liters';
      const waterMatch = lowercase.match(/(\d+)\s*(?:l|liter|gallon|gal|min)/);
      parsed.value = waterMatch ? parseInt(waterMatch[1], 10) : 50;
    } else {
      parsed.type = 'electricity';
      parsed.unit = 'kWh';
      const kwhMatch = lowercase.match(/(\d+)\s*(?:kwh|kilowatt)/);
      parsed.value = kwhMatch ? parseInt(kwhMatch[1], 10) : 10;
    }
    return parsed;
  }

  // 3. Check Category: DIET/FOOD
  if (/\b(eat|ate|had|meal|meals|dinner|lunch|burger|salad|breakfast)\b/i.test(lowercase)) {
    parsed.category = 'food';
    parsed.unit = 'meal';
    parsed.value = 1;

    if (/\b(vegan)\b/i.test(lowercase)) {
      parsed.type = 'vegan';
    } else if (/\b(vegetarian|veggie|salad)\b/i.test(lowercase)) {
      parsed.type = 'vegetarian';
    } else if (/\b(beef|steak|pork|mutton|red\s*meat|meat)\b/i.test(lowercase)) {
      parsed.type = 'red_meat';
    } else {
      parsed.type = 'poultry_fish'; // chicken, fish, etc.
    }
    return parsed;
  }

  // 4. Check Category: WASTE
  if (/\b(recycle|recycled|waste|trash|bag|bags)\b/i.test(lowercase)) {
    parsed.category = 'waste';
    const bagMatch = lowercase.match(/(\d+)\s*(?:bag|sack|bin)/);
    parsed.value = bagMatch ? parseInt(bagMatch[1], 10) : 1;
    parsed.unit = parsed.value === 1 ? 'bag' : 'bags';
    
    if (/\b(recycle|recycled)\b/i.test(lowercase)) {
      parsed.type = 'recycled';
    } else if (/\b(compost|composted)\b/i.test(lowercase)) {
      parsed.type = 'composted';
    } else {
      parsed.type = 'landfill';
    }
    return parsed;
  }

  // 5. Default Fallback if NLP does not match
  return {
    category: 'shopping',
    type: 'misc',
    value: 1,
    unit: 'transaction',
    description: `Logged via AI: "${text}"`
  };
};
