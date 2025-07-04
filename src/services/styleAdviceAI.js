// Style Advice AI Functions for StyleAgent
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function generateItemSearchQuery(wardrobeItem) {
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ OpenAI API key not found for search query generation");
    return {
      primaryTerms: [wardrobeItem.title || 'clothing item'],
      alternativeTerms: wardrobeItem.tags || [],
      category: wardrobeItem.category || 'Fashion',
      keyAttributes: [wardrobeItem.color, wardrobeItem.material, wardrobeItem.style].filter(Boolean),
      attributesToAvoid: [],
    };
  }

  const prompt = `You are a fashion search expert. Analyze this clothing item and generate optimal search terms for finding similar items online.

Item Details:
- Title: ${wardrobeItem.title || 'Unknown'}
- Description: ${wardrobeItem.description || 'No description'}
- Color: ${wardrobeItem.color || 'Unknown'}
- Material: ${wardrobeItem.material || 'Unknown'}
- Style: ${wardrobeItem.style || 'Unknown'}
- Category: ${wardrobeItem.category || 'Fashion'}
- Tags: ${wardrobeItem.tags?.join(', ') || 'None'}

IMPORTANT: Respond with ONLY valid JSON, no explanations or additional text.

Required JSON format:
{
  "primaryTerms": ["term1", "term2", "term3"],
  "alternativeTerms": ["alt1", "alt2"],
  "category": "Fashion",
  "keyAttributes": ["attr1", "attr2"],
  "attributesToAvoid": ["avoid1", "avoid2"]
}`;

  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 300,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 OpenAI Search Query Error:", res.status, errorText);
      throw new Error("OpenAI search query generation failed");
    }

    const json = await res.json();
    const responseText = json?.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    try {
      let cleanedResponse = responseText.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      const searchQuery = JSON.parse(cleanedResponse);
      
      if (!searchQuery.primaryTerms || !Array.isArray(searchQuery.primaryTerms)) {
        throw new Error('Invalid primaryTerms structure');
      }
      
      console.log("✅ Generated search query:", searchQuery);
      return searchQuery;
      
    } catch (parseError) {
      console.error("❌ Failed to parse search query JSON:", parseError);
      return {
        primaryTerms: [wardrobeItem.title || 'clothing item'].filter(Boolean),
        alternativeTerms: wardrobeItem.tags || [],
        category: wardrobeItem.category || 'Fashion',
        keyAttributes: [wardrobeItem.color, wardrobeItem.material, wardrobeItem.style].filter(Boolean),
        attributesToAvoid: [],
      };
    }

  } catch (error) {
    console.error("❌ generateItemSearchQuery Error:", error);
    return {
      primaryTerms: [wardrobeItem.title || 'clothing item'],
      alternativeTerms: wardrobeItem.tags || [],
      category: wardrobeItem.category || 'Fashion',
      keyAttributes: [wardrobeItem.color, wardrobeItem.material, wardrobeItem.style].filter(Boolean),
      attributesToAvoid: [],
    };
  }
}

export async function analyzeOutfitCompletion(outfitItems, occasion, season) {
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ OpenAI API key not found for outfit completion analysis");
    return {
      missingSlots: [],
      suggestions: [],
      completionConfidence: 0,
      reasoning: "AI analysis unavailable"
    };
  }

  const itemDescriptions = outfitItems.map(item => 
    `${item.title} (${item.category}) - ${item.color} ${item.material} ${item.style}`
  ).join(', ');

  const prompt = `
Analyze this outfit and identify what's missing to make it complete:

Current items: ${itemDescriptions}
Occasion: ${occasion || 'general/casual'}
Season: ${season || 'current'}

Identify:
1. missingSlots: Array of missing essential pieces (e.g., ["shoes", "jacket"])
2. suggestions: Array of specific item suggestions for each missing slot
3. completionConfidence: Score 0-100 for how complete the current outfit is
4. reasoning: Brief explanation of what's missing and why

Respond in JSON format only.`;

  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.4,
    max_tokens: 400,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 OpenAI Outfit Completion Error:", res.status, errorText);
      throw new Error("OpenAI outfit completion analysis failed");
    }

    const json = await res.json();
    const responseText = json?.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    try {
      const analysis = JSON.parse(responseText);
      console.log("✅ Outfit completion analysis:", analysis);
      return analysis;
    } catch (parseError) {
      console.error("❌ Failed to parse outfit completion JSON:", parseError);
      return {
        missingSlots: [],
        suggestions: [],
        completionConfidence: 50,
        reasoning: "Analysis available but parsing failed"
      };
    }

  } catch (error) {
    console.error("❌ analyzeOutfitCompletion Error:", error);
    return {
      missingSlots: [],
      suggestions: [],
      completionConfidence: 0,
      reasoning: "Analysis failed"
    };
  }
}

