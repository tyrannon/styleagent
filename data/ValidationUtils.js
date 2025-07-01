const { v4: uuidv4 } = require('uuid');

class ValidationError extends Error {
  constructor(message, field = null, code = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

class ValidationUtils {
  static VALID_CATEGORIES = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'underwear', 'sleepwear', 'activewear'];
  static VALID_SEASONS = ['spring', 'summer', 'fall', 'winter'];
  static VALID_OCCASIONS = ['casual', 'business', 'formal', 'athletic', 'loungewear', 'party', 'date', 'work'];
  static VALID_CONDITIONS = ['excellent', 'good', 'fair', 'poor'];

  /**
   * Validates a clothing item against the schema
   * @param {Object} item - The clothing item to validate
   * @param {boolean} isUpdate - Whether this is an update operation (some required fields may be omitted)
   * @returns {Object} Validated and sanitized item
   * @throws {ValidationError} If validation fails
   */
  static validateClothingItem(item, isUpdate = false) {
    if (!item || typeof item !== 'object') {
      throw new ValidationError('Item must be a valid object', null, 'INVALID_TYPE');
    }

    const validatedItem = {};

    // ID validation
    if (item.id) {
      if (typeof item.id !== 'string') {
        throw new ValidationError('ID must be a string', 'id', 'INVALID_TYPE');
      }
      validatedItem.id = item.id;
    } else if (!isUpdate) {
      validatedItem.id = uuidv4();
    }

    // Name validation (required)
    if (!isUpdate || item.name !== undefined) {
      if (!item.name || typeof item.name !== 'string') {
        throw new ValidationError('Name is required and must be a string', 'name', 'REQUIRED');
      }
      if (item.name.trim().length === 0) {
        throw new ValidationError('Name cannot be empty', 'name', 'EMPTY');
      }
      if (item.name.length > 100) {
        throw new ValidationError('Name cannot exceed 100 characters', 'name', 'TOO_LONG');
      }
      validatedItem.name = item.name.trim();
    }

    // Category validation (required)
    if (!isUpdate || item.category !== undefined) {
      if (!item.category || typeof item.category !== 'string') {
        throw new ValidationError('Category is required and must be a string', 'category', 'REQUIRED');
      }
      if (!this.VALID_CATEGORIES.includes(item.category)) {
        throw new ValidationError(`Category must be one of: ${this.VALID_CATEGORIES.join(', ')}`, 'category', 'INVALID_VALUE');
      }
      validatedItem.category = item.category;
    }

    // Subcategory validation (optional)
    if (item.subcategory !== undefined) {
      if (item.subcategory !== null && typeof item.subcategory !== 'string') {
        throw new ValidationError('Subcategory must be a string or null', 'subcategory', 'INVALID_TYPE');
      }
      validatedItem.subcategory = item.subcategory;
    }

    // Brand validation (optional)
    if (item.brand !== undefined) {
      if (item.brand !== null && typeof item.brand !== 'string') {
        throw new ValidationError('Brand must be a string or null', 'brand', 'INVALID_TYPE');
      }
      if (item.brand && item.brand.length > 50) {
        throw new ValidationError('Brand cannot exceed 50 characters', 'brand', 'TOO_LONG');
      }
      validatedItem.brand = item.brand;
    }

    // Color validation (required)
    if (!isUpdate || item.color !== undefined) {
      if (!Array.isArray(item.color)) {
        throw new ValidationError('Color must be an array', 'color', 'INVALID_TYPE');
      }
      if (item.color.length === 0) {
        throw new ValidationError('At least one color is required', 'color', 'EMPTY');
      }
      if (!item.color.every(color => typeof color === 'string')) {
        throw new ValidationError('All colors must be strings', 'color', 'INVALID_TYPE');
      }
      validatedItem.color = item.color.map(color => color.trim()).filter(color => color.length > 0);
      if (validatedItem.color.length === 0) {
        throw new ValidationError('At least one valid color is required', 'color', 'EMPTY');
      }
    }

    // Size validation (optional)
    if (item.size !== undefined) {
      if (item.size !== null && typeof item.size !== 'string') {
        throw new ValidationError('Size must be a string or null', 'size', 'INVALID_TYPE');
      }
      validatedItem.size = item.size;
    }

    // Material validation (optional)
    if (item.material !== undefined) {
      if (item.material !== null && !Array.isArray(item.material)) {
        throw new ValidationError('Material must be an array or null', 'material', 'INVALID_TYPE');
      }
      if (item.material && !item.material.every(mat => typeof mat === 'string')) {
        throw new ValidationError('All materials must be strings', 'material', 'INVALID_TYPE');
      }
      validatedItem.material = item.material ? item.material.map(mat => mat.trim()).filter(mat => mat.length > 0) : null;
    }

    // Season validation (optional)
    if (item.season !== undefined) {
      if (item.season !== null && !Array.isArray(item.season)) {
        throw new ValidationError('Season must be an array or null', 'season', 'INVALID_TYPE');
      }
      if (item.season && !item.season.every(season => this.VALID_SEASONS.includes(season))) {
        throw new ValidationError(`All seasons must be one of: ${this.VALID_SEASONS.join(', ')}`, 'season', 'INVALID_VALUE');
      }
      validatedItem.season = item.season;
    }

    // Occasion validation (optional)
    if (item.occasion !== undefined) {
      if (item.occasion !== null && !Array.isArray(item.occasion)) {
        throw new ValidationError('Occasion must be an array or null', 'occasion', 'INVALID_TYPE');
      }
      if (item.occasion && !item.occasion.every(occ => this.VALID_OCCASIONS.includes(occ))) {
        throw new ValidationError(`All occasions must be one of: ${this.VALID_OCCASIONS.join(', ')}`, 'occasion', 'INVALID_VALUE');
      }
      validatedItem.occasion = item.occasion;
    }

    // Image URL validation (optional)
    if (item.imageUrl !== undefined) {
      if (item.imageUrl !== null && typeof item.imageUrl !== 'string') {
        throw new ValidationError('Image URL must be a string or null', 'imageUrl', 'INVALID_TYPE');
      }
      validatedItem.imageUrl = item.imageUrl;
    }

    // Purchase date validation (optional)
    if (item.purchaseDate !== undefined) {
      if (item.purchaseDate !== null) {
        const date = new Date(item.purchaseDate);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Purchase date must be a valid date', 'purchaseDate', 'INVALID_DATE');
        }
        validatedItem.purchaseDate = item.purchaseDate;
      } else {
        validatedItem.purchaseDate = null;
      }
    }

    // Purchase price validation (optional)
    if (item.purchasePrice !== undefined) {
      if (item.purchasePrice !== null) {
        if (typeof item.purchasePrice !== 'number' || item.purchasePrice < 0) {
          throw new ValidationError('Purchase price must be a non-negative number', 'purchasePrice', 'INVALID_VALUE');
        }
        validatedItem.purchasePrice = item.purchasePrice;
      } else {
        validatedItem.purchasePrice = null;
      }
    }

    // Tags validation (optional)
    if (item.tags !== undefined) {
      if (item.tags !== null && !Array.isArray(item.tags)) {
        throw new ValidationError('Tags must be an array or null', 'tags', 'INVALID_TYPE');
      }
      if (item.tags && !item.tags.every(tag => typeof tag === 'string')) {
        throw new ValidationError('All tags must be strings', 'tags', 'INVALID_TYPE');
      }
      validatedItem.tags = item.tags ? item.tags.map(tag => tag.trim()).filter(tag => tag.length > 0) : null;
    }

    // Notes validation (optional)
    if (item.notes !== undefined) {
      if (item.notes !== null && typeof item.notes !== 'string') {
        throw new ValidationError('Notes must be a string or null', 'notes', 'INVALID_TYPE');
      }
      if (item.notes && item.notes.length > 500) {
        throw new ValidationError('Notes cannot exceed 500 characters', 'notes', 'TOO_LONG');
      }
      validatedItem.notes = item.notes;
    }

    // Condition validation (optional)
    if (item.condition !== undefined) {
      if (item.condition !== null && !this.VALID_CONDITIONS.includes(item.condition)) {
        throw new ValidationError(`Condition must be one of: ${this.VALID_CONDITIONS.join(', ')}`, 'condition', 'INVALID_VALUE');
      }
      validatedItem.condition = item.condition || 'good';
    }

    // Boolen fields validation
    ['favorite', 'retired'].forEach(field => {
      if (item[field] !== undefined) {
        if (typeof item[field] !== 'boolean') {
          throw new ValidationError(`${field} must be a boolean`, field, 'INVALID_TYPE');
        }
        validatedItem[field] = item[field];
      }
    });

    // Numeric fields validation
    if (item.timesWorn !== undefined) {
      if (typeof item.timesWorn !== 'number' || item.timesWorn < 0 || !Number.isInteger(item.timesWorn)) {
        throw new ValidationError('Times worn must be a non-negative integer', 'timesWorn', 'INVALID_VALUE');
      }
      validatedItem.timesWorn = item.timesWorn;
    }

    // Last worn validation (optional)
    if (item.lastWorn !== undefined) {
      if (item.lastWorn !== null) {
        const date = new Date(item.lastWorn);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Last worn date must be a valid date', 'lastWorn', 'INVALID_DATE');
        }
        validatedItem.lastWorn = item.lastWorn;
      } else {
        validatedItem.lastWorn = null;
      }
    }

