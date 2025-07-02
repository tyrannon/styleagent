const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

class WardrobeManager {
  constructor(dataPath = null) {
    this.dataPath = dataPath || path.join(__dirname, 'wardrobe.json');
    this.items = [];
    this.initialized = false;
  }

  async initialize() {
    try {
      await this.loadData();
      this.initialized = true;
    } catch (error) {
      console.log('No existing data found, starting fresh');
      this.items = [];
      this.initialized = true;
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      const parsed = JSON.parse(data);
      this.items = parsed.items || [];
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      this.items = [];
    }
  }

  async saveData() {
    const data = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      items: this.items
    };
    
    await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }

  validateItem(item) {
    const required = ['name', 'category'];
    const missing = required.filter(field => !item[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    const validCategories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'underwear', 'sleepwear', 'activewear'];
    if (!validCategories.includes(item.category)) {
      throw new Error(`Invalid category: ${item.category}`);
    }
  }

  async addItem(itemData) {
    if (!this.initialized) await this.initialize();

    this.validateItem(itemData);

    const item = {
      id: itemData.id || uuidv4(), // Use provided ID if available (from ClothingAnalyzer)
      name: itemData.name,
      category: itemData.category,
      brand: itemData.brand || '',
      color: Array.isArray(itemData.color) ? itemData.color : [itemData.color || 'unknown'],
      size: itemData.size || '',
      material: Array.isArray(itemData.material) ? itemData.material : [itemData.material || 'unknown'],
      season: Array.isArray(itemData.season) ? itemData.season : [itemData.season || 'all-season'],
      occasion: Array.isArray(itemData.occasion) ? itemData.occasion : [itemData.occasion || 'casual'],
      purchaseDate: itemData.purchaseDate || null,
      purchasePrice: itemData.purchasePrice || null,
      condition: itemData.condition || 'good',
      favorite: itemData.favorite || false,
      timesWorn: itemData.timesWorn || 0,
      lastWorn: itemData.lastWorn || null,
      tags: Array.isArray(itemData.tags) ? itemData.tags : [],
      notes: itemData.notes || '',
      // Preserve image data fields
      image: itemData.image || null, // Data URL for immediate display
      imageUrl: itemData.imageUrl || null, // Alternative image URL
      imagePath: itemData.imagePath || null, // Legacy field
      // Preserve metadata if available
      metadata: itemData.metadata || null,
      // Analysis data
      confidence: itemData.confidence || null,
      style: itemData.style || 'casual',
      pattern: itemData.pattern || 'solid',
      description: itemData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.items.push(item);
    await this.saveData();
    return item;
  }

  async updateItem(id, updates) {
    if (!this.initialized) await this.initialize();

    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    const updatedItem = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.validateItem(updatedItem);
    this.items[index] = updatedItem;
    await this.saveData();
    return updatedItem;
  }

  async deleteItem(id) {
    if (!this.initialized) await this.initialize();

    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    const deletedItem = this.items.splice(index, 1)[0];
    await this.saveData();
    return deletedItem;
  }

  async getItem(id) {
    if (!this.initialized) await this.initialize();
    return this.items.find(item => item.id === id);
  }

  async getAllItems(filters = {}) {
    if (!this.initialized) await this.initialize();

    let filtered = [...this.items];

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.season) {
      filtered = filtered.filter(item => item.season.includes(filters.season));
    }

    if (filters.favorite !== undefined) {
      filtered = filtered.filter(item => item.favorite === filters.favorite);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        item.notes.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'lastWorn':
            return new Date(b.lastWorn || 0) - new Date(a.lastWorn || 0);
          case 'timesWorn':
            return b.timesWorn - a.timesWorn;
          case 'createdAt':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }

  async recordWear(id) {
    if (!this.initialized) await this.initialize();

    const item = await this.getItem(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }

    return await this.updateItem(id, {
      timesWorn: item.timesWorn + 1,
      lastWorn: new Date().toISOString()
    });
  }

  async getStats() {
    if (!this.initialized) await this.initialize();

    const stats = {
      totalItems: this.items.length,
      categories: {},
      favorites: this.items.filter(item => item.favorite).length,
      mostWorn: null,
      leastWorn: null,
      averageWears: 0
    };

    this.items.forEach(item => {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
    });

    if (this.items.length > 0) {
      const totalWears = this.items.reduce((sum, item) => sum + item.timesWorn, 0);
      stats.averageWears = Math.round(totalWears / this.items.length * 100) / 100;

      const sortedByWears = [...this.items].sort((a, b) => b.timesWorn - a.timesWorn);
      stats.mostWorn = sortedByWears[0];
      stats.leastWorn = sortedByWears[sortedByWears.length - 1];
    }

    return stats;
  }

  async loadSampleData() {
    const sampleItems = [
      {
        name: "White Cotton T-Shirt",
        category: "tops",
        brand: "Uniqlo",
        color: ["white"],
        size: "M",
        material: ["cotton"],
        season: ["spring", "summer"],
        occasion: ["casual"],
        condition: "excellent",
        favorite: true,
        tags: ["basic", "versatile"]
      },
      {
        name: "Dark Jeans",
        category: "bottoms", 
        brand: "Levi's",
        color: ["blue", "dark"],
        size: "32",
        material: ["denim", "cotton"],
        season: ["fall", "winter", "spring"],
        occasion: ["casual", "business-casual"],
        condition: "good",
        tags: ["classic", "durable"]
      },
      {
        name: "Black Leather Boots",
        category: "shoes",
        brand: "Dr. Martens",
        color: ["black"],
        size: "10",
        material: ["leather"],
        season: ["fall", "winter"],
        occasion: ["casual", "business-casual"],
        condition: "excellent",
        favorite: true,
        tags: ["durable", "edgy"]
      },
      {
        name: "Wool Winter Coat",
        category: "outerwear",
        brand: "J.Crew",
        color: ["navy"],
        size: "M",
        material: ["wool"],
        season: ["winter"],
        occasion: ["business", "formal"],
        condition: "excellent",
        tags: ["warm", "professional"]
      },
      {
        name: "Sneakers",
        category: "shoes",
        brand: "Nike",
        color: ["white", "blue"],
        size: "10",
        material: ["synthetic"],
        season: ["spring", "summer"],
        occasion: ["casual", "athletic"],
        condition: "good",
        tags: ["comfortable", "athletic"]
      }
    ];

    for (const item of sampleItems) {
      await this.addItem(item);
    }

    return sampleItems.length;
  }
}

module.exports = WardrobeManager;