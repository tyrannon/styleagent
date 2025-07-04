// Enhanced OpenAI Client for StyleAgent with improved image generation prompts
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('⚠️ OPENAI_API_KEY not found in environment variables');
}

// Enhanced prompt templates for better image quality
const PROMPT_TEMPLATES = {
  fashionPhoto: {
    quality: `CRITICAL QUALITY REQUIREMENTS:
- Ultra-realistic human face with natural, beautiful features
- Clear, well-defined facial features with natural proportions
- Natural skin texture and tone, no distortions or uncanny valley effects
- Professional fashion model appearance
- High-resolution, sharp focus throughout the image`,
    
    composition: `COMPOSITION AND POSE:
- Full body shot from head to toe, nothing cropped
- Model standing in a confident, natural fashion pose
- Hands and feet fully visible and naturally positioned
- Professional fashion photography lighting
- Clean, minimal background (white or light gray)
- Model centered in frame with proper spacing`,
    
    avoid: `IMPORTANT - AVOID THESE ISSUES:
- NO distorted or unrealistic faces
- NO demon eyes or unnatural eye colors
- NO missing or extra body parts
- NO blurred or cropped body parts
- NO unnatural poses or body positions
- NO dark or busy backgrounds
- NO multiple people in the image`,
    
    style: `PHOTOGRAPHY STYLE:
- Professional fashion catalog photography
- Bright, even lighting that shows true colors
- Similar to Vogue, Harper's Bazaar editorial style
- Clean, commercial aesthetic
- Focus on outfit details and overall styling`
  }
};

// Helper function to build enhanced prompts
function buildEnhancedPrompt(basePrompt, options = {}) {
  const { includePersonalization = false, styleDNA = null, weatherContext = null } = options;
  
  let enhancedPrompt = `${PROMPT_TEMPLATES.fashionPhoto.quality}\n\n`;
  enhancedPrompt += `${basePrompt}\n\n`;
  enhancedPrompt += `${PROMPT_TEMPLATES.fashionPhoto.composition}\n\n`;
  enhancedPrompt += `${PROMPT_TEMPLATES.fashionPhoto.avoid}\n\n`;
  enhancedPrompt += `${PROMPT_TEMPLATES.fashionPhoto.style}`;
  
  return enhancedPrompt;
}

export async function describeClothingItem(base64Image) {
  const prompt = `
You are an expert fashion stylist analyzing clothing items. Examine this image carefully and provide a detailed analysis focusing on accuracy for outfit generation.

Pay special attention to:
- EXACT colors (be specific: "navy blue", "cream white", "burgundy", not just "blue" or "white")
- Material/texture (cotton, denim, silk, wool, leather, etc.)
- Specific style details (collar type, sleeve length, cut, fit)
- Patterns (solid, striped, plaid, floral, etc.)
- Any unique design elements

Return ONLY raw JSON in this exact format:
{
  "title": "Specific item name with color (e.g., 'Navy Blue Denim Jacket', 'Cream Silk Blouse')",
  "description": "Detailed description including exact color, material, style details, and how it fits/drapes. Be specific about visual characteristics that would help recreate this item.",
  "tags": ["exact_color", "material_type", "style_category", "fit_type", "occasion", "pattern_if_any"],
  "color": "Primary color of the item (be very specific)",
  "material": "Primary material/fabric",
  "style": "Specific style category (e.g., 'blazer', 'crop top', 'high-waisted jeans')",
  "fit": "How it fits (e.g., 'slim fit', 'oversized', 'tailored', 'relaxed')"
}`;

  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
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
      console.error("🚨 OpenAI API Error:", res.status, errorText);
      throw new Error("OpenAI request failed");
    }

    const json = await res.json();
    console.log("✅ OpenAI response:", json);
    return json?.choices?.[0]?.message?.content ?? "No description received";
  } catch (error) {
    console.error("❌ describeClothingItem Error:", error);
    throw error;
  }
}