export async function evaluateStyleCompatibility(wardrobeItem, onlineItem) {
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ OpenAI API key not found for style compatibility evaluation");
    return {
      overall: 50,
      colorHarmony: 50,
      styleConsistency: 50,
      occasionAppropriate: 50,
      seasonalCompatibility: 50,
      reasoning: "AI evaluation unavailable"
    };
  }

  const prompt = `
Evaluate the style compatibility between these two items:

Existing wardrobe item: 
- Title: ${wardrobeItem.title}
- Description: ${wardrobeItem.description}
- Color: ${wardrobeItem.color}
- Material: ${wardrobeItem.material}
- Style: ${wardrobeItem.style}
- Category: ${wardrobeItem.category}

Potential new item:
- Title: ${onlineItem.title}
- Description: ${onlineItem.description}
- Category: ${onlineItem.category}

Score compatibility (0-100) based on:
1. colorHarmony: How well the colors work together
2. styleConsistency: How well the styles match
3. occasionAppropriate: Suitable for same occasions
4. seasonalCompatibility: Work for same seasons
5. overall: Overall compatibility score

Respond in JSON format only.`;

  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 300,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 OpenAI Style Compatibility Error:", res.status, errorText);
      throw new Error("OpenAI style compatibility evaluation failed");
    }

    const json = await res.json();
    const responseText = json?.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    try {
      const compatibility = JSON.parse(responseText);
      console.log("✅ Style compatibility scores:", compatibility);
      return compatibility;
    } catch (parseError) {
      console.error("❌ Failed to parse compatibility JSON:", parseError);
      return {
        overall: 50,
        colorHarmony: 50,
        styleConsistency: 50,
        occasionAppropriate: 50,
        seasonalCompatibility: 50,
        reasoning: "Evaluation available but parsing failed"
      };
    }

  } catch (error) {
    console.error("❌ evaluateStyleCompatibility Error:", error);
    return {
      overall: 50,
      colorHarmony: 50,
      styleConsistency: 50,
      occasionAppropriate: 50,
      seasonalCompatibility: 50,
      reasoning: "Evaluation failed"
    };
  }
}

export async function generateIntelligentOutfitSelection(wardrobeItems, context, styleDNA = null) {
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ No OpenAI API key found for intelligent outfit selection');
    return null;
  }

  const prompt = `You are an expert fashion stylist creating a perfectly coordinated outfit.

USER'S WARDROBE:
${wardrobeItems.map((item, index) => `
${index + 1}. ${item.title || 'Untitled'}
   - Color: ${item.color || 'not specified'}
   - Material: ${item.material || 'not specified'}
   - Style: ${item.style || 'not specified'}
   - Fit: ${item.fit || 'not specified'}
   - Category: ${item.category || 'unknown'}
   - Description: ${item.description || 'no description'}
   - Tags: ${item.tags ? item.tags.join(', ') : 'none'}
`).join('')}

OUTFIT CONTEXT:
- Occasion: ${context.occasion}
- Location: ${context.location}
- Weather: ${context.weather}${context.temperature ? ` (${context.temperature}°F)` : ''}
- Time of day: ${context.time}
- Style goal: ${context.style}

${styleDNA ? `USER'S STYLE DNA:
- Personal style: ${styleDNA.style_preferences?.aesthetic_shown || 'not specified'}
- Preferred styles: ${styleDNA.style_preferences?.preferred_styles?.join(', ') || 'not specified'}
- Color palette: ${styleDNA.style_preferences?.color_palette?.join(', ') || 'not specified'}
- Fit preferences: ${styleDNA.style_preferences?.fit_preferences || 'not specified'}
` : ''}

CRITICAL INSTRUCTIONS:
1. Select items that create a cohesive, stylish outfit
2. Ensure appropriate for the occasion and weather
3. Only select items that truly work well together
4. If wardrobe lacks essential pieces, suggest specific items to add
5. Be realistic about what makes a complete outfit

Return ONLY raw JSON in this exact format:
{
  "outfit": {
    "top": "exact title of selected top item or null",
    "bottom": "exact title of selected bottom item or null", 
    "shoes": "exact title of selected shoes or null",
    "jacket": "exact title of selected jacket/outerwear or null",
    "hat": "exact title of selected hat or null",
    "accessories": "exact title of selected accessory or null"
  },
  "reasoning": "Detailed explanation of outfit choices",
  "styleScore": 85,
  "suggestedItems": [
    {
      "category": "shoes",
      "title": "White Leather Sneakers", 
      "description": "Clean white leather sneakers",
      "color": "white",
      "material": "leather",
      "style": "minimalist sneakers",
      "fit": "true to size",
      "reason": "Complete the casual look",
      "priority": "high"
    }
  ],
  "colorPalette": ["navy", "white", "brown"],
  "formality": "casual",
  "confidence": 92,
  "completionStatus": "complete"
}`;

  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a professional fashion stylist creating cohesive, stylish outfits."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 1000,
    temperature: 0.3,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 OpenAI Intelligent Outfit Selection Error:", res.status, errorText);
      throw new Error("OpenAI intelligent outfit selection failed");
    }

    const json = await res.json();
    const responseText = json?.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    try {
      let cleanResult = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const outfitSelection = JSON.parse(cleanResult);
      console.log("✅ Intelligent outfit selection:", outfitSelection);
      return outfitSelection;
    } catch (parseError) {
      console.error("❌ Failed to parse outfit selection JSON:", parseError);
      console.error("Raw response:", responseText);
      return null;
    }

  } catch (error) {
    console.error("❌ generateIntelligentOutfitSelection Error:", error);
    return null;
  }
}