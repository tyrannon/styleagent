const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * ImageStorage - Manages storage and retrieval of clothing item images
 */
class ImageStorage {
  constructor() {
    this.storageDir = path.join(__dirname, 'images');
    this.initialized = false;
  }

  /**
   * Initialize storage directory
   */
  async initialize() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      this.initialized = true;
      console.log('📁 Image storage initialized:', this.storageDir);
    } catch (error) {
      console.error('Error initializing image storage:', error);
    }
  }

  /**
   * Store an image and return its stored path
   * @param {string} sourcePath - Original image path
   * @param {string} itemId - Clothing item ID
   * @returns {Promise<Object>} Storage result
   */
  async storeImage(sourcePath, itemId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Read source image
      const imageBuffer = await fs.readFile(sourcePath);
      
      // Generate unique filename
      const fileExtension = path.extname(sourcePath);
      const filename = `${itemId}${fileExtension}`;
      const storedPath = path.join(this.storageDir, filename);
      
      // Write to storage
      await fs.writeFile(storedPath, imageBuffer);
      
      // Generate data URL for immediate use
      const mimeType = this.getMimeType(fileExtension);
      const base64Data = imageBuffer.toString('base64');
      const dataURL = `data:${mimeType};base64,${base64Data}`;
      
      console.log('📸 Image stored:', filename);
      
      return {
        success: true,
        storedPath: storedPath,
        relativePath: `data/images/${filename}`,
        dataURL: dataURL,
        filename: filename,
        size: imageBuffer.length
      };
      
    } catch (error) {
      console.error('Error storing image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Store multiple images for multiple items
   * @param {Array} imageItemPairs - Array of {imagePath, itemId} objects
   * @returns {Promise<Object>} Batch storage result
   */
  async storeMultipleImages(imageItemPairs) {
    const results = {
      success: true,
      stored: [],
      errors: []
    };

    for (const { imagePath, itemId } of imageItemPairs) {
      try {
        const result = await this.storeImage(imagePath, itemId);
        if (result.success) {
          results.stored.push({
            itemId: itemId,
            originalPath: imagePath,
            ...result
          });
        } else {
          results.errors.push({
            itemId: itemId,
            imagePath: imagePath,
            error: result.error
          });
        }
      } catch (error) {
        results.errors.push({
          itemId: itemId,
          imagePath: imagePath,
          error: error.message
        });
      }
    }

    if (results.errors.length > 0) {
      results.success = false;
    }

    return results;
  }

  /**
   * Get image data URL for an item
   * @param {string} itemId - Clothing item ID
   * @returns {Promise<string|null>} Data URL or null if not found
   */
  async getImageDataURL(itemId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Try different file extensions
      const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];
      
      for (const ext of extensions) {
        const filename = `${itemId}${ext}`;
        const imagePath = path.join(this.storageDir, filename);
        
        try {
          const imageBuffer = await fs.readFile(imagePath);
          const mimeType = this.getMimeType(ext);
          const base64Data = imageBuffer.toString('base64');
          return `data:${mimeType};base64,${base64Data}`;
        } catch (error) {
          // File doesn't exist with this extension, try next
          continue;
        }
      }
      
      return null; // No image found
      
    } catch (error) {
      console.error('Error getting image data URL:', error);
      return null;
    }
  }

  /**
   * Delete stored image for an item
   * @param {string} itemId - Clothing item ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteImage(itemId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];
      let deleted = false;
      
      for (const ext of extensions) {
        const filename = `${itemId}${ext}`;
        const imagePath = path.join(this.storageDir, filename);
        
        try {
          await fs.unlink(imagePath);
          deleted = true;
          console.log('🗑️ Image deleted:', filename);
        } catch (error) {
          // File doesn't exist, continue
        }
      }
      
      return deleted;
      
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
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
    
    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage stats
   */
  async getStats() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const files = await fs.readdir(this.storageDir);
      const imageFiles = files.filter(f => 
        ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(
          path.extname(f).toLowerCase()
        )
      );

      let totalSize = 0;
      for (const file of imageFiles) {
        const filePath = path.join(this.storageDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return {
        totalImages: imageFiles.length,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        storageDir: this.storageDir
      };
      
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalImages: 0,
        totalSizeMB: 0,
        storageDir: this.storageDir
      };
    }
  }
}

module.exports = ImageStorage;