export async function generateOutfitImage(clothingItems) {
  const detailedDescriptions = clothingItems.map(item => {
    if (item.color && item.material && item.style) {
      return `${item.color} ${item.material} ${item.style} with ${item.fit} fit - ${item.description}`;
    }
    return item.description || item;
  });

  const basePrompt = `Create a stunning fashion photograph featuring ONE beautiful fashion model wearing this complete outfit:

OUTFIT DETAILS:
${detailedDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

MODEL SPECIFICATIONS:
- ONE single person only
- Professional fashion model with beautiful, natural face
- Clear, attractive facial features with natural expression
- Confident, elegant pose typical of fashion catalogs
- Full body visible from head to toe`;

  const outfitPrompt = buildEnhancedPrompt(basePrompt);

  const payload = {
    model: "dall-e-3",
    prompt: outfitPrompt,
    n: 1,
    size: "1024x1792", // Taller format better for full body fashion shots
    quality: "hd", // Use HD quality for better faces
    style: "natural" // Natural style tends to produce more realistic humans
  };

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 OpenAI Image API Error:", res.status, errorText);
      throw new Error("OpenAI image generation failed");
    }

    const json = await res.json();
    console.log("✅ OpenAI image response:", json);
    
    return json?.data?.[0]?.url ?? null;
  } catch (error) {
    console.error("❌ generateOutfitImage Error:", error);
    throw error;
  }
}

export async function analyzePersonalStyle(base64Image) {
  const prompt = `
You are a fashion consultant analyzing clothing style preferences and general aesthetic elements for outfit coordination purposes. Focus ONLY on fashion styling aspects.

Analyze these STYLING ELEMENTS from the photo:
- Hair styling choices that influence fashion decisions
- General body proportions for clothing fit recommendations
- Color coordination preferences based on overall aesthetic
- Fashion style category and aesthetic preferences shown
- Styling elements that complement the overall look

Return styling recommendations in this JSON format:

{
  "appearance": {
    "hair_color": "general color family (warm brown, cool blonde, dark, etc.)",
    "hair_length": "general length category (short, medium, long)",
    "hair_texture": "general texture (straight, wavy, curly)",
    "hair_style": "specific style (bob, layers, ponytail, etc.)",
    "build": "general styling category (petite, average, tall, athletic, etc.)",
    "height_impression": "general height category for styling",
    "complexion": "general tone for color coordination (warm, cool, neutral)",
    "facial_structure": "general face shape for accessory recommendations",
    "eye_color": "general color for coordination",
    "approximate_age_range": "general style demographic (20s, 30s, etc.)",
    "overall_vibe": "style personality (classic, edgy, romantic, etc.)"
  },
  "style_preferences": {
    "aesthetic_shown": "current style aesthetic visible",
    "preferred_styles": ["complementary fashion styles"],
    "color_palette": ["color families that work well"],
    "fit_preferences": "clothing fits that work well",
    "styling_notes": "general fashion coordination notes"
  },
  "outfit_coordination": "Guidelines for creating coordinated looks",
  "fashion_prompt": "Detailed description for generating fashion images"
}`;

  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a fashion styling consultant who provides clothing coordination advice based on style aesthetics."
      },
      {
        role: "user", 
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 600,
    temperature: 0.5,
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
      console.error("🚨 OpenAI Style DNA Error:", res.status, errorText);
      throw new Error("OpenAI style analysis failed");
    }

    const json = await res.json();
    console.log("✅ Style DNA response:", json);
    return json?.choices?.[0]?.message?.content ?? "No analysis received";
  } catch (error) {
    console.error("❌ analyzePersonalStyle Error:", error);
    throw error;
  }
}

export async function generatePersonalizedOutfitImage(clothingItems, styleDNA = null, gender = null) {
  const detailedDescriptions = clothingItems.map(item => {
    if (item.color && item.material && item.style) {
      return `${item.color} ${item.material} ${item.style} with ${item.fit} fit`;
    }
    return item.description || item;
  });

  let basePrompt = `Create a stunning fashion photograph featuring ONE beautiful fashion model wearing this outfit:

OUTFIT DETAILS:
${detailedDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

MODEL SPECIFICATIONS:
- ONE single person only
- Professional fashion model with beautiful, natural face
- Clear, attractive facial features
- Confident, elegant fashion pose
- Full body visible from head to toe`;

  if (gender) {
    const genderText = gender === 'male' ? 'handsome male' : 
                      gender === 'female' ? 'beautiful female' : 
                      'stylish';
    basePrompt += `\n- ${genderText} model`;
  }

  if (styleDNA && styleDNA.appearance) {
    basePrompt += `

STYLING DETAILS:
- ${styleDNA.appearance.hair_color} ${styleDNA.appearance.hair_length} ${styleDNA.appearance.hair_texture} hair
- ${styleDNA.appearance.build} build
- ${styleDNA.appearance.complexion} skin tone
- ${styleDNA.appearance.overall_vibe} aesthetic
- Style that complements ${styleDNA.appearance.age_range} fashion`;
  }

  const personalizedPrompt = buildEnhancedPrompt(basePrompt, { 
    includePersonalization: true, 
    styleDNA 
  });

  const payload = {
    model: "dall-e-3",
    prompt: personalizedPrompt,
    n: 1,
    size: "1024x1792",
    quality: "hd",
    style: "natural"
  };

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 OpenAI Personalized Image Error:", res.status, errorText);
      throw new Error("OpenAI personalized image generation failed");
    }

    const json = await res.json();
    console.log("✅ Personalized outfit response:", json);
    
    return json?.data?.[0]?.url ?? null;
  } catch (error) {
    console.error("❌ generatePersonalizedOutfitImage Error:", error);
    throw error;
  }
}

