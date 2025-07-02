const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * StyleDNAManager - Manages user's personal style DNA profile
 * Handles photo upload, appearance analysis, and profile storage
 */
class StyleDNAManager {
  constructor() {
    this.dataPath = path.join(__dirname, 'style-dna.json');
    this.photosDir = path.join(__dirname, '../uploaded-photos');
    this.profile = null;
    
    // Initialize photos directory
    this.ensurePhotosDirectory();
  }

  /**
   * Initialize the Style DNA system
   * @returns {Promise<Object>} Initialization result
   */
  async initialize() {
    try {
      await this.loadProfile();
      return { success: true, hasProfile: !!this.profile };
    } catch (error) {
      console.error('Error initializing StyleDNAManager:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload and analyze a user photo for Style DNA
   * @param {string} photoPath - Path to the uploaded photo
   * @param {Object} metadata - Optional metadata about the photo
   * @returns {Promise<Object>} Analysis result and profile
   */
  async uploadAndAnalyzePhoto(photoPath, metadata = {}) {
    try {
      // Generate unique ID for this photo
      const photoId = uuidv4();
      const extension = path.extname(photoPath);
      const savedPhotoPath = path.join(this.photosDir, `${photoId}${extension}`);
      
      // Copy photo to our managed directory
      await fs.copyFile(photoPath, savedPhotoPath);
      
      // Analyze the photo for appearance characteristics
      const analysis = await this.analyzePhotoAppearance(savedPhotoPath);
      
      if (!analysis.success) {
        return { success: false, error: 'Failed to analyze photo appearance' };
      }
      
      // Create or update Style DNA profile
      const profile = {
        id: this.profile?.id || uuidv4(),
        photoId: photoId,
        photoPath: savedPhotoPath,
        uploadedAt: new Date().toISOString(),
        metadata: metadata,
        appearance: analysis.appearance,
        preferences: this.profile?.preferences || {
          styles: [],
          colors: [],
          occasions: [],
          customizations: {}
        },
        version: '1.0'
      };
      
      // Save profile
      await this.saveProfile(profile);
      this.profile = profile;
      
      return {
        success: true,
        profile: profile,
        analysis: analysis,
        message: 'Style DNA profile created successfully!'
      };
      
    } catch (error) {
      console.error('Error uploading and analyzing photo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze photo for appearance characteristics
   * @param {string} photoPath - Path to the photo to analyze
   * @returns {Promise<Object>} Analysis result
   */
  async analyzePhotoAppearance(photoPath) {
    try {
      // For now, we'll implement a basic analysis
      // In the future, this could use computer vision models
      
      // Read image file for basic analysis
      const imageBuffer = await fs.readFile(photoPath);
      const base64Image = imageBuffer.toString('base64');
      
      // TODO: Implement proper AI-based appearance analysis
      // For now, we'll create a basic template that can be customized
      const appearance = {
        skinTone: {
          category: 'medium', // light, medium, dark
          undertone: 'warm', // warm, cool, neutral
          hex: '#D4A574', // estimated skin tone color
          confidence: 0.7
        },
        hair: {
          color: 'brown', // blonde, brown, black, red, gray, etc.
          style: 'medium', // short, medium, long
          texture: 'straight', // straight, wavy, curly
          confidence: 0.6
        },
        eyes: {
          color: 'brown', // brown, blue, green, hazel, etc.
          confidence: 0.5
        },
        bodyType: {
          build: 'average', // petite, average, tall, plus
          confidence: 0.4
        },
        facialFeatures: {
          structure: 'oval', // oval, round, square, heart, etc.
          confidence: 0.3
        },
        style: {
          detected: ['casual'], // detected style preferences
          confidence: 0.2
        }
      };
      
      return {
        success: true,
        appearance: appearance,
        photoData: {
          base64: base64Image,
          format: path.extname(photoPath).slice(1),
          size: imageBuffer.length
        },
        analysis_method: 'basic_template', // Will be 'ai_vision' later
        analyzed_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error analyzing photo appearance:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current Style DNA profile
   * @returns {Object|null} Current profile or null if none exists
   */
  getProfile() {
    return this.profile;
  }

  /**
   * Update Style DNA preferences
   * @param {Object} preferences - Updated preferences
   * @returns {Promise<Object>} Update result
   */
  async updatePreferences(preferences) {
    try {
      if (!this.profile) {
        return { success: false, error: 'No Style DNA profile exists' };
      }
      
      this.profile.preferences = { ...this.profile.preferences, ...preferences };
      this.profile.updatedAt = new Date().toISOString();
      
      await this.saveProfile(this.profile);
      
      return { success: true, profile: this.profile };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate appearance-based prompt additions for outfit generation
   * @returns {string} Prompt additions based on Style DNA
   */
  generateAppearancePrompt() {
    if (!this.profile || !this.profile.appearance) {
      return '';
    }
    
    const appearance = this.profile.appearance;
    const promptParts = [];
    
    // Add skin tone information
    if (appearance.skinTone) {
      promptParts.push(`${appearance.skinTone.category} ${appearance.skinTone.undertone} skin tone`);
    }
    
    // Add hair information
    if (appearance.hair) {
      promptParts.push(`${appearance.hair.color} ${appearance.hair.style} ${appearance.hair.texture} hair`);
    }
    
    // Add eye information
    if (appearance.eyes) {
      promptParts.push(`${appearance.eyes.color} eyes`);
    }
    
    // Add body type
    if (appearance.bodyType) {
      promptParts.push(`${appearance.bodyType.build} build`);
    }
    
    // Add facial structure
    if (appearance.facialFeatures) {
      promptParts.push(`${appearance.facialFeatures.structure} face shape`);
    }
    
    return promptParts.length > 0 
      ? `person with ${promptParts.join(', ')}, ` 
      : '';
  }

  /**
   * Get Style DNA statistics
   * @returns {Object} Statistics about the profile
   */
  getStatistics() {
    if (!this.profile) {
      return { hasProfile: false };
    }
    
    return {
      hasProfile: true,
      createdAt: this.profile.uploadedAt,
      lastUpdated: this.profile.updatedAt || this.profile.uploadedAt,
      appearanceConfidence: this.calculateOverallConfidence(),
      preferences: {
        styles: this.profile.preferences.styles.length,
        colors: this.profile.preferences.colors.length,
        occasions: this.profile.preferences.occasions.length
      }
    };
  }

  /**
   * Calculate overall confidence in appearance analysis
   * @returns {number} Overall confidence score (0-1)
   */
  calculateOverallConfidence() {
    if (!this.profile || !this.profile.appearance) return 0;
    
    const appearance = this.profile.appearance;
    const confidences = [
      appearance.skinTone?.confidence || 0,
      appearance.hair?.confidence || 0,
      appearance.eyes?.confidence || 0,
      appearance.bodyType?.confidence || 0,
      appearance.facialFeatures?.confidence || 0
    ];
    
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  /**
   * Load existing Style DNA profile
   * @returns {Promise<void>}
   */
  async loadProfile() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      this.profile = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist yet, that's okay
      this.profile = null;
    }
  }

  /**
   * Save Style DNA profile
   * @param {Object} profile - Profile to save
   * @returns {Promise<void>}
   */
  async saveProfile(profile) {
    await fs.writeFile(this.dataPath, JSON.stringify(profile, null, 2));
  }

  /**
   * Ensure photos directory exists
   * @returns {Promise<void>}
   */
  async ensurePhotosDirectory() {
    try {
      await fs.access(this.photosDir);
    } catch {
      await fs.mkdir(this.photosDir, { recursive: true });
    }
  }

  /**
   * Delete Style DNA profile and associated data
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProfile() {
    try {
      if (!this.profile) {
        return { success: false, error: 'No profile to delete' };
      }
      
      // Delete photo file if it exists
      if (this.profile.photoPath) {
        try {
          await fs.unlink(this.profile.photoPath);
        } catch (error) {
          console.warn('Could not delete photo file:', error.message);
        }
      }
      
      // Delete profile file
      await fs.unlink(this.dataPath);
      
      this.profile = null;
      
      return { success: true, message: 'Style DNA profile deleted successfully' };
      
    } catch (error) {
      console.error('Error deleting profile:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = StyleDNAManager;