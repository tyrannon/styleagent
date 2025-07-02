const OllamaClient = require('./OllamaClient');

/**
 * PromptGenerator - Converts wardrobe items into detailed Stable Diffusion prompts
 * Uses TinyLlama to create professional, consistent prompts for photo-realistic outfit generation
 */
class PromptGenerator {
  constructor() {
    this.ollama = new OllamaClient();
    
    // Fashion photography prompt templates
    this.basePrompts = {
      flatlay: "Professional fashion photography, flat lay arrangement, clean white background, studio lighting, high resolution, commercial quality",
      model: "Professional fashion photography, model wearing outfit, neutral pose, clean background, studio lighting, high quality",
      product: "Product photography, clothing items displayed professionally, e-commerce style, clean background, detailed textures"
    };
    
    // Clothing category mappings for better descriptions
    this.categoryDescriptors = {
      tops: {
        't-shirt': 'cotton t-shirt',
        'shirt': 'button-up shirt',
        'blouse': 'elegant blouse',
        'sweater': 'knit sweater',
        'hoodie': 'casual hoodie'
      },
      bottoms: {
        'jeans': 'denim jeans',
        'pants': 'dress pants',
        'shorts': 'casual shorts',
        'skirt': 'flowing skirt',
        'dress': 'elegant dress'
      },
      shoes: {
        'sneakers': 'athletic sneakers',
        'boots': 'leather boots',
        'heels': 'dress heels',
        'flats': 'ballet flats'
      }
    };
  }

  /**
   * Generate a detailed Stable Diffusion prompt for an outfit
   * @param {Array} items - Array of clothing items from wardrobe
   * @param {Object} options - Generation options (style, background, etc.)
   * @returns {Promise<string>} Detailed prompt for Stable Diffusion
   */
  async generateOutfitPrompt(items, options = {}) {
    const style = options.style || 'flatlay';
    const occasion = options.occasion || 'casual';
    const mood = options.mood || 'professional';
    
    try {
      // Filter out null/undefined items and create structured descriptions
      const validItems = items.filter(item => item && typeof item === 'object' && item.name);
      if (validItems.length === 0) {
        return this.buildTemplatePrompt(['basic clothing items'], style, options);
      }
      
      const itemDescriptions = validItems.map(item => this.describeItem(item));
      const itemList = itemDescriptions.join(', ');
      
      // Use Style DNA appearance information if provided
      const appearancePrompt = options.appearancePrompt || '';
      
      // Use TinyLlama to enhance the prompt
      const aiContext = {
        items: itemList,
        style: style,
        occasion: occasion,
        mood: mood,
        appearance: appearancePrompt
      };
      
      const prompt = `Create a detailed, professional photography prompt for generating a realistic image of this outfit: ${itemList}. 
      
Style: ${style}
Occasion: ${occasion} 
Mood: ${mood}
${appearancePrompt ? `Appearance: ${appearancePrompt}` : ''}

The prompt should be optimized for Stable Diffusion and include:
- Specific clothing descriptions with materials and colors
- Professional photography terms
- Lighting and background specifications
- Quality and resolution keywords
${appearancePrompt ? '- Person characteristics from Style DNA profile' : ''}

Make it concise but detailed, focusing on visual accuracy for fashion photography${appearancePrompt ? ' showing a person with the specified appearance wearing the outfit' : ''}.`;

      const result = await this.ollama.chat(prompt);
      
      if (result.success) {
        // Combine AI-enhanced description with our base templates
        return this.buildFinalPrompt(result.response, style, itemDescriptions, appearancePrompt);
      } else {
        // Fallback to template-based generation
        return this.buildTemplatePrompt(itemDescriptions, style, options, appearancePrompt);
      }
      
    } catch (error) {
      console.error('Error generating outfit prompt:', error);
      // Fallback to simple template with safe item filtering
      const validItems = (items || []).filter(item => item && typeof item === 'object');
      const descriptions = validItems.length > 0 
        ? validItems.map(item => this.describeItem(item))
        : ['basic clothing items'];
      const appearancePrompt = options.appearancePrompt || '';
      return this.buildTemplatePrompt(descriptions, style, options, appearancePrompt);
    }
  }

  /**
   * Describe a single clothing item in detail
   * @param {Object} item - Clothing item from wardrobe
   * @returns {string} Detailed description
   */
  describeItem(item) {
    // Handle missing or null items
    if (!item || typeof item !== 'object') {
      return 'clothing item';
    }
    
    const colors = Array.isArray(item.color) ? item.color.join(' and ') : item.color || 'neutral';
    const materials = Array.isArray(item.material) ? item.material.join(' ') : item.material || '';
    const brand = item.brand ? `${item.brand} ` : '';
    
    // Get enhanced category description with null safety
    const categoryKey = item.category || 'clothing';
    const itemName = (item.name || 'clothing item').toLowerCase();
    let descriptor = item.name || 'clothing item';
    
    // Enhanced descriptions based on category and name
    if (this.categoryDescriptors[categoryKey]) {
      for (const [key, value] of Object.entries(this.categoryDescriptors[categoryKey])) {
        if (itemName.includes(key)) {
          descriptor = value;
          break;
        }
      }
    }
    
    return `${colors} ${materials} ${brand}${descriptor}`.trim();
  }