export async function generateWeatherBasedOutfit(clothingItems, styleDNA = null, weatherData = null, gender = null) {
  const detailedDescriptions = clothingItems.map(item => {
    if (item.color && item.material && item.style) {
      return `${item.color} ${item.material} ${item.style} with ${item.fit} fit`;
    }
    return item.description || item;
  });

  let weatherContext = "";
  if (weatherData) {
    weatherContext = `
WEATHER CONTEXT:
- Temperature: ${weatherData.temperature}°F
- Conditions: ${weatherData.description}
- The outfit is perfectly suited for this weather
- Model appears comfortable and stylish in these conditions`;
  }

  let basePrompt = `Create a stunning fashion photograph featuring ONE beautiful fashion model wearing this weather-appropriate outfit:

OUTFIT DETAILS:
${detailedDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

${weatherContext}

MODEL SPECIFICATIONS:
- ONE single person only
- Professional fashion model with beautiful, natural face
- Clear, attractive facial features
- Confident pose showing the outfit works for the weather
- Full body visible from head to toe`;

  if (gender) {
    const genderText = gender === 'male' ? 'handsome male' : 
                      gender === 'female' ? 'beautiful female' : 
                      'stylish';
    basePrompt += `\n- ${genderText} model`;
  }

  if (styleDNA && styleDNA.appearance) {
    basePrompt += `

STYLING PREFERENCES:
- ${styleDNA.appearance.hair_color} ${styleDNA.appearance.hair_length} hair
- ${styleDNA.appearance.build} build
- ${styleDNA.style_preferences?.aesthetic_shown || 'modern'} style aesthetic`;
  }

  const weatherOutfitPrompt = buildEnhancedPrompt(basePrompt, { 
    weatherContext,
    styleDNA 
  });

  const payload = {
    model: "dall-e-3",
    prompt: weatherOutfitPrompt,
    n: 1,
    size: "1024x1792",
    quality: "hd",
    style: "natural"
  };

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 OpenAI Weather Outfit Error:", res.status, errorText);
      throw new Error("OpenAI weather outfit generation failed");
    }

    const json = await res.json();
    console.log("✅ Weather outfit response:", json);
    
    return json?.data?.[0]?.url ?? null;
  } catch (error) {
    console.error("❌ generateWeatherBasedOutfit Error:", error);
    throw error;
  }
}

export async function generateClothingItemImage(item) {
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ OpenAI API key not found for clothing item image generation");
    return null;
  }

  console.log('🎨 Generating image for clothing item:', item.title || item.description);

  const itemPrompt = `Create a high-quality product photograph of this clothing item:

ITEM DETAILS:
- ${item.title || item.description}
- Color: ${item.color || 'as described'}
- Material: ${item.material || 'as appropriate'}
- Style: ${item.style || 'as described'}

PHOTOGRAPHY REQUIREMENTS:
- Clean white background
- Professional product photography lighting
- Item displayed on invisible mannequin or laid flat
- Crystal clear detail and texture
- True-to-life colors
- Commercial e-commerce style
- NO people, just the clothing item
- Sharp focus throughout

Style: Premium e-commerce product photography`;

  const payload = {
    model: "dall-e-3",
    prompt: itemPrompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
    style: "natural"
  };

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 OpenAI Clothing Item Image Error:", res.status, errorText);
      throw new Error("OpenAI clothing item image generation failed");
    }

    const json = await res.json();
    console.log("✅ Clothing item image generated successfully");
    
    return json?.data?.[0]?.url ?? null;
  } catch (error) {
    console.error("❌ generateClothingItemImage Error:", error);
    throw error;
  }
}

// Export all style advice functions from the original file
export { 
  generateItemSearchQuery,
  analyzeOutfitCompletion,
  evaluateStyleCompatibility,
  generateIntelligentOutfitSelection
} from './styleAdviceAI.js';