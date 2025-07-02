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
        console.log('🔍 Attempting vision analysis with moondream...');
        analysisResult = await this.ollama.analyzeImage(base64Image, analysisPrompt, {
          model: options.model || 'moondream',
          mimeType: mimeType
        });
        console.log('✅ Vision analysis completed successfully');
      } catch (visionError) {
        console.error('❌ Vision analysis failed:', visionError.message);
        console.log('📝 Falling back to enhanced text-based analysis...');
        // Fallback to enhanced text-only analysis with better naming
        analysisResult = await this.analyzeWithEnhancedFallback(imagePath, options);
      }
      
      if (analysisResult.success) {
        console.log('✅ Analysis successful, response type:', typeof analysisResult.response);
        console.log('📄 Raw response:', analysisResult.response);
        
        // Ensure we have a valid response
        if (!analysisResult.response) {
          console.error('❌ Empty response from AI analysis');
          throw new Error('Empty response from AI analysis');
        }
        
        // Parse and structure the AI response
        const structuredData = this.parseAnalysisResponse(analysisResult.response);
        console.log('🏷️ Structured data:', structuredData);
        
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
      
      // Create fallback item but still try to store the image
      const fallbackItem = this.createFallbackItem(imagePath);
      
      try {
        // Try to store the image even if analysis failed
        const imageResult = await this.imageStorage.storeImage(imagePath, fallbackItem.id);
        
        if (imageResult.success) {
          fallbackItem.image = imageResult.dataURL;
          fallbackItem.imageUrl = imageResult.dataURL;
          fallbackItem.imagePath = imageResult.relativePath;
          fallbackItem.metadata.imageStored = true;
          fallbackItem.metadata.storedImagePath = imageResult.storedPath;
          console.log('✅ Image stored for fallback item:', fallbackItem.id);
        } else {
          console.log('❌ Failed to store image for fallback item:', imageResult.error);
          fallbackItem.metadata.imageStored = false;
          fallbackItem.metadata.imageError = imageResult.error;
        }
      } catch (imageError) {
        console.error('Error storing image for fallback item:', imageError);
        fallbackItem.metadata.imageStored = false;
        fallbackItem.metadata.imageError = imageError.message;
      }
      
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
  "name": "descriptive name following format: [Color] [Item Type]",
  "category": "one of: tops, bottoms, shoes, accessories, outerwear, underwear, sleepwear, activewear",
  "colors": ["primary color", "secondary color if visible"],
  "materials": ["material type from visual clues"],
  "brand": "brand name if any logo/label visible",
  "style": "style type (casual, formal, sporty, vintage, etc.)",
  "pattern": "pattern type (solid, striped, plaid, floral, polka-dot, etc.)",
  "description": "detailed visual description",
  "confidence": 0.8
}

NAMING EXAMPLES:
- "Navy Blue Jeans" (not "Navy Blue Cotton Jeans" or "Jeans Navy Blue")
- "Red Tank Top" (not "Red Cotton Tank Top")
- "Black Sneakers" (not "Black Athletic Sneakers")
- "White Button-Up Shirt"
- "Gray Hoodie"
- "Brown Leather Boots"

ANALYSIS GUIDELINES:
- NAME: Use format [Main Color] [Simple Item Type]. Keep names short and natural.
- Colors: Be specific (navy blue, burgundy, forest green, charcoal gray, etc.)
- Materials: Look at texture and fabric appearance (cotton, denim, wool, polyester, silk, leather, etc.)
- Brands: Check for visible logos, labels, or brand names
- Category: Must be exactly one of the listed categories
- Pattern: Describe any patterns or prints visible
- Return ONLY the JSON object with no additional text

