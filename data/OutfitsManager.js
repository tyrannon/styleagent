const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class OutfitsManager {
  constructor() {
    this.dataPath = path.join(__dirname, 'outfits.json');
    this.ensureDataFile();
  }

  async ensureDataFile() {
    try {
      await fs.access(this.dataPath);
    } catch (error) {
      // File doesn't exist, create it
      const initialData = {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        outfits: []
      };
      await fs.writeFile(this.dataPath, JSON.stringify(initialData, null, 2));
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading outfits data:', error);
      return { version: '1.0', lastUpdated: new Date().toISOString(), outfits: [] };
    }
  }

  async saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Error saving outfits data:', error);
      return { success: false, error: error.message };
    }
  }

  async createOutfit(outfitData) {
    try {
      const data = await this.loadData();
      
      const outfit = {
        id: uuidv4(),
        name: outfitData.name || 'Untitled Outfit',
        description: outfitData.description || '',
        items: outfitData.items || [], // Array of item IDs
        itemDetails: outfitData.itemDetails || [], // Full item objects for quick access
        tags: outfitData.tags || [],
        occasion: outfitData.occasion || 'casual',
        season: outfitData.season || 'all',
        weather: outfitData.weather || 'mild',
        loved: false,
        timesWorn: 0,
        lastWorn: null,
        image: outfitData.image || null, // Generated outfit visualization
        aiGenerated: outfitData.aiGenerated || false,
        aiModel: outfitData.aiModel || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.outfits.push(outfit);
      const saveResult = await this.saveData(data);
      
      if (saveResult.success) {
        return { success: true, data: outfit };
      } else {
        return { success: false, error: saveResult.error };
      }
    } catch (error) {
      console.error('Error creating outfit:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllOutfits() {
    try {
      const data = await this.loadData();
      return { success: true, data: data.outfits };
    } catch (error) {
      console.error('Error getting all outfits:', error);
      return { success: false, error: error.message };
    }
  }

  async getOutfit(outfitId) {
    try {
      const data = await this.loadData();
      const outfit = data.outfits.find(o => o.id === outfitId);
      
      if (outfit) {
        return { success: true, data: outfit };
      } else {
        return { success: false, error: 'Outfit not found' };
      }
    } catch (error) {
      console.error('Error getting outfit:', error);
      return { success: false, error: error.message };
    }
  }

  async updateOutfit(outfitId, updateData) {
    try {
      const data = await this.loadData();
      const outfitIndex = data.outfits.findIndex(o => o.id === outfitId);
      
      if (outfitIndex !== -1) {
        data.outfits[outfitIndex] = {
          ...data.outfits[outfitIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        
        const saveResult = await this.saveData(data);
        
        if (saveResult.success) {
          return { success: true, data: data.outfits[outfitIndex] };
        } else {
          return { success: false, error: saveResult.error };
        }
      } else {
        return { success: false, error: 'Outfit not found' };
      }
    } catch (error) {
      console.error('Error updating outfit:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteOutfit(outfitId) {
    try {
      const data = await this.loadData();
      const outfitIndex = data.outfits.findIndex(o => o.id === outfitId);
      
      if (outfitIndex !== -1) {
        data.outfits.splice(outfitIndex, 1);
        const saveResult = await this.saveData(data);
        
        if (saveResult.success) {
          return { success: true };
        } else {
          return { success: false, error: saveResult.error };
        }
      } else {
        return { success: false, error: 'Outfit not found' };
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
      return { success: false, error: error.message };
    }
  }

  async toggleLove(outfitId) {
    try {
      const data = await this.loadData();
      const outfit = data.outfits.find(o => o.id === outfitId);
      
      if (outfit) {
        outfit.loved = !outfit.loved;
        outfit.updatedAt = new Date().toISOString();
        
        const saveResult = await this.saveData(data);
        
        if (saveResult.success) {
          return { success: true, data: outfit };
        } else {
          return { success: false, error: saveResult.error };
        }
      } else {
        return { success: false, error: 'Outfit not found' };
      }
    } catch (error) {
      console.error('Error toggling outfit love:', error);
      return { success: false, error: error.message };
    }
  }

  async recordWear(outfitId) {
    try {
      const data = await this.loadData();
      const outfit = data.outfits.find(o => o.id === outfitId);
      
      if (outfit) {
        outfit.timesWorn = (outfit.timesWorn || 0) + 1;
        outfit.lastWorn = new Date().toISOString();
        outfit.updatedAt = new Date().toISOString();
        
        const saveResult = await this.saveData(data);
        
        if (saveResult.success) {
          return { success: true, data: outfit };
        } else {
          return { success: false, error: saveResult.error };
        }
      } else {
        return { success: false, error: 'Outfit not found' };
      }
    } catch (error) {
      console.error('Error recording outfit wear:', error);
      return { success: false, error: error.message };
    }
  }

  async getLovedOutfits() {
    try {
      const data = await this.loadData();
      const lovedOutfits = data.outfits.filter(outfit => outfit.loved);
      return { success: true, data: lovedOutfits };
    } catch (error) {
      console.error('Error getting loved outfits:', error);
      return { success: false, error: error.message };
    }
  }

  async getOutfitsByOccasion(occasion) {
    try {
      const data = await this.loadData();
      const outfits = data.outfits.filter(outfit => outfit.occasion === occasion);
      return { success: true, data: outfits };
    } catch (error) {
      console.error('Error getting outfits by occasion:', error);
      return { success: false, error: error.message };
    }
  }

  async getStatistics() {
    try {
      const data = await this.loadData();
      const outfits = data.outfits;
      
      const stats = {
        totalOutfits: outfits.length,
        lovedOutfits: outfits.filter(o => o.loved).length,
        totalWears: outfits.reduce((sum, o) => sum + (o.timesWorn || 0), 0),
        aiGeneratedOutfits: outfits.filter(o => o.aiGenerated).length,
        occasionBreakdown: {},
        averageWears: 0,
        mostWornOutfit: null,
        recentOutfits: outfits.slice(-5).reverse()
      };

      // Calculate occasion breakdown
      outfits.forEach(outfit => {
        stats.occasionBreakdown[outfit.occasion] = (stats.occasionBreakdown[outfit.occasion] || 0) + 1;
      });

      // Calculate average wears
      if (outfits.length > 0) {
        stats.averageWears = Math.round(stats.totalWears / outfits.length * 10) / 10;
      }

      // Find most worn outfit
      if (outfits.length > 0) {
        stats.mostWornOutfit = outfits.reduce((max, outfit) => 
          (outfit.timesWorn || 0) > (max.timesWorn || 0) ? outfit : max
        );
      }

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting outfit statistics:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = OutfitsManager;