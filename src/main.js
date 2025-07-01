const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WardrobeManager = require('../data/WardrobeManager');
const OutfitsManager = require('../data/OutfitsManager');
const StyleAI = require('../agent/StyleAI');
const OutfitVisualizer = require('../agent/OutfitVisualizer');

let mainWindow;
let wardrobeManager;
let outfitsManager;
let styleAI;
let outfitVisualizer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../ui/index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Initialize wardrobe manager
  const dataPath = path.join(__dirname, '../data/wardrobe.json');
  wardrobeManager = new WardrobeManager(dataPath);
  await wardrobeManager.initialize();
  
  // Initialize outfits manager and visualizer
  outfitsManager = new OutfitsManager();
  outfitVisualizer = new OutfitVisualizer();
  
  // Initialize AI agent
  styleAI = new StyleAI(wardrobeManager);
  try {
    await styleAI.initialize();
    console.log('StyleAI initialized successfully');
  } catch (error) {
    console.warn('StyleAI initialization failed:', error.message);
    console.warn('AI features will be limited until Ollama is available');
  }
  
  // Set up IPC handlers
  setupIpcHandlers();
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Setup IPC handlers for wardrobe management
function setupIpcHandlers() {
  // Add clothing item
  ipcMain.handle('wardrobe:addItem', async (event, itemData) => {
    try {
      const result = await wardrobeManager.addItem(itemData);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error adding item:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  });

  // Update clothing item
  ipcMain.handle('wardrobe:updateItem', async (event, itemId, updateData) => {
    try {
      const result = await wardrobeManager.updateItem(itemId, updateData);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating item:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  });

  // Delete clothing item
  ipcMain.handle('wardrobe:deleteItem', async (event, itemId) => {
    try {
      const result = await wardrobeManager.deleteItem(itemId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  });

  // Get single clothing item
  ipcMain.handle('wardrobe:getItem', async (event, itemId) => {
    try {
      const result = await wardrobeManager.getItem(itemId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting item:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  });

  // Get all clothing items with filters
  ipcMain.handle('wardrobe:getAllItems', async (event, filters = {}) => {
    try {
      const result = await wardrobeManager.getAllItems(filters);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting items:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  });

  // Record item wear
  ipcMain.handle('wardrobe:recordWear', async (event, itemId) => {
    try {
      const result = await wardrobeManager.recordWear(itemId);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error recording wear:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  });

  // Get wardrobe statistics
  ipcMain.handle('wardrobe:getStats', async (event) => {
    try {
      const result = await wardrobeManager.getStats();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  });

  // Load sample data (for testing)
  ipcMain.handle('wardrobe:loadSampleData', async (event) => {
    try {
      const result = await wardrobeManager.loadSampleData();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error loading sample data:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  });

  // AI Agent handlers
  ipcMain.handle('ai:chat', async (event, message, context = {}) => {
    try {
      if (!styleAI) {
        return {
          success: false,
          error: 'AI agent not initialized'
        };
      }
      
      const result = await styleAI.chat(message, context);
      return result;
    } catch (error) {
      console.error('Error in AI chat:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('ai:suggestOutfit', async (event, context = {}) => {
    try {
      if (!styleAI) {
        return {
          success: false,
          error: 'AI agent not initialized'
        };
      }
      
      const result = await styleAI.suggestOutfit(context);
      return result;
    } catch (error) {
      console.error('Error suggesting outfit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('ai:analyzeWardrobe', async (event) => {
    try {
      if (!styleAI) {
        return {
          success: false,
          error: 'AI agent not initialized'
        };
      }
      
      const analysis = await styleAI.analyzeWardrobe();
      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      console.error('Error analyzing wardrobe:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('ai:isAvailable', async (event) => {
    try {
      if (!styleAI) {
        return { success: false, available: false };
      }
      
      const available = await styleAI.ollama.isAvailable();
      return { success: true, available };
    } catch (error) {
      return { success: false, available: false, error: error.message };
    }
  });

  // Outfit Management handlers
  ipcMain.handle('outfits:create', async (event, outfitData) => {
    try {
      const result = await outfitsManager.createOutfit(outfitData);
      return result;
    } catch (error) {
      console.error('Error creating outfit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:getAll', async (event) => {
    try {
      const result = await outfitsManager.getAllOutfits();
      return result;
    } catch (error) {
      console.error('Error getting all outfits:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:get', async (event, outfitId) => {
    try {
      const result = await outfitsManager.getOutfit(outfitId);
      return result;
    } catch (error) {
      console.error('Error getting outfit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:update', async (event, outfitId, updateData) => {
    try {
      const result = await outfitsManager.updateOutfit(outfitId, updateData);
      return result;
    } catch (error) {
      console.error('Error updating outfit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:delete', async (event, outfitId) => {
    try {
      const result = await outfitsManager.deleteOutfit(outfitId);
      return result;
    } catch (error) {
      console.error('Error deleting outfit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:toggleLove', async (event, outfitId) => {
    try {
      const result = await outfitsManager.toggleLove(outfitId);
      return result;
    } catch (error) {
      console.error('Error toggling outfit love:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:recordWear', async (event, outfitId) => {
    try {
      const result = await outfitsManager.recordWear(outfitId);
      return result;
    } catch (error) {
      console.error('Error recording outfit wear:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:getLoved', async (event) => {
    try {
      const result = await outfitsManager.getLovedOutfits();
      return result;
    } catch (error) {
      console.error('Error getting loved outfits:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:getStats', async (event) => {
    try {
      const result = await outfitsManager.getStatistics();
      return result;
    } catch (error) {
      console.error('Error getting outfit statistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:generateVisualization', async (event, items, size = 'large') => {
    try {
      const svgString = outfitVisualizer.generateOutfitPreview(items, size);
      const dataURL = outfitVisualizer.generateDataURL(svgString);
      
      return {
        success: true,
        data: {
          svg: svgString,
          dataURL: dataURL
        }
      };
    } catch (error) {
      console.error('Error generating outfit visualization:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('outfits:generateFromAI', async (event, context = {}) => {
    try {
      if (!styleAI) {
        return {
          success: false,
          error: 'AI agent not initialized'
        };
      }

      // Get AI outfit suggestion
      const aiResult = await styleAI.suggestOutfit(context);
      if (!aiResult.success) {
        return aiResult;
      }

      // Get the suggested items from the wardrobe
      const wardrobeItems = await wardrobeManager.getAllItems();
      const availableItems = wardrobeItems || [];
      
      // Extract item suggestions from AI response (simple approach)
      const selectedItems = [];
      const categories = ['tops', 'bottoms', 'shoes'];
      
      categories.forEach(category => {
        const categoryItems = availableItems.filter(item => item.category === category);
        if (categoryItems.length > 0) {
          // Select a random item from this category (simple selection)
          const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
          selectedItems.push(randomItem);
        }
      });

      if (selectedItems.length === 0) {
        return {
          success: false,
          error: 'No suitable items found for outfit generation'
        };
      }

      // Generate visualization
      const visualization = outfitVisualizer.generateOutfitPreview(selectedItems, 'large');
      const dataURL = outfitVisualizer.generateDataURL(visualization);

      // Create outfit data
      const outfitData = {
        name: `AI Outfit - ${new Date().toLocaleDateString()}`,
        description: aiResult.suggestion,
        items: selectedItems.map(item => item.id),
        itemDetails: selectedItems,
        occasion: context.occasion || 'casual',
        weather: context.weather || 'mild',
        image: dataURL,
        aiGenerated: true,
        aiModel: 'tinyllama'
      };

      // Save the outfit
      const createResult = await outfitsManager.createOutfit(outfitData);
      
      return {
        success: true,
        data: {
          outfit: createResult.data,
          visualization: {
            svg: visualization,
            dataURL: dataURL
          },
          aiSuggestion: aiResult.suggestion,
          selectedItems: selectedItems
        }
      };
    } catch (error) {
      console.error('Error generating AI outfit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });
}