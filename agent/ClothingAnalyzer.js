const OllamaClient = require('./OllamaClient');
const ImageStorage = require('../data/ImageStorage');
const { v4: uuidv4 } = require('uuid');

/**
 * ClothingAnalyzer - AI-powered clothing item analysis from photos
 * Uses TinyLlama/LLaVA for automatic categorization, color detection, and metadata extraction
 */
class ClothingAnalyzer {
  constructor() {
    this.ollama = new OllamaClient();
    this.imageStorage = new ImageStorage();
    
    // Category mapping and detection patterns
    this.categoryKeywords = {
      tops: ['shirt', 't-shirt', 'tshirt', 'blouse', 'sweater', 'hoodie', 'tank', 'cardigan', 'blazer', 'jacket', 'coat'],
      bottoms: ['pants', 'jeans', 'trousers', 'shorts', 'skirt', 'dress', 'leggings', 'joggers'],
      shoes: ['shoes', 'sneakers', 'boots', 'heels', 'flats', 'sandals', 'loafers', 'pumps'],
      accessories: ['bag', 'purse', 'belt', 'hat', 'scarf', 'jewelry', 'watch', 'necklace', 'bracelet'],
      outerwear: ['coat', 'jacket', 'blazer', 'hoodie', 'cardigan', 'vest', 'parka'],
      underwear: ['underwear', 'bra', 'panties', 'boxers', 'briefs', 'lingerie'],
      sleepwear: ['pajamas', 'nightgown', 'sleepwear', 'robe'],
      activewear: ['workout', 'gym', 'athletic', 'sports bra', 'leggings', 'activewear']
    };
    
    // Color detection patterns
    this.colorKeywords = [
      'black', 'white', 'gray', 'grey', 'brown', 'beige', 'tan', 'cream', 'ivory',
      'red', 'pink', 'orange', 'yellow', 'gold', 
      'green', 'olive', 'mint', 'teal', 'turquoise',
      'blue', 'navy', 'royal', 'sky', 'denim',
      'purple', 'violet', 'lavender', 'magenta',
      'multicolor', 'striped', 'plaid', 'patterned', 'floral'
    ];
    
    // Material/fabric keywords
    this.materialKeywords = [
      'cotton', 'denim', 'silk', 'wool', 'cashmere', 'linen', 'polyester', 
      'leather', 'suede', 'velvet', 'satin', 'chiffon', 'lace', 'knit',
      'jersey', 'flannel', 'tweed', 'corduroy', 'canvas'
    ];
  }

