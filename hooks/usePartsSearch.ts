import { useState } from 'react';
import { Part, PartTier } from '@/types/parts';

export const usePartsSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Part[]>([]);
  
  const searchParts = async (
    make: string,
    model: string,
    year: number,
    partType: string
  ) => {
    setIsLoading(true);
    
    try {
      const prompt = `You are an automotive parts expert. Search for "${partType}" parts for a ${year} ${make} ${model}.

Provide parts from these sources: AutoZone, O'Reilly Auto Parts, RockAuto, Advance Auto Parts, Walmart.

For each source, provide 3 tiers of parts (economy/low, OEM quality/mid, premium/high) with realistic:
- Part names
- Part numbers (realistic format for each retailer)
- Prices (economy: lowest, OEM: mid-range, premium: highest)

Return ONLY a JSON array with this exact structure:
[
  {
    "name": "Valvoline MaxLife 5W-30 Motor Oil",
    "tier": "mid",
    "price": 24.99,
    "partNumber": "VV150-6PK",
    "source": "AutoZone"
  },
  {
    "name": "Mobil 1 Extended Performance 5W-30",
    "tier": "high", 
    "price": 34.99,
    "partNumber": "MOB1-EP-5W30",
    "source": "AutoZone"
  }
]

Include realistic part numbers, competitive pricing, and appropriate tier classifications. Provide 3-5 parts per source (15-25 total parts).`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an automotive parts expert. Always respond with valid JSON only, no additional text or formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search for parts');
      }

      const data = await response.json();
      
      // Parse the AI response
      let partsData;
      try {
        // Clean the response to ensure it's valid JSON
        const cleanedResponse = data.completion.replace(/```json\n?|\n?```/g, '').trim();
        partsData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', data.completion);
        // Fallback to mock data if AI parsing fails
        partsData = generateMockResults(make, model, year, partType);
      }

      if (!Array.isArray(partsData)) {
        throw new Error('AI response is not an array');
      }

      // Convert to Part objects with unique IDs
      const parts: Part[] = partsData.map((part: any, index: number) => ({
        id: `${part.source}-${part.tier}-${Date.now()}-${index}`,
        name: part.name || `${partType} for ${year} ${make} ${model}`,
        tier: part.tier || 'mid',
        price: typeof part.price === 'number' ? part.price : parseFloat(part.price) || 25.99,
        partNumber: part.partNumber || `PART-${Date.now()}-${index}`,
        source: part.source || 'AutoZone',
        url: `https://example.com/${part.source?.toLowerCase().replace(/\s+/g, '') || 'autozone'}`
      }));

      setResults(parts);
    } catch (error) {
      console.error('Error searching parts:', error);
      // Fallback to mock results if API fails
      const mockResults = generateMockResults(make, model, year, partType);
      setResults(mockResults);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    results,
    searchParts
  };
};

// Fallback mock function in case AI search fails
const generateMockResults = (
  make: string,
  model: string,
  year: number,
  partType: string
): Part[] => {
  const sources = ['AutoZone', 'O\'Reilly Auto Parts', 'RockAuto', 'Advance Auto Parts', 'Walmart'];
  const tiers: PartTier[] = ['low', 'mid', 'high'];
  
  const generatePartNumber = (source: string, tier: PartTier) => {
    const makeCode = make.substring(0, 2).toUpperCase();
    const modelCode = model.substring(0, 2).toUpperCase();
    const yearCode = year.toString().substring(2);
    const sourceCode = source.substring(0, 2).toUpperCase();
    const tierCode = tier === 'low' ? 'L' : tier === 'mid' ? 'M' : 'H';
    
    return `${makeCode}${modelCode}${yearCode}-${sourceCode}${tierCode}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };
  
  const generatePrice = (tier: PartTier) => {
    const basePrice = partType.toLowerCase().includes('oil') ? 8 : 
                      partType.toLowerCase().includes('filter') ? 15 :
                      partType.toLowerCase().includes('brake') ? 35 :
                      partType.toLowerCase().includes('spark') ? 10 : 25;
    
    const multiplier = tier === 'low' ? 1 : 
                       tier === 'mid' ? 1.8 : 3;
    
    return Math.round(basePrice * multiplier * (0.9 + Math.random() * 0.2) * 100) / 100;
  };
  
  const results: Part[] = [];
  
  sources.forEach(source => {
    tiers.forEach(tier => {
      const tierLabel = tier === 'low' ? 'Economy' : 
                        tier === 'mid' ? 'OEM Quality' : 'Premium';
      
      results.push({
        id: `${source}-${tier}-${Date.now()}-${Math.random()}`,
        name: `${tierLabel} ${partType} for ${year} ${make} ${model}`,
        tier,
        price: generatePrice(tier),
        partNumber: generatePartNumber(source, tier),
        source,
        url: `https://example.com/${source.toLowerCase().replace(/\s+/g, '')}`
      });
    });
  });
  
  return results;
};