Focus on creating natural, marketplace-style names that people would actually use.`;
  }

  /**
   * Parse AI analysis response into structured data
   * @param {string} response - Raw AI response
   * @returns {Object} Structured item data
   */
  parseAnalysisResponse(response) {
    console.log('🔍 parseAnalysisResponse called with response type:', typeof response);
    console.log('🔍 Response preview:', String(response).substring(0, 200));
    
    try {
      // Ensure response is a string
      const responseStr = typeof response === 'string' ? response : String(response || '');
      
      // Try to extract JSON from response
      const jsonMatch = responseStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('✅ Found JSON in response:', jsonMatch[0].substring(0, 100));
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed JSON data:', parsedData);
        
        // Validate and clean the data
        return this.validateAndCleanItemData(parsedData);
      } else {
        console.log('❌ No JSON found in response, falling back to text parsing');
        // Parse as text if JSON not found
        return this.parseTextResponse(responseStr);
      }
    } catch (error) {
      console.error('❌ Error parsing analysis response:', error);
      console.log('🔄 Falling back to text parsing');
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
      name: this.generateBetterName(data) || 'Unknown Item',
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
   * Generate a better name using color + item type format
   * @param {Object} data - Raw item data from AI
   * @returns {string} Improved name
   */
  generateBetterName(data) {
    if (data.name && this.isGoodName(data.name)) {
      return data.name;
    }

    // Extract color and category to build a better name
    const colors = Array.isArray(data.colors) ? data.colors : [data.colors || ''];
    const primaryColor = colors[0] || '';
    const category = data.category || 'item';
    
    // Map categories to common item names
    const itemNames = {
      'tops': this.getTopType(data),
      'bottoms': this.getBottomType(data),
      'shoes': this.getShoeType(data),
      'outerwear': this.getOuterwearType(data),
      'accessories': this.getAccessoryType(data),
      'underwear': 'Underwear',
      'sleepwear': 'Sleepwear',
      'activewear': this.getActivewearType(data)
    };
    
    const itemType = itemNames[category] || this.capitalizeFirst(category);
    
    // Build name: [Color] [Item Type]
    if (primaryColor && primaryColor !== 'unknown') {
      return `${this.capitalizeFirst(primaryColor)} ${itemType}`;
    } else {
      return itemType;
    }
  }

  /**
   * Check if a name is already in good format
   * @param {string} name - Name to check
   * @returns {boolean} Whether name is good
   */
  isGoodName(name) {
    // Check if name follows "Color ItemType" pattern and is reasonable length
    return name && 
           name.length > 3 && 
           name.length < 50 && 
           !name.toLowerCase().includes('unknown') &&
           !name.toLowerCase().includes('item');
  }

  /**
   * Determine specific top type from analysis data
   * @param {Object} data - Item data
   * @returns {string} Specific top type
   */
  getTopType(data) {
    const name = (data.name || '').toLowerCase();
    const description = (data.description || '').toLowerCase();
    const combined = name + ' ' + description;
    
    if (combined.includes('t-shirt') || combined.includes('tshirt')) return 'T-Shirt';
    if (combined.includes('tank')) return 'Tank Top';
    if (combined.includes('blouse')) return 'Blouse';
    if (combined.includes('sweater')) return 'Sweater';
    if (combined.includes('hoodie')) return 'Hoodie';
    if (combined.includes('cardigan')) return 'Cardigan';
    if (combined.includes('blazer')) return 'Blazer';
    if (combined.includes('shirt')) return 'Shirt';
    if (combined.includes('dress')) return 'Dress';
    return 'Top';
  }

  /**
   * Determine specific bottom type from analysis data
   * @param {Object} data - Item data
   * @returns {string} Specific bottom type
   */
  getBottomType(data) {
    const name = (data.name || '').toLowerCase();
    const description = (data.description || '').toLowerCase();
    const combined = name + ' ' + description;
    
    if (combined.includes('jeans')) return 'Jeans';
    if (combined.includes('shorts')) return 'Shorts';
    if (combined.includes('skirt')) return 'Skirt';
    if (combined.includes('leggings')) return 'Leggings';
    if (combined.includes('joggers')) return 'Joggers';
    if (combined.includes('trousers')) return 'Trousers';
    if (combined.includes('pants')) return 'Pants';
    return 'Bottoms';
  }

  /**
   * Determine specific shoe type from analysis data
   * @param {Object} data - Item data
   * @returns {string} Specific shoe type
   */
  getShoeType(data) {
    const name = (data.name || '').toLowerCase();
    const description = (data.description || '').toLowerCase();
    const combined = name + ' ' + description;
    
    if (combined.includes('sneakers') || combined.includes('sneaker')) return 'Sneakers';
    if (combined.includes('boots') || combined.includes('boot')) return 'Boots';
    if (combined.includes('heels') || combined.includes('heel')) return 'Heels';
    if (combined.includes('flats') || combined.includes('flat')) return 'Flats';
    if (combined.includes('sandals') || combined.includes('sandal')) return 'Sandals';
    if (combined.includes('loafers') || combined.includes('loafer')) return 'Loafers';
    return 'Shoes';
  }

  /**
   * Determine specific outerwear type from analysis data
   * @param {Object} data - Item data
   * @returns {string} Specific outerwear type
   */
  getOuterwearType(data) {
    const name = (data.name || '').toLowerCase();
    const description = (data.description || '').toLowerCase();
    const combined = name + ' ' + description;
    
    if (combined.includes('coat')) return 'Coat';
    if (combined.includes('jacket')) return 'Jacket';
    if (combined.includes('blazer')) return 'Blazer';
    if (combined.includes('hoodie')) return 'Hoodie';
    if (combined.includes('cardigan')) return 'Cardigan';
    if (combined.includes('vest')) return 'Vest';
    return 'Outerwear';
  }

  /**
   * Determine specific accessory type from analysis data
   * @param {Object} data - Item data
   * @returns {string} Specific accessory type
   */
  getAccessoryType(data) {
    const name = (data.name || '').toLowerCase();
    const description = (data.description || '').toLowerCase();
    const combined = name + ' ' + description;
    
    if (combined.includes('bag') || combined.includes('purse')) return 'Bag';
    if (combined.includes('belt')) return 'Belt';
    if (combined.includes('hat') || combined.includes('cap')) return 'Hat';
    if (combined.includes('scarf')) return 'Scarf';
    if (combined.includes('watch')) return 'Watch';
    if (combined.includes('necklace')) return 'Necklace';
    if (combined.includes('bracelet')) return 'Bracelet';
    if (combined.includes('ring')) return 'Ring';
    if (combined.includes('earrings')) return 'Earrings';
    return 'Accessory';
  }

  /**
   * Determine specific activewear type from analysis data
   * @param {Object} data - Item data
   * @returns {string} Specific activewear type
   */
  getActivewearType(data) {
    const name = (data.name || '').toLowerCase();
    const description = (data.description || '').toLowerCase();
    const combined = name + ' ' + description;
    
    if (combined.includes('sports bra')) return 'Sports Bra';
    if (combined.includes('leggings')) return 'Athletic Leggings';
    if (combined.includes('shorts')) return 'Athletic Shorts';
    if (combined.includes('tank')) return 'Athletic Tank';
    if (combined.includes('workout')) return 'Workout Gear';
    return 'Activewear';
  }

  /**
   * Get generic item type name from category
   * @param {string} category - Category name
   * @returns {string} Generic item type
   */
  getItemTypeFromCategory(category) {
    const typeMap = {
      'tops': 'Top',
      'bottoms': 'Bottoms',
      'shoes': 'Shoes',
      'outerwear': 'Outerwear',
      'accessories': 'Accessory',
      'underwear': 'Underwear',
      'sleepwear': 'Sleepwear',
      'activewear': 'Activewear'
    };
    
    return typeMap[category] || this.capitalizeFirst(category);
  }

  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
   * Enhanced fallback analysis when vision is not available
   * @param {string} imagePath - Image file path
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeWithEnhancedFallback(imagePath, options = {}) {
    const path = require('path');
    const filename = path.basename(imagePath, path.extname(imagePath));
    
    console.log('🔄 Creating enhanced fallback analysis for:', filename);
    
    // Create a better structured response based on filename analysis
    const analyzedData = this.analyzeFilename(filename);
    
    // Use AI to enhance the analysis if possible
    try {
      const prompt = `Based on this clothing filename "${filename}", provide better details. Respond in JSON format:
{
  "name": "descriptive name like 'Blue Jeans' or 'Red Tank Top'",
  "category": "category from: tops, bottoms, shoes, accessories, outerwear, underwear, sleepwear, activewear",
  "colors": ["primary color", "secondary color if any"],
  "materials": ["likely material"],
  "style": "style type",
  "confidence": 0.5
}`;

      const result = await this.ollama.chat(prompt);
      
      if (result.success) {
        return {
          success: true,
          response: result.response,
          visionUsed: false
        };
      }
    } catch (error) {
      console.log('AI enhancement failed, using filename analysis:', error.message);
    }
    
    // Pure filename-based analysis as final fallback
    return {
      success: true,
      response: JSON.stringify(analyzedData),
      visionUsed: false
    };
  }

  /**
   * Analyze filename to extract clothing information
   * @param {string} filename - Image filename
   * @returns {Object} Analyzed data
   */
  analyzeFilename(filename) {
    const lowerFilename = filename.toLowerCase();
    
    // Detect colors from filename
    const detectedColors = this.colorKeywords.filter(color => 
      lowerFilename.includes(color.toLowerCase())
    );
    
    // Detect category from filename
    let detectedCategory = 'tops';
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => lowerFilename.includes(keyword))) {
        detectedCategory = category;
        break;
      }
    }
    
    // Detect materials from filename
    const detectedMaterials = this.materialKeywords.filter(material => 
      lowerFilename.includes(material.toLowerCase())
    );
    
    // Generate a natural name
    const primaryColor = detectedColors[0] || '';
    const itemType = this.getItemTypeFromCategory(detectedCategory);
    const name = primaryColor ? 
      `${this.capitalizeFirst(primaryColor)} ${itemType}` : 
      itemType;
    
    return {
      name: name,
      category: detectedCategory,
      colors: detectedColors.length > 0 ? detectedColors : ['unknown'],
      materials: detectedMaterials.length > 0 ? detectedMaterials : ['unknown'],
      style: 'casual',
      pattern: 'solid',
      confidence: 0.6
    };
  }

  /**
   * Legacy text-only analysis method (kept for compatibility)
   * @param {string} imagePath - Image file path
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeWithTextOnly(imagePath, options = {}) {
    return this.analyzeWithEnhancedFallback(imagePath, options);
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
    // Ensure response is a string
    const responseStr = typeof response === 'string' ? response : String(response || '');
    console.log('parseTextResponse called with:', responseStr.substring(0, 100));
    
    // Basic text parsing for key information
    const lowerResponse = responseStr.toLowerCase();
    
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
    
    // Generate a better name based on found information
    let itemName = 'Clothing Item';
    if (foundColors.length > 0 && category) {
      const colorName = this.capitalizeFirst(foundColors[0]);
      const itemType = this.getItemTypeFromCategory(category);
      itemName = `${colorName} ${itemType}`;
    } else if (category) {
      itemName = this.getItemTypeFromCategory(category);
    }

    return {
      name: itemName,
      category: category,
      color: foundColors.length > 0 ? foundColors : ['unknown'],
      material: foundMaterials.length > 0 ? foundMaterials : ['unknown'],
      brand: '',
      style: 'casual',
      pattern: 'solid',
      description: responseStr.substring(0, 100),
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