  /**
   * Analyze a single clothing item from an image
   * @param {string} imagePath - Path to the image file
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result with detected attributes
   */
  async analyzeClothingImage(imagePath, options = {}) {
    try {
      console.log('🔍 Analyzing clothing image:', imagePath);
      
      // Read image and convert to base64 for AI analysis
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(imagePath)) {
        throw new Error('Image file not found');
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const fileExtension = path.extname(imagePath).toLowerCase();
      const mimeType = this.getMimeType(fileExtension);
      
      // Create analysis prompt for the AI
      const analysisPrompt = this.createAnalysisPrompt();
      
      // Use vision-capable model if available, otherwise fall back to text analysis
      let analysisResult;
      try {
        // Try with vision model first (moondream is available)
        analysisResult = await this.ollama.analyzeImage(base64Image, analysisPrompt, {
          model: options.model || 'moondream',
          mimeType: mimeType
        });
      } catch (visionError) {
        console.error('❌ Vision analysis failed:', visionError.message);
        console.log('📝 Falling back to text-based analysis...');
        // Fallback to text-only analysis with filename and basic detection
        analysisResult = await this.analyzeWithTextOnly(imagePath, options);
      }
      
      if (analysisResult.success) {
        // Parse and structure the AI response
        const structuredData = this.parseAnalysisResponse(analysisResult.response);
        
        // Generate ID first so we can use it for image storage
        if (!structuredData.id) {
          structuredData.id = this.generateItemId(structuredData);
        }
        
        // Store the image and get its storage info
        const imageResult = await this.imageStorage.storeImage(imagePath, structuredData.id);
        
        // Add metadata including image storage info
        structuredData.metadata = {
          analyzedAt: new Date().toISOString(),
          originalImagePath: imagePath,
          imageSize: imageBuffer.length,
          analysisMethod: analysisResult.visionUsed ? 'vision' : 'text',
          confidence: structuredData.confidence || 0.7
        };
        
        // Add image data if storage was successful
        if (imageResult.success) {
          structuredData.image = imageResult.dataURL; // Primary field for UI display
          structuredData.imageUrl = imageResult.dataURL; // Alternative field
          structuredData.imagePath = imageResult.relativePath; // For backwards compatibility
          structuredData.metadata.imageStored = true;
          structuredData.metadata.storedImagePath = imageResult.storedPath;
          console.log('✅ Image stored and attached to item:', structuredData.id);
        } else {
          structuredData.metadata.imageStored = false;
          structuredData.metadata.imageError = imageResult.error;
          console.log('❌ Image storage failed:', imageResult.error);
        }
        
        console.log('✅ Analysis complete:', structuredData.name || 'Unknown item');
        
        return {
          success: true,
          item: structuredData
        };
      } else {
        throw new Error(analysisResult.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Error analyzing clothing image:', error);
      
      // Return basic fallback data
      const fallbackItem = this.createFallbackItem(imagePath);
      
      return {
        success: false,
        error: error.message,
        item: fallbackItem
      };
    }
  }

  /**
   * Analyze multiple clothing images in batch
   * @param {Array} imagePaths - Array of image file paths
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Batch analysis results
   */
  async analyzeMultipleImages(imagePaths, options = {}) {
    console.log('🔍 Starting batch analysis of', imagePaths.length, 'images...');
    
    const results = {
      success: true,
      items: [],
      errors: [],
      stats: {
        total: imagePaths.length,
        successful: 0,
        failed: 0,
        startTime: Date.now()
      }
    };
    
    // Process images with progress tracking
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      
      try {
        console.log(`📸 Analyzing image ${i + 1}/${imagePaths.length}: ${imagePath}`);
        
        // Report progress if callback provided
        if (options.onProgress) {
          options.onProgress({
            current: i + 1,
            total: imagePaths.length,
            imagePath: imagePath,
            percentage: Math.round(((i + 1) / imagePaths.length) * 100)
          });
        }
        
        const analysisResult = await this.analyzeClothingImage(imagePath, options);
        
        if (analysisResult.success) {
          results.items.push(analysisResult.item);
          results.stats.successful++;
        } else {
          results.errors.push({
            imagePath: imagePath,
            error: analysisResult.error,
            fallbackItem: analysisResult.item
          });
          results.stats.failed++;
          
          // Add fallback item if available
          if (analysisResult.item) {
            results.items.push(analysisResult.item);
          }
        }
        
        // Small delay to prevent overwhelming the AI
        await this.delay(500);
        
      } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error);
        results.errors.push({
          imagePath: imagePath,
          error: error.message
        });
        results.stats.failed++;
      }
    }
    
    results.stats.endTime = Date.now();
    results.stats.duration = results.stats.endTime - results.stats.startTime;
    
    console.log(`✅ Batch analysis complete: ${results.stats.successful} successful, ${results.stats.failed} failed`);
    