  /**
   * Build final prompt combining AI enhancement with templates
   * @param {string} aiResponse - Enhanced description from TinyLlama
   * @param {string} style - Photography style
   * @param {Array} itemDescriptions - Structured item descriptions
   * @param {string} appearancePrompt - Style DNA appearance information
   * @returns {string} Final Stable Diffusion prompt
   */
  buildFinalPrompt(aiResponse, style, itemDescriptions, appearancePrompt = '') {
    const baseTemplate = this.basePrompts[style] || this.basePrompts.flatlay;
    
    // Clean and structure the AI response
    const cleanResponse = aiResponse.replace(/['"]/g, '').trim();
    
    // Combine for final prompt with appearance if available
    const appearancePart = appearancePrompt ? `${appearancePrompt}, ` : '';
    const finalPrompt = `${appearancePart}${cleanResponse}, ${baseTemplate}, detailed fabric textures, fashion photography, 8k resolution, professional quality`;
    
    return this.cleanPrompt(finalPrompt);
  }

  /**
   * Build template-based prompt as fallback
   * @param {Array} itemDescriptions - Item descriptions
   * @param {string} style - Photography style  
   * @param {Object} options - Additional options
   * @param {string} appearancePrompt - Style DNA appearance information
   * @returns {string} Template-based prompt
   */
  buildTemplatePrompt(itemDescriptions, style, options, appearancePrompt = '') {
    const baseTemplate = this.basePrompts[style] || this.basePrompts.flatlay;
    const itemList = itemDescriptions.join(', ');
    
    let styleModifiers = '';
    if (options.occasion === 'formal') {
      styleModifiers += ', elegant composition, sophisticated lighting';
    } else if (options.occasion === 'casual') {
      styleModifiers += ', relaxed arrangement, natural lighting';
    }
    
    // Add appearance information if available
    const appearancePart = appearancePrompt ? `${appearancePrompt}, ` : '';
    const finalPrompt = `${appearancePart}${baseTemplate}, outfit featuring ${itemList}${styleModifiers}, detailed textures, high quality fashion photography, 8k resolution`;
    
    return this.cleanPrompt(finalPrompt);
  }

  /**
   * Clean and optimize prompt for Stable Diffusion
   * @param {string} prompt - Raw prompt
   * @returns {string} Cleaned prompt
   */
  cleanPrompt(prompt) {
    return prompt
      .replace(/\s+/g, ' ') // Remove extra spaces
      .replace(/,\s*,/g, ',') // Remove double commas
      .replace(/\.$/, '') // Remove trailing period
      .trim();
  }

  /**
   * Generate negative prompt to improve image quality
   * @param {Object} options - Generation options
   * @returns {string} Negative prompt
   */
  generateNegativePrompt(options = {}) {
    const baseNegative = [
      'blurry', 'low quality', 'distorted', 'deformed',
      'bad anatomy', 'extra limbs', 'watermark', 'text',
      'signature', 'username', 'low resolution', 'pixelated'
    ];
    
    // Add fashion-specific negative terms
    const fashionNegative = [
      'mismatched colors', 'wrinkled clothing', 'stains',
      'torn fabric', 'ill-fitting clothes', 'unprofessional'
    ];
    
    return [...baseNegative, ...fashionNegative].join(', ');
  }

  /**
   * Get Style DNA appearance information for prompt enhancement
   * @returns {Promise<string>} Appearance prompt additions
   */
  async getStyleDNAAppearance() {
    try {
      // This will be called from Node.js context (main process)
      // We need to use a different approach since we can't directly access StyleDNAManager
      // The StyleDNAManager will provide this via IPC in the main process
      
      // For now, return empty string - this will be enhanced when called from main process
      // The main process will inject appearance information before calling this
      return '';
    } catch (error) {
      console.error('Error getting Style DNA appearance:', error);
      return '';
    }
  }

  /**
   * Generate prompts for different outfit visualization styles
   * @param {Array} items - Clothing items
   * @param {Object} options - Style options
   * @returns {Promise<Object>} Multiple prompt variations
   */
  async generatePromptVariations(items, options = {}) {
    const variations = {};
    
    const styles = ['flatlay', 'model', 'product'];
    
    for (const style of styles) {
      variations[style] = await this.generateOutfitPrompt(items, {
        ...options,
        style: style
      });
    }
    
    variations.negative = this.generateNegativePrompt(options);
    
    return variations;
  }
}

module.exports = PromptGenerator;