const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const WardrobeManager = require('../data/WardrobeManager');
const OutfitsManager = require('../data/OutfitsManager');
const StyleDNAManager = require('../data/StyleDNAManager');
const StyleAI = require('../agent/StyleAI');
const OutfitVisualizer = require('../agent/OutfitVisualizer');
const PhotoRealisticVisualizer = require('../agent/PhotoRealisticVisualizer');
const ClothingAnalyzer = require('../agent/ClothingAnalyzer');

let mainWindow;
let wardrobeManager;
let outfitsManager;
let styleDNAManager;
let styleAI;
let outfitVisualizer;
let photoRealisticVisualizer;
let clothingAnalyzer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Allow drag-drop from external sources
      enableRemoteModule: true
    },
    titleBarStyle: 'default', // Changed from 'hiddenInset' to allow window dragging
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
  
  // Initialize outfits manager and visualizers
  outfitsManager = new OutfitsManager();
  outfitVisualizer = new OutfitVisualizer();
  
  // Initialize Style DNA manager first
  styleDNAManager = new StyleDNAManager();
  await styleDNAManager.initialize();
  
  // Initialize photo-realistic visualizer with Style DNA manager
  photoRealisticVisualizer = new PhotoRealisticVisualizer(styleDNAManager);
  
  // Initialize clothing analyzer
  clothingAnalyzer = new ClothingAnalyzer();
  await clothingAnalyzer.imageStorage.initialize();
  
  // Initialize AI agent
  styleAI = new StyleAI(wardrobeManager);
  try {
    await styleAI.initialize();
    console.log('StyleAI initialized successfully');
  } catch (error) {
    console.warn('StyleAI initialization failed:', error.message);
    console.warn('AI features will be limited until Ollama is available');
  }
  
  // Initialize photo-realistic visualizer
  try {
    const photoResult = await photoRealisticVisualizer.initialize();
    if (photoResult.success) {
      console.log('🎨 PhotoRealistic Visualizer initialized successfully');
    } else {
      console.warn('📷 PhotoRealistic Visualizer not available:', photoResult.error);
      console.warn('💡 Suggestion:', photoResult.suggestion);
    }
  } catch (error) {
    console.warn('PhotoRealistic Visualizer initialization failed:', error.message);
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

  ipcMain.handle('outfits:generateVisualization', async (event, items, size = 'large', options = {}) => {
    try {
      // Try photo-realistic generation first
      const photoResult = await photoRealisticVisualizer.generateOutfitPreview(items, size, options);
      
      if (photoResult.success) {
        return {
          success: true,
          data: {
            image: photoResult.image,
            dataURL: photoResult.image,
            type: photoResult.fallback ? 'svg' : 'photo-realistic',
            metadata: photoResult.metadata,
            svg: photoResult.svg || null,
            fallback: photoResult.fallback || false
          }
        };
      } else {
        // Fallback to SVG if photo-realistic fails
        console.log('Falling back to SVG visualization...');
        const svgString = outfitVisualizer.generateOutfitPreview(items, size);
        const dataURL = outfitVisualizer.generateDataURL(svgString);
        
        return {
          success: true,
          data: {
            svg: svgString,
            dataURL: dataURL,
            type: 'svg',
            fallback: true,
            photoError: photoResult.error
          }
        };
      }
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

  // Photo-Realistic Visualization handlers
  ipcMain.handle('photo:isAvailable', async (event) => {
    try {
      const status = photoRealisticVisualizer.getStatus();
      return {
        success: true,
        available: status.available,
        config: status.config,
        lastError: status.lastError
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('photo:generateOutfit', async (event, items, options = {}) => {
    try {
      const result = await photoRealisticVisualizer.generateOutfitImage(items, options);
      return result;
    } catch (error) {
      console.error('Error generating photo-realistic outfit:', error);
      return {
        success: false,
        error: error.message,
        fallback: 'svg'
      };
    }
  });

  ipcMain.handle('photo:generateVariations', async (event, items, options = {}) => {
    try {
      const result = await photoRealisticVisualizer.generateOutfitVariations(items, options);
      return result;
    } catch (error) {
      console.error('Error generating outfit variations:', error);
      return {
        success: false,
        error: error.message,
        fallback: 'svg'
      };
    }
  });

  ipcMain.handle('photo:getModels', async (event) => {
    try {
      const result = await photoRealisticVisualizer.getAvailableModels();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        models: []
      };
    }
  });

  ipcMain.handle('photo:setModel', async (event, modelName) => {
    try {
      const result = await photoRealisticVisualizer.setModel(modelName);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // ===================== STYLE DNA HANDLERS =====================

  // Upload photo for Style DNA analysis
  ipcMain.handle('styleDNA:uploadPhoto', async (event) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Your Photo for Style DNA Analysis',
        buttonLabel: 'Upload Photo',
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'webp'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || !result.filePaths.length) {
        return { success: false, error: 'No file selected' };
      }

      const photoPath = result.filePaths[0];
      const analysisResult = await styleDNAManager.uploadAndAnalyzePhoto(photoPath);
      
      return analysisResult;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get current Style DNA profile
  ipcMain.handle('styleDNA:getProfile', async (event) => {
    try {
      const profile = styleDNAManager.getProfile();
      const stats = styleDNAManager.getStatistics();
      
      return {
        success: true,
        profile: profile,
        statistics: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Update Style DNA preferences
  ipcMain.handle('styleDNA:updatePreferences', async (event, preferences) => {
    try {
      const result = await styleDNAManager.updatePreferences(preferences);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Delete Style DNA profile
  ipcMain.handle('styleDNA:deleteProfile', async (event) => {
    try {
      const result = await styleDNAManager.deleteProfile();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Get appearance prompt for outfit generation
  ipcMain.handle('styleDNA:getAppearancePrompt', async (event) => {
    try {
      const prompt = styleDNAManager.generateAppearancePrompt();
      return {
        success: true,
        prompt: prompt,
        hasProfile: !!styleDNAManager.getProfile()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        prompt: ''
      };
    }
  });

  // ===================== MULTI-IMAGE CLOTHING ANALYSIS HANDLERS =====================

  // Upload multiple images for clothing analysis
  ipcMain.handle('clothing:uploadMultipleImages', async (event) => {
    try {
      console.log('🎯 IPC handler called: clothing:uploadMultipleImages');
      console.log('🪟 Main window available:', !!mainWindow);
      
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Clothing Images for Analysis',
        buttonLabel: 'Analyze Images',
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'webp'] }
        ],
        properties: ['openFile', 'multiSelections']
      });

      console.log('📂 Dialog result:', result);

      if (result.canceled || !result.filePaths.length) {
        console.log('❌ No files selected or dialog canceled');
        return { success: false, error: 'No files selected' };
      }

      console.log('✅ Files selected:', result.filePaths);
      return {
        success: true,
        imagePaths: result.filePaths,
        count: result.filePaths.length
      };
    } catch (error) {
      console.error('❌ Error in clothing:uploadMultipleImages:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Analyze multiple clothing images
  ipcMain.handle('clothing:analyzeImages', async (event, imagePaths, options = {}) => {
    try {
      if (!clothingAnalyzer) {
        return {
          success: false,
          error: 'Clothing analyzer not initialized'
        };
      }

      // Set up progress reporting
      const progressCallback = (progress) => {
        event.sender.send('clothing:analysisProgress', progress);
      };

      const analysisOptions = {
        ...options,
        onProgress: progressCallback
      };

      console.log('🔍 Starting batch analysis of', imagePaths.length, 'clothing images...');
      
      const results = await clothingAnalyzer.analyzeMultipleImages(imagePaths, analysisOptions);
      
      console.log('✅ Batch analysis complete:', results.stats);
      
      return results;
    } catch (error) {
      console.error('Error in batch clothing analysis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Analyze single clothing image
  ipcMain.handle('clothing:analyzeSingleImage', async (event, imagePath, options = {}) => {
    try {
      if (!clothingAnalyzer) {
        return {
          success: false,
          error: 'Clothing analyzer not initialized'
        };
      }

      console.log('🔍 Analyzing single clothing image:', imagePath);
      
      const result = await clothingAnalyzer.analyzeClothingImage(imagePath, options);
      
      return result;
    } catch (error) {
      console.error('Error analyzing clothing image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Add analyzed items to wardrobe
  ipcMain.handle('clothing:addAnalyzedItems', async (event, items) => {
    try {
      if (!wardrobeManager) {
        return {
          success: false,
          error: 'Wardrobe manager not initialized'
        };
      }

      const results = {
        success: true,
        added: [],
        errors: []
      };

      for (const item of items) {
        try {
          console.log('🏷️ Adding item to wardrobe:', item.name);
          console.log('📸 Item image data:', {
            hasImage: !!item.image,
            hasImageUrl: !!item.imageUrl,
            imagePreview: item.image ? item.image.substring(0, 50) + '...' : 'none'
          });
          
          const addResult = await wardrobeManager.addItem(item);
          
          console.log('✅ Item added with image data:', {
            hasImage: !!addResult.image,
            hasImageUrl: !!addResult.imageUrl,
            id: addResult.id
          });
          
          results.added.push(addResult);
        } catch (error) {
          console.error('❌ Error adding item:', error);
          results.errors.push({
            item: item,
            error: error.message
          });
        }
      }

      console.log(`✅ Added ${results.added.length} items to wardrobe, ${results.errors.length} errors`);
      
      return results;
    } catch (error) {
      console.error('Error adding analyzed items to wardrobe:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Check vision model availability
  ipcMain.handle('clothing:checkVisionCapability', async (event) => {
    try {
      if (!clothingAnalyzer || !clothingAnalyzer.ollama) {
        return {
          success: false,
          available: false,
          error: 'Clothing analyzer not available'
        };
      }

      const hasVision = await clothingAnalyzer.ollama.hasVisionCapability();
      const visionModels = await clothingAnalyzer.ollama.getVisionModels();
      
      return {
        success: true,
        available: hasVision,
        models: visionModels,
        recommendation: hasVision ? 
          'Vision analysis available' : 
          'Consider installing llava model for better analysis: ollama pull llava'
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        error: error.message
      };
    }
  });
}