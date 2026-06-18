import { describe, it, expect } from 'vitest';
import { parseNaturalLanguage } from '../services/speechService';

describe('Voice Commands & NLP Parsing Unit Tests', () => {

  // Test 1: Transport gas car parsing
  it('correctly parses gasoline car travel distances', () => {
    const text = 'I drove 45 km today to the city centre';
    const parsed = parseNaturalLanguage(text);
    expect(parsed.category).toBe('transport');
    expect(parsed.type).toBe('gas_car');
    expect(parsed.value).toBe(45);
    expect(parsed.unit).toBe('km');
  });

  // Test 2: Transport EV car parsing
  it('correctly identifies electric vehicle context', () => {
    const text = 'I rode my electric vehicle for 20 km';
    const parsed = parseNaturalLanguage(text);
    expect(parsed.category).toBe('transport');
    expect(parsed.type).toBe('electric_car');
    expect(parsed.value).toBe(20);
  });

  // Test 3: Food parsing (vegetarian)
  it('correctly parses vegetarian meal logs', () => {
    const text = 'I had a delicious vegetarian salad for dinner';
    const parsed = parseNaturalLanguage(text);
    expect(parsed.category).toBe('food');
    expect(parsed.type).toBe('vegetarian');
    expect(parsed.value).toBe(1);
  });

  // Test 4: Food parsing (red meat)
  it('correctly parses red meat logs', () => {
    const text = 'We ate beef steak';
    const parsed = parseNaturalLanguage(text);
    expect(parsed.category).toBe('food');
    expect(parsed.type).toBe('red_meat');
  });

  // Test 5: Energy water usage parsing
  it('correctly parses water volume from shower descriptions', () => {
    const text = 'I took a quick shower and used 50 Liters of water';
    const parsed = parseNaturalLanguage(text);
    expect(parsed.category).toBe('energy');
    expect(parsed.type).toBe('water');
    expect(parsed.value).toBe(50);
  });

  // Test 6: Waste sorting recycling parsing
  it('correctly parses bags of recycling sorted', () => {
    const text = 'I sorted and recycled 3 bags of plastic bottles';
    const parsed = parseNaturalLanguage(text);
    expect(parsed.category).toBe('waste');
    expect(parsed.type).toBe('recycled');
    expect(parsed.value).toBe(3);
  });
});
