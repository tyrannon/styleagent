const PromptGenerator = require('./PromptGenerator');
const ImageGenerator = require('./ImageGenerator');

/**
 * PhotoRealisticVisualizer - High-level orchestrator for photo-realistic outfit generation
 * Combines TinyLlama prompt generation with Stable Diffusion image generation
 */
class PhotoRealisticVisualizer {
  constructor(styleDNAManager = null) {
    this.promptGenerator = new PromptGenerator();
    this.imageGenerator = new ImageGenerator();
    this.styleDNAManager = styleDNAManager;
    this.isAvailable = false;
    this.lastError = null;
  }

  /**
   * Initialize and check availability of all components
   * @returns {Promise<Object>} Initialization result
   */
  async initialize() {
    try {
      console.log('🎨 Initializing PhotoRealistic Outfit Visualizer...');
      
      // Check if Stable Diffusion API is available
      const sdStatus = await this.imageGenerator.checkAvailability();
      
      if (sdStatus.available) {
        this.isAvailable = true;
        console.log('✅ Stable Diffusion API connected successfully');
        
        // Log the configured model
        const config = this.imageGenerator.getConfig();
        console.log(`📦 Using model: ${config.defaultParams.model_id}`);
        
        return {
          success: true,
          available: true,
          message: 'PhotoRealistic Visualizer ready',
          details: sdStatus
        };
      } else {
        this.isAvailable = false;
        this.lastError = sdStatus.error;
        
        return {
          success: false,
          available: false,
          error: sdStatus.error,
          suggestion: sdStatus.suggestion || 'Please install and run Automatic1111 WebUI with --api flag'
        };
      }
      
    } catch (error) {
      console.error('Error initializing PhotoRealistic Visualizer:', error);
      this.isAvailable = false;
      this.lastError = error.message;
      
      return {
        success: false,
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a single photo-realistic outfit image
   * @param {Array} items - Clothing items from wardrobe
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateOutfitImage(items, options = {}) {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'PhotoRealistic Visualizer not available',
        lastError: this.lastError,
        fallback: 'svg' // Suggest falling back to SVG
      };
    }

    try {
      console.log('🎨 Generating photo-realistic outfit for', items.length, 'items...');
      
      // Get Style DNA appearance information if available
      let appearancePrompt = '';
      if (this.styleDNAManager) {
        appearancePrompt = this.styleDNAManager.generateAppearancePrompt();
        if (appearancePrompt) {
          console.log('🧬 Using Style DNA appearance for personalized generation');
        }
      }
      
      // Step 1: Generate intelligent prompt using TinyLlama with Style DNA
      const style = options.style || 'flatlay';
      const prompt = await this.promptGenerator.generateOutfitPrompt(items, {
        style: style,
        occasion: options.occasion || 'casual',
        mood: options.mood || 'professional',
        appearancePrompt: appearancePrompt
      });
      
      console.log('📝 Generated prompt:', prompt.substring(0, 100) + '...');
      
      // Step 2: Generate negative prompt for better quality
      const negativePrompt = this.promptGenerator.generateNegativePrompt(options);
      
      // Step 3: Generate image using Stable Diffusion
      const imageResult = await this.imageGenerator.generateOutfitImage(prompt, {
        negativePrompt: negativePrompt,
        width: options.width || 512,
        height: options.height || 512,
        steps: options.steps || 20,
        cfgScale: options.cfgScale || 7,
        saveLocal: options.saveLocal || false,
        filename: options.filename
      });
      
      if (imageResult.success) {
        console.log('✅ Photo-realistic outfit generated successfully');
        
        return {
          success: true,
          image: imageResult.image, // Data URL for immediate use
          base64: imageResult.base64,
          prompt: prompt,
          negativePrompt: negativePrompt,
          savedPath: imageResult.savedPath,
          parameters: imageResult.parameters,
          metadata: {
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              color: item.color
            })),
            style: style,
            generatedAt: new Date().toISOString(),
            model: 'stable-diffusion'
          }
        };
      } else {
        return {
          success: false,
          error: imageResult.error,
          suggestion: imageResult.suggestion,
          fallback: 'svg'
        };
      }
      
    } catch (error) {
      console.error('Error in photo-realistic generation:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: 'svg'
      };
    }
  }

  /**
   * Generate multiple style variations of an outfit
   * @param {Array} items - Clothing items
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Multiple style variations
   */
  async generateOutfitVariations(items, options = {}) {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'PhotoRealistic Visualizer not available',
        fallback: 'svg'
      };
    }

    try {
      console.log('🎨 Generating multiple style variations...');
      
      // Step 1: Generate prompts for all styles
      const prompts = await this.promptGenerator.generatePromptVariations(items, options);
      
      // Step 2: Generate images for each style
      const results = await this.imageGenerator.generateOutfitVariations(prompts, {
        width: options.width || 512,
        height: options.height || 512,
        saveLocal: options.saveLocal || false
      });
      
      if (results.success) {
        console.log('✅ Generated', Object.keys(results.variations).length, 'style variations');
        
        // Add metadata to each variation
        for (const [style, result] of Object.entries(results.variations)) {
          result.metadata = {
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              color: item.color
            })),
            style: style,
            generatedAt: new Date().toISOString(),
            model: 'stable-diffusion'
          };
        }
        
        return {
          success: true,
          variations: results.variations,
          errors: results.errors,
          prompts: prompts
        };
      } else {
        return {
          success: false,
          error: 'Failed to generate variations',
          errors: results.errors,
          fallback: 'svg'
        };
      }
      
    } catch (error) {
      console.error('Error generating outfit variations:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: 'svg'
      };
    }
  }

  /**
   * Generate outfit preview with fallback to SVG
   * @param {Array} items - Clothing items
   * @param {string} size - Size preference ('small' or 'large')
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated preview with fallback
   */
  async generateOutfitPreview(items, size = 'large', options = {}) {
    // Try photo-realistic generation first
    if (this.isAvailable) {
      const dimensions = size === 'small' ? { width: 256, height: 256 } : { width: 512, height: 512 };
      
      const result = await this.generateOutfitImage(items, {
        ...options,
        ...dimensions,
        style: 'flatlay' // Default to flatlay for previews
      });
      
      if (result.success) {
        return result;
      }
      
      console.log('📷 Photo-realistic generation failed, falling back to SVG...');
    }
    
    // Fallback to SVG generation
    const OutfitVisualizer = require('./OutfitVisualizer');
    const svgVisualizer = new OutfitVisualizer();
    
    const svgString = svgVisualizer.generateOutfitPreview(items, size);
    const dataURL = svgVisualizer.generateDataURL(svgString);
    
    return {
      success: true,
      image: dataURL,
      svg: svgString,
      fallback: true,
      type: 'svg',
      metadata: {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          color: item.color
        })),
        style: 'svg',
        generatedAt: new Date().toISOString(),
        model: 'svg-renderer'
      }
    };
  }

  /**
   * Get available models from Stable Diffusion
   * @returns {Promise<Object>} Available models
   */
  async getAvailableModels() {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'PhotoRealistic Visualizer not available',
        models: []
      };
    }
    
    return await this.imageGenerator.getAvailableModels();
  }

  /**
   * Set the Stable Diffusion model to use
   * @param {string} modelName - Model name
   * @returns {Promise<Object>} Result of model change
   */
  async setModel(modelName) {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'PhotoRealistic Visualizer not available'
      };
    }
    
    return await this.imageGenerator.setModel(modelName);
  }

  /**
   * Get current status and configuration
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      available: this.isAvailable,
      lastError: this.lastError,
      promptGenerator: !!this.promptGenerator,
      imageGenerator: !!this.imageGenerator,
      config: this.imageGenerator.getConfig()
    };
  }

  /**
   * Configure the visualizer
   * @param {Object} config - Configuration options
   */
  configure(config) {
    if (config.stableDiffusion) {
      this.imageGenerator.configure(config.stableDiffusion);
    }
    
    // Re-initialize if configuration changed
    if (config.reinitialize) {
      return this.initialize();
    }
  }
}

module.exports = PhotoRealisticVisualizer;