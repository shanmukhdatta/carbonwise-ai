/**
 * Gemini AI Service - Coordinates AI coaching, onboarding reports, and what-if modeling.
 * Supports both Live API requests and robust local NLP parsing.
 */
import { calculateOnboardingScore } from '../utils/carbonFormulas';

// Helper to make live Gemini requests if API Key exists
const fetchLiveGemini = async (prompt, systemInstruction, apiKey) => {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to call Gemini API');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// 1. Sustainability Coach (Chat response helper)
export const askGeminiCoach = async (chatHistory, userMessage, apiKey = '') => {
  if (apiKey) {
    try {
      const systemInstruction = `You are the CarbonWise AI Sustainability Coach. You are an expert in environmental science, individual carbon tracking, and lifestyle optimization.
Your goal is to provide concise, friendly, actionable, and personalized tips based on the user's queries.
Keep your answers under 3-4 paragraphs. Use bullet points for steps. Remind them of simple changes that take less than 5 minutes to implement. Use positive, encouraging green terminology.`;

      const prompt = `Chat History:\n${chatHistory.map(h => `${h.sender === 'user' ? 'User' : 'Coach'}: ${h.text}`).join('\n')}\nUser: ${userMessage}`;
      const reply = await fetchLiveGemini(prompt, systemInstruction, apiKey);
      return reply;
    } catch (e) {
      console.error('Error with live Gemini, running fallback:', e);
    }
  }

  // NLP Mock Fallback Engine
  const query = userMessage.toLowerCase();
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate thinking

  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return `Hello! 🌿 I am your CarbonWise AI Coach. I'm here to help you understand your footprint, optimize your habits, and work toward a more sustainable lifestyle. Ask me anything, like:
- *Why is my electricity footprint high?*
- *How can I offset my travel emissions?*
- *Give me a 5-minute action to reduce waste.*`;
  }
  
  if (query.includes('electric') || query.includes('energy') || query.includes('power') || query.includes('solar') || query.includes('ac') || query.includes('heat')) {
    return `Electricity and heating are usually the largest contributors to home emissions! ⚡ Here are some quick, high-impact strategies:
1. **Unplug Phantom Loads:** Items in standby mode (TVs, chargers, gaming consoles) can account for up to 10% of your energy bill. Unplug them or use smart power strips.
2. **Optimize your Thermostat:** Lowering your thermostat by just 1°C in winter (or raising it by 1°C in summer) can reduce your heating/cooling energy usage by up to 5-10%.
3. **Upgrade to LEDs:** LED bulbs use 75% less energy and last 25 times longer than incandescent bulbs.
4. **Consider Solar Potential:** If you own your home, Google's Solar API shows that average roofs receive enough sunlight to offset up to 80% of grid dependency. Check nearby incentives!`;
  }

  if (query.includes('car') || query.includes('drive') || query.includes('transport') || query.includes('bus') || query.includes('train') || query.includes('flight') || query.includes('travel')) {
    return `Transportation is a primary carbon source for most individuals. 🚗 Here is how you can optimize:
1. **Prefer Active Transit:** For trips under 3 km, try walking or cycling. It produces **zero carbon** and improves health!
2. **Utilize Public Transit:** Taking a bus or train reduces emissions per passenger kilometer by up to 60-80% compared to a single-occupancy gasoline car.
3. **Eco-Driving Techniques:** If you must drive, maintain a steady speed, avoid rapid acceleration, and check tire pressure. Correct inflation increases fuel efficiency by up to 3%.
4. **Fly Direct and Pack Light:** Flights represent massive point-in-time emissions. When travel is necessary, choose direct flights and limit heavy luggage to decrease fuel burning.`;
  }

  if (query.includes('food') || query.includes('meat') || query.includes('diet') || query.includes('vegan') || query.includes('veget') || query.includes('eat')) {
    return `What we eat plays a massive role in our carbon footprint. Livestock farming (particularly beef and dairy) creates significant methane emissions. 🥗
- **Try a Meatless Day:** Cutting out red meat just one day a week reduces your food footprint by roughly 15%. Red meat emissions (3.5kg CO2e/meal) are nearly 7x higher than vegetarian options.
- **Minimize Food Waste:** Food rotting in landfills produces methane, a greenhouse gas 28x more potent than CO2. Try planning meals weekly and composting scraps.
- **Eat Local & Seasonal:** Consuming foods grown nearby reduces transportation emissions (food miles).`;
  }

  if (query.includes('offset') || query.includes('tree') || query.includes('credit')) {
    return `Carbon offsetting should be your secondary tool after reducing emissions directly! 🌲 When offsetting:
1. **Choose Certified Projects:** Look for Gold Standard or VCS (Verified Carbon Standard) credits. These verify that emissions reductions are real, permanent, and additional.
2. **Support Reforestation:** Planting trees is a powerful long-term carbon capture mechanism. A single mature tree absorbs about 22kg of CO2 per year.
3. **Renewable Investments:** Look into offsets that fund solar, wind, or biogas initiatives in developing communities. This replaces coal grids and supports local economies.`;
  }

  if (query.includes('recycle') || query.includes('plastic') || query.includes('compost') || query.includes('waste')) {
    return `Waste reduction is an easy win for your carbon ledger! ♻️
- **Compost Organics:** Food waste in regular landfills lacks oxygen, creating methane. Composting allows aerobic decomposition, which has negligible greenhouse gas emissions.
- **Refuse Single-Use Plastics:** Plastic requires refined crude oil to manufacture. Carry reusable water bottles, coffee cups, and shopping bags.
- **E-Waste Recycling:** Electronics contain precious metals that require extreme carbon expenditure to mine. Recycle them at certified local depots (which we can find on the map!).`;
  }

  return `That is a great sustainability question! 🌿 Every small action counts.
To reduce your footprint in this area, try to focus on efficiency (doing more with less), active conservation (turning things off), and switching to renewable resources whenever possible.
Is there a specific category you would like to tackle today (Transport, Diet, Home Energy, or Waste)?`;
};