    return results;
  }

  /**
   * Create analysis prompt for AI
   * @returns {string} Structured prompt for clothing analysis
   */
  createAnalysisPrompt() {
    return `Analyze this clothing item image. Look at the most prominent/central piece if multiple items are visible.

Examine the clothing carefully and provide information in this EXACT JSON format:

{
  "name": "descriptive name (e.g., 'Navy Blue Cotton T-Shirt')",
  "category": "one of: tops, bottoms, shoes, accessories, outerwear, underwear, sleepwear, activewear",
  "colors": ["primary color", "secondary color if visible"],
  "materials": ["material type from visual clues"],
  "brand": "brand name if any logo/label visible",
  "style": "style type (casual, formal, sporty, vintage, etc.)",
  "pattern": "pattern type (solid, striped, plaid, floral, polka-dot, etc.)",
  "description": "detailed visual description",
  "confidence": 0.8
}

ANALYSIS GUIDELINES:
- Focus on the largest/most central clothing item
- Colors: Be specific (navy blue, burgundy, forest green, charcoal gray, etc.)
- Materials: Look at texture and fabric appearance (cotton, denim, wool, polyester, silk, leather, etc.)
- Brands: Check for visible logos, labels, or brand names
- Category: Must be exactly one of the listed categories
- Pattern: Describe any patterns or prints visible
- Return ONLY the JSON object with no additional text

Analyze fabric texture, colors, and any visible details carefully.`;
  }

  /**
   * Parse AI analysis response into structured data
   * @param {string} response - Raw AI response
   * @returns {Object} Structured item data
   */
  parseAnalysisResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Validate and clean the data
        return this.validateAndCleanItemData(parsedData);
      } else {
        // Parse as text if JSON not found
        return this.parseTextResponse(response);
      }
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return this.parseTextResponse(response);
    }
  }

  /**
   * Validate and clean parsed item data
   * @param {Object} data - Raw parsed data
   * @returns {Object} Cleaned and validated data
   */
  validateAndCleanItemData(data) {
    // Ensure required fields
    const cleanData = {
      name: data.name || 'Unknown Item',
      category: this.validateCategory(data.category) || 'tops',
      color: Array.isArray(data.colors) ? data.colors : [data.colors || 'unknown'],
      material: Array.isArray(data.materials) ? data.materials : [data.materials || 'unknown'],
      brand: data.brand || '',
      style: data.style || 'casual',
      pattern: data.pattern || 'solid',
      description: data.description || '',
      confidence: Math.min(Math.max(data.confidence || 0.5, 0), 1),
      size: '',
      laundryStatus: 'clean',
      wearCount: 0,
      lastWorn: null,
      isFavorite: false,
      tags: [],
      notes: ''
    };
    
    // Generate ID if not already present
    if (!cleanData.id) {
      cleanData.id = this.generateItemId(cleanData);
    }
    
    return cleanData;
  }

  /**
   * Validate category against known categories
   * @param {string} category - Category to validate
   * @returns {string} Valid category
   */
  validateCategory(category) {
    const validCategories = Object.keys(this.categoryKeywords);
    const lowerCategory = (category || '').toLowerCase();
    
    // Direct match
    if (validCategories.includes(lowerCategory)) {
      return lowerCategory;
    }
    
    // Keyword matching
    for (const [validCategory, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => lowerCategory.includes(keyword))) {
        return validCategory;
      }
    }
    
    return 'tops'; // Default fallback
  }

  /**
   * Fallback text-only analysis when vision is not available
   * @param {string} imagePath - Image file path
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeWithTextOnly(imagePath, options = {}) {
    const path = require('path');
    const filename = path.basename(imagePath, path.extname(imagePath));
    
    // Use filename and basic rules for analysis
    const prompt = `Based on this filename "${filename}", identify what type of clothing item this might be and extract details:

Analyze and respond in JSON format:
{
  "name": "item name based on filename",
  "category": "best guess category",
  "colors": ["colors if mentioned in filename"],
  "materials": ["materials if mentioned"],
  "confidence": 0.3
}

Categories: tops, bottoms, shoes, accessories, outerwear, underwear, sleepwear, activewear`;

    const result = await this.ollama.chat(prompt);
    
    if (result.success) {
      return {
        success: true,
        response: result.response,
        visionUsed: false
      };
    } else {
      throw new Error('Text analysis failed');
    }
  }

  /**
   * Create fallback item data when analysis fails
   * @param {string} imagePath - Image file path
   * @returns {Object} Basic item data
   */
  createFallbackItem(imagePath) {
    const path = require('path');
    const filename = path.basename(imagePath, path.extname(imagePath));
    
    return {
      id: this.generateFallbackId(),
      name: filename.replace(/[_-]/g, ' ') || 'Unknown Item',
      category: 'tops',
      color: ['unknown'],
      material: ['unknown'],
      brand: '',
      style: 'casual',
      pattern: 'solid',
      description: 'Imported from image',
      size: '',
      laundryStatus: 'clean',
      wearCount: 0,
      lastWorn: null,
      isFavorite: false,
      tags: ['imported'],
      notes: 'Requires manual review',
      confidence: 0.1,
      metadata: {
        analyzedAt: new Date().toISOString(),
        imagePath: imagePath,
        analysisMethod: 'fallback',
        needsReview: true
      }
    };
  }

  /**
   * Parse text response when JSON parsing fails
   * @param {string} response - AI text response
   * @returns {Object} Extracted item data
   */
  parseTextResponse(response) {
    // Basic text parsing for key information
    const lowerResponse = response.toLowerCase();
    
    // Extract category
    let category = 'tops';
    for (const [cat, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => lowerResponse.includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    // Extract colors
    const foundColors = this.colorKeywords.filter(color => 
      lowerResponse.includes(color.toLowerCase())
    );
    
    // Extract materials
    const foundMaterials = this.materialKeywords.filter(material => 
      lowerResponse.includes(material.toLowerCase())
    );
    
    return {
      name: 'Clothing Item',
      category: category,
      color: foundColors.length > 0 ? foundColors : ['unknown'],
      material: foundMaterials.length > 0 ? foundMaterials : ['unknown'],
      brand: '',
      style: 'casual',
      pattern: 'solid',
      description: response.substring(0, 100),
      confidence: 0.4
    };
  }

  /**
   * Get MIME type from file extension
   * @param {string} extension - File extension
   * @returns {string} MIME type
   */
  getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp'
    };
    
    return mimeTypes[extension] || 'image/jpeg';
  }

  /**
   * Generate unique ID for item
   * @param {Object} itemData - Item data
   * @returns {string} Unique ID
   */
  generateItemId(itemData) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const nameHash = itemData.name.toLowerCase().replace(/\s+/g, '-').substring(0, 10);
    return `${nameHash}-${timestamp}-${random}`;
  }

  /**
   * Generate fallback ID
   * @returns {string} Fallback ID
   */
  generateFallbackId() {
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Delay utility for batch processing
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ClothingAnalyzer;