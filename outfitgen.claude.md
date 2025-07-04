# OUTFITGEN.CLAUDE.MD

## Purpose
Generate complete outfits from wardrobe data using AI analysis of clothing compatibility, style coherence, and contextual appropriateness. Combines local LLM reasoning with outfit visualization pipelines.

## Trigger Examples
- `//outfitgen` - Generate outfit for current context
- `//outfitgen casual friday` - Generate for specific occasion
- `//outfitgen --weather cold` - Weather-aware generation
- `//outfitgen --style minimalist` - Style-specific generation
- `use outfitgen.claude.md to create a formal dinner outfit`

## Claude Strategy

### Step 1: Context Analysis
- Parse occasion, weather, style preferences from user input
- Analyze current wardrobe data from `data/wardrobe.json`
- Identify available clothing categories and items
- Check for any constraints (favorites only, specific colors, etc.)

### Step 2: Compatibility Assessment
- Use AI reasoning to match colors, materials, and styles
- Apply fashion rules (formal/casual appropriateness)
- Consider seasonal and weather appropriateness
- Evaluate outfit balance and visual harmony

### Step 3: Outfit Construction
- Select primary items (tops, bottoms, shoes)
- Add complementary items (outerwear, accessories)
- Ensure all selected items exist in wardrobe
- Validate outfit completeness for occasion

### Step 4: Generation Pipeline
- Call `generateOutfit()` function in app.js
- Use PhotoRealisticVisualizer for image generation
- Apply Style DNA if user profile exists
- Generate outfit description and styling tips

### Step 5: Save & Display
- Save outfit to `data/outfits.json`
- Display in outfit modal with zoom/pan
- Add to Outfits tab for future reference
- Log generation context for analytics

## Dev Tips (Electron/JS Specific)

### Outfit Generation Pipeline
```javascript
// Use existing StyleAgent APIs
const outfitData = {
  occasion: 'casual',
  weather: 'mild',
  items: selectedItems,
  context: userContext
};

// Generate via IPC
const result = await ipcRenderer.invoke('outfit:generate', outfitData);
```

### Wardrobe Data Access
```javascript
// Get filtered items for generation
const availableItems = await WardrobeAPI.getItems({
  category: 'tops',
  season: 'spring',
  condition: 'clean'
});
```

### Style Compatibility Logic
```javascript
// Color coordination check
const isColorCompatible = (item1, item2) => {
  const neutrals = ['black', 'white', 'gray', 'beige'];
  return item1.color.some(c1 => 
    item2.color.some(c2 => 
      c1 === c2 || neutrals.includes(c1) || neutrals.includes(c2)
    )
  );
};
```

### AI Integration Points
- PromptGenerator.js - Create outfit generation prompts
- PhotoRealisticVisualizer.js - Generate outfit images
- AIAgent.js - Style reasoning and recommendations
- StyleDNA integration for personalized fitting

## Output Formatting

### Success Response
```
✨ **Generated Outfit: [Occasion]**

**Items Selected:**
• Top: [Item Name] ([Brand], [Color])
• Bottoms: [Item Name] ([Brand], [Color])  
• Shoes: [Item Name] ([Brand], [Color])
• [Additional items...]

**Style Notes:** [AI-generated styling tips]
**Weather Suitability:** [Appropriateness assessment]

🖼️ **Outfit Visualization:** [Display in modal with zoom]
💾 **Saved to Outfits:** Available in Outfits tab
```

### Error Response
```
❌ **Outfit Generation Failed**

**Issue:** [Specific problem - insufficient items, style mismatch, etc.]

**Suggestions:**
• Add more [category] items to wardrobe
• Try different occasion/style parameters
• Check if items are marked as clean/available

**Available Items:** [List relevant items in wardrobe]
```

### Debug Output
```
🔍 **Outfit Generation Debug**

**Context:** [Parsed user requirements]
**Available Items:** [Count by category]
**Selection Criteria:** [Applied filters and rules]
**Compatibility Matrix:** [Item pairing analysis]
**AI Reasoning:** [Style logic explanation]
**Generation Time:** [Performance metrics]
```