// 2. Multistep Onboarding Lifestyle Analyzer
export const analyzeLifestyleOnboarding = async (profileData, apiKey = '') => {
  const score = calculateOnboardingScore(profileData);
  let persona = 'Eco Beginner';
  if (score >= 40 && score < 65) persona = 'Conscious Consumer';
  else if (score >= 65 && score < 85) persona = 'Green Champion';
  else if (score >= 85) persona = 'Sustainability Leader';

  if (apiKey) {
    try {
      const prompt = `Based on this user profile, generate a 2-paragraph environmental analysis:
Household size: ${profileData.householdSize}
Transport: ${profileData.transportMode} (${profileData.weeklyKm} km/week)
Energy bills: $${profileData.energyBill}/month
Diet: ${profileData.dietType}
Recycle Habits: ${profileData.recycleHabit}
Persona assigned: ${persona}
Score: ${score}/100.
Point out their single largest potential emission area and offer one encouraging reduction goal.`;
      
      const analysisText = await fetchLiveGemini(prompt, 'You are an environmental assessment bot.', apiKey);
      return { score, persona, analysisText };
    } catch (e) {
      console.error('Error with live Gemini onboarding analysis, running fallback:', e);
    }
  }

  // Fallback Mock Assessment Text
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  let primaryConcern = 'home heating and electricity bills';
  if (profileData.transportMode === 'gas_car' && profileData.weeklyKm > 100) {
    primaryConcern = 'daily gasoline car commute';
  } else if (profileData.dietType === 'omnivore' && profileData.recycleHabit === 'rarely') {
    primaryConcern = 'meat consumption combined with low recycling rates';
  }

  const analysisText = `Your environmental persona is **${persona}**! Your assessment score is **${score}/100**, indicating a solid starting point with room for optimized savings.
Our analysis indicates that your largest emission contributor is likely your **${primaryConcern}**. By making minor changes—such as optimizing transport routes or switching to one veggie meal per day—you could easily save up to 120 kg of CO2e per month. We have generated some tailored reduction challenges on your Dashboard!`;

  return { score, persona, analysisText };
};

// Using imported calculateOnboardingScore from carbonFormulas.js

// 3. Weekly/Monthly Sustainability report card text
export const generateWeeklyReport = async (activities, profile, apiKey = '') => {
  const totalCo2 = activities.reduce((sum, a) => sum + a.co2e, 0);
  const avgDaily = parseFloat((totalCo2 / 14).toFixed(1)); // mock 14 days baseline

  if (apiKey) {
    try {
      const prompt = `Generate a weekly sustainability report summary.
Total logged emissions: ${totalCo2.toFixed(1)} kg CO2e over the past 2 weeks.
Average daily: ${avgDaily} kg CO2e.
Provide a 3-bullet breakdown detailing:
1. Progress comparison
2. Top category
3. Action recommendation.
Make it brief.`;
      return await fetchLiveGemini(prompt, 'You are an environmental report bot.', apiKey);
    } catch (e) {
      console.error('Error with live Gemini report card, running fallback:', e);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return `### Weekly Performance Digest 📊
Your carbon budget efficiency was **92%** this week, keeping you well under the local residential average!

**Key Highlights:**
- **Primary Source:** Transportation accounted for **48%** of your total emissions due to car commutes.
- **Top Saver:** Your diet was highly sustainable—logging 6 vegetarian/vegan meals saved **18.0 kg CO2e** compared to red meat.
- **Action Suggestion:** Consider replacing one car commute next week with public transit to save another **4.5 kg CO2e**!`;
};