    // Timestamps
    const now = new Date().toISOString();
    if (!isUpdate) {
      validatedItem.createdAt = item.createdAt || now;
    }
    validatedItem.updatedAt = now;

    return validatedItem;
  }

  /**
   * Validates search/filter parameters
   * @param {Object} filters - Filter parameters
   * @returns {Object} Validated filters
   */
  static validateFilters(filters = {}) {
    const validatedFilters = {};

    if (filters.category) {
      if (!this.VALID_CATEGORIES.includes(filters.category)) {
        throw new ValidationError(`Invalid category filter: ${filters.category}`, 'category', 'INVALID_VALUE');
      }
      validatedFilters.category = filters.category;
    }

    if (filters.season) {
      if (!this.VALID_SEASONS.includes(filters.season)) {
        throw new ValidationError(`Invalid season filter: ${filters.season}`, 'season', 'INVALID_VALUE');
      }
      validatedFilters.season = filters.season;
    }

    if (filters.occasion) {
      if (!this.VALID_OCCASIONS.includes(filters.occasion)) {
        throw new ValidationError(`Invalid occasion filter: ${filters.occasion}`, 'occasion', 'INVALID_VALUE');
      }
      validatedFilters.occasion = filters.occasion;
    }

    if (filters.condition) {
      if (!this.VALID_CONDITIONS.includes(filters.condition)) {
        throw new ValidationError(`Invalid condition filter: ${filters.condition}`, 'condition', 'INVALID_VALUE');
      }
      validatedFilters.condition = filters.condition;
    }

    if (filters.color && typeof filters.color === 'string') {
      validatedFilters.color = filters.color.toLowerCase();
    }

    if (filters.brand && typeof filters.brand === 'string') {
      validatedFilters.brand = filters.brand;
    }

    if (filters.favorite !== undefined) {
      validatedFilters.favorite = Boolean(filters.favorite);
    }

    if (filters.retired !== undefined) {
      validatedFilters.retired = Boolean(filters.retired);
    }

    if (filters.search && typeof filters.search === 'string') {
      validatedFilters.search = filters.search.trim();
    }

    return validatedFilters;
  }

  /**
   * Sanitizes user input to prevent XSS and other issues
   * @param {string} input - Input string to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim();
  }

  /**
   * Validates wardrobe metadata
   * @param {Object} metadata - Wardrobe metadata
   * @returns {Object} Validated metadata
   */
  static validateWardrobeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
      throw new ValidationError('Metadata must be a valid object', null, 'INVALID_TYPE');
    }

    return {
      version: metadata.version || '1.0.0',
      createdAt: metadata.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalItems: typeof metadata.totalItems === 'number' ? metadata.totalItems : 0
    };
  }
}

module.exports = { ValidationUtils, ValidationError };