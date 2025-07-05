const { ipcRenderer } = require('electron');

// API Classes (keeping existing functionality)
class WardrobeAPI {
  static async addItem(itemData) {
    return await ipcRenderer.invoke('wardrobe:addItem', itemData);
  }

  static async updateItem(itemId, updateData) {
    return await ipcRenderer.invoke('wardrobe:updateItem', itemId, updateData);
  }

  static async deleteItem(itemId) {
    return await ipcRenderer.invoke('wardrobe:deleteItem', itemId);
  }

  static async getItem(itemId) {
    return await ipcRenderer.invoke('wardrobe:getItem', itemId);
  }

  static async getItems(options = {}) {
    return await ipcRenderer.invoke('wardrobe:getAllItems', options.filters);
  }

  static async searchItems(query, options = {}) {
    return await ipcRenderer.invoke('wardrobe:searchItems', query, options);
  }

  static async recordWear(itemId) {
    return await ipcRenderer.invoke('wardrobe:recordWear', itemId);
  }

  static async getStatistics() {
    return await ipcRenderer.invoke('wardrobe:getStats');
  }

  static async loadSampleData() {
    return await ipcRenderer.invoke('wardrobe:loadSampleData');
  }
}

class AIAPI {
  static async chat(message, context = {}) {
    return await ipcRenderer.invoke('ai:chat', message, context);
  }

  static async suggestOutfit(context = {}) {
    return await ipcRenderer.invoke('ai:suggestOutfit', context);
  }

  static async analyzeWardrobe() {
    return await ipcRenderer.invoke('ai:analyzeWardrobe');
  }

  static async isAvailable() {
    return await ipcRenderer.invoke('ai:isAvailable');
  }
}

class StyleDNAAPI {
  static async uploadPhoto() {
    return await ipcRenderer.invoke('styleDNA:uploadPhoto');
  }

  static async getProfile() {
    return await ipcRenderer.invoke('styleDNA:getProfile');
  }

  static async updatePreferences(preferences) {
    return await ipcRenderer.invoke('styleDNA:updatePreferences', preferences);
  }

  static async deleteProfile() {
    return await ipcRenderer.invoke('styleDNA:deleteProfile');
  }

  static async getAppearancePrompt() {
    return await ipcRenderer.invoke('styleDNA:getAppearancePrompt');
  }
}

class ClothingAnalysisAPI {
  static async uploadMultipleImages() {
    console.log('📡 Calling IPC: clothing:uploadMultipleImages');
    try {
      const result = await ipcRenderer.invoke('clothing:uploadMultipleImages');
      console.log('📡 IPC response:', result);
      return result;
    } catch (error) {
      console.error('📡 IPC error:', error);
      return { success: false, error: error.message };
    }
  }

  static async analyzeImages(imagePaths, options = {}) {
    return await ipcRenderer.invoke('clothing:analyzeImages', imagePaths, options);
  }

  static async analyzeSingleImage(imagePath, options = {}) {
    return await ipcRenderer.invoke('clothing:analyzeSingleImage', imagePath, options);
  }

  static async analyzeCapturedPhoto(dataURL, options = {}) {
    return await ipcRenderer.invoke('clothing:analyzeCapturedPhoto', dataURL, options);
  }

  static async addAnalyzedItems(items) {
    return await ipcRenderer.invoke('clothing:addAnalyzedItems', items);
  }

  static async checkVisionCapability() {
    return await ipcRenderer.invoke('clothing:checkVisionCapability');
  }

  static onAnalysisProgress(callback) {
    ipcRenderer.on('clothing:analysisProgress', (event, progress) => {
      callback(progress);
    });
  }

  static removeAnalysisProgressListener() {
    ipcRenderer.removeAllListeners('clothing:analysisProgress');
  }
}

class OutfitsAPI {
  static async createOutfit(outfitData) {
    return await ipcRenderer.invoke('outfits:create', outfitData);
  }

  static async getAllOutfits() {
    return await ipcRenderer.invoke('outfits:getAll');
  }

  static async getOutfit(outfitId) {
    return await ipcRenderer.invoke('outfits:get', outfitId);
  }

  static async updateOutfit(outfitId, updateData) {
    return await ipcRenderer.invoke('outfits:update', outfitId, updateData);
  }

  static async deleteOutfit(outfitId) {
    return await ipcRenderer.invoke('outfits:delete', outfitId);
  }

  static async toggleLove(outfitId) {
    return await ipcRenderer.invoke('outfits:toggleLove', outfitId);
  }

  static async recordWear(outfitId) {
    return await ipcRenderer.invoke('outfits:recordWear', outfitId);
  }

  static async getLovedOutfits() {
    return await ipcRenderer.invoke('outfits:getLoved');
  }

  static async getStatistics() {
    return await ipcRenderer.invoke('outfits:getStats');
  }

  static async generateVisualization(items, size = 'large') {
    return await ipcRenderer.invoke('outfits:generateVisualization', items, size);
  }

  static async generateFromAI(context = {}) {
    return await ipcRenderer.invoke('outfits:generateFromAI', context);
  }
}

class PhotoAPI {
  static async isAvailable() {
    try {
      const result = await ipcRenderer.invoke('photo:isAvailable');
      console.log('🔍 PhotoAPI.isAvailable() result:', result);
      return result && result.available;
    } catch (error) {
      console.error('❌ PhotoAPI.isAvailable() error:', error);
      return false;
    }
  }

  static async generateOutfit(items, options = {}) {
    return await ipcRenderer.invoke('photo:generateOutfit', items, options);
  }

  static async generateVariations(items, options = {}) {
    return await ipcRenderer.invoke('photo:generateVariations', items, options);
  }

  static async getModels() {
    return await ipcRenderer.invoke('photo:getModels');
  }

  static async setModel(modelName) {
    return await ipcRenderer.invoke('photo:setModel', modelName);
  }

  // Batch generation methods
  static async batchGenerate(items, options = {}) {
    return await ipcRenderer.invoke('photo:batchGenerate', items, options);
  }

  static async pauseBatchGeneration() {
    return await ipcRenderer.invoke('photo:pauseBatchGeneration');
  }

  static async resumeBatchGeneration() {
    return await ipcRenderer.invoke('photo:resumeBatchGeneration');
  }

  static async cancelBatchGeneration() {
    return await ipcRenderer.invoke('photo:cancelBatchGeneration');
  }

  static onBatchProgress(callback) {
    ipcRenderer.on('photo:batchProgress', (event, progress) => {
      callback(progress);
    });
  }

  static removeBatchProgressListener() {
    ipcRenderer.removeAllListeners('photo:batchProgress');
  }

  // Detailed progress event listeners
  static onPipelineProgress(callback) {
    ipcRenderer.on('photo:pipelineProgress', (event, progress) => {
      callback(progress);
    });
  }

  static onGenerationProgress(callback) {
    ipcRenderer.on('photo:generationProgress', (event, progress) => {
      callback(progress);
    });
  }

  static onItemStarted(callback) {
    ipcRenderer.on('photo:itemStarted', (event, data) => {
      callback(data);
    });
  }

  static onItemCompleted(callback) {
    ipcRenderer.on('photo:itemCompleted', (event, data) => {
      callback(data);
    });
  }

  static onItemFailed(callback) {
    ipcRenderer.on('photo:itemFailed', (event, data) => {
      callback(data);
    });
  }

  static onModelLoading(callback) {
    ipcRenderer.on('photo:modelLoading', (event, data) => {
      callback(data);
    });
  }

  static onMemoryUsage(callback) {
    ipcRenderer.on('photo:memoryUsage', (event, data) => {
      callback(data);
    });
  }

  static onGenerationStarting(callback) {
    ipcRenderer.on('photo:generationStarting', (event, data) => {
      callback(data);
    });
  }

  static onGenerationCompleted(callback) {
    ipcRenderer.on('photo:generationCompleted', (event, data) => {
      callback(data);
    });
  }

  static onGenerationError(callback) {
    ipcRenderer.on('photo:generationError', (event, data) => {
      callback(data);
    });
  }

  static onGenerationLog(callback) {
    ipcRenderer.on('photo:generationLog', (event, data) => {
      callback(data);
    });
  }

  static removeDetailedProgressListeners() {
    ipcRenderer.removeAllListeners('photo:pipelineProgress');
    ipcRenderer.removeAllListeners('photo:generationProgress');
    ipcRenderer.removeAllListeners('photo:itemStarted');
    ipcRenderer.removeAllListeners('photo:itemCompleted');
    ipcRenderer.removeAllListeners('photo:itemFailed');
    ipcRenderer.removeAllListeners('photo:modelLoading');
    ipcRenderer.removeAllListeners('photo:memoryUsage');
    ipcRenderer.removeAllListeners('photo:generationStarting');
    ipcRenderer.removeAllListeners('photo:generationCompleted');
    ipcRenderer.removeAllListeners('photo:generationError');
    ipcRenderer.removeAllListeners('photo:generationLog');
  }
}

// Main StyleAgent Application Class
class StyleAgent {
  constructor() {
    this.currentItems = [];
    this.currentFilters = {};
    this.currentTab = 'wardrobe';
    this.selectedItem = null;
    this.aiAvailable = false;
    this.photoAvailable = false;
    this.outfits = [];
    this.analytics = {};
    
    // Session tracking
    this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.sessionStartTime = Date.now();
    
    // Enhanced filtering state
    this.currentSort = 'newest';
    this.currentSearch = '';
    
    // Builder state
    this.builderState = {
      selectedItems: {
        tops: null,
        bottoms: null,
        shoes: null,
        outerwear: null,
        accessories: []
      },
      isSelecting: false,
      selectingCategory: null
    };
    
    // Initialize logging first
    this.initializeLogging();
    
    this.initializeApp();
  }

  async initializeApp() {
    console.log('🚀 Initializing StyleAgent...');
    
    // Initialize navigation
    this.initializeNavigation();
    
    // Initialize modals
    this.initializeModals();
    
    // Initialize tab-specific functionality
    this.initializeWardrobe();
    this.initializeBuilder();
    this.initializeOutfits();
    this.initializeProfile();
    
    // Check AI availability
    await this.checkAIAvailability();
    
    // Check photo-realistic generation availability
    await this.checkPhotoAvailability();
    
    // Load initial data
    await this.loadWardrobe();
    
    console.log('✨ StyleAgent initialized successfully!');
  }

  // ==================== NAVIGATION SYSTEM ====================
  
  initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabName) {
    if (this.currentTab === tabName) return;
    
    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content state
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Page`).classList.add('active');
    
    this.currentTab = tabName;
    
    // Load tab-specific data
    this.onTabChanged(tabName);
  }

  async onTabChanged(tabName) {
    switch(tabName) {
      case 'wardrobe':
        await this.refreshWardrobe();
        break;
      case 'outfits':
        await this.refreshOutfitsWithFallback();
        break;
      case 'profile':
        await this.refreshProfile();
        break;
      case 'builder':
        this.refreshBuilder();
        break;
    }
  }

  // ==================== MODAL SYSTEM ====================
  
  initializeModals() {
    // AI Chat Modal
    const aiChatBtn = document.getElementById('suggestOutfitBtn');
    const aiChatModal = document.getElementById('aiChatModal');
    const aiChatBackdrop = document.getElementById('aiChatBackdrop');
    const closeAiChatBtn = document.getElementById('closeAiChatBtn');
    const sendBtn = document.getElementById('sendBtn');
    const agentInput = document.getElementById('agentInput');

    aiChatBtn.addEventListener('click', () => this.openAiChatModal());
    closeAiChatBtn.addEventListener('click', () => this.closeModal('aiChatModal'));
    aiChatBackdrop.addEventListener('click', () => this.closeModal('aiChatModal'));
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    agentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Item Detail Modal
    const itemDetailModal = document.getElementById('itemDetailModal');
    const itemDetailBackdrop = document.getElementById('itemDetailBackdrop');
    const closeItemDetailBtn = document.getElementById('closeItemDetailBtn');

    closeItemDetailBtn.addEventListener('click', () => this.closeModal('itemDetailModal'));
    itemDetailBackdrop.addEventListener('click', () => this.closeModal('itemDetailModal'));

    // Unified Add Button functionality
    const unifiedAddBtn = document.getElementById('unifiedAddBtn');
    const unifiedAddModal = document.getElementById('unifiedAddModal');
    const unifiedAddBackdrop = document.getElementById('unifiedAddBackdrop');
    const closeUnifiedAddBtn = document.getElementById('closeUnifiedAddBtn');

    unifiedAddBtn.addEventListener('click', () => this.openUnifiedAddModal());
    closeUnifiedAddBtn.addEventListener('click', () => this.closeModal('unifiedAddModal'));
    unifiedAddBackdrop.addEventListener('click', () => this.closeModal('unifiedAddModal'));

    // Method selection handlers
    const photoAnalysisMethod = document.getElementById('photoAnalysisMethod');
    const manualEntryMethod = document.getElementById('manualEntryMethod');
    const textOnlyMethod = document.getElementById('textOnlyMethod');
    const styleDNAMethod = document.getElementById('styleDNAMethod');
    const professionalCameraMethod = document.getElementById('professionalCameraMethod');

    photoAnalysisMethod.addEventListener('click', () => this.selectAddMethod('photoAnalysis'));
    manualEntryMethod.addEventListener('click', () => this.selectAddMethod('manualEntry'));
    textOnlyMethod.addEventListener('click', () => this.selectAddMethod('textOnly'));
    styleDNAMethod.addEventListener('click', () => this.selectAddMethod('styleDNA'));
    professionalCameraMethod.addEventListener('click', () => this.selectAddMethod('professionalCamera'));

    // Professional Camera event listeners
    this.initializeCameraEventListeners();

    // Batch Generation Modal
    this.initializeBatchGenerationModal();
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('open'), 10);
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('open');
    setTimeout(() => modal.style.display = 'none', 300);
  }

  openAiChatModal() {
    this.openModal('aiChatModal');
    // Focus input
    setTimeout(() => {
      document.getElementById('agentInput').focus();
    }, 300);
  }

  // ==================== UNIFIED ADD MODAL ====================

  async openUnifiedAddModal() {
    // Check vision capability for status display
    const visionCheck = await ClothingAnalysisAPI.checkVisionCapability();
    
    // Update vision status in the modal
    const visionStatus = document.getElementById('visionStatus');
    if (visionStatus) {
      if (visionCheck.available) {
        visionStatus.textContent = '✅ Vision AI Available';
        visionStatus.className = 'method-status available';
      } else {
        visionStatus.textContent = '⚠️ Vision AI Unavailable';
        visionStatus.className = 'method-status unavailable';
      }
    }
    
    this.openModal('unifiedAddModal');
  }

  async selectAddMethod(method) {
    console.log('🎯 Selected add method:', method);
    
    // Close the unified add modal
    this.closeModal('unifiedAddModal');
    
    // Route to appropriate method
    switch(method) {
      case 'photoAnalysis':
        await this.showMultiImageUpload();
        break;
      case 'manualEntry':
        this.showManualEntryModal();
        break;
      case 'textOnly':
        this.showTextOnlyEntryModal();
        break;
      case 'styleDNA':
        this.uploadStyleDNAPhoto();
        break;
      case 'professionalCamera':
        await this.openProfessionalCamera();
        break;
      default:
        console.warn('Unknown add method:', method);
    }
  }

  showManualEntryModal() {
    // For now, use the existing multi-image upload but focus on manual entry
    console.log('🔧 Manual entry not fully implemented yet, using photo analysis');
    this.showMultiImageUpload();
  }

  showTextOnlyEntryModal() {
    console.log('📝 Showing text-only entry modal');
    
    const modal = document.createElement('div');
    modal.className = 'modal text-entry-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>📝 Quick Text Entry</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="text-entry-form">
            <h4>✨ Describe your item</h4>
            <p>Just type what you have - AI will help fill in the details!</p>
            
            <textarea id="textEntryDescription" placeholder="e.g., 'black leather jacket from Zara, size M, worn twice'" 
                      rows="4" style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #e2e8f0; resize: vertical;"></textarea>
            
            <div class="entry-options" style="margin-top: 16px;">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="autoCategories" checked>
                <span>Auto-detect category and details</span>
              </label>
            </div>
            
            <div class="modal-actions" style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
              <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
              <button class="btn-primary" onclick="app.processTextEntry()">✨ Add Item</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Focus the textarea
    setTimeout(() => {
      document.getElementById('textEntryDescription').focus();
    }, 300);
  }

  async processTextEntry() {
    const description = document.getElementById('textEntryDescription').value.trim();
    const autoCategories = document.getElementById('autoCategories').checked;
    
    if (!description) {
      this.showNotification('Please describe your item first!', 'warning');
      return;
    }
    
    console.log('🔄 Processing text entry:', description);
    
    // Close the modal
    document.querySelector('.text-entry-modal').remove();
    
    // For now, create a basic item - this would be enhanced with AI parsing
    const itemData = {
      name: description.slice(0, 50), // First 50 chars as name
      category: autoCategories ? this.guessCategory(description) : 'tops',
      color: autoCategories ? this.guessColors(description) : ['unknown'],
      material: autoCategories ? this.guessMaterials(description) : ['unknown'],
      brand: autoCategories ? this.guessBrand(description) : '',
      size: autoCategories ? this.guessSize(description) : '',
      notes: description,
      condition: 'good',
      favorite: false,
      timesWorn: 0,
      lastWorn: null,
      tags: []
    };
    
    try {
      const result = await WardrobeAPI.addItem(itemData);
      if (result.success) {
        this.showNotification('✅ Item added successfully!', 'success');
        await this.refreshWardrobe();
      } else {
        this.showNotification('❌ Failed to add item', 'error');
      }
    } catch (error) {
      console.error('Error adding text item:', error);
      this.showNotification('❌ Error adding item', 'error');
    }
  }

  // Simple text parsing helpers (could be enhanced with AI)
  guessCategory(text) {
    const categories = {
      'jacket|coat|blazer': 'outerwear',
      'shirt|blouse|top|tee|tank': 'tops',
      'pants|jeans|trousers|shorts|skirt|dress': 'bottoms',
      'shoes|boots|sneakers|heels|sandals': 'shoes',
      'bag|purse|belt|hat|necklace|watch': 'accessories'
    };
    
    for (const [pattern, category] of Object.entries(categories)) {
      if (new RegExp(pattern, 'i').test(text)) {
        return category;
      }
    }
    return 'tops'; // default
  }

  guessColors(text) {
    const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'purple', 'pink', 'brown', 'gray', 'navy', 'beige'];
    const foundColors = colors.filter(color => new RegExp(color, 'i').test(text));
    return foundColors.length > 0 ? foundColors : ['unknown'];
  }

  guessMaterials(text) {
    const materials = ['cotton', 'leather', 'denim', 'wool', 'silk', 'polyester', 'linen', 'cashmere'];
    const foundMaterials = materials.filter(material => new RegExp(material, 'i').test(text));
    return foundMaterials.length > 0 ? foundMaterials : ['unknown'];
  }

  guessBrand(text) {
    const brands = ['zara', 'h&m', 'uniqlo', 'nike', 'adidas', 'levi', 'gap', 'banana republic'];
    const foundBrand = brands.find(brand => new RegExp(brand, 'i').test(text));
    return foundBrand ? foundBrand.charAt(0).toUpperCase() + foundBrand.slice(1) : '';
  }

  guessSize(text) {
    const sizeMatch = text.match(/\b(xs|s|m|l|xl|xxl|\d+)\b/i);
    return sizeMatch ? sizeMatch[0].toUpperCase() : '';
  }

  // ==================== WARDROBE TAB ====================
  
  initializeWardrobe() {
    // Enhanced Filters
    const sortFilter = document.getElementById('sortFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const laundryFilter = document.getElementById('laundryFilter');
    const searchFilter = document.getElementById('searchFilter');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    // Initialize current filters and sorting
    this.currentSort = 'newest';
    this.currentSearch = '';

    // Event listeners
    sortFilter.addEventListener('change', () => {
      this.currentSort = sortFilter.value;
      this.applyFiltersAndSort();
    });
    
    categoryFilter.addEventListener('change', () => this.applyFiltersAndSort());
    laundryFilter.addEventListener('change', () => this.applyFiltersAndSort());
    
    // Search with debounce
    let searchTimeout;
    searchFilter.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.currentSearch = e.target.value.trim();
        this.applyFiltersAndSort();
        this.updateClearSearchButton();
      }, 300);
    });
    
    // Clear search button
    clearSearchBtn.addEventListener('click', () => {
      searchFilter.value = '';
      this.currentSearch = '';
      this.applyFiltersAndSort();
      this.updateClearSearchButton();
    });

    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
    });

    // Initialize clear search button state
    this.updateClearSearchButton();

    // Batch Generation Button
    const batchGenerateBtn = document.getElementById('batchGenerateBtn');
    if (batchGenerateBtn) {
      console.log('✅ Batch generate button found and event listener added');
      batchGenerateBtn.addEventListener('click', () => {
        console.log('🔥 BATCH GENERATE BUTTON CLICKED!');
        this.openBatchGenerationModal();
      });
    }
    
    // Add debug functionality
    this.addDebugFunctionality();
  }

  addDebugFunctionality() {
    // Add a debug button for loading sample data
    const headerActions = document.querySelector('.header-actions');
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🧪 Load Sample';
    debugBtn.className = 'btn-secondary';
    debugBtn.addEventListener('click', () => this.loadSampleData());
    headerActions.appendChild(debugBtn);
  }

  async loadSampleData() {
    try {
      this.showLoading('Loading sample data...');
      const result = await WardrobeAPI.loadSampleData();
      
      if (result.success) {
        this.showNotification(`✨ Loaded ${result.data} sample items!`, 'success');
        await this.loadWardrobe();
      } else {
        this.showNotification(`❌ Failed to load sample data: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error loading sample data:', error);
      this.showNotification('❌ Failed to load sample data', 'error');
    }
  }

  async loadWardrobe() {
    // Use the new enhanced filtering method
    await this.applyFiltersAndSort();
  }

  async refreshWardrobe() {
    await this.loadWardrobe();
  }

  async applyFiltersAndSort() {
    const startTime = Date.now();
    
    try {
      this.showLoading('Filtering wardrobe...');
      
      // Log the action
      this.logAction('wardrobeActions', 'filter', {
        sort: this.currentSort,
        search: this.currentSearch,
        filters: this.getCurrentFilters()
      });
      
      // Get all items first
      const result = await WardrobeAPI.getItems();
      
      if (result.success) {
        let items = result.data || [];
        const originalCount = items.length;
        
        // Apply filters
        items = this.filterItems(items);
        
        // Apply sorting
        items = this.sortItems(items);
        
        this.currentItems = items;
        this.renderWardrobe();
        this.updateWardrobeStats();
        
        // Log performance and results
        this.logPerformance('search', startTime);
        this.logAction('wardrobeActions', 'filterComplete', {
          originalCount,
          filteredCount: items.length,
          sort: this.currentSort,
          duration: Date.now() - startTime
        });
        
        console.log(`🔍 Applied filters and sort: ${items.length} items displayed`);
        console.log(`📊 Sort: ${this.currentSort}, Search: "${this.currentSearch}", Filters:`, this.getCurrentFilters());
      } else {
        this.logError('wardrobeActions', 'filter', new Error(result.error));
        console.error('Failed to load wardrobe:', result.error);
        this.showNotification(`❌ Failed to load wardrobe: ${result.error}`, 'error');
      }
    } catch (error) {
      this.logError('wardrobeActions', 'filter', error);
      console.error('Error applying filters:', error);
      this.showNotification('❌ Failed to apply filters', 'error');
    }
  }
  
  // Legacy method for backward compatibility
  async applyFilters() {
    await this.applyFiltersAndSort();
  }

  renderWardrobe() {
    const grid = document.getElementById('clothingGrid');
    
    if (this.currentItems.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>✨ Your wardrobe awaits</h3>
          <p>Add some clothing items to get started, or load sample data to explore StyleAgent!</p>
          <button class="btn-primary" onclick="app.openUnifiedAddModal()">✨ Add First Item</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.currentItems.map(item => this.renderItemCard(item)).join('');
    
    // Add click listeners
    grid.querySelectorAll('.clothing-item').forEach((element, index) => {
      element.addEventListener('click', () => this.selectItem(this.currentItems[index]));
    });
  }

  renderItemCard(item) {
    const colors = item.color.join(', ');
    
    // Debug image data
    console.log('🖼️ Rendering item:', item.name);
    console.log('📸 Image data available:', {
      hasImage: !!item.image,
      hasImageUrl: !!item.imageUrl,
      hasImagePath: !!item.imagePath,
      imageType: typeof item.image,
      imagePreview: item.image ? item.image.substring(0, 50) + '...' : 'none'
    });
    
    // Check for stored image data URL first, then imageUrl, then placeholder
    const imageUrl = item.image || item.imageUrl || this.generatePlaceholderImage(item);
    const favorite = item.favorite ? '<span class="favorite-star">⭐</span>' : '';
    const laundryStatus = this.getLaundryStatusIcon(item.laundryStatus || 'clean');
    const wearCount = item.timesWorn > 0 ? `<span class="wear-count">Worn ${item.timesWorn}x</span>` : '';
    
    return `
      <div class="clothing-item" data-id="${item.id}">
        <div class="item-image">
          <img src="${imageUrl}" alt="${item.name}" onerror="this.src='${this.generatePlaceholderImage(item)}'">
          ${favorite}
          <span class="laundry-status">${laundryStatus}</span>
        </div>
        <div class="item-info">
          <h4>${item.name}</h4>
          <div class="item-details">
            <span class="category">${this.formatCategory(item.category)}</span>
            ${item.brand ? `<span class="brand">${item.brand}</span>` : ''}
          </div>
          <div class="item-colors">${colors}</div>
          ${wearCount}
        </div>
      </div>
    `;
  }

  getLaundryStatusIcon(status) {
    const icons = {
      clean: '🧽',
      dirty: '🧺', 
      washing: '🌀'
    };
    return icons[status] || icons.clean;
  }

  generatePlaceholderImage(item) {
    const categoryLabels = {
      tops: 'TOP',
      bottoms: 'BTM', 
      shoes: 'SHOE',
      accessories: 'ACC',
      outerwear: 'COAT',
      underwear: 'UND',
      sleepwear: 'PJ',
      activewear: 'SPORT'
    };
    
    const label = categoryLabels[item.category] || 'ITEM';
    const primaryColor = item.color[0] || 'gray';
    
    const svgString = `<svg width="200" height="240" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="240" fill="#f3f4f6"/>
      <text x="100" y="110" text-anchor="middle" font-size="24" fill="#9ca3af" font-family="Arial, sans-serif">${label}</text>
      <text x="100" y="140" text-anchor="middle" font-size="14" fill="#6b7280" font-family="Arial, sans-serif">${primaryColor}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  }

  formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  updateWardrobeStats() {
    const totalItems = this.currentItems.length;
    const cleanItems = this.currentItems.filter(item => (item.laundryStatus || 'clean') === 'clean').length;
    const dirtyItems = this.currentItems.filter(item => (item.laundryStatus || 'clean') === 'dirty').length;

    document.getElementById('totalItems').textContent = `${totalItems} items`;
    document.getElementById('cleanItems').textContent = `${cleanItems} clean`;
    document.getElementById('dirtyItems').textContent = `${dirtyItems} dirty`;
  }

  // ==================== ENHANCED FILTERING & SORTING ====================

  filterItems(items) {
    const categoryFilter = document.getElementById('categoryFilter');
    const laundryFilter = document.getElementById('laundryFilter');
    
    let filtered = [...items];
    
    // Category filter
    if (categoryFilter.value) {
      filtered = filtered.filter(item => item.category === categoryFilter.value);
    }
    
    // Laundry status filter
    if (laundryFilter.value) {
      filtered = filtered.filter(item => (item.laundryStatus || 'clean') === laundryFilter.value);
    }
    
    // Search filter
    if (this.currentSearch) {
      const searchTerm = this.currentSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm)) ||
        item.category.toLowerCase().includes(searchTerm) ||
        (item.color && item.color.some(color => color.toLowerCase().includes(searchTerm))) ||
        (item.material && item.material.some(material => material.toLowerCase().includes(searchTerm))) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm))
      );
    }
    
    return filtered;
  }
  
  sortItems(items) {
    const sorted = [...items];
    
    switch (this.currentSort) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
        
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
        
      case 'most-worn':
        return sorted.sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0));
        
      case 'least-worn':
        return sorted.sort((a, b) => (a.timesWorn || 0) - (b.timesWorn || 0));
        
      case 'favorites':
        return sorted.sort((a, b) => {
          if (a.favorite && !b.favorite) return -1;
          if (!a.favorite && b.favorite) return 1;
          // If both are favorites or both are not, sort by newest
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        
      case 'recent-worn':
        return sorted.sort((a, b) => {
          const aDate = new Date(a.lastWorn || 0);
          const bDate = new Date(b.lastWorn || 0);
          return bDate - aDate;
        });
        
      default:
        return sorted;
    }
  }
  
  getCurrentFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const laundryFilter = document.getElementById('laundryFilter');
    
    const filters = {};
    if (categoryFilter.value) filters.category = categoryFilter.value;
    if (laundryFilter.value) filters.laundryStatus = laundryFilter.value;
    if (this.currentSearch) filters.search = this.currentSearch;
    
    return filters;
  }
  
  updateClearSearchButton() {
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchFilter = document.getElementById('searchFilter');
    
    if (clearSearchBtn && searchFilter) {
      clearSearchBtn.style.display = searchFilter.value ? 'block' : 'none';
    }
  }

  switchView(view) {
    this.logAction('wardrobeActions', 'viewMode', { view, previousView: this.currentView || 'grid' });
    
    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the correct button
    const targetButton = document.querySelector(`.view-btn[data-view="${view}"]`);
    if (targetButton) {
      targetButton.classList.add('active');
    }
    
    const grid = document.getElementById('clothingGrid');
    
    // Clean up previous view state
    this.cleanupGalleryView();
    
    // Remove all view classes first
    grid.classList.remove('list-view', 'gallery-view');
    
    // Apply the selected view
    if (view === 'list') {
      grid.classList.add('list-view');
      this.currentView = 'list';
    } else if (view === 'gallery') {
      grid.classList.add('gallery-view');
      this.currentView = 'gallery';
      // Add slight delay to ensure DOM is updated
      setTimeout(() => this.initializeGalleryView(), 50);
    } else {
      this.currentView = 'grid';
    }
  }

  cleanupGalleryView() {
    const grid = document.getElementById('clothingGrid');
    
    // Remove gallery event listeners
    if (this.galleryListeners) {
      this.galleryListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.galleryListeners = null;
    }
    
    // Reset cursor and scroll behavior
    if (grid) {
      grid.style.cursor = '';
      grid.style.scrollBehavior = '';
    }
  }

  initializeGalleryView() {
    const grid = document.getElementById('clothingGrid');
    
    // Remove any existing gallery listeners
    if (this.galleryListeners) {
      this.galleryListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    }
    this.galleryListeners = [];

    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let momentum = 0;
    let lastMoveTime = 0;
    let lastMoveX = 0;

    // Mouse/touch start
    const handleStart = (e) => {
      isDown = true;
      grid.style.scrollBehavior = 'auto'; // Disable smooth scrolling during drag
      
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      startX = clientX - grid.offsetLeft;
      scrollLeft = grid.scrollLeft;
      velocity = 0;
      lastMoveTime = Date.now();
      lastMoveX = clientX;
      
      grid.style.cursor = 'grabbing';
    };

    // Mouse/touch move
    const handleMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const x = clientX - grid.offsetLeft;
      const walk = (x - startX) * 1.5; // Increase scroll speed
      
      const now = Date.now();
      const timeDelta = now - lastMoveTime;
      const distance = clientX - lastMoveX;
      
      if (timeDelta > 0) {
        velocity = distance / timeDelta;
      }
      
      grid.scrollLeft = scrollLeft - walk;
      lastMoveTime = now;
      lastMoveX = clientX;
    };

    // Mouse/touch end
    const handleEnd = () => {
      if (!isDown) return;
      isDown = false;
      grid.style.cursor = 'grab';
      grid.style.scrollBehavior = 'smooth';

      // Apply momentum scrolling
      if (Math.abs(velocity) > 0.1) {
        momentum = velocity * 300; // Adjust momentum factor
        this.applyMomentum(grid, momentum);
      }
    };

    // Add event listeners
    const listeners = [
      { element: grid, event: 'mousedown', handler: handleStart },
      { element: grid, event: 'mousemove', handler: handleMove },
      { element: grid, event: 'mouseup', handler: handleEnd },
      { element: grid, event: 'mouseleave', handler: handleEnd },
      { element: grid, event: 'touchstart', handler: handleStart },
      { element: grid, event: 'touchmove', handler: handleMove },
      { element: grid, event: 'touchend', handler: handleEnd }
    ];

    listeners.forEach(({ element, event, handler }) => {
      element.addEventListener(event, handler, { passive: false });
    });

    this.galleryListeners = listeners;

    // Set cursor style
    grid.style.cursor = 'grab';
    
    // Log gallery view initialization
    this.logAction('wardrobeActions', 'galleryViewInitialized', { 
      itemCount: this.currentItems.length 
    });
  }

  applyMomentum(element, momentum) {
    if (Math.abs(momentum) < 1) return;
    
    const friction = 0.95;
    element.scrollLeft -= momentum;
    momentum *= friction;
    
    requestAnimationFrame(() => this.applyMomentum(element, momentum));
  }

  // ==================== ITEM INTERACTIONS ====================

  selectItem(item) {
    // Check if we're in builder selection mode
    if (this.builderState.isSelecting) {
      this.selectItemForBuilder(item);
      return;
    }
    
    this.selectedItem = item;
    this.showItemDetails(item);
  }

  showItemDetails(item) {
    const modal = document.getElementById('itemDetailModal');
    const title = document.getElementById('itemDetailTitle');
    const body = document.getElementById('itemDetailBody');

    title.textContent = item.name;
    
    body.innerHTML = `
      <div class="item-details-full">
        <img src="${item.image || item.imageUrl || this.generatePlaceholderImage(item)}" alt="${item.name}" class="item-image-large">
        <div class="item-info-full">
          <p><strong>Category:</strong> ${this.formatCategory(item.category)}</p>
          ${item.brand ? `<p><strong>Brand:</strong> ${item.brand}</p>` : ''}
          <p><strong>Colors:</strong> ${item.color.join(', ')}</p>
          ${item.size ? `<p><strong>Size:</strong> ${item.size}</p>` : ''}
          ${item.material ? `<p><strong>Material:</strong> ${item.material.join(', ')}</p>` : ''}
          ${item.season ? `<p><strong>Seasons:</strong> ${item.season.join(', ')}</p>` : ''}
          ${item.occasion ? `<p><strong>Occasions:</strong> ${item.occasion.join(', ')}</p>` : ''}
          <p><strong>Laundry Status:</strong> ${this.getLaundryStatusIcon(item.laundryStatus || 'clean')} ${this.formatCategory(item.laundryStatus || 'clean')}</p>
          <p><strong>Times Worn:</strong> ${item.timesWorn || 0}</p>
          ${item.lastWorn ? `<p><strong>Last Worn:</strong> ${new Date(item.lastWorn).toLocaleDateString()}</p>` : ''}
          ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-primary" onclick="app.recordWear('${item.id}')">👕 Mark as Worn</button>
        <button class="btn-secondary" onclick="app.toggleLaundryStatus('${item.id}')">🧺 Toggle Laundry</button>
        <button class="btn-secondary" onclick="app.editItem('${item.id}')">✏️ Edit</button>
        <button class="btn-danger" onclick="app.deleteItem('${item.id}')">🗑️ Delete</button>
      </div>
    `;
    
    this.openModal('itemDetailModal');
  }

  async recordWear(itemId) {
    try {
      const result = await WardrobeAPI.recordWear(itemId);
      
      if (result.success) {
        this.showNotification('👕 Wear recorded successfully!', 'success');
        await this.loadWardrobe();
        this.closeModal('itemDetailModal');
      } else {
        this.showNotification(`❌ Failed to record wear: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error recording wear:', error);
      this.showNotification('❌ Failed to record wear', 'error');
    }
  }

  async toggleLaundryStatus(itemId) {
    try {
      const item = this.currentItems.find(i => i.id === itemId);
      if (!item) return;

      const statusCycle = { clean: 'dirty', dirty: 'washing', washing: 'clean' };
      const newStatus = statusCycle[item.laundryStatus || 'clean'];

      const result = await WardrobeAPI.updateItem(itemId, { laundryStatus: newStatus });
      
      if (result.success) {
        this.showNotification(`🧺 Status changed to ${newStatus}!`, 'success');
        await this.loadWardrobe();
        this.closeModal('itemDetailModal');
      } else {
        this.showNotification(`❌ Failed to update status: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error updating laundry status:', error);
      this.showNotification('❌ Failed to update laundry status', 'error');
    }
  }

  editItem(itemId) {
    const item = this.currentItems.find(i => i.id === itemId);
    if (!item) {
      this.showNotification('❌ Item not found', 'error');
      return;
    }
    
    this.logAction('itemInteractions', 'edit', { itemId, category: item.category });
    this.showEditItemModal(item);
  }

  showEditItemModal(item) {
    // Close the detail modal first
    this.closeModal('itemDetailModal');
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal edit-item-modal';
    modal.id = 'editItemModal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>✏️ Edit Item</h3>
          <button class="close-btn" onclick="app.closeEditItemModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="edit-item-form">
            <!-- Basic Information -->
            <div class="form-section">
              <h4>📝 Basic Information</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="editItemName">Name *</label>
                  <input type="text" id="editItemName" value="${item.name}" required>
                </div>
                <div class="form-group">
                  <label for="editItemCategory">Category *</label>
                  <select id="editItemCategory" required>
                    <option value="tops" ${item.category === 'tops' ? 'selected' : ''}>👕 Tops</option>
                    <option value="bottoms" ${item.category === 'bottoms' ? 'selected' : ''}>👖 Bottoms</option>
                    <option value="shoes" ${item.category === 'shoes' ? 'selected' : ''}>👟 Shoes</option>
                    <option value="accessories" ${item.category === 'accessories' ? 'selected' : ''}>👜 Accessories</option>
                    <option value="outerwear" ${item.category === 'outerwear' ? 'selected' : ''}>🧥 Outerwear</option>
                    <option value="underwear" ${item.category === 'underwear' ? 'selected' : ''}>🩲 Underwear</option>
                    <option value="sleepwear" ${item.category === 'sleepwear' ? 'selected' : ''}>🌙 Sleepwear</option>
                    <option value="activewear" ${item.category === 'activewear' ? 'selected' : ''}>🏃 Activewear</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="editItemBrand">Brand</label>
                  <input type="text" id="editItemBrand" value="${item.brand || ''}" placeholder="e.g., Nike, Zara">
                </div>
                <div class="form-group">
                  <label for="editItemSize">Size</label>
                  <input type="text" id="editItemSize" value="${item.size || ''}" placeholder="e.g., M, 32, 8.5">
                </div>
              </div>
            </div>

            <!-- Colors & Materials -->
            <div class="form-section">
              <h4>🎨 Colors & Materials</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="editItemColors">Colors (comma-separated)</label>
                  <input type="text" id="editItemColors" value="${(item.color || []).join(', ')}" placeholder="e.g., blue, white, navy">
                </div>
                <div class="form-group">
                  <label for="editItemMaterials">Materials (comma-separated)</label>
                  <input type="text" id="editItemMaterials" value="${(item.material || []).join(', ')}" placeholder="e.g., cotton, polyester">
                </div>
              </div>
            </div>

            <!-- Attributes -->
            <div class="form-section">
              <h4>🏷️ Attributes</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="editItemSeasons">Seasons (comma-separated)</label>
                  <input type="text" id="editItemSeasons" value="${(item.season || []).join(', ')}" placeholder="e.g., spring, summer">
                </div>
                <div class="form-group">
                  <label for="editItemOccasions">Occasions (comma-separated)</label>
                  <input type="text" id="editItemOccasions" value="${(item.occasion || []).join(', ')}" placeholder="e.g., casual, work">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="editItemCondition">Condition</label>
                  <select id="editItemCondition">
                    <option value="excellent" ${item.condition === 'excellent' ? 'selected' : ''}>Excellent</option>
                    <option value="good" ${item.condition === 'good' ? 'selected' : ''}>Good</option>
                    <option value="fair" ${item.condition === 'fair' ? 'selected' : ''}>Fair</option>
                    <option value="poor" ${item.condition === 'poor' ? 'selected' : ''}>Poor</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="editItemLaundryStatus">Laundry Status</label>
                  <select id="editItemLaundryStatus">
                    <option value="clean" ${(item.laundryStatus || 'clean') === 'clean' ? 'selected' : ''}>🧽 Clean</option>
                    <option value="dirty" ${item.laundryStatus === 'dirty' ? 'selected' : ''}>🧺 Dirty</option>
                    <option value="washing" ${item.laundryStatus === 'washing' ? 'selected' : ''}>🌀 Washing</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Usage & Preferences -->
            <div class="form-section">
              <h4>📊 Usage & Preferences</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="editItemTimesWorn">Times Worn</label>
                  <input type="number" id="editItemTimesWorn" value="${item.timesWorn || 0}" min="0">
                </div>
                <div class="form-group checkbox-group">
                  <label>
                    <input type="checkbox" id="editItemFavorite" ${item.favorite ? 'checked' : ''}>
                    <span class="checkbox-label">⭐ Mark as Favorite</span>
                  </label>
                </div>
              </div>
              
              <div class="form-group">
                <label for="editItemTags">Tags (comma-separated)</label>
                <input type="text" id="editItemTags" value="${(item.tags || []).join(', ')}" placeholder="e.g., casual, comfortable, vintage">
              </div>
              
              <div class="form-group">
                <label for="editItemNotes">Notes</label>
                <textarea id="editItemNotes" rows="3" placeholder="Any additional notes about this item...">${item.notes || ''}</textarea>
              </div>
            </div>

            <!-- Image Section -->
            <div class="form-section">
              <h4>📷 Image</h4>
              <div class="current-image-preview">
                <img src="${item.image || item.imageUrl || this.generatePlaceholderImage(item)}" alt="${item.name}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                <p class="image-note">Current image (image updating coming soon)</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="app.closeEditItemModal()">Cancel</button>
          <button class="btn-primary" onclick="app.saveItemChanges('${item.id}')">💾 Save Changes</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Focus the name field
    setTimeout(() => {
      document.getElementById('editItemName').focus();
    }, 300);
  }

  closeEditItemModal() {
    const modal = document.getElementById('editItemModal');
    if (modal) {
      modal.remove();
    }
  }

  async saveItemChanges(itemId) {
    try {
      // Collect form data
      const updates = {
        name: document.getElementById('editItemName').value.trim(),
        category: document.getElementById('editItemCategory').value,
        brand: document.getElementById('editItemBrand').value.trim(),
        size: document.getElementById('editItemSize').value.trim(),
        color: document.getElementById('editItemColors').value.split(',').map(c => c.trim()).filter(c => c),
        material: document.getElementById('editItemMaterials').value.split(',').map(m => m.trim()).filter(m => m),
        season: document.getElementById('editItemSeasons').value.split(',').map(s => s.trim()).filter(s => s),
        occasion: document.getElementById('editItemOccasions').value.split(',').map(o => o.trim()).filter(o => o),
        condition: document.getElementById('editItemCondition').value,
        laundryStatus: document.getElementById('editItemLaundryStatus').value,
        timesWorn: parseInt(document.getElementById('editItemTimesWorn').value) || 0,
        favorite: document.getElementById('editItemFavorite').checked,
        tags: document.getElementById('editItemTags').value.split(',').map(t => t.trim()).filter(t => t),
        notes: document.getElementById('editItemNotes').value.trim()
      };

      // Validate required fields
      if (!updates.name) {
        this.showNotification('❌ Name is required', 'error');
        document.getElementById('editItemName').focus();
        return;
      }

      if (!updates.category) {
        this.showNotification('❌ Category is required', 'error');
        return;
      }

      // Ensure arrays are not empty - provide defaults
      if (updates.color.length === 0) updates.color = ['unknown'];
      if (updates.material.length === 0) updates.material = ['unknown'];
      if (updates.season.length === 0) updates.season = ['all-season'];
      if (updates.occasion.length === 0) updates.occasion = ['casual'];

      this.showLoading('Saving changes...');
      
      const result = await WardrobeAPI.updateItem(itemId, updates);
      
      if (result.success) {
        this.logAction('itemInteractions', 'edit', { 
          itemId, 
          changedFields: Object.keys(updates),
          newCategory: updates.category 
        });
        
        this.showNotification('✅ Item updated successfully!', 'success');
        this.closeEditItemModal();
        await this.loadWardrobe();
      } else {
        this.showNotification(`❌ Failed to update item: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving item changes:', error);
      this.showNotification('❌ Failed to save changes', 'error');
    }
  }

  async deleteItem(itemId) {
    if (!confirm('🗑️ Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const result = await WardrobeAPI.deleteItem(itemId);
      
      if (result.success) {
        this.showNotification('🗑️ Item deleted successfully!', 'success');
        await this.loadWardrobe();
        this.closeModal('itemDetailModal');
      } else {
        this.showNotification(`❌ Failed to delete item: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showNotification('❌ Failed to delete item', 'error');
    }
  }

  // ==================== OUTFIT EDITING ====================

  editOutfit(outfitId) {
    const outfit = this.outfits.find(o => o.id === outfitId);
    if (!outfit) {
      this.showNotification('❌ Outfit not found', 'error');
      return;
    }
    
    this.logAction('outfitGeneration', 'edit', { outfitId, itemCount: outfit.itemIds.length });
    this.showEditOutfitModal(outfit);
  }

  showEditOutfitModal(outfit) {
    // Close any existing modals
    const existingModals = document.querySelectorAll('.modal');
    existingModals.forEach(modal => modal.remove());
    
    // Create edit outfit modal
    const modal = document.createElement('div');
    modal.className = 'modal edit-outfit-modal';
    modal.id = 'editOutfitModal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>✏️ Edit Outfit</h3>
          <button class="close-btn" onclick="app.closeEditOutfitModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="edit-outfit-form">
            <!-- Basic Information -->
            <div class="form-section">
              <h4>📝 Outfit Details</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="editOutfitName">Name *</label>
                  <input type="text" id="editOutfitName" value="${outfit.name}" required placeholder="e.g., Summer Casual Look">
                </div>
                <div class="form-group">
                  <label for="editOutfitOccasion">Occasion</label>
                  <select id="editOutfitOccasion">
                    <option value="casual" ${outfit.occasion === 'casual' ? 'selected' : ''}>Casual</option>
                    <option value="work" ${outfit.occasion === 'work' ? 'selected' : ''}>Work</option>
                    <option value="formal" ${outfit.occasion === 'formal' ? 'selected' : ''}>Formal</option>
                    <option value="date" ${outfit.occasion === 'date' ? 'selected' : ''}>Date Night</option>
                    <option value="gym" ${outfit.occasion === 'gym' ? 'selected' : ''}>Gym/Active</option>
                    <option value="travel" ${outfit.occasion === 'travel' ? 'selected' : ''}>Travel</option>
                    <option value="party" ${outfit.occasion === 'party' ? 'selected' : ''}>Party</option>
                    <option value="beach" ${outfit.occasion === 'beach' ? 'selected' : ''}>Beach</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="editOutfitWeather">Weather</label>
                  <select id="editOutfitWeather">
                    <option value="mild" ${outfit.weather === 'mild' ? 'selected' : ''}>Mild</option>
                    <option value="hot" ${outfit.weather === 'hot' ? 'selected' : ''}>Hot</option>
                    <option value="cold" ${outfit.weather === 'cold' ? 'selected' : ''}>Cold</option>
                    <option value="rainy" ${outfit.weather === 'rainy' ? 'selected' : ''}>Rainy</option>
                    <option value="windy" ${outfit.weather === 'windy' ? 'selected' : ''}>Windy</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="editOutfitTimesWorn">Times Worn</label>
                  <input type="number" id="editOutfitTimesWorn" value="${outfit.timesWorn || 0}" min="0">
                </div>
              </div>
              
              <div class="form-group">
                <label for="editOutfitDescription">Description</label>
                <textarea id="editOutfitDescription" rows="3" placeholder="Add a description for this outfit...">${outfit.description || ''}</textarea>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="editOutfitLoved" ${outfit.loved ? 'checked' : ''}>
                  <span class="checkbox-label">❤️ Mark as Loved</span>
                </label>
              </div>
            </div>

            <!-- Current Items -->
            <div class="form-section">
              <h4>👗 Outfit Items</h4>
              <div class="current-outfit-items">
                ${outfit.itemDetails.map(item => `
                  <div class="outfit-edit-item" data-item-id="${item.id}">
                    <div class="outfit-item-preview">
                      <img src="${item.image || this.generatePlaceholderImage(item)}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    </div>
                    <div class="outfit-item-info">
                      <div class="outfit-item-name">${item.name}</div>
                      <div class="outfit-item-details">${this.formatCategory(item.category)} • ${item.color.join(', ')}</div>
                    </div>
                    <button class="btn-remove-item" onclick="app.removeItemFromOutfitEdit('${item.id}')" title="Remove from outfit">✕</button>
                  </div>
                `).join('')}
              </div>
              
              <div class="add-items-section">
                <h5>Add Items to Outfit</h5>
                <p class="help-text">Select items from your wardrobe to add to this outfit:</p>
                <div class="available-items-grid" id="availableItemsGrid">
                  <!-- Will be populated with available items -->
                </div>
              </div>
            </div>

            <!-- Image Preview -->
            <div class="form-section">
              <h4>📷 Outfit Image</h4>
              <div class="current-image-preview">
                ${outfit.image ? 
                  `<img src="${outfit.image}" alt="${outfit.name}" style="max-width: 300px; max-height: 300px; border-radius: 8px;">` :
                  `<div class="no-image-placeholder">👗 No outfit image available</div>`
                }
                <p class="image-note">Outfit image (regeneration coming soon)</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="app.closeEditOutfitModal()">Cancel</button>
          <button class="btn-primary" onclick="app.saveOutfitChanges('${outfit.id}')">💾 Save Changes</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Load available items for adding to outfit
    this.loadAvailableItemsForOutfit(outfit);
    
    // Focus the name field
    setTimeout(() => {
      document.getElementById('editOutfitName').focus();
    }, 300);
  }

  async loadAvailableItemsForOutfit(outfit) {
    try {
      const result = await WardrobeAPI.getItems();
      if (result.success) {
        const allItems = result.data || [];
        const currentItemIds = new Set(outfit.itemIds);
        const availableItems = allItems.filter(item => !currentItemIds.has(item.id));
        
        const grid = document.getElementById('availableItemsGrid');
        if (grid) {
          grid.innerHTML = availableItems.map(item => `
            <div class="available-item" data-item-id="${item.id}" onclick="app.addItemToOutfitEdit('${item.id}')">
              <div class="available-item-preview">
                <img src="${item.image || this.generatePlaceholderImage(item)}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
              </div>
              <div class="available-item-info">
                <div class="available-item-name">${item.name}</div>
                <div class="available-item-category">${this.formatCategory(item.category)}</div>
              </div>
              <div class="add-item-btn">+</div>
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading available items:', error);
    }
  }

  addItemToOutfitEdit(itemId) {
    const availableItem = document.querySelector(`[data-item-id="${itemId}"]`);
    if (availableItem && availableItem.classList.contains('available-item')) {
      // Move item to current outfit items
      availableItem.remove();
      
      // Add to current items (you would get the full item data here)
      this.showNotification('✅ Item added to outfit!', 'success');
      
      // In a full implementation, you'd update the UI and track the changes
      console.log('Added item to outfit:', itemId);
    }
  }

  removeItemFromOutfitEdit(itemId) {
    const outfitItem = document.querySelector(`.outfit-edit-item[data-item-id="${itemId}"]`);
    if (outfitItem) {
      outfitItem.remove();
      this.showNotification('✅ Item removed from outfit!', 'success');
      
      // In a full implementation, you'd move it back to available items
      console.log('Removed item from outfit:', itemId);
    }
  }

  closeEditOutfitModal() {
    const modal = document.getElementById('editOutfitModal');
    if (modal) {
      modal.remove();
    }
  }

  async saveOutfitChanges(outfitId) {
    try {
      // Collect form data
      const updates = {
        name: document.getElementById('editOutfitName').value.trim(),
        occasion: document.getElementById('editOutfitOccasion').value,
        weather: document.getElementById('editOutfitWeather').value,
        timesWorn: parseInt(document.getElementById('editOutfitTimesWorn').value) || 0,
        description: document.getElementById('editOutfitDescription').value.trim(),
        loved: document.getElementById('editOutfitLoved').checked
      };

      // Validate required fields
      if (!updates.name) {
        this.showNotification('❌ Outfit name is required', 'error');
        document.getElementById('editOutfitName').focus();
        return;
      }

      this.showLoading('Saving outfit changes...');
      
      const result = await OutfitsAPI.updateOutfit(outfitId, updates);
      
      if (result.success) {
        this.logAction('outfitGeneration', 'edit', { 
          outfitId, 
          changedFields: Object.keys(updates),
          newName: updates.name 
        });
        
        this.showNotification('✅ Outfit updated successfully!', 'success');
        this.closeEditOutfitModal();
        await this.loadOutfits();
      } else {
        this.showNotification(`❌ Failed to update outfit: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving outfit changes:', error);
      this.showNotification('❌ Failed to save changes', 'error');
    }
  }

  async showAddItemModal() {
    console.log('🔄 showAddItemModal called');
    // First check vision capability
    const visionCheck = await ClothingAnalysisAPI.checkVisionCapability();
    console.log('👁️ Vision check result:', visionCheck);
    
    const modal = document.createElement('div');
    modal.className = 'modal multi-image-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>📸 Add Clothing Items</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="add-method-selector">
            <div class="method-option" id="methodPhotoAnalysis">
              <div class="method-icon">🤖</div>
              <div class="method-content">
                <h4>AI Photo Analysis</h4>
                <p>Upload multiple photos and let AI automatically detect details</p>
                ${visionCheck.available ? 
                  '<span class="status-available">✅ Vision AI Available</span>' : 
                  '<span class="status-unavailable">⚠️ Vision AI Unavailable</span>'
                }
              </div>
            </div>
            <div class="method-option" id="methodManualEntry">
              <div class="method-icon">✏️</div>
              <div class="method-content">
                <h4>Manual Entry</h4>
                <p>Add item details manually (traditional form)</p>
                <span class="status-available">✅ Always Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Handle method selection
    const photoAnalysisMethod = modal.querySelector('#methodPhotoAnalysis');
    const manualEntryMethod = modal.querySelector('#methodManualEntry');
    
    photoAnalysisMethod.addEventListener('click', () => {
      modal.remove();
      this.showMultiImageUpload();
    });
    
    manualEntryMethod.addEventListener('click', () => {
      modal.remove();
      this.showManualEntryForm();
    });
  }

  async showMultiImageUpload() {
    const modal = document.createElement('div');
    modal.className = 'modal multi-image-upload-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>📸 AI Photo Analysis</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="upload-section">
            <div class="upload-instructions">
              <h4>🧠 How it works:</h4>
              <ol>
                <li>Select multiple photos of your clothing items</li>
                <li>AI will analyze each photo automatically</li>
                <li>Review and edit the detected information</li>
                <li>Add items to your wardrobe</li>
              </ol>
            </div>
            
            <div class="upload-area" id="uploadArea">
              <div class="upload-icon">📸</div>
              <h4>Select Clothing Photos</h4>
              <p>Choose multiple images for AI analysis</p>
              <p class="drag-hint">💡 Or drag & drop images here</p>
              <button class="btn-primary" id="selectImagesBtn">Choose Images</button>
            </div>
            
            <div class="analysis-progress" id="analysisProgress" style="display: none;">
              <div class="progress-header">
                <h4>🔍 Analyzing Images...</h4>
                <span class="progress-text" id="progressText">0%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
              </div>
              <div class="current-item" id="currentItem"></div>
            </div>
            
            <div class="analysis-results" id="analysisResults" style="display: none;">
              <h4>📋 Analysis Results</h4>
              <div class="results-grid" id="resultsGrid">
                <!-- Results will be populated here -->
              </div>
              <div class="results-actions">
                <button class="btn-primary" id="addAllItemsBtn">✅ Add All Items</button>
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    const selectImagesBtn = modal.querySelector('#selectImagesBtn');
    const uploadArea = modal.querySelector('#uploadArea');
    console.log('🔘 Select images button found:', !!selectImagesBtn);
    
    // Bind the handler properly with arrow function to preserve 'this' context
    selectImagesBtn.addEventListener('click', (e) => {
      console.log('🖱️ Select images button clicked');
      console.log('🎯 App context available:', !!this);
      e.preventDefault();
      e.stopPropagation();
      this.handleMultiImageUpload(modal);
    });

    // Add drag-and-drop functionality to the upload area
    this.setupModalDragDrop(uploadArea, modal);
  }

  async handleMultiImageUpload(modal) {
    try {
      console.log('🔄 Starting multi-image upload...');
      
      // Upload multiple images
      const uploadResult = await ClothingAnalysisAPI.uploadMultipleImages();
      console.log('📤 Upload result:', uploadResult);
      
      if (!uploadResult.success) {
        console.error('❌ Upload failed:', uploadResult.error);
        this.showNotification(`❌ Upload failed: ${uploadResult.error || 'No images selected'}`, 'error');
        return;
      }
      
      const { imagePaths, count } = uploadResult;
      console.log(`📸 Selected ${count} images for analysis`);
      
      // Show progress area
      const uploadArea = modal.querySelector('#uploadArea');
      const progressArea = modal.querySelector('#analysisProgress');
      
      uploadArea.style.display = 'none';
      progressArea.style.display = 'block';
      
      // Set up progress tracking
      const progressText = modal.querySelector('#progressText');
      const progressFill = modal.querySelector('#progressFill');
      const currentItem = modal.querySelector('#currentItem');
      
      ClothingAnalysisAPI.onAnalysisProgress((progress) => {
        const percentage = Math.round(progress.percentage);
        progressText.textContent = `${percentage}%`;
        progressFill.style.width = `${percentage}%`;
        currentItem.textContent = `Analyzing: ${progress.imagePath.split('/').pop()}`;
      });
      
      // Start analysis
      const analysisResult = await ClothingAnalysisAPI.analyzeImages(imagePaths);
      
      // Clean up progress listener
      ClothingAnalysisAPI.removeAnalysisProgressListener();
      
      if (analysisResult.success) {
        this.showAnalysisResults(modal, analysisResult);
      } else {
        this.showNotification(`❌ Analysis failed: ${analysisResult.error}`, 'error');
        modal.remove();
      }
      
    } catch (error) {
      console.error('Error in multi-image upload:', error);
      this.showNotification('❌ Failed to analyze images', 'error');
      modal.remove();
    }
  }

  showAnalysisResults(modal, analysisResult) {
    const progressArea = modal.querySelector('#analysisProgress');
    const resultsArea = modal.querySelector('#analysisResults');
    const resultsGrid = modal.querySelector('#resultsGrid');
    
    progressArea.style.display = 'none';
    resultsArea.style.display = 'block';
    
    // Clear previous results
    resultsGrid.innerHTML = '';
    
    // Display analyzed items
    analysisResult.items.forEach((item, index) => {
      const itemCard = document.createElement('div');
      itemCard.className = 'analysis-result-card';
      itemCard.innerHTML = `
        <div class="result-header">
          <h5>${item.name}</h5>
          <span class="confidence-badge">🎯 ${Math.round(item.confidence * 100)}%</span>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Category:</span>
            <select class="detail-input" data-field="category" data-index="${index}">
              <option value="tops" ${item.category === 'tops' ? 'selected' : ''}>👕 Tops</option>
              <option value="bottoms" ${item.category === 'bottoms' ? 'selected' : ''}>👖 Bottoms</option>
              <option value="shoes" ${item.category === 'shoes' ? 'selected' : ''}>👟 Shoes</option>
              <option value="accessories" ${item.category === 'accessories' ? 'selected' : ''}>👜 Accessories</option>
              <option value="outerwear" ${item.category === 'outerwear' ? 'selected' : ''}>🧥 Outerwear</option>
            </select>
          </div>
          <div class="detail-row">
            <span class="detail-label">Colors:</span>
            <input type="text" class="detail-input" data-field="color" data-index="${index}" 
                   value="${Array.isArray(item.color) ? item.color.join(', ') : item.color}">
          </div>
          <div class="detail-row">
            <span class="detail-label">Materials:</span>
            <input type="text" class="detail-input" data-field="material" data-index="${index}" 
                   value="${Array.isArray(item.material) ? item.material.join(', ') : item.material}">
          </div>
          <div class="detail-row">
            <span class="detail-label">Brand:</span>
            <input type="text" class="detail-input" data-field="brand" data-index="${index}" 
                   value="${item.brand || ''}">
          </div>
        </div>
      `;
      
      resultsGrid.appendChild(itemCard);
    });
    
    // Handle adding all items
    const addAllBtn = modal.querySelector('#addAllItemsBtn');
    addAllBtn.addEventListener('click', () => this.handleAddAnalyzedItems(modal, analysisResult.items));
  }

  async handleAddAnalyzedItems(modal, items) {
    try {
      // Collect updated data from the form
      const updatedItems = items.map((item, index) => {
        const categoryInput = modal.querySelector(`[data-field="category"][data-index="${index}"]`);
        const colorInput = modal.querySelector(`[data-field="color"][data-index="${index}"]`);
        const materialInput = modal.querySelector(`[data-field="material"][data-index="${index}"]`);
        const brandInput = modal.querySelector(`[data-field="brand"][data-index="${index}"]`);
        
        return {
          ...item,
          category: categoryInput.value,
          color: colorInput.value.split(',').map(c => c.trim()).filter(c => c),
          material: materialInput.value.split(',').map(m => m.trim()).filter(m => m),
          brand: brandInput.value.trim() || null
        };
      });
      
      // Add items to wardrobe
      const addResult = await ClothingAnalysisAPI.addAnalyzedItems(updatedItems);
      
      if (addResult.success) {
        const addedCount = addResult.added.length;
        const errorCount = addResult.errors.length;
        
        this.showNotification(
          `✅ Added ${addedCount} items successfully!${errorCount > 0 ? ` (${errorCount} errors)` : ''}`, 
          'success'
        );
        
        await this.loadWardrobe();
        modal.remove();
      } else {
        this.showNotification(`❌ Failed to add items: ${addResult.error}`, 'error');
      }
      
    } catch (error) {
      console.error('Error adding analyzed items:', error);
      this.showNotification('❌ Failed to add items to wardrobe', 'error');
    }
  }

  showManualEntryForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>➕ Add New Item</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <form id="addItemForm">
            <div class="form-group">
              <label for="itemName">Name *</label>
              <input type="text" id="itemName" required>
            </div>
            
            <div class="form-group">
              <label for="itemCategory">Category *</label>
              <select id="itemCategory" required>
                <option value="">Select Category</option>
                <option value="tops">👕 Tops</option>
                <option value="bottoms">👖 Bottoms</option>
                <option value="shoes">👟 Shoes</option>
                <option value="accessories">👜 Accessories</option>
                <option value="outerwear">🧥 Outerwear</option>
                <option value="underwear">🩲 Underwear</option>
                <option value="sleepwear">🛌 Sleepwear</option>
                <option value="activewear">🏃 Activewear</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="itemBrand">Brand</label>
              <input type="text" id="itemBrand">
            </div>
            
            <div class="form-group">
              <label for="itemColors">Colors (comma-separated) *</label>
              <input type="text" id="itemColors" placeholder="e.g., blue, white" required>
            </div>
            
            <div class="form-group">
              <label for="itemSize">Size</label>
              <input type="text" id="itemSize">
            </div>

            <div class="form-group">
              <label for="itemLaundryStatus">Laundry Status</label>
              <select id="itemLaundryStatus">
                <option value="clean">🧽 Clean</option>
                <option value="dirty">🧺 Dirty</option>
                <option value="washing">🌀 Washing</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="itemNotes">Notes</label>
              <textarea id="itemNotes" rows="3"></textarea>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary">➕ Add Item</button>
              <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Handle form submission
    const form = document.getElementById('addItemForm');
    form.addEventListener('submit', (e) => this.handleManualAddItem(e, modal));
  }

  async handleManualAddItem(event, modal) {
    event.preventDefault();
    
    const itemData = {
      name: document.getElementById('itemName').value.trim(),
      category: document.getElementById('itemCategory').value,
      brand: document.getElementById('itemBrand').value.trim() || null,
      color: document.getElementById('itemColors').value.split(',').map(c => c.trim()).filter(c => c),
      size: document.getElementById('itemSize').value.trim() || null,
      laundryStatus: document.getElementById('itemLaundryStatus').value,
      notes: document.getElementById('itemNotes').value.trim() || null
    };

    try {
      const result = await WardrobeAPI.addItem(itemData);
      
      if (result.success) {
        this.showNotification('✨ Item added successfully!', 'success');
        await this.loadWardrobe();
        modal.remove();
      } else {
        this.showNotification(`❌ Failed to add item: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      this.showNotification('❌ Failed to add item', 'error');
    }
  }

  // ==================== BUILDER TAB ====================
  
  initializeBuilder() {
    // Initialize enhanced builder state
    this.builderState = {
      isSelecting: false,
      selectingCategory: null,
      selectedItems: {
        tops: null,
        bottoms: null,
        shoes: null,
        outerwear: null,
        accessories: [],
        underwear: null,
        sleepwear: null,
        activewear: null
      },
      currentOccasion: 'casual',
      currentWeather: 'mild'
    };

    // Initialize event listeners
    this.initializeBuilderEvents();
    
    // Initialize suggestions system
    this.initializeSuggestions();
    
    // Load initial suggestions
    this.updateSmartSuggestions();
  }

  initializeBuilderEvents() {
    // Main action buttons
    document.getElementById('generateOutfitBtn').addEventListener('click', () => this.generateAIOutfit());
    document.getElementById('saveOutfitBtn').addEventListener('click', () => this.saveCurrentOutfit());
    document.getElementById('clearOutfitBtn').addEventListener('click', () => this.clearAllOutfitSlots());
    document.getElementById('randomizeOutfitBtn').addEventListener('click', () => this.randomizeOutfit());
    
    // Context controls
    document.getElementById('occasionSelect').addEventListener('change', (e) => {
      this.builderState.currentOccasion = e.target.value;
      this.updateSmartSuggestions();
    });
    
    document.getElementById('weatherSelect').addEventListener('change', (e) => {
      this.builderState.currentWeather = e.target.value;
      this.updateSmartSuggestions();
    });
    
    document.getElementById('getSmartSuggestionsBtn').addEventListener('click', () => {
      this.generateSmartSuggestions();
    });

    // Outfit slot selection
    document.querySelectorAll('.outfit-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-remove-btn')) {
          this.removeItemFromSlot(slot);
          return;
        }
        const category = slot.dataset.category;
        this.startItemSelection(category);
      });
    });

    // Suggestion tabs
    document.querySelectorAll('.suggestion-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchSuggestionTab(e.target.dataset.tab);
      });
    });
  }

  refreshBuilder() {
    this.updateBuilderSlots();
    this.updateSmartSuggestions();
  }

  // ==================== SUGGESTIONS SYSTEM ====================
  
  initializeSuggestions() {
    this.suggestionSystem = {
      currentTab: 'based-on-selection',
      cache: {
        'based-on-selection': [],
        'trending': [],
        'weather': []
      }
    };
  }

  switchSuggestionTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.suggestion-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update content sections
    document.querySelectorAll('.suggestion-category').forEach(category => {
      category.classList.toggle('active', category.id === tabName);
    });
    
    this.suggestionSystem.currentTab = tabName;
    this.updateSmartSuggestions();
  }

  async updateSmartSuggestions() {
    const currentTab = this.suggestionSystem.currentTab;
    console.log('updateSmartSuggestions called for tab:', currentTab);
    
    // Map tab names to container IDs
    const containerIds = {
      'based-on-selection': 'selectionBasedSuggestions',
      'trending': 'trendingSuggestions', 
      'weather': 'weatherSuggestions'
    };
    
    const container = document.getElementById(containerIds[currentTab]);
    console.log('Looking for container ID:', containerIds[currentTab]);
    console.log('Container found:', !!container);
    
    if (!container) return;

    try {
      container.innerHTML = '<div class="suggestions-loading">🧠 Generating smart suggestions...</div>';
      
      let suggestions = [];
      
      switch (currentTab) {
        case 'based-on-selection':
          suggestions = await this.generateSelectionBasedSuggestions();
          break;
        case 'trending':
          suggestions = await this.generateTrendingSuggestions();
          break;
        case 'weather':
          suggestions = await this.generateWeatherSuggestions();
          break;
      }
      
      console.log('Generated suggestions for', currentTab, ':', suggestions.length, 'items');
      this.renderSuggestions(container, suggestions);
    } catch (error) {
      console.error('Error updating suggestions:', error);
      container.innerHTML = '<div class="suggestions-empty">❌ Failed to load suggestions</div>';
    }
  }

  async generateSelectionBasedSuggestions() {
    const selectedItems = this.getSelectedItemsArray();
    console.log('generateSelectionBasedSuggestions - selected items:', selectedItems);
    
    if (selectedItems.length === 0) {
      // If no items selected, show some popular items as suggestions
      const allItems = this.currentItems || [];
      console.log('No items selected, showing popular items from:', allItems.length, 'total items');
      return allItems.slice(0, 6);
    }

    // Use AI to suggest complementary items
    try {
      const prompt = this.createSuggestionPrompt(selectedItems);
      const result = await AIAPI.chat(prompt);
      
      if (result.success) {
        return await this.processSuggestionResponse(result.response);
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
    }

    // Fallback to rule-based suggestions
    return this.generateRuleBasedSuggestions(selectedItems);
  }

  async generateTrendingSuggestions() {
    // Get most worn items and popular combinations
    const allItems = this.currentItems || [];
    console.log('generateTrendingSuggestions - all items:', allItems.length);
    
    // Filter items with wear count, or fallback to all items
    let trending = allItems.filter(item => (item.timesWorn || item.wearCount || 0) > 0);
    
    if (trending.length === 0) {
      // If no worn items, just show random items
      console.log('No worn items found, showing random items');
      trending = allItems.slice(0, 6);
    } else {
      trending = trending
        .sort((a, b) => (b.timesWorn || b.wearCount || 0) - (a.timesWorn || a.wearCount || 0))
        .slice(0, 6);
    }
    
    console.log('Trending suggestions:', trending.length, 'items');
    return trending;
  }

  async generateWeatherSuggestions() {
    const weather = this.builderState.currentWeather;
    const allItems = this.currentItems || [];
    console.log('generateWeatherSuggestions - weather:', weather, 'items:', allItems.length);
    
    // Filter items appropriate for current weather
    const weatherAppropriate = allItems.filter(item => {
      switch (weather) {
        case 'hot':
          return ['shorts', 'tank', 't-shirt', 'dress', 'sandals', 'flip-flops'].some(term => 
            item.name.toLowerCase().includes(term) || 
            item.category === 'activewear'
          );
        case 'cold':
          return ['coat', 'jacket', 'sweater', 'hoodie', 'boots', 'pants'].some(term => 
            item.name.toLowerCase().includes(term) || 
            item.category === 'outerwear'
          );
        case 'rainy':
          return ['jacket', 'coat', 'boots', 'umbrella'].some(term => 
            item.name.toLowerCase().includes(term)
          );
        default:
          return true;
      }
    });
    
    console.log('Weather appropriate items:', weatherAppropriate.length);
    return weatherAppropriate.slice(0, 6);
  }

  createSuggestionPrompt(selectedItems) {
    const itemDescriptions = selectedItems.map(item => 
      `${item.category}: ${item.name} (${item.color.join(', ')})`
    ).join(', ');
    
    return `I have selected these clothing items: ${itemDescriptions}. 
    
    Based on these selections for a ${this.builderState.currentOccasion} occasion in ${this.builderState.currentWeather} weather, suggest 3-5 complementary items that would complete this outfit. 
    
    Consider:
    - Color coordination and harmony
    - Style consistency 
    - Occasion appropriateness
    - Weather suitability
    
    Respond with just the item names and categories, like: "black leather shoes (shoes), silver watch (accessories)"`;
  }

  async processSuggestionResponse(response) {
    // Parse AI response and match with actual wardrobe items
    const allItems = this.currentItems || [];
    const suggestions = [];
    
    // Simple matching based on keywords in the response
    const words = response.toLowerCase().split(/[,\s]+/);
    
    for (const item of allItems) {
      const itemWords = [
        ...item.name.toLowerCase().split(/\s+/),
        ...item.color.map(c => c.toLowerCase()),
        item.category.toLowerCase()
      ];
      
      const matchScore = itemWords.reduce((score, word) => {
        return score + (words.includes(word) ? 1 : 0);
      }, 0);
      
      if (matchScore > 0) {
        suggestions.push({ ...item, matchScore });
      }
    }
    
    return suggestions
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  }

  generateRuleBasedSuggestions(selectedItems) {
    const allItems = this.currentItems || [];
    const suggestions = [];
    
    // Simple rule-based matching
    for (const item of allItems) {
      // Skip already selected items
      if (selectedItems.find(selected => selected.id === item.id)) {
        continue;
      }
      
      // Color coordination rules
      const hasComplementaryColor = selectedItems.some(selected => {
        return selected.color.some(color => 
          this.areColorsComplementary(color, item.color[0])
        );
      });
      
      if (hasComplementaryColor) {
        suggestions.push(item);
      }
    }
    
    return suggestions.slice(0, 6);
  }

  areColorsComplementary(color1, color2) {
    const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'cream'];
    const color1Lower = color1.toLowerCase();
    const color2Lower = color2.toLowerCase();
    
    // Neutrals go with everything
    if (neutrals.includes(color1Lower) || neutrals.includes(color2Lower)) {
      return true;
    }
    
    // Same color family
    if (color1Lower === color2Lower) {
      return true;
    }
    
    // Basic complementary rules
    const complementary = {
      'blue': ['white', 'cream', 'gray'],
      'red': ['black', 'white', 'gray'],
      'green': ['white', 'cream', 'brown'],
      'yellow': ['black', 'blue', 'gray'],
      'brown': ['cream', 'beige', 'white']
    };
    
    return complementary[color1Lower]?.includes(color2Lower) || 
           complementary[color2Lower]?.includes(color1Lower);
  }

  renderSuggestions(container, suggestions) {
    console.log('renderSuggestions called with:', suggestions?.length, 'suggestions');
    
    if (!suggestions || suggestions.length === 0) {
      container.innerHTML = '<div class="suggestions-empty">No suggestions available</div>';
      console.log('No suggestions to render');
      return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'suggestions-grid';
    
    suggestions.forEach((item, index) => {
      console.log(`Rendering suggestion ${index}:`, item.name, item.category);
      
      const suggestionItem = document.createElement('div');
      suggestionItem.className = 'suggestion-item';
      suggestionItem.style.cursor = 'pointer';
      
      // Use addEventListener instead of onclick for better event handling
      suggestionItem.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Suggestion clicked:', item);
        this.applySuggestion(item);
      });
      
      const imageUrl = item.image || item.imageUrl || this.generatePlaceholderImage(item);
      
      suggestionItem.innerHTML = `
        <img src="${imageUrl}" alt="${item.name}" class="suggestion-item-image">
        <div class="suggestion-item-name">${item.name}</div>
        <div class="suggestion-item-category">${this.formatCategory(item.category)}</div>
      `;
      
      grid.appendChild(suggestionItem);
    });
    
    container.innerHTML = '';
    container.appendChild(grid);
    console.log('Suggestions rendered successfully');
  }

  applySuggestion(item) {
    console.log('Applying suggestion:', item);
    
    // Ensure builder state is initialized
    if (!this.builderState) {
      console.log('Builder state not initialized, initializing now...');
      this.initializeBuilder();
    }
    
    // Add suggested item to appropriate slot
    const category = item.category;
    console.log('Adding item to category:', category);
    this.addItemToBuilder(item, category);
    
    // Update the builder display
    this.updateBuilderSlots();
    
    // Update suggestions to reflect the new selection
    this.updateSmartSuggestions();
    
    // Show success notification
    this.showNotification(`✨ Added ${item.name} to your outfit!`, 'success');
    
    // Log the current state for debugging
    console.log('Builder state after adding item:', this.builderState.selectedItems);
  }

  async generateSmartSuggestions() {
    this.showNotification('🧠 Generating AI-powered outfit suggestions...', 'info');
    
    try {
      const context = {
        occasion: this.builderState.currentOccasion,
        weather: this.builderState.currentWeather,
        selectedItems: this.getSelectedItemsArray()
      };
      
      const result = await AIAPI.suggestOutfit(context);
      
      if (result.success) {
        this.showNotification('✨ Smart suggestions updated!', 'success');
        this.updateSmartSuggestions();
      } else {
        this.showNotification('❌ Failed to generate suggestions', 'error');
      }
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
      this.showNotification('❌ Error generating suggestions', 'error');
    }
  }

  startItemSelection(category) {
    this.builderState.isSelecting = true;
    this.builderState.selectingCategory = category;
    
    // Switch to wardrobe tab to select items
    this.switchTab('wardrobe');
    
    // Show selection mode notification
    this.showNotification(`🎯 Select a ${category.slice(0, -1)} item for your outfit`, 'info');
    
    // Add selection styling to grid
    const grid = document.getElementById('clothingGrid');
    grid.classList.add('selection-mode');
    
    // Filter items by category
    this.currentFilters = { category: category };
    this.loadWardrobe();
  }

  selectItemForBuilder(item) {
    if (!this.builderState.isSelecting) return;
    
    const category = this.builderState.selectingCategory;
    this.addItemToBuilder(item, category);
    
    // Exit selection mode
    this.builderState.isSelecting = false;
    this.builderState.selectingCategory = null;
    
    // Remove selection styling
    const grid = document.getElementById('clothingGrid');
    grid.classList.remove('selection-mode');
    
    // Clear filters and reload
    this.currentFilters = {};
    this.loadWardrobe();
    
    // Go back to builder and update
    this.switchTab('builder');
    this.updateBuilderSlots();
    this.updateSmartSuggestions();
    
    this.showNotification(`✅ ${item.name} added to outfit!`, 'success');
  }

  addItemToBuilder(item, category) {
    console.log('addItemToBuilder called with:', { item: item.name, category });
    console.log('Current builder state:', this.builderState);
    
    if (category === 'accessories') {
      // Accessories can have multiple items
      if (!Array.isArray(this.builderState.selectedItems[category])) {
        this.builderState.selectedItems[category] = [];
      }
      // Avoid duplicates
      if (!this.builderState.selectedItems[category].find(existing => existing.id === item.id)) {
        this.builderState.selectedItems[category].push(item);
        console.log('Added accessory:', item.name);
      } else {
        console.log('Accessory already exists:', item.name);
      }
    } else {
      // Other categories have single items
      this.builderState.selectedItems[category] = item;
      console.log('Added item to', category, ':', item.name);
    }
    
    console.log('Updated builder state:', this.builderState.selectedItems);
  }

  removeItemFromSlot(slot) {
    const category = slot.dataset.category;
    
    if (category === 'accessories') {
      // For now, clear all accessories - could be enhanced to remove specific items
      this.builderState.selectedItems[category] = [];
    } else {
      this.builderState.selectedItems[category] = null;
    }
    
    this.updateBuilderSlots();
    this.updateSmartSuggestions();
    this.showNotification(`🗑️ Removed item from ${category}`, 'info');
  }

  clearAllOutfitSlots() {
    this.builderState.selectedItems = {
      tops: null,
      bottoms: null,
      shoes: null,
      outerwear: null,
      accessories: [],
      underwear: null,
      sleepwear: null,
      activewear: null
    };
    
    this.updateBuilderSlots();
    this.updateSmartSuggestions();
    this.showNotification('🗑️ Cleared all outfit slots', 'info');
  }

  async randomizeOutfit() {
    this.showNotification('🎲 Randomizing outfit...', 'info');
    
    const allItems = this.currentItems || [];
    const categories = ['tops', 'bottoms', 'shoes'];
    
    // Clear current selection
    this.clearAllOutfitSlots();
    
    // Randomly select items for each category
    categories.forEach(category => {
      const categoryItems = allItems.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        this.builderState.selectedItems[category] = randomItem;
      }
    });
    
    // Maybe add outerwear and accessories
    if (Math.random() > 0.5) {
      const outerwearItems = allItems.filter(item => item.category === 'outerwear');
      if (outerwearItems.length > 0) {
        const randomOuterwear = outerwearItems[Math.floor(Math.random() * outerwearItems.length)];
        this.builderState.selectedItems.outerwear = randomOuterwear;
      }
    }
    
    if (Math.random() > 0.3) {
      const accessoryItems = allItems.filter(item => item.category === 'accessories');
      if (accessoryItems.length > 0) {
        const randomAccessory = accessoryItems[Math.floor(Math.random() * accessoryItems.length)];
        this.builderState.selectedItems.accessories = [randomAccessory];
      }
    }
    
    this.updateBuilderSlots();
    this.updateSmartSuggestions();
    this.showNotification('🎲 Random outfit generated!', 'success');
  }

  getSelectedItemsArray() {
    const selected = [];
    
    Object.entries(this.builderState.selectedItems).forEach(([category, item]) => {
      if (category === 'accessories' && Array.isArray(item)) {
        selected.push(...item);
      } else if (item) {
        selected.push(item);
      }
    });
    
    return selected;
  }

  updateBuilderSlots() {
    console.log('updateBuilderSlots called');
    console.log('Current builder state:', this.builderState?.selectedItems);
    
    // Update all categories
    const categories = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'underwear', 'sleepwear', 'activewear'];
    
    categories.forEach(category => {
      const slot = document.querySelector(`[data-category="${category}"]`);
      if (!slot) {
        console.log('Slot not found for category:', category);
        return;
      }
      
      const slotContent = slot.querySelector('.slot-content');
      if (!slotContent) {
        console.log('Slot content not found for category:', category);
        return;
      }
      
      const selectedItem = this.builderState.selectedItems[category];
      console.log(`Category ${category} has item:`, selectedItem);
      
      if (category === 'accessories') {
        // Handle multiple accessories
        if (selectedItem && selectedItem.length > 0) {
          console.log('Rendering accessories:', selectedItem);
          slot.classList.add('filled');
          slotContent.innerHTML = this.renderAccessoriesItems(selectedItem);
        } else {
          slot.classList.remove('filled');
          slotContent.innerHTML = this.renderEmptySlot(category);
        }
      } else {
        // Handle single items
        if (selectedItem) {
          console.log('Rendering single item for', category, ':', selectedItem.name);
          slot.classList.add('filled');
          slotContent.innerHTML = this.renderSelectedItem(selectedItem);
        } else {
          slot.classList.remove('filled');
          slotContent.innerHTML = this.renderEmptySlot(category);
        }
      }
    });
    
    // Update save button state
    this.updateSaveButtonState();
  }

  renderSelectedItem(item) {
    const imageUrl = item.image || item.imageUrl || this.generatePlaceholderImage(item);
    
    return `
      <div class="selected-item">
        <img src="${imageUrl}" alt="${item.name}" class="selected-item-image">
        <div class="selected-item-info">
          <div class="selected-item-name">${item.name}</div>
          <div class="selected-item-details">${item.color.join(', ')}</div>
        </div>
        <button class="item-remove-btn" title="Remove item">×</button>
      </div>
    `;
  }

  renderAccessoriesItems(accessories) {
    if (accessories.length === 1) {
      return this.renderSelectedItem(accessories[0]);
    }
    
    // Multiple accessories - show count and first item
    const firstItem = accessories[0];
    const imageUrl = firstItem.image || firstItem.imageUrl || this.generatePlaceholderImage(firstItem);
    
    return `
      <div class="selected-item">
        <img src="${imageUrl}" alt="${firstItem.name}" class="selected-item-image">
        <div class="selected-item-info">
          <div class="selected-item-name">${accessories.length} accessories</div>
          <div class="selected-item-details">${firstItem.name}${accessories.length > 1 ? ` +${accessories.length - 1}` : ''}</div>
        </div>
        <button class="item-remove-btn" title="Remove items">×</button>
      </div>
    `;
  }

  renderEmptySlot(category) {
    const slotInfo = this.getSlotInfo(category);
    
    return `
      <div class="slot-placeholder">
        <p>${slotInfo.placeholder}</p>
        <button class="select-btn">Choose</button>
      </div>
    `;
  }

  getSlotInfo(category) {
    const slotData = {
      tops: { placeholder: 'Select a top' },
      bottoms: { placeholder: 'Select bottoms' },
      shoes: { placeholder: 'Select shoes' },
      outerwear: { placeholder: 'Add jacket/coat' },
      accessories: { placeholder: 'Add accessories' },
      underwear: { placeholder: 'Add undergarments' },
      sleepwear: { placeholder: 'Add sleepwear' },
      activewear: { placeholder: 'Add activewear' }
    };
    
    return slotData[category] || { placeholder: 'Select item' };
  }

  renderBuilderItem(item, category) {
    const imageUrl = item.imageUrl || this.generatePlaceholderImage(item);
    const categoryEmoji = this.getCategoryEmoji(item.category);
    return `
      <div class="builder-item">
        <div class="builder-item-image">
          ${categoryEmoji}
        </div>
        <div class="builder-item-info">
          <div class="builder-item-name">${item.name}</div>
          <div class="builder-item-details">${item.color.join(', ')} • ${item.brand || 'No brand'}</div>
        </div>
        <button class="builder-item-remove" onclick="app.removeBuilderItem('${category}')">×</button>
      </div>
    `;
  }

  removeBuilderItem(category) {
    if (category === 'accessories') {
      this.builderState.selectedItems[category] = [];
    } else {
      this.builderState.selectedItems[category] = null;
    }
    this.updateBuilderSlots();
  }

  updateSaveButtonState() {
    const saveBtn = document.getElementById('saveOutfitBtn');
    const hasItems = this.builderState.selectedItems.tops || 
                    this.builderState.selectedItems.bottoms || 
                    this.builderState.selectedItems.shoes;
    
    if (hasItems) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Outfit';
    } else {
      saveBtn.disabled = true;
      saveBtn.textContent = '💾 Add items to save';
    }
  }

  async generateAIOutfit() {
    if (!this.aiAvailable) {
      this.showNotification('🤖 AI is not available yet', 'error');
      return;
    }

    try {
      // Show StyleMuse-like progress modal
      this.showOutfitGenerationProgress();

      // Use the working OutfitsAPI.generateFromAI that handles everything
      const result = await OutfitsAPI.generateFromAI({
        occasion: this.builderState.currentOccasion || 'casual',
        weather: this.builderState.currentWeather || 'mild',
        mood: 'comfortable'
      });
      
      if (result.success) {
        this.updateProgressStep('✨ Complete!', 100);
        
        // Update builder with AI selected items
        const selectedItems = result.data.selectedItems;
        this.clearAllOutfitSlots();
        
        selectedItems.forEach(item => {
          this.addItemToBuilder(item, item.category);
        });
        
        this.updateBuilderSlots();
        this.updateSmartSuggestions();

        // Show beautiful completion modal with the generated image
        setTimeout(() => {
          this.hideProgressModal();
          
          if (result.data.visualization && result.data.visualization.dataURL) {
            const visualData = {
              dataURL: result.data.visualization.dataURL,
              type: result.data.visualization.type || 'svg'
            };
            
            const outfitData = {
              name: result.data.outfit.name,
              description: result.data.outfit.description,
              itemDetails: selectedItems,
              occasion: this.builderState.currentOccasion || 'casual',
              weather: this.builderState.currentWeather || 'mild'
            };
            
            this.showOutfitCompletionModal(outfitData, visualData);
          } else {
            this.showNotification('✨ AI outfit generated and saved!', 'success');
            setTimeout(() => this.switchTab('outfits'), 1000);
          }
        }, 500);
        
      } else {
        this.hideProgressModal();
        this.showNotification(`❌ Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
      this.hideProgressModal();
      this.showNotification('❌ Failed to generate outfit', 'error');
    }
  }

  async generateAndAutoSaveOutfit(selectedItems) {
    try {
      console.log('🎨 Generating and auto-saving outfit...', selectedItems.length, 'items');
      
      if (!selectedItems || selectedItems.length === 0) {
        console.log('❌ No items selected for auto-save');
        return;
      }

      // Show StyleMuse-like progress modal
      this.showOutfitGenerationProgress();

      // Generate visualization with progress updates
      let visualResult = { success: false };
      if (typeof OutfitsAPI !== 'undefined') {
        this.updateProgressStep('🎨 Creating outfit visualization...', 60);
        visualResult = await OutfitsAPI.generateVisualization(selectedItems, 'large');
        console.log('🖼️ Visualization result:', visualResult.success);
      }

      this.updateProgressStep('💾 Saving outfit...', 90);

      // Create outfit data with AI metadata
      const outfitData = {
        id: `ai-outfit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `AI ${this.builderState.currentOccasion} Outfit`,
        description: `AI-generated ${this.builderState.currentOccasion} outfit for ${this.builderState.currentWeather} weather`,
        items: selectedItems.map(item => item.id),
        itemDetails: selectedItems,
        occasion: this.builderState.currentOccasion,
        weather: this.builderState.currentWeather,
        image: visualResult.success ? visualResult.data.dataURL : null,
        aiGenerated: true,
        createdAt: new Date().toISOString(),
        isLoved: false,
        wearCount: 0,
        type: visualResult.success ? visualResult.data.type : 'text-only'
      };

      // Save to localStorage immediately (StyleMuse-like)
      const savedOutfits = JSON.parse(localStorage.getItem('styleagent_outfits') || '[]');
      savedOutfits.unshift(outfitData); // Add to beginning for most recent first
      localStorage.setItem('styleagent_outfits', JSON.stringify(savedOutfits));
      
      console.log('💾 Outfit auto-saved:', outfitData.name);

      this.updateProgressStep('✨ Complete!', 100);

      // Show beautiful result modal with the generated outfit
      setTimeout(() => {
        this.hideProgressModal();
        if (visualResult.success) {
          this.showOutfitCompletionModal(outfitData, visualResult.data);
        } else {
          this.showOutfitSavedNotification(outfitData);
        }
      }, 500);

    } catch (error) {
      console.error('Error auto-saving outfit:', error);
      this.hideProgressModal();
      this.showNotification('⚠️ Could not save outfit automatically', 'warning');
    }
  }

  async generateAndDisplayOutfitVisualization(selectedItems) {
    try {
      console.log('🎨 Generating outfit visualization...', selectedItems.length, 'items');
      
      // Check if we have any items
      if (!selectedItems || selectedItems.length === 0) {
        console.log('❌ No items selected for visualization');
        return;
      }

      // Generate visualization using the OutfitsAPI
      let visualResult = { success: false };
      
      if (typeof OutfitsAPI !== 'undefined') {
        this.showLoading('🎨 Creating outfit visualization...');
        visualResult = await OutfitsAPI.generateVisualization(selectedItems, 'large');
        console.log('🖼️ Visualization result:', visualResult.success);
      } else {
        console.log('❌ OutfitsAPI not available');
        return;
      }

      if (visualResult.success && visualResult.data) {
        // Display the generated image in a modal
        this.showOutfitVisualizationModal(visualResult.data, selectedItems);
      } else {
        console.log('❌ Visualization generation failed:', visualResult.error);
        this.showNotification('⚠️ Could not generate outfit image, but items are selected!', 'warning');
      }
    } catch (error) {
      console.error('Error generating outfit visualization:', error);
      this.showNotification('⚠️ Visualization failed, but outfit is ready!', 'warning');
    }
  }

  showOutfitVisualizationModal(visualData, items) {
    // Create a modal to display the generated outfit
    const modal = document.createElement('div');
    modal.className = 'modal outfit-visual-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>✨ Generated Outfit</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="outfit-display">
            <div class="outfit-image-container">
              <img src="${visualData.dataURL}" alt="Generated Outfit" class="outfit-preview" />
              <div class="outfit-type-badge">${visualData.type === 'photo-realistic' ? '📸 Photo-Realistic' : '🎨 Stylized'}</div>
            </div>
            <div class="outfit-details">
              <h4>🧥 Items in this outfit:</h4>
              <div class="outfit-items-list">
                ${items.slice(0, 6).map(item => `
                  <div class="outfit-item-detail">
                    <span class="item-icon">${this.getCategoryIcon(item.category)}</span>
                    <span class="item-name">${item.name}</span>
                    <span class="item-category">${item.category}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="outfit-actions">
            <button class="btn-primary" onclick="document.querySelector('.outfit-visual-modal').remove(); app.saveCurrentOutfit();">💾 Save This Outfit</button>
            <button class="btn-secondary" onclick="this.closest('.modal').remove()">👍 Looks Good</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Add click handler to image for zoom
    const img = modal.querySelector('.outfit-preview');
    img.addEventListener('click', () => {
      this.showImageModal(visualData.dataURL, 'Generated Outfit');
    });
  }

  displayGeneratedOutfit(data) {
    // Show AI suggestion in chat
    this.openAiChatModal();
    this.addMessage("🎨 Here's your AI-generated outfit:", 'agent');
    this.addMessage(data.aiSuggestion, 'agent');
    
    // Also show a visual notification
    this.showNotification('🎨 Check the AI chat and Outfits tab!', 'info');
  }

  async saveCurrentOutfit() {
    const selectedItems = this.getSelectedItemsArray();
    
    if (selectedItems.length === 0) {
      this.showNotification('❌ Please select some items first!', 'error');
      return;
    }

    try {
      // Generate visualization if OutfitsAPI is available
      let visualResult = { success: false };
      
      if (typeof OutfitsAPI !== 'undefined') {
        visualResult = await OutfitsAPI.generateVisualization(selectedItems);
      }

      // Create outfit data
      const outfitData = {
        id: `outfit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${this.builderState.currentOccasion} Outfit - ${new Date().toLocaleDateString()}`,
        description: `Created for ${this.builderState.currentOccasion} occasion in ${this.builderState.currentWeather} weather`,
        items: selectedItems.map(item => item.id),
        itemDetails: selectedItems,
        occasion: this.builderState.currentOccasion,
        weather: this.builderState.currentWeather,
        image: visualResult.success ? visualResult.data.dataURL : null,
        aiGenerated: false,
        createdAt: new Date().toISOString(),
        isLoved: false,
        wearCount: 0
      };

      // Save to localStorage for now (could be enhanced to use proper API)
      const savedOutfits = JSON.parse(localStorage.getItem('styleagent_outfits') || '[]');
      savedOutfits.push(outfitData);
      localStorage.setItem('styleagent_outfits', JSON.stringify(savedOutfits));
      
      this.showNotification('💾 Outfit saved successfully!', 'success');
      
      // Clear builder
      this.clearAllOutfitSlots();
      
      // Refresh outfits tab with fallback
      await this.refreshOutfitsWithFallback();
    } catch (error) {
      console.error('Error saving outfit:', error);
      this.showNotification('❌ Failed to save outfit', 'error');
    }
  }

  // ==================== OUTFITS TAB ====================
  
  initializeOutfits() {
    // Initialize outfits management
  }

  async refreshOutfits() {
    try {
      // Load all outfits
      const outfitsResult = await OutfitsAPI.getAllOutfits();
      const lovedResult = await OutfitsAPI.getLovedOutfits();
      
      if (outfitsResult.success) {
        this.outfits = outfitsResult.data;
        this.renderOutfits(this.outfits, lovedResult.success ? lovedResult.data : []);
      } else {
        console.error('Failed to load outfits:', outfitsResult.error);
        this.renderEmptyOutfits();
      }
    } catch (error) {
      console.error('Error refreshing outfits:', error);
      this.renderEmptyOutfits();
    }
  }

  async refreshOutfitsWithFallback() {
    try {
      // Try the main API first
      if (typeof OutfitsAPI !== 'undefined') {
        await this.refreshOutfits();
        return;
      }

      // Fallback: Load from localStorage directly
      console.log('📦 Loading outfits from localStorage (fallback)');
      const savedOutfits = JSON.parse(localStorage.getItem('styleagent_outfits') || '[]');
      const lovedOutfits = savedOutfits.filter(outfit => outfit.isLoved);
      
      this.outfits = savedOutfits;
      this.renderOutfits(savedOutfits, lovedOutfits);
      
      console.log('✅ Loaded', savedOutfits.length, 'outfits from localStorage');
    } catch (error) {
      console.error('Error refreshing outfits with fallback:', error);
      this.renderEmptyOutfits();
    }
  }

  renderOutfits(allOutfits, lovedOutfits) {
    const lovedContainer = document.getElementById('lovedOutfits');
    const outfitsGrid = document.getElementById('outfitsGrid');

    // Render loved outfits
    if (lovedOutfits.length > 0) {
      lovedContainer.innerHTML = lovedOutfits.map(outfit => this.renderOutfitCard(outfit, true)).join('');
    } else {
      lovedContainer.innerHTML = `
        <div class="empty-state" style="padding: 20px; text-align: center; color: #718096;">
          <p>💫 Your loved outfits will appear here</p>
        </div>
      `;
    }

    // Render all outfits
    if (allOutfits.length > 0) {
      outfitsGrid.innerHTML = allOutfits.map(outfit => this.renderOutfitCard(outfit, false)).join('');
      
      // Add click listeners
      outfitsGrid.querySelectorAll('.outfit-card').forEach((element, index) => {
        element.addEventListener('click', () => this.selectOutfit(allOutfits[index]));
      });
    } else {
      this.renderEmptyOutfits();
    }
  }

  renderEmptyOutfits() {
    const outfitsGrid = document.getElementById('outfitsGrid');
    outfitsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>📸 No outfits yet</h3>
        <p>Create your first outfit in the Builder tab!</p>
        <button class="btn-primary" onclick="app.switchTab('builder')">🎨 Go to Builder</button>
      </div>
    `;
  }

  renderOutfitCard(outfit, isHorizontal = false) {
    const cardClass = isHorizontal ? 'outfit-card horizontal' : 'outfit-card';
    const lovedClass = outfit.loved ? ' loved' : '';
    
    return `
      <div class="${cardClass}${lovedClass}" data-id="${outfit.id}">
        <div class="outfit-image">
          ${outfit.image ? `<img src="${outfit.image}" alt="${outfit.name}" onclick="app.openImageModal('${outfit.image}', '${outfit.name}')" style="cursor: pointer;">` : `<div class="outfit-image-placeholder">👗</div>`}
          ${outfit.loved ? '<div class="outfit-love-indicator">❤️</div>' : ''}
          ${outfit.aiGenerated ? '<div class="outfit-ai-badge">AI</div>' : ''}
          <div class="outfit-actions">
            <button class="outfit-action-btn love ${outfit.loved ? 'loved' : ''}" onclick="app.toggleOutfitLove('${outfit.id}', event)">
              ${outfit.loved ? '❤️' : '🤍'}
            </button>
            <button class="outfit-action-btn wear" onclick="app.recordOutfitWear('${outfit.id}')">👗</button>
            <button class="outfit-action-btn delete" onclick="app.deleteOutfit('${outfit.id}')">🗑️</button>
          </div>
        </div>
        <div class="outfit-info">
          <div class="outfit-name">${outfit.name}</div>
          <div class="outfit-meta">
            <span>${outfit.aiGenerated ? '🤖' : '👤'}</span>
            <span>Worn ${outfit.timesWorn || 0}x</span>
          </div>
          <div class="outfit-tags">
            <span class="outfit-tag">${outfit.occasion}</span>
            <span class="outfit-tag">${outfit.weather}</span>
          </div>
        </div>
      </div>
    `;
  }

  generateOutfitPlaceholder() {
    return `
      <div class="outfit-placeholder">
        <span>👗</span>
        <p>Outfit</p>
      </div>
    `;
  }

  selectOutfit(outfit) {
    this.showOutfitDetails(outfit);
  }

  showOutfitDetails(outfit) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content outfit-modal-content">
        <div class="modal-header">
          <h3>${outfit.name}</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="outfit-modal-image">
            ${outfit.image ? `<img src="${outfit.image}" alt="${outfit.name}" onclick="app.openImageModal('${outfit.image}', '${outfit.name}')" style="cursor: pointer;">` : `<div class="outfit-image-placeholder">👗</div>`}
          </div>
          
          <div class="outfit-modal-details">
            <div class="outfit-detail-section">
              <h4>Outfit Items</h4>
              <div class="outfit-items-list">
                ${outfit.itemDetails.map(item => `
                  <div class="outfit-item">
                    <span class="outfit-item-emoji">${this.getCategoryEmoji(item.category)}</span>
                    <div class="outfit-item-info">
                      <div class="outfit-item-name">${item.name}</div>
                      <div class="outfit-item-details">${item.color.join(', ')} • ${item.brand || 'No brand'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="outfit-detail-section">
              <h4>Outfit Stats</h4>
              <div class="outfit-stats">
                <div class="outfit-stat">
                  <span class="outfit-stat-number">${outfit.timesWorn || 0}</span>
                  <span class="outfit-stat-label">Times Worn</span>
                </div>
                <div class="outfit-stat">
                  <span class="outfit-stat-number">${outfit.loved ? '❤️' : '🤍'}</span>
                  <span class="outfit-stat-label">Loved</span>
                </div>
                <div class="outfit-stat">
                  <span class="outfit-stat-number">${outfit.aiGenerated ? '🤖' : '👤'}</span>
                  <span class="outfit-stat-label">Type</span>
                </div>
              </div>
              
              <div style="margin-top: 16px; font-size: 14px; color: #718096;">
                <p><strong>Occasion:</strong> ${outfit.occasion}</p>
                <p><strong>Weather:</strong> ${outfit.weather}</p>
                <p><strong>Created:</strong> ${new Date(outfit.createdAt).toLocaleDateString()}</p>
                ${outfit.lastWorn ? `<p><strong>Last Worn:</strong> ${new Date(outfit.lastWorn).toLocaleDateString()}</p>` : ''}
                ${outfit.description ? `<p><strong>Description:</strong> ${outfit.description}</p>` : ''}
              </div>
            </div>
          </div>
          
          <div class="outfit-modal-actions">
            <button class="btn-wear" onclick="app.recordOutfitWear('${outfit.id}')">👗 Mark as Worn</button>
            <button class="btn-love" onclick="app.toggleOutfitLove('${outfit.id}')">
              ${outfit.loved ? '💔 Remove Love' : '❤️ Love This'}
            </button>
            <button class="btn-edit" onclick="app.editOutfit('${outfit.id}')">✏️ Edit</button>
            <button class="btn-copy" onclick="app.copyToBuilder('${outfit.id}')">🎨 Copy to Builder</button>
            <button class="btn-delete" onclick="app.deleteOutfit('${outfit.id}')">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }

  async toggleOutfitLove(outfitId, event = null) {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      const result = await OutfitsAPI.toggleLove(outfitId);
      
      if (result.success) {
        this.showNotification(`${result.data.loved ? '❤️ Added to' : '💔 Removed from'} loved outfits!`, 'success');
        await this.refreshOutfits();
        
        // Close modal if open
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
      } else {
        this.showNotification(`❌ Failed to update: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error toggling outfit love:', error);
      this.showNotification('❌ Failed to update outfit', 'error');
    }
  }

  async recordOutfitWear(outfitId) {
    try {
      const result = await OutfitsAPI.recordWear(outfitId);
      
      if (result.success) {
        this.showNotification('👗 Outfit wear recorded!', 'success');
        await this.refreshOutfits();
        
        // Close modal
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
      } else {
        this.showNotification(`❌ Failed to record wear: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error recording outfit wear:', error);
      this.showNotification('❌ Failed to record wear', 'error');
    }
  }

  async copyToBuilder(outfitId) {
    try {
      const result = await OutfitsAPI.getOutfit(outfitId);
      
      if (result.success) {
        const outfit = result.data;
        
        // Clear builder first
        this.builderState.selectedItems = {
          tops: null,
          bottoms: null,
          shoes: null,
          outerwear: null,
          accessories: []
        };
        
        // Add items to builder
        outfit.itemDetails.forEach(item => {
          if (item.category === 'accessories') {
            this.builderState.selectedItems[item.category].push(item);
          } else {
            this.builderState.selectedItems[item.category] = item;
          }
        });
        
        // Switch to builder and update
        this.switchTab('builder');
        this.updateBuilderSlots();
        
        this.showNotification('🎨 Outfit copied to Builder!', 'success');
        
        // Close modal
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
      } else {
        this.showNotification(`❌ Failed to copy outfit: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error copying outfit to builder:', error);
      this.showNotification('❌ Failed to copy outfit', 'error');
    }
  }

  async deleteOutfit(outfitId) {
    if (!confirm('🗑️ Are you sure you want to delete this outfit?')) {
      return;
    }

    try {
      const result = await OutfitsAPI.deleteOutfit(outfitId);
      
      if (result.success) {
        this.showNotification('🗑️ Outfit deleted successfully!', 'success');
        await this.refreshOutfits();
        
        // Close modal
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
      } else {
        this.showNotification(`❌ Failed to delete outfit: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
      this.showNotification('❌ Failed to delete outfit', 'error');
    }
  }

  // ==================== PROFILE TAB ====================
  
  initializeProfile() {
    // Initialize profile settings
    console.log('Initializing profile tab...');
    
    // Only add the drag-drop section once
    if (!document.getElementById('addClothingSection')) {
      // Find the profile content container
      const profileContent = document.querySelector('.profile-content');
      if (profileContent) {
        // Create the add clothing section
        const addClothingSection = document.createElement('div');
        addClothingSection.id = 'addClothingSection';
        addClothingSection.className = 'add-clothing-section';
        addClothingSection.innerHTML = `
          <h4>📸 Add to Wardrobe</h4>
          <div class="add-clothing-container">
            <div class="drop-zone" id="dropZone">
              <div class="drop-zone-content">
                <span class="drop-icon">📷</span>
                <p class="drop-text">Drag & drop images here</p>
                <p class="drop-subtext">or</p>
                <button class="btn-primary" onclick="app.openUnifiedAddModal()">
                  ✨ Add Clothing
                </button>
              </div>
            </div>
          </div>
        `;
        
        // Insert after analytics cards but before settings
        const settingsSection = document.querySelector('.settings-section');
        profileContent.insertBefore(addClothingSection, settingsSection);
      }
    }
    
    // Initialize drag and drop every time we switch to profile tab
    setTimeout(() => {
      this.initializeDragAndDrop();
      
      // Add clothing button now uses unified add modal via onclick
    }, 100);
  }

  async refreshProfile() {
    // Re-initialize profile to ensure drag-drop works
    this.initializeProfile();
    await this.updateAnalytics();
    await this.loadStyleDNA();
  }

  initializeDragAndDrop() {
    console.log('🚀 Starting drag and drop initialization...');
    
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) {
      console.log('❌ Drop zone not found');
      return;
    }

    console.log('🎯 Found drop zone:', dropZone);

    // Use Electron-specific approach for file drops
    // First, prevent default behavior on the entire document
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📄 Document dragover');
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📄 Document drop');
    });

    // Now set up the drop zone with better Electron compatibility
    const setupDropZone = () => {
      console.log('⚙️ Setting up drop zone handlers...');
      
      dropZone.addEventListener('dragenter', (e) => {
        console.log('🔥 DRAGENTER EVENT!');
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
      }, true);

      dropZone.addEventListener('dragover', (e) => {
        console.log('🔄 DRAGOVER EVENT!');
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'copy';
      }, true);

      dropZone.addEventListener('dragleave', (e) => {
        console.log('🚪 DRAGLEAVE EVENT!');
        e.preventDefault();
        e.stopPropagation();
        
        // Check if we're really leaving the drop zone
        const rect = dropZone.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
          dropZone.classList.remove('drag-over');
        }
      }, true);

      dropZone.addEventListener('drop', (e) => {
        console.log('🎯 DROP EVENT TRIGGERED!');
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        console.log('📦 Files received:', files ? files.length : 0);
        
        if (files && files.length > 0) {
          console.log('✅ Processing files...');
          this.handleDroppedFiles(files);
        } else {
          console.log('❌ No files in drop event');
        }
      }, true);
    };

    // Set up the handlers
    setupDropZone();

    // Also try the whole-page approach as backup
    document.body.addEventListener('drop', (e) => {
      console.log('🌍 BODY DROP EVENT!');
      console.log('📍 Drop coordinates:', e.clientX, e.clientY);
      
      // Check if the drop zone exists and is visible (better approach)
      const dropZoneElement = document.getElementById('dropZone');
      console.log('🔍 Drop zone element:', dropZoneElement);
      console.log('🔍 Drop zone visible:', dropZoneElement ? !dropZoneElement.offsetParent ? 'hidden' : 'visible' : 'not found');
      console.log('🔍 Current tab from app:', this.currentTab);
      
      // If drop zone exists and is visible, accept the drop
      if (dropZoneElement && dropZoneElement.offsetParent !== null) {
        console.log('✅ Drop zone is visible - accepting files');
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        console.log('📁 Files in drop:', files ? files.length : 0);
        
        if (files && files.length > 0) {
          // Add visual feedback to drop zone
          dropZoneElement.classList.add('drag-over');
          setTimeout(() => {
            dropZoneElement.classList.remove('drag-over');
          }, 300);
          
          this.handleDroppedFiles(files);
        }
      } else {
        console.log('❌ Drop zone not visible, ignoring drop');
      }
    }, true);

    // Visual feedback setup
    const dropIcon = dropZone.querySelector('.drop-icon');
    if (dropIcon) {
      dropIcon.textContent = '📷✨';
    }
    
    dropZone.style.cursor = 'copy';
    
    console.log('✅ Drag and drop setup complete');
  }

  setupModalDragDrop(uploadArea, modal) {
    console.log('🎯 Setting up modal drag-and-drop...');
    
    // Prevent default drag behaviors on the modal
    const modalContent = modal.querySelector('.modal-content');
    
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Handle drag events on the upload area
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
      modalContent.addEventListener(eventName, preventDefaults, false);
    });

    // Visual feedback
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        console.log('🔥 Modal drag enter/over');
        uploadArea.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        console.log('🚪 Modal drag leave/drop');
        uploadArea.classList.remove('drag-over');
      }, false);
    });

    // Handle dropped files
    uploadArea.addEventListener('drop', (e) => {
      console.log('🎯 FILES DROPPED ON MODAL!');
      const files = e.dataTransfer.files;
      console.log('📦 Files dropped:', files ? files.length : 0);
      
      if (files && files.length > 0) {
        // Filter for image files
        const imageFiles = Array.from(files).filter(file => 
          file.type.startsWith('image/')
        );
        
        console.log('🖼️ Image files:', imageFiles.length);
        
        if (imageFiles.length > 0) {
          // Close the current modal and open the dropped files modal
          modal.remove();
          this.showMultiImageUploadWithFiles(imageFiles);
        } else {
          console.log('❌ No image files found');
          this.showNotification('❌ Please drop image files only', 'error');
        }
      }
    }, false);

    console.log('✅ Modal drag-and-drop setup complete');
  }

  showOutfitGenerationProgress() {
    // Create StyleMuse-like progress modal
    const modal = document.createElement('div');
    modal.className = 'modal outfit-progress-modal';
    modal.id = 'outfitProgressModal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-body">
          <div class="progress-container">
            <div class="progress-icon">
              <div class="dna-spinner">🧬</div>
            </div>
            <h3 class="progress-title">Analyzing Your Style DNA...</h3>
            <p class="progress-description">Creating the perfect outfit combination</p>
            
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" id="outfitProgressFill"></div>
              </div>
              <div class="progress-percentage" id="outfitProgressPercent">20%</div>
            </div>
            
            <div class="progress-step" id="outfitProgressStep">🤖 AI analyzing your preferences...</div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Start with initial progress
    this.updateProgressStep('🤖 AI analyzing your preferences...', 20);
  }

  updateProgressStep(stepText, percentage) {
    const stepEl = document.getElementById('outfitProgressStep');
    const fillEl = document.getElementById('outfitProgressFill');
    const percentEl = document.getElementById('outfitProgressPercent');
    
    if (stepEl) stepEl.textContent = stepText;
    if (fillEl) fillEl.style.width = `${percentage}%`;
    if (percentEl) percentEl.textContent = `${percentage}%`;
    
    // Update title based on progress
    const titleEl = document.querySelector('.progress-title');
    if (titleEl && percentage >= 90) {
      titleEl.textContent = 'Almost Ready!';
    } else if (titleEl && percentage >= 60) {
      titleEl.textContent = 'Creating Your Look...';
    }
  }

  hideProgressModal() {
    const modal = document.getElementById('outfitProgressModal');
    if (modal) {
      modal.remove();
    }
  }

  showOutfitCompletionModal(outfitData, visualData) {
    // Beautiful completion modal with the generated image
    const modal = document.createElement('div');
    modal.className = 'modal outfit-completion-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>✨ Your Outfit is Ready!</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="completion-display">
            <div class="outfit-image-showcase">
              <img src="${visualData.dataURL}" alt="Generated Outfit" class="completion-image" />
              <div class="outfit-badge">${visualData.type === 'photo-realistic' ? '📸 Photo-Realistic' : '🎨 Stylized'}</div>
            </div>
            <div class="outfit-summary">
              <h4>${outfitData.name}</h4>
              <p class="outfit-desc">${outfitData.description}</p>
              <div class="outfit-stats">
                <span class="stat">👔 ${outfitData.itemDetails.length} items</span>
                <span class="stat">🎯 ${outfitData.occasion}</span>
                <span class="stat">🌤️ ${outfitData.weather}</span>
              </div>
            </div>
          </div>
          <div class="completion-actions">
            <button class="btn-primary" onclick="this.closest('.modal').remove(); app.switchTab('outfits');">
              👗 View in Outfits
            </button>
            <button class="btn-secondary" onclick="this.closest('.modal').remove();">
              ✨ Create Another
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Add click handler to image for zoom
    const img = modal.querySelector('.completion-image');
    img.addEventListener('click', () => {
      this.showImageModal(visualData.dataURL, 'Your Generated Outfit');
    });
  }

  showOutfitSavedNotification(outfitData) {
    // Fallback for when no image was generated
    this.showNotification(`✨ ${outfitData.name} saved successfully!`, 'success');
    setTimeout(() => {
      this.switchTab('outfits');
    }, 1000);
  }

  async handleDroppedFiles(files) {
    console.log('handleDroppedFiles called with:', files.length, 'files');
    
    // Filter for image files only
    const imageFiles = Array.from(files).filter(file => {
      console.log('File:', file.name, 'Type:', file.type);
      return file.type.startsWith('image/');
    });

    if (imageFiles.length === 0) {
      this.showNotification('❌ Please drop image files only', 'error');
      return;
    }

    console.log(`📸 Dropped ${imageFiles.length} image files`);
    
    // Show upload modal with dropped files
    this.showMultiImageUploadModal(imageFiles);
  }

  showMultiImageUploadModal(droppedFiles = null) {
    // If files were dropped, use the existing multi-image upload flow
    if (droppedFiles && droppedFiles.length > 0) {
      // Convert FileList to array of paths for the existing flow
      this.showMultiImageUploadWithFiles(droppedFiles);
    } else {
      // Otherwise show the regular upload modal
      this.showMultiImageUpload();
    }
  }

  async showMultiImageUploadWithFiles(droppedFiles) {
    // Create a custom modal for dropped files
    const modal = document.createElement('div');
    modal.className = 'modal multi-image-upload-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>📸 Analyze Dropped Images</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="dropped-files-section">
            <h4>📎 ${droppedFiles.length} images ready for analysis</h4>
            <div class="dropped-files-grid">
              ${Array.from(droppedFiles).map(file => `
                <div class="dropped-file-preview">
                  <div class="file-icon">🖼️</div>
                  <div class="file-name">${file.name}</div>
                  <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
                </div>
              `).join('')}
            </div>
            <button class="btn-primary" id="analyzeDroppedBtn">🔍 Analyze All Images</button>
          </div>
          
          <div class="analysis-progress" id="analysisProgress" style="display: none;">
            <div class="progress-header">
              <h4>🔍 Analyzing Images...</h4>
              <span class="progress-text" id="progressText">0%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="current-item" id="currentItem"></div>
          </div>
          
          <div class="analysis-results" id="analysisResults" style="display: none;">
            <h4>📋 Analysis Results</h4>
            <div class="results-grid" id="resultsGrid">
              <!-- Results will be populated here -->
            </div>
            <div class="results-actions">
              <button class="btn-primary" id="addAllItemsBtn">✅ Add All Items</button>
              <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Handle analyze button click
    const analyzeBtn = modal.querySelector('#analyzeDroppedBtn');
    analyzeBtn.addEventListener('click', async () => {
      await this.analyzeDroppedFiles(modal, droppedFiles);
    });
  }

  async analyzeDroppedFiles(modal, droppedFiles) {
    try {
      console.log('Starting analysis of dropped files...');
      
      // For Electron, we need to save files temporarily to analyze them
      // Create temporary file paths
      const fs = require('fs').promises;
      const path = require('path');
      const os = require('os');
      
      const tempDir = path.join(os.tmpdir(), 'styleagent-temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const tempFilePaths = [];
      
      // Save each file temporarily
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        const buffer = await file.arrayBuffer();
        const tempPath = path.join(tempDir, `temp-${Date.now()}-${i}-${file.name}`);
        await fs.writeFile(tempPath, Buffer.from(buffer));
        tempFilePaths.push(tempPath);
      }
      
      // Hide the dropped files section and show progress
      const droppedSection = modal.querySelector('.dropped-files-section');
      const progressArea = modal.querySelector('#analysisProgress');
      droppedSection.style.display = 'none';
      progressArea.style.display = 'block';
      
      // Set up progress tracking
      const progressText = modal.querySelector('#progressText');
      const progressFill = modal.querySelector('#progressFill');
      const currentItem = modal.querySelector('#currentItem');
      
      // Set up progress listener
      ClothingAnalysisAPI.onAnalysisProgress((progress) => {
        const percentage = Math.round(progress.percentage);
        progressText.textContent = `${percentage}%`;
        progressFill.style.width = `${percentage}%`;
        currentItem.textContent = `Analyzing: ${progress.imagePath.split('/').pop()}`;
      });
      
      // Use the clothing analysis API
      const analysisResult = await ClothingAnalysisAPI.analyzeImages(tempFilePaths);
      
      // Clean up progress listener
      ClothingAnalysisAPI.removeAnalysisProgressListener();
      
      // Clean up temp files
      for (const tempPath of tempFilePaths) {
        try {
          await fs.unlink(tempPath);
        } catch (e) {
          console.error('Error deleting temp file:', e);
        }
      }
      
      if (analysisResult.success) {
        this.showAnalysisResults(modal, analysisResult);
      } else {
        this.showNotification(`❌ Analysis failed: ${analysisResult.error}`, 'error');
        modal.remove();
      }
      
    } catch (error) {
      console.error('Error analyzing dropped files:', error);
      this.showNotification('❌ Failed to analyze images', 'error');
      modal.remove();
    }
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async analyzeFileData(fileData) {
    // This is a simplified version - in production, you'd save the file temporarily
    // or send it directly to the analysis API
    try {
      // For now, create a basic item from the data URL
      const item = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: fileData.name.replace(/\.[^/.]+$/, ''), // Remove extension
        category: 'tops', // Default category
        color: ['unknown'],
        material: ['unknown'],
        image: fileData.dataUrl,
        confidence: 0.8,
        brand: '',
        size: '',
        season: ['all-season'],
        occasion: ['casual']
      };
      
      return item;
    } catch (error) {
      console.error('Error analyzing file data:', error);
      return null;
    }
  }

  async updateAnalytics() {
    try {
      const stats = await WardrobeAPI.getStatistics();
      
      if (stats.success) {
        this.updateAnalyticsDisplay(stats.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }

  updateAnalyticsDisplay(data) {
    // Update analytics numbers
    document.getElementById('totalWears').textContent = data.totalWears || 0;
    document.getElementById('favoriteItems').textContent = data.favoriteItems || 0;
    document.getElementById('outfitCount').textContent = data.outfitCount || 0;

    // Update color palette
    const topColors = document.getElementById('topColors');
    if (data.topColors && data.topColors.length > 0) {
      topColors.innerHTML = data.topColors.slice(0, 5).map(color => 
        `<div class="color-swatch" style="background-color: ${color}"></div>`
      ).join('');
    } else {
      topColors.innerHTML = '<p style="color: #718096; font-size: 12px;">Add items to see your color palette</p>';
    }

    // Update style tags
    const styleTags = document.getElementById('styleTags');
    if (data.styleTags && data.styleTags.length > 0) {
      styleTags.innerHTML = data.styleTags.map(tag => 
        `<span class="style-tag">${tag}</span>`
      ).join('');
    } else {
      styleTags.innerHTML = '<p style="color: #718096; font-size: 12px;">Style insights coming soon!</p>';
    }
  }

  // ======================================
  // STYLE DNA FUNCTIONALITY
  // ======================================

  async loadStyleDNA() {
    try {
      const result = await StyleDNAAPI.getProfile();
      
      if (result.success && result.profile) {
        this.renderStyleDNAProfile(result.profile, result.statistics);
      } else {
        this.renderStyleDNAUpload();
      }
    } catch (error) {
      console.error('Error loading Style DNA:', error);
      this.renderStyleDNAUpload();
    }
  }

  renderStyleDNAUpload() {
    const container = document.getElementById('styleDNAContent');
    container.innerHTML = `
      <div class="style-dna-upload">
        <div class="upload-area">
          <div class="upload-icon">📸</div>
          <h3>Create Your Style DNA</h3>
          <p>Upload a clear photo of yourself to generate personalized outfit visualizations</p>
          <button class="btn-primary style-dna-upload-btn" onclick="app.uploadStyleDNAPhoto()">
            📷 Upload Photo
          </button>
        </div>
        <div class="style-dna-benefits">
          <h4>✨ What you'll get:</h4>
          <ul>
            <li>🧬 Personalized appearance analysis</li>
            <li>👤 Outfit images showing YOU wearing the clothes</li>
            <li>🎨 Custom style recommendations</li>
            <li>📊 Consistent appearance across all generated outfits</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderStyleDNAProfile(profile, statistics) {
    const container = document.getElementById('styleDNAContent');
    const appearance = profile.appearance;
    
    container.innerHTML = `
      <div class="style-dna-profile">
        <div class="profile-header">
          <div class="profile-photo">
            <img src="data:image/${appearance.photoData?.format || 'png'};base64,${appearance.photoData?.base64 || ''}" 
                 alt="Your Style DNA Photo" 
                 class="dna-photo" 
                 onclick="app.openImageModal('data:image/${appearance.photoData?.format || 'png'};base64,${appearance.photoData?.base64 || ''}', 'Your Style DNA Photo')">
          </div>
          <div class="profile-info">
            <h3>🧬 Your Style DNA</h3>
            <p class="created-date">Created ${new Date(profile.uploadedAt).toLocaleDateString()}</p>
            <div class="confidence-score">
              <span class="confidence-label">Analysis Confidence:</span>
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${(statistics.appearanceConfidence * 100)}%"></div>
              </div>
              <span class="confidence-text">${Math.round(statistics.appearanceConfidence * 100)}%</span>
            </div>
          </div>
        </div>

        <div class="appearance-analysis">
          <h4>🎨 Appearance Analysis</h4>
          <div class="appearance-grid">
            <div class="appearance-item">
              <span class="appearance-label">Skin Tone:</span>
              <span class="appearance-value">${appearance.skinTone.category} (${appearance.skinTone.undertone})</span>
              <div class="skin-color-swatch" style="background-color: ${appearance.skinTone.hex}"></div>
            </div>
            <div class="appearance-item">
              <span class="appearance-label">Hair:</span>
              <span class="appearance-value">${appearance.hair.color} ${appearance.hair.style}</span>
            </div>
            <div class="appearance-item">
              <span class="appearance-label">Eyes:</span>
              <span class="appearance-value">${appearance.eyes.color}</span>
            </div>
            <div class="appearance-item">
              <span class="appearance-label">Build:</span>
              <span class="appearance-value">${appearance.bodyType.build}</span>
            </div>
          </div>
        </div>

        <div class="style-dna-actions">
          <button class="btn-secondary" onclick="app.updateStyleDNAPhoto()">
            📷 Update Photo
          </button>
          <button class="btn-secondary" onclick="app.editStylePreferences()">
            ✏️ Edit Preferences  
          </button>
          <button class="btn-danger" onclick="app.deleteStyleDNA()">
            🗑️ Delete Profile
          </button>
        </div>

        <div class="style-benefits-active">
          <p>✅ <strong>Style DNA Active!</strong> Your outfit generations now show YOU wearing the clothes!</p>
        </div>
      </div>
    `;
  }

  async uploadStyleDNAPhoto() {
    try {
      this.showNotification('📸 Opening photo selector...', 'info');
      
      const result = await StyleDNAAPI.uploadPhoto();
      
      if (result.success) {
        this.showNotification('🎉 Style DNA created successfully!', 'success');
        await this.loadStyleDNA(); // Refresh the display
      } else {
        this.showNotification(`❌ Upload failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error uploading Style DNA photo:', error);
      this.showNotification('❌ Upload failed. Please try again.', 'error');
    }
  }

  async updateStyleDNAPhoto() {
    try {
      const result = await StyleDNAAPI.uploadPhoto();
      
      if (result.success) {
        this.showNotification('✅ Photo updated successfully!', 'success');
        await this.loadStyleDNA();
      } else {
        this.showNotification(`❌ Update failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error updating Style DNA photo:', error);
      this.showNotification('❌ Update failed. Please try again.', 'error');
    }
  }

  async deleteStyleDNA() {
    if (!confirm('Are you sure you want to delete your Style DNA profile? This cannot be undone.')) {
      return;
    }
    
    try {
      const result = await StyleDNAAPI.deleteProfile();
      
      if (result.success) {
        this.showNotification('✅ Style DNA profile deleted', 'success');
        await this.loadStyleDNA(); // Show upload interface
      } else {
        this.showNotification(`❌ Delete failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting Style DNA:', error);
      this.showNotification('❌ Delete failed. Please try again.', 'error');
    }
  }

  editStylePreferences() {
    // TODO: Implement preferences editing modal
    this.showNotification('🚧 Preferences editing coming soon!', 'info');
  }

  getCategoryEmoji(category) {
    const emojis = {
      tops: '👕',
      bottoms: '👖',
      shoes: '👟',
      accessories: '👜',
      outerwear: '🧥',
      underwear: '🩲',
      sleepwear: '🛌',
      activewear: '🏃'
    };
    return emojis[category] || '👔';
  }

  // ==================== AI SYSTEM ====================
  
  async checkAIAvailability() {
    try {
      const result = await AIAPI.isAvailable();
      this.aiAvailable = result.success && result.available;
      
      if (this.aiAvailable) {
        this.showNotification('🤖 AI StyleAgent is ready!', 'success');
        this.updateAIButton(true);
      } else {
        this.updateAIButton(false);
      }
    } catch (error) {
      console.error('Error checking AI availability:', error);
      this.aiAvailable = false;
      this.updateAIButton(false);
    }
  }

  updateAIButton(available) {
    const aiBtn = document.getElementById('suggestOutfitBtn');
    if (available) {
      aiBtn.innerHTML = '🤖 AI Suggest';
      aiBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    } else {
      aiBtn.innerHTML = '⏳ AI Loading...';
      aiBtn.style.background = '#718096';
    }
  }

  async checkPhotoAvailability() {
    try {
      const result = await PhotoAPI.isAvailable();
      this.photoAvailable = result.success && result.available;
      
      if (this.photoAvailable) {
        this.showNotification('🎨 Photo-realistic generation ready!', 'success');
        console.log('📸 Photo-realistic outfit generation available');
      } else {
        console.log('📷 Photo-realistic generation not available:', result.lastError);
        console.log('💡 To enable: Install Automatic1111 WebUI and start with --api flag');
        console.log('ℹ️  Using SVG fallback for outfit visualization');
      }
    } catch (error) {
      console.error('Error checking photo availability:', error);
      this.photoAvailable = false;
    }
  }

  async sendMessage() {
    const input = document.getElementById('agentInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    
    if (!this.aiAvailable) {
      this.addMessage("🤖 AI is not available yet. Make sure Ollama is installed and running.", 'agent');
      return;
    }

    // Show typing indicator
    this.addMessage("💭 Thinking...", 'agent', 'typing');
    
    try {
      const result = await AIAPI.chat(message, {
        currentTab: this.currentTab,
        itemCount: this.currentItems.length
      });
      
      // Remove typing indicator
      this.removeTypingIndicator();
      
      if (result.success) {
        this.addMessage(result.response, 'agent');
      } else {
        this.addMessage(`❌ Sorry, I had an error: ${result.error}`, 'agent');
      }
    } catch (error) {
      this.removeTypingIndicator();
      console.error('Error sending message:', error);
      this.addMessage("❌ Sorry, I couldn't process that message. Please try again.", 'agent');
    }
  }

  addMessage(text, sender, type = '') {
    const conversation = document.getElementById('conversation');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message ${type}`;
    
    // Convert line breaks to HTML for better formatting
    const formattedText = text.replace(/\n/g, '<br>');
    messageDiv.innerHTML = `<p>${formattedText}</p>`;
    
    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
  }

  removeTypingIndicator() {
    const typingMessage = document.querySelector('.message.typing');
    if (typingMessage) {
      typingMessage.remove();
    }
  }

  // ==================== UTILITY FUNCTIONS ====================
  
  showLoading(message = 'Loading...') {
    const grid = document.getElementById('clothingGrid');
    if (grid) {
      grid.innerHTML = `<div class="loading">${message}</div>`;
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
  }

  // ======================================
  // IMAGE MODAL FUNCTIONALITY
  // ======================================

  // Bridge function for outfit modals to open fullscreen image view
  showImageModal(imageSrc, imageName = 'Generated Outfit') {
    this.openImageModal(imageSrc, imageName);
  }

  openImageModal(imageSrc, imageName = 'Outfit Image') {
    // Create modal if it doesn't exist
    let modal = document.getElementById('image-modal');
    if (!modal) {
      modal = this.createImageModal();
    }

    // Set image and name
    const modalImage = modal.querySelector('.modal-image');
    const modalTitle = modal.querySelector('.modal-title');
    
    modalImage.src = imageSrc;
    modalTitle.textContent = imageName;
    
    // Start with contain mode (full image visible) by default
    modalImage.classList.remove('cover-mode', 'crop-mode');
    modalImage.classList.add('contain-mode');
    
    // Reset zoom and position
    this.resetImageModalTransform();
    
    // Show modal with beautiful fade-in
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Auto-hide help text after 4 seconds for cleaner viewing
    const imageInfo = modal.querySelector('.image-info');
    setTimeout(() => {
      if (imageInfo) {
        imageInfo.style.opacity = '0';
        // Show again on mouse move
        const showInfoOnMove = () => {
          imageInfo.style.opacity = '0.9';
          clearTimeout(this.hideInfoTimeout);
          this.hideInfoTimeout = setTimeout(() => {
            imageInfo.style.opacity = '0';
          }, 3000);
        };
        modal.addEventListener('mousemove', showInfoOnMove, { once: true });
      }
    }, 4000);
    
    // Add keyboard event listener for Escape key
    this.addModalKeyboardListener();
  }

  createImageModal() {
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="app.closeImageModal()"></div>
      <div class="modal-content fullscreen-content">
        <!-- Enhanced Header with Beautiful Styling -->
        <div class="modal-header fullscreen-header">
          <h3 class="modal-title">✨ Your Beautiful Outfit</h3>
          <div class="modal-controls">
            <button class="modal-control-btn" onclick="app.toggleImageFit()" title="Toggle Fit Mode">
              <span>📐</span>
            </button>
            <button class="modal-control-btn" onclick="app.zoomImageModal(0.8)" title="Zoom Out">
              <span>🔍-</span>
            </button>
            <button class="modal-control-btn" onclick="app.zoomImageModal(1.25)" title="Zoom In">
              <span>🔍+</span>
            </button>
            <button class="modal-control-btn" onclick="app.resetImageModalTransform()" title="Reset View">
              <span>⟲</span>
            </button>
            <button class="modal-control-btn close-btn" onclick="app.closeImageModal()" title="Close">
              <span>✕</span>
            </button>
          </div>
        </div>
        
        <!-- Fullscreen Image Container -->
        <div class="modal-image-container fullscreen-container">
          <img class="modal-image fullscreen-image" draggable="false">
          
          <!-- Image Info Overlay -->
          <div class="image-info">
            <span class="image-hint">🖱️ Drag to pan • 🖱️ Scroll to zoom • 📐 F key to toggle fit modes • ⌨️ ESC to close</span>
          </div>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(modal);

    // Add event listeners for dragging and zooming
    this.setupImageModalInteractions(modal);

    return modal;
  }

  setupImageModalInteractions(modal) {
    const image = modal.querySelector('.modal-image');
    const container = modal.querySelector('.modal-image-container');
    
    // Zoom and pan state
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let lastPanX = 0;
    let lastPanY = 0;

    // Apply transform to image with improved handling
    const updateTransform = () => {
      // Only apply transform if not in crop-mode (which has its own transform)
      if (!image.classList.contains('crop-mode')) {
        image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      } else {
        // In crop mode, combine the crop transform with user zoom/pan
        image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale * 1.3})`;
      }
    };

    // Reset transform
    this.resetImageModalTransform = () => {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
    };

    // Enhanced zoom functions for buttons
    this.zoomImageModal = (factor) => {
      const newScale = scale * factor;
      // Adjust zoom limits based on current mode
      const maxZoom = image.classList.contains('crop-mode') ? 3 : 5;
      const minZoom = 0.3;
      
      if (newScale >= minZoom && newScale <= maxZoom) {
        scale = newScale;
        updateTransform();
      }
    };

    // 🖱️ SCROLL TO ZOOM
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const zoomIntensity = 0.1;
      const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
      const newScale = scale + delta;
      
      // Adjust zoom limits based on current mode
      const maxZoom = image.classList.contains('crop-mode') ? 3 : 5;
      const minZoom = 0.3;
      
      if (newScale >= minZoom && newScale <= maxZoom) {
        scale = newScale;
        updateTransform();
      }
    });

    // 📱 PINCH TO ZOOM (Touch)
    let initialDistance = 0;
    let initialScale = 1;

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        // Two finger pinch
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialScale = scale;
      } else if (e.touches.length === 1) {
        // Single finger drag setup
        isDragging = true;
        lastPanX = e.touches[0].clientX;
        lastPanY = e.touches[0].clientY;
        image.style.cursor = 'grabbing';
      }
    });

    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      
      if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const newScale = initialScale * (currentDistance / initialDistance);
        // Adjust zoom limits based on current mode
        const maxZoom = image.classList.contains('crop-mode') ? 3 : 5;
        const minZoom = 0.3;
        
        if (newScale >= minZoom && newScale <= maxZoom) {
          scale = newScale;
          updateTransform();
        }
      } else if (e.touches.length === 1 && isDragging) {
        // Single finger pan
        const deltaX = e.touches[0].clientX - lastPanX;
        const deltaY = e.touches[0].clientY - lastPanY;
        
        translateX += deltaX;
        translateY += deltaY;
        
        lastPanX = e.touches[0].clientX;
        lastPanY = e.touches[0].clientY;
        
        updateTransform();
      }
    });

    container.addEventListener('touchend', () => {
      isDragging = false;
      image.style.cursor = 'grab';
    });

    // 🖱️ MOUSE DRAG TO PAN
    image.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      lastPanX = e.clientX;
      lastPanY = e.clientY;
      image.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastPanX;
      const deltaY = e.clientY - lastPanY;
      
      translateX += deltaX;
      translateY += deltaY;
      
      lastPanX = e.clientX;
      lastPanY = e.clientY;
      
      updateTransform();
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      image.style.cursor = 'grab';
    });

    // Initialize transform
    updateTransform();
  }

  // Toggle between different image fit modes
  toggleImageFit() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    
    const image = modal.querySelector('.fullscreen-image');
    if (!image) return;
    
    // Enhanced toggle with three modes: contain -> cover -> crop -> contain
    if (image.classList.contains('contain-mode')) {
      // Switch to cover mode (fill screen, may crop)
      image.classList.remove('contain-mode');
      image.classList.add('cover-mode');
      this.showNotification('📐 Fill Screen Mode (may crop edges)', 'info');
    } else if (image.classList.contains('cover-mode')) {
      // Switch to crop mode (zoomed in focus)
      image.classList.remove('cover-mode');
      image.classList.add('crop-mode');
      this.showNotification('🔍 Focused Crop Mode (zoomed in)', 'info');
    } else {
      // Switch back to contain mode (show full image, may have black bars)
      image.classList.remove('cover-mode', 'crop-mode');
      image.classList.add('contain-mode');
      this.showNotification('📐 Fit Full Image Mode (may show black bars)', 'info');
    }
    
    // Reset zoom and position when changing modes
    this.resetImageModalTransform();
  }

  closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = ''; // Restore body scrolling
      this.removeModalKeyboardListener();
    }
  }

  addModalKeyboardListener() {
    // Remove existing listener if any
    this.removeModalKeyboardListener();
    
    // Create new listener
    this.modalKeyboardHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeImageModal();
      } else if (e.key === '+' || e.key === '=') {
        this.zoomImageModal(1.25);
      } else if (e.key === '-') {
        this.zoomImageModal(0.8);
      } else if (e.key === '0') {
        this.resetImageModalTransform();
      } else if (e.key === 'f' || e.key === 'F') {
        // Toggle fit mode with 'F' key
        this.toggleImageFit();
      }
    };
    
    document.addEventListener('keydown', this.modalKeyboardHandler);
  }

  removeModalKeyboardListener() {
    if (this.modalKeyboardHandler) {
      document.removeEventListener('keydown', this.modalKeyboardHandler);
      this.modalKeyboardHandler = null;
    }
  }

  // ==================== COMPREHENSIVE LOGGING SYSTEM ====================

  initializeLogging() {
    this.logHistory = [];
    this.featureUsage = {
      wardrobeActions: { sort: 0, filter: 0, search: 0, viewMode: 0 },
      itemInteractions: { add: 0, edit: 0, delete: 0, favorite: 0, worn: 0 },
      outfitGeneration: { create: 0, save: 0, favorite: 0 },
      aiInteractions: { chat: 0, suggest: 0, analyze: 0 },
      uploads: { single: 0, batch: 0, dragDrop: 0 }
    };
    this.performanceMetrics = {
      loadTimes: [],
      renderTimes: [],
      searchTimes: []
    };
    
    // Set up periodic logging
    setInterval(() => this.logPeriodicStats(), 30000); // Every 30 seconds
    
    console.log('📊 Comprehensive logging system initialized');
  }

  logAction(category, action, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      action,
      details,
      sessionId: this.sessionId || 'unknown'
    };
    
    this.logHistory.push(logEntry);
    
    // Track feature usage
    if (this.featureUsage[category] && this.featureUsage[category][action] !== undefined) {
      this.featureUsage[category][action]++;
    }
    
    // Console output with emoji for visibility
    const emoji = this.getLogEmoji(category, action);
    console.log(`${emoji} [${category}:${action}]`, details);
    
    // Keep log history reasonable size
    if (this.logHistory.length > 1000) {
      this.logHistory = this.logHistory.slice(-500);
    }
  }

  getLogEmoji(category, action) {
    const emojiMap = {
      wardrobeActions: { sort: '🔄', filter: '🔍', search: '🔎', viewMode: '📋' },
      itemInteractions: { add: '➕', edit: '✏️', delete: '🗑️', favorite: '⭐', worn: '👕' },
      outfitGeneration: { create: '✨', save: '💾', favorite: '❤️' },
      aiInteractions: { chat: '🤖', suggest: '💡', analyze: '🧠' },
      uploads: { single: '📸', batch: '📷', dragDrop: '🎯' },
      performance: { load: '⚡', render: '🎨', search: '🔍' },
      errors: { api: '❌', ui: '⚠️', network: '🌐' }
    };
    
    return emojiMap[category]?.[action] || '📝';
  }

  logPerformance(action, startTime, endTime = Date.now()) {
    const duration = endTime - startTime;
    const category = 'performance';
    
    this.logAction(category, action, { duration, startTime, endTime });
    
    // Track performance metrics
    if (this.performanceMetrics[`${action}Times`]) {
      this.performanceMetrics[`${action}Times`].push(duration);
      
      // Keep only last 50 measurements
      if (this.performanceMetrics[`${action}Times`].length > 50) {
        this.performanceMetrics[`${action}Times`] = this.performanceMetrics[`${action}Times`].slice(-25);
      }
    }
    
    // Warn about slow operations
    if (duration > 3000) {
      console.warn(`⚠️ Slow ${action}: ${duration}ms`);
    }
  }

  logError(category, action, error, context = {}) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    this.logAction('errors', category, errorDetails);
    console.error(`❌ Error in ${category}:${action}:`, error, context);
  }

  logWarning(category, action, message, details = {}) {
    this.logAction('warnings', category, { message, ...details });
    console.warn(`⚠️ Warning in ${category}:${action}: ${message}`, details);
  }

  logPeriodicStats() {
    const stats = {
      totalActions: this.logHistory.length,
      featureUsage: this.featureUsage,
      averagePerformance: this.calculateAveragePerformance(),
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Periodic Stats:', stats);
    return stats;
  }

  calculateAveragePerformance() {
    const averages = {};
    
    Object.keys(this.performanceMetrics).forEach(key => {
      const times = this.performanceMetrics[key];
      if (times.length > 0) {
        averages[key] = {
          average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
          min: Math.min(...times),
          max: Math.max(...times),
          samples: times.length
        };
      }
    });
    
    return averages;
  }

  exportLogs() {
    const exportData = {
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      logHistory: this.logHistory,
      featureUsage: this.featureUsage,
      performanceMetrics: this.performanceMetrics,
      summary: {
        totalActions: this.logHistory.length,
        sessionDuration: Date.now() - (this.sessionStartTime || Date.now()),
        averagePerformance: this.calculateAveragePerformance()
      }
    };
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `styleagent-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📄 Logs exported successfully');
    return exportData;
  }

  clearLogs() {
    this.logHistory = [];
    this.featureUsage = {
      wardrobeActions: { sort: 0, filter: 0, search: 0, viewMode: 0 },
      itemInteractions: { add: 0, edit: 0, delete: 0, favorite: 0, worn: 0 },
      outfitGeneration: { create: 0, save: 0, favorite: 0 },
      aiInteractions: { chat: 0, suggest: 0, analyze: 0 },
      uploads: { single: 0, batch: 0, dragDrop: 0 }
    };
    this.performanceMetrics = {
      loadTimes: [],
      renderTimes: [],
      searchTimes: []
    };
    
    console.log('🧹 Logs cleared');
  }

  // ==================== PROFESSIONAL CAMERA ====================

  initializeCameraEventListeners() {
    // Camera modal controls
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const shutterBtn = document.getElementById('shutterBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const usePhotoBtn = document.getElementById('usePhotoBtn');
    const flipCameraBtn = document.getElementById('flipCameraBtn');
    const gridToggle = document.getElementById('gridToggle');
    const exposureSlider = document.getElementById('exposureSlider');
    const cameraSourceSelect = document.getElementById('cameraSourceSelect');

    if (closeCameraBtn) closeCameraBtn.addEventListener('click', () => this.closeProfessionalCamera());
    if (shutterBtn) shutterBtn.addEventListener('click', () => this.capturePhoto());
    if (retakeBtn) retakeBtn.addEventListener('click', () => this.retakePhoto());
    if (usePhotoBtn) usePhotoBtn.addEventListener('click', () => this.usePhoto());
    if (flipCameraBtn) flipCameraBtn.addEventListener('click', () => this.flipCamera());
    if (gridToggle) gridToggle.addEventListener('click', () => this.toggleGrid());
    if (exposureSlider) exposureSlider.addEventListener('input', (e) => this.adjustExposure(e.target.value));
    if (cameraSourceSelect) cameraSourceSelect.addEventListener('change', () => this.changeCameraSource());

    // Camera mode buttons
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.setCameraMode(e.target.dataset.mode));
    });

    // Touch focus for camera viewport
    const cameraViewport = document.getElementById('cameraVideo');
    if (cameraViewport) {
      cameraViewport.addEventListener('click', (e) => this.setFocusPoint(e));
    }
  }

  async openProfessionalCamera() {
    console.log('📸 Opening Professional Camera...');
    
    try {
      // Initialize camera state
      this.camera = {
        stream: null,
        currentCamera: 'user', // 'user' for front, 'environment' for back
        gridVisible: true,
        mode: 'auto',
        exposure: 0,
        capturedPhoto: null
      };

      // Open camera modal
      this.openModal('professionalCameraModal');

      // Request camera access
      await this.startCamera();

      // Log camera opening
      this.logAction('cameraActions', 'cameraOpened', { mode: this.camera.mode });

    } catch (error) {
      console.error('❌ Failed to open camera:', error);
      this.showNotification('❌ Camera access denied or unavailable', 'error');
      this.closeModal('professionalCameraModal');
    }
  }

  async startCamera() {
    try {
      const video = document.getElementById('cameraVideo');
      
      // Stop existing stream if any
      if (this.camera.stream) {
        this.camera.stream.getTracks().forEach(track => track.stop());
      }

      // Get camera source preference
      const cameraSourceSelect = document.getElementById('cameraSourceSelect');
      const selectedSource = cameraSourceSelect?.value || this.camera.currentCamera;
      
      let constraints;
      
      if (selectedSource === 'continuity') {
        // Try to detect Continuity Camera devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const continuityDevice = devices.find(device => 
          device.kind === 'videoinput' && 
          (device.label.includes('iPhone') || device.label.includes('iPad') || device.label.includes('Continuity'))
        );
        
        if (continuityDevice) {
          constraints = {
            video: {
              deviceId: { exact: continuityDevice.deviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: false
          };
        } else {
          // Fallback to environment camera if no Continuity Camera found
          constraints = {
            video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: false
          };
          this.showNotification('📱 Continuity Camera not found, using back camera', 'info');
        }
      } else {
        // Standard camera constraints
        constraints = {
          video: {
            facingMode: selectedSource,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };
      }
      
      console.log('📷 Camera constraints:', constraints);

      this.camera.stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = this.camera.stream;

      // Wait for video to load
      await new Promise((resolve) => {
        video.addEventListener('loadedmetadata', resolve, { once: true });
      });

      console.log('✅ Camera stream started successfully');

    } catch (error) {
      console.error('❌ Failed to start camera:', error);
      
      // Try fallback to any available camera
      try {
        console.log('🔄 Trying fallback camera...');
        const fallbackConstraints = {
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        };
        
        this.camera.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        const video = document.getElementById('cameraVideo');
        video.srcObject = this.camera.stream;
        
        await new Promise((resolve) => {
          video.addEventListener('loadedmetadata', resolve, { once: true });
        });
        
        console.log('✅ Fallback camera started');
        this.showNotification('📷 Camera started (fallback mode)', 'info');
      } catch (fallbackError) {
        console.error('❌ Fallback camera also failed:', fallbackError);
        this.showNotification('❌ Camera access denied or unavailable', 'error');
        throw new Error('Could not access camera');
      }
    }
  }

  async changeCameraSource() {
    console.log('🔄 Changing camera source...');
    
    if (this.camera.stream) {
      // Stop current stream
      this.camera.stream.getTracks().forEach(track => track.stop());
    }
    
    // Start new stream with selected source
    await this.startCamera();
  }

  async capturePhoto() {
    console.log('📸 Capturing photo...');
    
    const shutterBtn = document.getElementById('shutterBtn');
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const capturePreview = document.getElementById('capturePreview');
    const capturedImage = document.getElementById('capturedImage');

    try {
      // Add capture animation
      shutterBtn.classList.add('capturing');
      setTimeout(() => shutterBtn.classList.remove('capturing'), 300);

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.save();
      
      // Mirror the image (flip horizontally)
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0);
      ctx.restore();

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/jpeg', 0.9);
      this.camera.capturedPhoto = dataURL;

      // Show preview
      capturedImage.src = dataURL;
      capturePreview.style.display = 'flex';

      // Log capture
      this.logAction('cameraActions', 'photoCaptured', { 
        mode: this.camera.mode,
        exposure: this.camera.exposure 
      });

      console.log('✅ Photo captured successfully');

    } catch (error) {
      console.error('❌ Failed to capture photo:', error);
      this.showNotification('❌ Failed to capture photo', 'error');
    }
  }

  retakePhoto() {
    console.log('🔄 Retaking photo...');
    const capturePreview = document.getElementById('capturePreview');
    capturePreview.style.display = 'none';
    this.camera.capturedPhoto = null;
  }

  async usePhoto() {
    console.log('🎬 === CAMERA CAPTURE DEBUG SESSION START ===');
    const sessionId = `camera-${Date.now()}`;
    console.log(`📋 Session ID: ${sessionId}`);
    
    // Step 1: Validate captured photo exists
    console.log('📋 Step 1: Checking captured photo exists...');
    if (!this.camera.capturedPhoto) {
      console.error('❌ Step 1 FAILED: No photo captured');
      this.showNotification('❌ No photo to use', 'error');
      return;
    }
    console.log('✅ Step 1 SUCCESS: Photo exists, size:', this.camera.capturedPhoto.length, 'characters');
    console.log('📄 Photo preview:', this.camera.capturedPhoto.substring(0, 100) + '...');

    // Step 2: Close camera interface
    console.log('📋 Step 2: Closing camera interface...');
    try {
      await this.closeProfessionalCamera();
      console.log('✅ Step 2 SUCCESS: Camera closed');
    } catch (closeError) {
      console.error('❌ Step 2 FAILED:', closeError);
      // Continue anyway - not critical
    }

    // Step 3: Start analysis pipeline
    console.log('📋 Step 3: Starting analysis pipeline...');
    this.showNotification('📸 Saving and analyzing your photo...', 'info');
    
    try {
      // Step 4: Call analysis API
      console.log('📋 Step 4: Calling analyzeCapturedPhoto API...');
      console.log('📤 API call parameters:', {
        dataURLLength: this.camera.capturedPhoto.length,
        options: { generatePlaceholder: true }
      });
      
      const analysisResult = await ClothingAnalysisAPI.analyzeCapturedPhoto(this.camera.capturedPhoto, {
        generatePlaceholder: true
      });
      
      console.log('📥 Step 4 API Response received:', {
        success: analysisResult.success,
        hasItem: !!analysisResult.item,
        hasItems: !!analysisResult.items,
        error: analysisResult.error
      });
      console.log('📄 Full analysis result:', JSON.stringify(analysisResult, null, 2));

      if (analysisResult.success) {
        console.log('✅ Step 4 SUCCESS: Analysis completed');
        this.showNotification('✅ Photo analyzed! Adding to wardrobe...', 'success');
        
        // Step 5: Prepare items for wardrobe
        console.log('📋 Step 5: Preparing items for wardrobe addition...');
        const itemsToAdd = analysisResult.items ? analysisResult.items : [analysisResult.item];
        
        console.log('📦 Items to add:', {
          count: itemsToAdd.length,
          firstItemValid: !!(itemsToAdd[0]),
          firstItemPreview: itemsToAdd[0] ? {
            id: itemsToAdd[0].id,
            name: itemsToAdd[0].name,
            category: itemsToAdd[0].category,
            hasImage: !!itemsToAdd[0].image
          } : null
        });
        
        if (itemsToAdd && itemsToAdd.length > 0 && itemsToAdd[0]) {
          console.log('✅ Step 5 SUCCESS: Items prepared');
          
          // Step 6: Add items to wardrobe
          console.log('📋 Step 6: Adding items to wardrobe...');
          const addResult = await ClothingAnalysisAPI.addAnalyzedItems(itemsToAdd);
          console.log('📥 Step 6 API Response:', {
            success: addResult.success,
            error: addResult.error,
            fullResult: addResult
          });
          
          if (addResult.success) {
            console.log('✅ Step 6 SUCCESS: Items added to wardrobe');
            this.showNotification(`✅ Added ${itemsToAdd.length} item(s) to wardrobe!`, 'success');
            
            // Step 7: Refresh wardrobe display
            console.log('📋 Step 7: Refreshing wardrobe display...');
            await this.loadAndDisplayItems();
            console.log('✅ Step 7 SUCCESS: Wardrobe refreshed');
            console.log('🎉 === CAMERA CAPTURE SUCCESS ===');
            return;
          } else {
            console.error('❌ Step 6 FAILED: Could not add items to wardrobe');
            this.showNotification('❌ Failed to add items to wardrobe: ' + (addResult.error || 'Unknown error'), 'error');
          }
        } else {
          console.error('❌ Step 5 FAILED: No valid items to add');
          this.showNotification('❌ No valid items to add from analysis', 'error');
        }
      } else {
        console.log('⚠️ Step 4 PARTIAL: Analysis failed, checking for fallback item...');
        
        if (analysisResult.item) {
          console.log('📋 Step 5-FALLBACK: Adding fallback item to wardrobe...');
          console.log('📦 Fallback item:', analysisResult.item);
          
          const addResult = await ClothingAnalysisAPI.addAnalyzedItems([analysisResult.item]);
          console.log('📥 Fallback add result:', addResult);
          
          if (addResult.success) {
            console.log('✅ Step 5-FALLBACK SUCCESS: Fallback item added');
            this.showNotification(`✅ Added item to wardrobe (with basic info)!`, 'success');
            await this.loadAndDisplayItems();
            console.log('🎉 === CAMERA CAPTURE SUCCESS (FALLBACK) ===');
            return;
          }
        }
        
        console.error('❌ Step 4 FAILED: Analysis failed completely');
        throw new Error(analysisResult.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('💥 MAIN PIPELINE FAILURE:', error);
      console.error('📄 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      this.showNotification('❌ Failed to analyze photo: ' + error.message, 'error');
      
      // Step 8: Emergency fallback
      console.log('📋 Step 8-EMERGENCY: Creating emergency fallback item...');
      try {
        const timestamp = Date.now();
        const fallbackItem = {
          id: `camera-${timestamp}`,
          name: `Camera Capture ${new Date().toLocaleTimeString()}`,
          category: 'tops',
          color: ['unknown'],
          material: ['unknown'],
          image: this.camera.capturedPhoto,
          createdAt: new Date().toISOString(),
          condition: 'good',
          season: ['all-season'],
          occasion: ['casual'],
          tags: ['camera-capture', 'emergency-fallback'],
          notes: `Captured with camera - please edit details (Session: ${sessionId})`
        };
        
        console.log('📦 Emergency fallback item:', fallbackItem);
        
        const emergencyResult = await ClothingAnalysisAPI.addAnalyzedItems([fallbackItem]);
        console.log('📥 Emergency add result:', emergencyResult);
        
        if (emergencyResult.success) {
          console.log('✅ Step 8-EMERGENCY SUCCESS: Emergency item added');
          this.showNotification('📸 Photo saved! Please edit item details', 'info');
          await this.loadAndDisplayItems();
          console.log('🎉 === CAMERA CAPTURE SUCCESS (EMERGENCY) ===');
        } else {
          console.error('❌ Step 8-EMERGENCY FAILED:', emergencyResult);
          // Show manual entry modal as ultimate fallback
          this.showManualEntryModal(this.camera.capturedPhoto);
        }
      } catch (emergencyError) {
        console.error('💥 EMERGENCY FALLBACK FAILURE:', emergencyError);
        console.error('📄 Emergency error details:', {
          message: emergencyError.message,
          stack: emergencyError.stack
        });
        // Show manual entry modal as ultimate fallback
        this.showManualEntryModal(this.camera.capturedPhoto);
      }
    }
    
    console.log('🎬 === CAMERA CAPTURE DEBUG SESSION END ===');
  }

  async flipCamera() {
    console.log('🔄 Flipping camera...');
    
    this.camera.currentCamera = this.camera.currentCamera === 'user' ? 'environment' : 'user';
    
    try {
      await this.startCamera();
      this.showNotification(`📱 Switched to ${this.camera.currentCamera === 'user' ? 'front' : 'back'} camera`, 'info');
    } catch (error) {
      console.error('❌ Failed to flip camera:', error);
      this.showNotification('❌ Failed to switch camera', 'error');
    }
  }

  // ==================== MANUAL ENTRY MODAL ====================

  showManualEntryModal(photoDataURL) {
    console.log('📝 Showing manual entry modal as fallback...');
    
    // Show the photo in the modal
    const previewImage = document.getElementById('manualPreviewImage');
    if (previewImage && photoDataURL) {
      previewImage.src = photoDataURL;
    }
    
    // Show notification about fallback
    this.showNotification('🛠️ Please manually enter item details', 'info');
    
    // Store the photo for later use
    this.manualEntryPhoto = photoDataURL;
    
    // Show the modal
    this.showModal('manualEntryModal');
    
    // Set up event listeners if not already done
    this.initializeManualEntryListeners();
  }

  initializeManualEntryListeners() {
    if (this.manualEntryListenersInitialized) return;
    
    const closeBtn = document.getElementById('closeManualEntryBtn');
    const cancelBtn = document.getElementById('cancelManualEntryBtn');
    const form = document.getElementById('manualItemForm');
    const backdrop = document.getElementById('manualEntryBackdrop');
    
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeManualEntryModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeManualEntryModal());
    if (backdrop) backdrop.addEventListener('click', () => this.closeManualEntryModal());
    if (form) form.addEventListener('submit', (e) => this.handleManualItemSubmit(e));
    
    this.manualEntryListenersInitialized = true;
  }

  closeManualEntryModal() {
    this.closeModal('manualEntryModal');
    this.manualEntryPhoto = null;
  }

  async handleManualItemSubmit(event) {
    event.preventDefault();
    
    console.log('📝 Processing manual item submission...');
    
    // Get form values
    const name = document.getElementById('manualItemName').value.trim();
    const category = document.getElementById('manualItemCategory').value;
    const color = document.getElementById('manualItemColor').value.trim();
    const material = document.getElementById('manualItemMaterial').value.trim();
    const condition = document.getElementById('manualItemCondition').value;
    const season = document.getElementById('manualItemSeason').value;
    const notes = document.getElementById('manualItemNotes').value.trim();
    
    // Validate required fields
    if (!name || !category) {
      this.showNotification('❌ Please fill in required fields (Name and Category)', 'error');
      return;
    }
    
    // Create item object
    const timestamp = Date.now();
    const manualItem = {
      id: `manual-${timestamp}`,
      name: name,
      category: category,
      color: color ? [color] : ['unknown'],
      material: material ? [material] : ['unknown'],
      condition: condition,
      season: [season],
      occasion: ['casual'],
      image: this.manualEntryPhoto,
      createdAt: new Date().toISOString(),
      tags: ['manual-entry'],
      notes: notes || 'Manually entered item',
      favorite: false,
      timesWorn: 0,
      lastWorn: null
    };
    
    console.log('📦 Manual item created:', manualItem);
    
    try {
      // Add to wardrobe
      const result = await ClothingAnalysisAPI.addAnalyzedItems([manualItem]);
      
      if (result.success) {
        console.log('✅ Manual item added successfully');
        this.showNotification('✅ Item added to wardrobe!', 'success');
        this.closeManualEntryModal();
        await this.loadAndDisplayItems();
      } else {
        console.error('❌ Failed to add manual item:', result);
        this.showNotification('❌ Failed to add item: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('❌ Error adding manual item:', error);
      this.showNotification('❌ Error adding item: ' + error.message, 'error');
    }
  }

  toggleGrid() {
    const gridToggle = document.getElementById('gridToggle');
    const cameraGrid = document.getElementById('cameraGrid');
    
    this.camera.gridVisible = !this.camera.gridVisible;
    
    if (this.camera.gridVisible) {
      cameraGrid.classList.remove('hidden');
      gridToggle.classList.add('active');
      gridToggle.textContent = 'ON';
    } else {
      cameraGrid.classList.add('hidden');
      gridToggle.classList.remove('active');
      gridToggle.textContent = 'OFF';
    }
    
    console.log('📐 Grid toggled:', this.camera.gridVisible ? 'ON' : 'OFF');
  }

  adjustExposure(value) {
    this.camera.exposure = parseFloat(value);
    const exposureIndicator = document.getElementById('exposureIndicator');
    exposureIndicator.textContent = `EV: ${value > 0 ? '+' : ''}${value}`;
    
    // Apply exposure filter to video (visual feedback)
    const video = document.getElementById('cameraVideo');
    const brightness = 1 + (parseFloat(value) * 0.3); // Adjust brightness based on exposure
    video.style.filter = `brightness(${brightness})`;
    
    console.log('☀️ Exposure adjusted:', value);
  }

  setCameraMode(mode) {
    console.log('🎯 Setting camera mode:', mode);
    
    // Update active mode button
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    this.camera.mode = mode;
    
    // Apply mode-specific settings
    switch(mode) {
      case 'portrait':
        this.showNotification('👤 Portrait mode: Best for close-up clothing shots', 'info');
        break;
      case 'flat-lay':
        this.showNotification('📐 Flat lay mode: Perfect for laying clothes flat', 'info');
        break;
      case 'detail':
        this.showNotification('🔍 Detail mode: Great for textures and patterns', 'info');
        break;
      default:
        this.showNotification('⚡ Auto mode: Smart automatic settings', 'info');
    }
  }

  setFocusPoint(event) {
    const focusPoint = document.getElementById('focusPoint');
    const rect = event.target.getBoundingClientRect();
    
    // Calculate focus point position
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Position focus indicator
    focusPoint.style.left = (x - 40) + 'px';
    focusPoint.style.top = (y - 40) + 'px';
    
    // Show focus animation
    focusPoint.classList.remove('active', 'focusing');
    setTimeout(() => {
      focusPoint.classList.add('active', 'focusing');
    }, 10);
    
    // Hide after animation
    setTimeout(() => {
      focusPoint.classList.remove('focusing');
    }, 1000);
    
    console.log('🎯 Focus point set:', { x, y });
  }

  async closeProfessionalCamera() {
    console.log('📸 Closing Professional Camera...');
    
    // Stop camera stream
    if (this.camera && this.camera.stream) {
      this.camera.stream.getTracks().forEach(track => track.stop());
    }
    
    // Close modal
    this.closeModal('professionalCameraModal');
    
    // Reset camera state
    this.camera = null;
    
    // Clear video element
    const video = document.getElementById('cameraVideo');
    if (video) {
      video.srcObject = null;
    }
    
    console.log('✅ Professional Camera closed');
  }

  // ==================== BATCH GENERATION ====================

  initializeBatchGenerationModal() {
    console.log('📸 Initializing Batch Generation Modal...');

    // Batch generation state
    this.batchGeneration = {
      isRunning: false,
      isPaused: false,
      currentIndex: 0,
      totalItems: 0,
      results: [],
      startTime: null,
      settings: {
        quality: 'standard',
        quantity: 5,
        category: ''
      }
    };

    // Modal elements
    const batchModal = document.getElementById('batchGenerationModal');
    const batchBackdrop = document.getElementById('batchGenerationBackdrop');
    const closeBatchBtn = document.getElementById('closeBatchGenerationBtn');

    // Setup phase elements
    const qualityOptions = document.querySelectorAll('input[name="quality"]');
    const quantityOptions = document.querySelectorAll('input[name="quantity"]');
    const categoryFilter = document.getElementById('batchCategoryFilter');
    const cancelBatchBtn = document.getElementById('cancelBatchBtn');
    const startBatchBtn = document.getElementById('startBatchBtn');

    // Progress phase elements
    const pauseBatchBtn = document.getElementById('pauseBatchBtn');
    const resumeBatchBtn = document.getElementById('resumeBatchBtn');
    const cancelBatchProgressBtn = document.getElementById('cancelBatchProgressBtn');

    // Results phase elements
    const generateMoreBtn = document.getElementById('generateMoreBtn');
    const closeBatchResultsBtn = document.getElementById('closeBatchResultsBtn');

    // Event listeners for modal close
    closeBatchBtn.addEventListener('click', () => this.closeBatchGenerationModal());
    batchBackdrop.addEventListener('click', () => this.closeBatchGenerationModal());

    // Setup phase listeners
    qualityOptions.forEach(option => {
      option.addEventListener('change', () => {
        this.batchGeneration.settings.quality = option.value;
        this.updateBatchSummary();
      });
    });

    quantityOptions.forEach(option => {
      option.addEventListener('change', () => {
        this.batchGeneration.settings.quantity = option.value;
        this.updateBatchSummary();
      });
    });

    categoryFilter.addEventListener('change', () => {
      this.batchGeneration.settings.category = categoryFilter.value;
      this.updateBatchSummary();
    });

    cancelBatchBtn.addEventListener('click', () => this.closeBatchGenerationModal());
    startBatchBtn.addEventListener('click', () => this.startBatchGeneration());

    // Progress phase listeners
    pauseBatchBtn.addEventListener('click', () => this.pauseBatchGeneration());
    resumeBatchBtn.addEventListener('click', () => this.resumeBatchGeneration());
    cancelBatchProgressBtn.addEventListener('click', () => this.cancelBatchGeneration());

    // Results phase listeners
    generateMoreBtn.addEventListener('click', () => this.resetBatchGeneration());
    closeBatchResultsBtn.addEventListener('click', () => this.closeBatchGenerationModal());

    // Listen for batch progress updates
    PhotoAPI.onBatchProgress((progress) => this.updateBatchProgress(progress));

    // Set up detailed progress listeners
    this.setupDetailedProgressListeners();

    console.log('✅ Batch Generation Modal initialized');
  }

  async openBatchGenerationModal() {
    console.log('📸 Opening Batch Generation Modal...');

    // Check if photo generation is available
    console.log('🔍 Checking photo availability...');
    const photoAvailable = await PhotoAPI.isAvailable();
    console.log('📊 Photo availability result:', photoAvailable);
    if (!photoAvailable) {
      console.log('❌ Photo generation not available');
      this.showNotification('Photo generation is not available', 'error');
      return;
    }

    // Reset to setup phase
    this.resetBatchGeneration();

    // Update summary with current wardrobe
    console.log('📊 Current items count:', this.currentItems.length);
    this.updateBatchSummary();

    // Open modal
    console.log('🚀 Opening modal...');
    this.openModal('batchGenerationModal');
  }

  closeBatchGenerationModal() {
    console.log('📸 Closing Batch Generation Modal...');

    // Cancel any running generation
    if (this.batchGeneration.isRunning && !this.batchGeneration.isPaused) {
      this.cancelBatchGeneration();
    }

    // Clean up listeners
    PhotoAPI.removeBatchProgressListener();
    PhotoAPI.removeDetailedProgressListeners();

    this.closeModal('batchGenerationModal');
  }

  resetBatchGeneration() {
    console.log('🔄 Resetting Batch Generation...');

    // Reset state
    this.batchGeneration.isRunning = false;
    this.batchGeneration.isPaused = false;
    this.batchGeneration.currentIndex = 0;
    this.batchGeneration.totalItems = 0;
    this.batchGeneration.results = [];
    this.batchGeneration.startTime = null;

    // Show setup phase
    document.getElementById('batchSetupPhase').style.display = 'block';
    document.getElementById('batchProgressPhase').style.display = 'none';
    document.getElementById('batchResultsPhase').style.display = 'none';

    // Reset form to defaults
    document.getElementById('qualityStandard').checked = true;
    document.getElementById('quantity5').checked = true;
    document.getElementById('batchCategoryFilter').value = '';

    this.batchGeneration.settings = {
      quality: 'standard',
      quantity: 5,
      category: ''
    };

    // Reset all progress displays
    this.resetProgressDisplays();

    this.updateBatchSummary();
  }

  resetProgressDisplays() {
    // Reset pipeline progress
    document.getElementById('pipelineFill').style.width = '0%';
    document.getElementById('pipelinePercentage').textContent = '0%';
    document.getElementById('pipelineStatus').textContent = 'Initializing...';
    document.getElementById('pipelineCurrentComponent').textContent = 'Loading components...';
    document.getElementById('pipelineComponentCount').textContent = '0/7';

    // Reset generation progress
    document.getElementById('generationFill').style.width = '0%';
    document.getElementById('generationPercentage').textContent = '0%';
    document.getElementById('generationStatus').textContent = 'Waiting...';
    document.getElementById('generationCurrentStep').textContent = 'Ready to generate...';
    document.getElementById('generationStepCount').textContent = '0/25';
    document.getElementById('generationSpeed').textContent = '0.0s/step';

    // Reset batch progress
    document.getElementById('batchFill').style.width = '0%';
    document.getElementById('batchPercentage').textContent = '0%';
    document.getElementById('batchStatus').textContent = 'Starting...';
    document.getElementById('batchJobsCompleted').textContent = '0 jobs completed';
    document.getElementById('batchJobsTotal').textContent = '0 total jobs';

    // Reset current processing
    document.getElementById('currentJobId').textContent = 'Job: waiting...';
    document.getElementById('currentItemName').textContent = 'Waiting for first item...';
    document.getElementById('currentItemDetails').textContent = 'Ready to start processing';
    document.getElementById('currentJobStartTime').textContent = '--:--:--';
    document.getElementById('currentJobElapsed').textContent = '0s';
    document.getElementById('currentJobETA').textContent = '--:--';

    // Reset completed items
    document.getElementById('completedItemsGrid').innerHTML = '';
    document.getElementById('completedCount').textContent = '0 items';

    // Reset processing stats
    document.getElementById('totalProcessingTime').textContent = '0s';
    document.getElementById('averageProcessingTime').textContent = '0s';
    document.getElementById('overallETA').textContent = '--:--';
    document.getElementById('processingSpeed').textContent = '0.0 items/min';

    // Reset overall progress
    document.getElementById('progressCurrent').textContent = '0';
    document.getElementById('progressTotal').textContent = '5';
  }

  updateBatchSummary() {
    console.log('📊 Updating Batch Summary...');

    const { quality, quantity, category } = this.batchGeneration.settings;

    // Calculate items to process
    let itemsToProcess = 0;
    if (quantity === 'all') {
      // Filter items by category if specified
      const filteredItems = category 
        ? this.currentItems.filter(item => item.category === category)
        : this.currentItems;
      itemsToProcess = filteredItems.length;
    } else {
      itemsToProcess = parseInt(quantity);
    }

    // Estimate time based on quality
    let timePerItem = 15; // seconds
    switch (quality) {
      case 'preview': timePerItem = 5; break;
      case 'standard': timePerItem = 15; break;
      case 'high': timePerItem = 30; break;
    }

    const totalSeconds = itemsToProcess * timePerItem;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const estimatedTime = minutes > 0 
      ? `${minutes}${seconds > 0 ? `-${minutes + 1}` : ''} minute${minutes !== 1 ? 's' : ''}`
      : `${seconds} seconds`;

    // Update UI
    document.getElementById('itemsToProcess').textContent = itemsToProcess;
    document.getElementById('estimatedTime').textContent = estimatedTime;

    // Store for generation
    this.batchGeneration.totalItems = itemsToProcess;
  }

  async startBatchGeneration() {
    console.log('🚀 Starting Batch Generation...');
    console.log('📊 Batch settings:', this.batchGeneration.settings);

    const { quality, quantity, category } = this.batchGeneration.settings;

    // Get items to process
    let itemsToGenerate = [];
    if (quantity === 'all') {
      itemsToGenerate = category 
        ? this.currentItems.filter(item => item.category === category)
        : [...this.currentItems];
    } else {
      const targetCount = parseInt(quantity);
      const filteredItems = category 
        ? this.currentItems.filter(item => item.category === category)
        : [...this.currentItems];
      
      // Take the first N items (could be randomized)
      itemsToGenerate = filteredItems.slice(0, targetCount);
    }

    console.log('📊 Items to generate:', itemsToGenerate.length);
    if (itemsToGenerate.length === 0) {
      console.log('❌ No items to generate');
      this.showNotification('No items to generate images for', 'warning');
      return;
    }

    // Update state
    this.batchGeneration.isRunning = true;
    this.batchGeneration.isPaused = false;
    this.batchGeneration.currentIndex = 0;
    this.batchGeneration.totalItems = itemsToGenerate.length;
    this.batchGeneration.results = [];
    this.batchGeneration.startTime = Date.now();

    // Switch to progress phase
    document.getElementById('batchSetupPhase').style.display = 'none';
    document.getElementById('batchProgressPhase').style.display = 'block';
    document.getElementById('batchResultsPhase').style.display = 'none';

    // Initialize progress UI
    document.getElementById('progressTotal').textContent = itemsToGenerate.length;
    document.getElementById('progressCurrent').textContent = '0';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercentage').textContent = '0%';
    document.getElementById('progressThumbnails').innerHTML = '';

    try {
      console.log('🎯 Starting batch generation for', itemsToGenerate.length, 'items');
      // Start batch generation
      const result = await PhotoAPI.batchGenerate(itemsToGenerate, {
        quality: quality,
        generateThumbnails: true
      });

      if (result.success) {
        console.log('✅ Batch generation completed successfully');
        this.completeBatchGeneration(result);
      } else {
        console.error('❌ Batch generation failed:', result.error);
        this.showNotification(`Batch generation failed: ${result.error}`, 'error');
        this.resetBatchGeneration();
      }
    } catch (error) {
      console.error('❌ Batch generation error:', error);
      this.showNotification('An error occurred during batch generation', 'error');
      this.resetBatchGeneration();
    }
  }

  async pauseBatchGeneration() {
    console.log('⏸️ Pausing Batch Generation...');

    try {
      await PhotoAPI.pauseBatchGeneration();
      this.batchGeneration.isPaused = true;

      // Update UI
      document.getElementById('pauseBatchBtn').style.display = 'none';
      document.getElementById('resumeBatchBtn').style.display = 'inline-block';

      this.showNotification('Batch generation paused', 'info');
    } catch (error) {
      console.error('❌ Failed to pause batch generation:', error);
      this.showNotification('Failed to pause generation', 'error');
    }
  }

  async resumeBatchGeneration() {
    console.log('▶️ Resuming Batch Generation...');

    try {
      await PhotoAPI.resumeBatchGeneration();
      this.batchGeneration.isPaused = false;

      // Update UI
      document.getElementById('pauseBatchBtn').style.display = 'inline-block';
      document.getElementById('resumeBatchBtn').style.display = 'none';

      this.showNotification('Batch generation resumed', 'info');
    } catch (error) {
      console.error('❌ Failed to resume batch generation:', error);
      this.showNotification('Failed to resume generation', 'error');
    }
  }

  async cancelBatchGeneration() {
    console.log('🛑 Cancelling Batch Generation...');

    try {
      await PhotoAPI.cancelBatchGeneration();
      this.batchGeneration.isRunning = false;
      this.batchGeneration.isPaused = false;

      this.showNotification('Batch generation cancelled', 'warning');
      this.resetBatchGeneration();
    } catch (error) {
      console.error('❌ Failed to cancel batch generation:', error);
      this.showNotification('Failed to cancel generation', 'error');
    }
  }

  /**
   * Set up detailed progress listeners for enhanced progress tracking
   */
  setupDetailedProgressListeners() {
    // Pipeline loading progress
    PhotoAPI.onPipelineProgress((progress) => {
      console.log('🔧 Pipeline Progress:', progress);
      this.updatePipelineProgress({
        current: progress.current,
        total: progress.total,
        percentage: progress.percentage,
        component: `Component ${progress.current}/${progress.total}`,
        status: 'Loading pipeline components'
      });
    });

    // Generation steps progress
    PhotoAPI.onGenerationProgress((progress) => {
      console.log('🎨 Generation Progress:', progress);
      this.updateGenerationProgress({
        current: progress.current,
        total: progress.total,
        percentage: progress.percentage,
        step: `Step ${progress.current}/${progress.total}`,
        status: 'Generating',
        speed: progress.speed,
        elapsed: progress.elapsed,
        remaining: progress.remaining
      });
    });

    // Item started
    PhotoAPI.onItemStarted((data) => {
      console.log('🚀 Item Started:', data);
      this.updateCurrentProcessing({
        name: data.itemName,
        id: data.itemId
      }, data.jobId, { startTime: Date.now() });
    });

    // Item completed
    PhotoAPI.onItemCompleted((data) => {
      console.log('✅ Item Completed:', data);
      if (data.result && data.result.imagePath) {
        this.addCompletedItem(
          { name: data.itemName, id: data.itemId },
          data.result.imagePath
        );
      }
    });

    // Item failed
    PhotoAPI.onItemFailed((data) => {
      console.log('❌ Item Failed:', data);
      this.addFailedItem(data.itemName, data.error);
    });

    // Model loading
    PhotoAPI.onModelLoading((data) => {
      console.log('🤖 Model Loading:', data);
      const componentElement = document.getElementById('pipelineCurrentComponent');
      if (componentElement) {
        componentElement.textContent = `Loading model: ${data.modelName}`;
      }
    });

    // Memory usage
    PhotoAPI.onMemoryUsage((data) => {
      console.log('🧠 Memory Usage:', data);
      // Update memory indicator if available
      const memoryIndicator = document.getElementById('memoryUsage');
      if (memoryIndicator) {
        memoryIndicator.textContent = `${data.used.toFixed(1)}GB / ${data.total.toFixed(1)}GB (${data.percentage.toFixed(1)}%)`;
      }
    });

    // Generation starting
    PhotoAPI.onGenerationStarting((data) => {
      console.log('🎬 Generation Starting:', data);
      const stepElement = document.getElementById('generationCurrentStep');
      if (stepElement) {
        stepElement.textContent = `Starting ${data.quality} generation...`;
      }
    });

    // Generation completed
    PhotoAPI.onGenerationCompleted((data) => {
      console.log('🎉 Generation Completed:', data);
      const stepElement = document.getElementById('generationCurrentStep');
      if (stepElement) {
        stepElement.textContent = `Completed in ${data.duration}s`;
      }
    });

    // Generation errors
    PhotoAPI.onGenerationError((data) => {
      console.error('💥 Generation Error:', data);
      this.showNotification(`Generation error: ${data.message}`, 'error');
    });

    // Generation logs for debugging
    PhotoAPI.onGenerationLog((data) => {
      console.log('📝 Generation Log:', data.message);
    });
  }

  updateBatchProgress(progress) {
    console.log('📈 Batch Progress Update:', progress);

    const { 
      current, 
      total, 
      item, 
      thumbnail, 
      eta, 
      status,
      pipeline,
      generation,
      batch,
      jobId,
      timing 
    } = progress;

    // Update overall progress stats
    const percentage = Math.round((current / total) * 100);
    document.getElementById('progressCurrent').textContent = current;
    document.getElementById('progressTotal').textContent = total;

    // Update pipeline progress if provided
    if (pipeline) {
      this.updatePipelineProgress(pipeline);
    }

    // Update generation progress if provided
    if (generation) {
      this.updateGenerationProgress(generation);
    }

    // Update batch progress if provided
    if (batch) {
      this.updateBatchProgressSection(batch);
    }

    // Update current item processing
    if (item || jobId || timing) {
      this.updateCurrentProcessing(item, jobId, timing);
    }

    // Add to completed items if status is completed
    if (thumbnail && status === 'completed') {
      this.addCompletedItem(item, thumbnail);
    }

    // Update processing statistics
    this.updateProcessingStats(current, total, timing);

    // Store result (for backward compatibility)
    if (status) {
      this.batchGeneration.results.push({
        item: item,
        thumbnail: thumbnail,
        status: status
      });
    }

    // Update current index
    this.batchGeneration.currentIndex = current;
  }

  updatePipelineProgress(pipeline) {
    const { current, total, component, status } = pipeline;
    const percentage = Math.round((current / total) * 100);
    
    document.getElementById('pipelineFill').style.width = `${percentage}%`;
    document.getElementById('pipelinePercentage').textContent = `${percentage}%`;
    document.getElementById('pipelineStatus').textContent = status || 'Loading...';
    document.getElementById('pipelineCurrentComponent').textContent = component || 'Initializing...';
    document.getElementById('pipelineComponentCount').textContent = `${current}/${total}`;
  }

  updateGenerationProgress(generation) {
    const { current, total, step, status, speed, elapsed, remaining } = generation;
    const percentage = Math.round((current / total) * 100);
    
    document.getElementById('generationFill').style.width = `${percentage}%`;
    document.getElementById('generationPercentage').textContent = `${percentage}%`;
    document.getElementById('generationStatus').textContent = status || 'Generating...';
    document.getElementById('generationCurrentStep').textContent = step || 'Processing...';
    document.getElementById('generationStepCount').textContent = `${current}/${total}`;
    
    if (speed) {
      document.getElementById('generationSpeed').textContent = `${speed.toFixed(1)}s/step`;
    }

    // Update ETA if available
    if (remaining) {
      const etaElement = document.getElementById('generationETA');
      if (etaElement) {
        etaElement.textContent = `ETA: ${this.formatDuration(remaining * 1000)}`;
      }
    }
  }

  updateBatchProgressSection(batch) {
    const { completed, total, status } = batch;
    const percentage = Math.round((completed / total) * 100);
    
    document.getElementById('batchFill').style.width = `${percentage}%`;
    document.getElementById('batchPercentage').textContent = `${percentage}%`;
    document.getElementById('batchStatus').textContent = status || 'Processing...';
    document.getElementById('batchJobsCompleted').textContent = `${completed} jobs completed`;
    document.getElementById('batchJobsTotal').textContent = `${total} total jobs`;
  }

  updateCurrentProcessing(item, jobId, timing) {
    if (item) {
      document.getElementById('currentItemName').textContent = item.name || 'Processing item...';
      document.getElementById('currentItemDetails').textContent = 
        item.description || `${item.category || 'Item'} - ${item.color || 'Unknown color'}`;
    }

    if (jobId) {
      document.getElementById('currentJobId').textContent = `Job: ${jobId.substring(0, 8)}...`;
    }

    if (timing) {
      if (timing.startTime) {
        const startTime = new Date(timing.startTime);
        document.getElementById('currentJobStartTime').textContent = 
          startTime.toLocaleTimeString();
      }
      
      if (timing.elapsed) {
        document.getElementById('currentJobElapsed').textContent = this.formatDuration(timing.elapsed);
      }
      
      if (timing.eta) {
        document.getElementById('currentJobETA').textContent = this.formatDuration(timing.eta);
      }
    }
  }

  addCompletedItem(item, thumbnail) {
    const grid = document.getElementById('completedItemsGrid');
    const completedCount = grid.children.length + 1;
    
    const itemElement = document.createElement('div');
    itemElement.className = 'completed-item';
    itemElement.innerHTML = `
      <img src="${thumbnail}" alt="Generated image">
      <div class="completion-badge">✓</div>
      <div class="item-info">${item?.name || 'Generated Item'}</div>
    `;
    
    itemElement.addEventListener('click', () => this.showImageModal(thumbnail));
    grid.appendChild(itemElement);
    
    // Update completed count
    document.getElementById('completedCount').textContent = `${completedCount} items`;
    
    // Scroll to show latest item
    grid.scrollTop = grid.scrollHeight;
  }

  addFailedItem(itemName, error) {
    const grid = document.getElementById('completedItemsGrid');
    
    const itemElement = document.createElement('div');
    itemElement.className = 'completed-item failed-item';
    itemElement.innerHTML = `
      <div class="error-placeholder">
        <div class="error-icon">⚠️</div>
        <div class="error-text">Failed</div>
      </div>
      <div class="completion-badge error">✗</div>
      <div class="item-info">${itemName || 'Failed Item'}</div>
    `;
    
    itemElement.addEventListener('click', () => {
      this.showNotification(`Generation failed: ${error}`, 'error');
    });
    
    grid.appendChild(itemElement);
    
    // Scroll to show latest item
    grid.scrollTop = grid.scrollHeight;
  }

  updateProcessingStats(current, total, timing) {
    const now = Date.now();
    const startTime = this.batchGeneration.startTime || now;
    const totalElapsed = now - startTime;
    
    // Update total processing time
    document.getElementById('totalProcessingTime').textContent = this.formatDuration(totalElapsed);
    
    // Update average processing time per item
    if (current > 0) {
      const averageTime = totalElapsed / current;
      document.getElementById('averageProcessingTime').textContent = this.formatDuration(averageTime);
    }
    
    // Update overall ETA
    if (current > 0 && total > current) {
      const averageTime = totalElapsed / current;
      const remainingItems = total - current;
      const eta = remainingItems * averageTime;
      document.getElementById('overallETA').textContent = this.formatDuration(eta);
    }
    
    // Update processing speed (items per minute)
    if (totalElapsed > 0) {
      const itemsPerMinute = (current / totalElapsed) * 60000;
      document.getElementById('processingSpeed').textContent = `${itemsPerMinute.toFixed(1)} items/min`;
    }
  }

  formatDuration(milliseconds) {
    if (!milliseconds || milliseconds < 0) return '0s';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  addProgressThumbnail(thumbnail, status) {
    const thumbnailsContainer = document.getElementById('progressThumbnails');
    
    const thumbnailElement = document.createElement('div');
    thumbnailElement.className = `progress-thumbnail ${status}`;
    
    if (thumbnail) {
      const img = document.createElement('img');
      img.src = thumbnail;
      img.alt = 'Generated image';
      thumbnailElement.appendChild(img);
    }

    thumbnailsContainer.appendChild(thumbnailElement);

    // Scroll to show latest thumbnail
    thumbnailsContainer.scrollTop = thumbnailsContainer.scrollHeight;
  }

  completeBatchGeneration(result) {
    console.log('🎉 Batch Generation Complete:', result);

    // Calculate completion stats
    const endTime = Date.now();
    const totalTime = endTime - this.batchGeneration.startTime;
    const successCount = this.batchGeneration.results.filter(r => r.status === 'completed').length;
    const errorCount = this.batchGeneration.results.filter(r => r.status === 'error').length;

    // Format total time
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    // Update results UI
    document.getElementById('successCount').textContent = successCount;
    document.getElementById('errorCount').textContent = errorCount;
    document.getElementById('totalTime').textContent = timeString;

    // Populate results grid
    this.populateResultsGrid();

    // Switch to results phase
    document.getElementById('batchProgressPhase').style.display = 'none';
    document.getElementById('batchResultsPhase').style.display = 'block';

    // Update state
    this.batchGeneration.isRunning = false;

    // Show success notification
    this.showNotification(`Batch generation completed! ${successCount} successful, ${errorCount} errors`, 'success');
  }

  populateResultsGrid() {
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '';

    this.batchGeneration.results.forEach((result, index) => {
      const resultElement = document.createElement('div');
      resultElement.className = `result-item ${result.status}`;

      if (result.thumbnail && result.status === 'completed') {
        const img = document.createElement('img');
        img.src = result.thumbnail;
        img.alt = `Generated image ${index + 1}`;
        img.addEventListener('click', () => this.showImageModal(result.thumbnail));
        resultElement.appendChild(img);
      }

      resultsGrid.appendChild(resultElement);
    });
  }

  // Demo function for testing the enhanced progress interface
  simulateEnhancedProgress() {
    console.log('🎬 Starting enhanced progress simulation...');
    
    // Switch to progress phase
    document.getElementById('batchSetupPhase').style.display = 'none';
    document.getElementById('batchProgressPhase').style.display = 'block';
    
    this.batchGeneration.startTime = Date.now();
    let step = 0;
    
    const simulationSteps = [
      // Pipeline loading phase
      () => this.updatePipelineProgress({ current: 1, total: 7, component: 'Loading tokenizer...', status: 'Initializing' }),
      () => this.updatePipelineProgress({ current: 3, total: 7, component: 'Loading text encoder...', status: 'Loading' }),
      () => this.updatePipelineProgress({ current: 5, total: 7, component: 'Loading VAE decoder...', status: 'Loading' }),
      () => this.updatePipelineProgress({ current: 7, total: 7, component: 'Pipeline ready', status: 'Complete' }),
      
      // First item processing
      () => this.updateCurrentProcessing(
        { name: 'Blue Cotton T-Shirt', category: 'tops', color: 'blue' },
        '010d2136-abc123',
        { startTime: Date.now(), elapsed: 0 }
      ),
      () => this.updateGenerationProgress({ current: 5, total: 25, step: 'Denoising step 5', status: 'Generating', speed: 0.8 }),
      () => this.updateGenerationProgress({ current: 15, total: 25, step: 'Denoising step 15', status: 'Generating', speed: 0.7 }),
      () => this.updateGenerationProgress({ current: 25, total: 25, step: 'Generation complete', status: 'Complete', speed: 0.7 }),
      
      // Complete first item
      () => {
        this.addCompletedItem(
          { name: 'Blue Cotton T-Shirt' },
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMwNzNkYyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4='
        );
        this.updateBatchProgressSection({ completed: 1, total: 3, status: 'Processing items' });
      },
      
      // Second item
      () => this.updateCurrentProcessing(
        { name: 'Black Jeans', category: 'bottoms', color: 'black' },
        '010d2136-def456',
        { startTime: Date.now(), elapsed: 2000 }
      ),
      () => this.updateGenerationProgress({ current: 10, total: 25, step: 'Denoising step 10', status: 'Generating', speed: 0.6 }),
      () => this.updateGenerationProgress({ current: 25, total: 25, step: 'Generation complete', status: 'Complete', speed: 0.6 }),
      
      // Complete second item
      () => {
        this.addCompletedItem(
          { name: 'Black Jeans' },
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4='
        );
        this.updateBatchProgressSection({ completed: 2, total: 3, status: 'Processing items' });
      },
      
      // Third item
      () => this.updateCurrentProcessing(
        { name: 'White Sneakers', category: 'shoes', color: 'white' },
        '010d2136-ghi789',
        { startTime: Date.now(), elapsed: 1500 }
      ),
      () => this.updateGenerationProgress({ current: 20, total: 25, step: 'Denoising step 20', status: 'Generating', speed: 0.5 }),
      () => this.updateGenerationProgress({ current: 25, total: 25, step: 'Generation complete', status: 'Complete', speed: 0.5 }),
      
      // Complete third item
      () => {
        this.addCompletedItem(
          { name: 'White Sneakers' },
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4='
        );
        this.updateBatchProgressSection({ completed: 3, total: 3, status: 'Complete' });
      }
    ];
    
    const runStep = () => {
      if (step < simulationSteps.length) {
        simulationSteps[step]();
        step++;
        setTimeout(runStep, 1000);
      } else {
        console.log('🎉 Enhanced progress simulation complete!');
      }
    };
    
    runStep();
  }
}

window.app = null;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new StyleAgent();
  console.log('✅ StyleAgent app initialized:', !!window.app);
});

// Add global test functions for debugging
window.testFileDialog = async () => {
  console.log('🧪 Testing file dialog...');
  try {
    const result = await ClothingAnalysisAPI.uploadMultipleImages();
    console.log('🎯 Test result:', result);
    return result;
  } catch (error) {
    console.error('❌ Test error:', error);
    return { success: false, error: error.message };
  }
};

// Test the enhanced batch generation progress interface
window.testEnhancedProgress = () => {
  console.log('🧪 Testing enhanced progress interface...');
  if (window.app) {
    // Open the batch generation modal first
    window.app.openBatchGenerationModal();
    // Wait a bit then start simulation
    setTimeout(() => {
      window.app.simulateEnhancedProgress();
    }, 1000);
  } else {
    console.error('App not initialized');
  }
};