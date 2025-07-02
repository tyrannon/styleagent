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
    return await ipcRenderer.invoke('photo:isAvailable');
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

    // Add Item functionality
    const addClothingBtn = document.getElementById('addClothingBtn');
    addClothingBtn.addEventListener('click', () => this.showAddItemModal());
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

  // ==================== WARDROBE TAB ====================
  
  initializeWardrobe() {
    // Filters
    const categoryFilter = document.getElementById('categoryFilter');
    const laundryFilter = document.getElementById('laundryFilter');

    categoryFilter.addEventListener('change', () => this.applyFilters());
    laundryFilter.addEventListener('change', () => this.applyFilters());

    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
    });

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
    try {
      this.showLoading('Loading wardrobe...');
      const result = await WardrobeAPI.getItems({ filters: this.currentFilters });
      
      if (result.success) {
        this.currentItems = result.data || [];
        this.renderWardrobe();
        this.updateWardrobeStats();
      } else {
        console.error('Failed to load wardrobe:', result.error);
        this.showNotification(`❌ Failed to load wardrobe: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      this.showNotification('❌ Failed to load wardrobe', 'error');
    }
  }

  async refreshWardrobe() {
    await this.loadWardrobe();
  }

  async applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const laundryFilter = document.getElementById('laundryFilter');

    this.currentFilters = {};
    
    if (categoryFilter.value) {
      this.currentFilters.category = categoryFilter.value;
    }
    
    if (laundryFilter.value) {
      this.currentFilters.laundryStatus = laundryFilter.value;
    }

    await this.loadWardrobe();
  }

  renderWardrobe() {
    const grid = document.getElementById('clothingGrid');
    
    if (this.currentItems.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>✨ Your wardrobe awaits</h3>
          <p>Add some clothing items to get started, or load sample data to explore StyleAgent!</p>
          <button class="btn-primary" onclick="app.showAddItemModal()">+ Add First Item</button>
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

  switchView(view) {
    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const grid = document.getElementById('clothingGrid');
    if (view === 'list') {
      grid.classList.add('list-view');
    } else {
      grid.classList.remove('list-view');
    }
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
    this.showNotification('✏️ Edit functionality coming soon!', 'info');
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
                <button class="btn-primary" id="addClothingBtn">
                  📸 Add Clothing
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
      
      // Initialize add clothing button
      const addClothingBtn = document.getElementById('addClothingBtn');
      if (addClothingBtn && !addClothingBtn.hasListener) {
        addClothingBtn.hasListener = true;
        addClothingBtn.addEventListener('click', () => {
          console.log('📸 Add Clothing button clicked');
          this.showMultiImageUploadModal();
        });
      }
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
    
    // Reset zoom and position
    this.resetImageModalTransform();
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Add keyboard event listener for Escape key
    this.addModalKeyboardListener();
  }

  createImageModal() {
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="app.closeImageModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Outfit Image</h3>
          <div class="modal-controls">
            <button class="modal-btn" onclick="app.zoomImageModal(0.8)" title="Zoom Out">🔍-</button>
            <button class="modal-btn" onclick="app.zoomImageModal(1.25)" title="Zoom In">🔍+</button>
            <button class="modal-btn" onclick="app.resetImageModalTransform()" title="Reset">⟲</button>
            <button class="modal-btn close-btn" onclick="app.closeImageModal()" title="Close">✕</button>
          </div>
        </div>
        <div class="modal-image-container">
          <img class="modal-image" draggable="false">
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
    
    let isDragging = false;
    let startX, startY, startTransformX = 0, startTransformY = 0;
    let currentScale = 1;
    let currentX = 0, currentY = 0;

    // Mouse events for dragging
    image.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startTransformX = currentX;
      startTransformY = currentY;
      image.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      currentX = startTransformX + deltaX;
      currentY = startTransformY + deltaY;
      
      this.updateImageTransform(image, currentScale, currentX, currentY);
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        image.style.cursor = 'grab';
      }
    });

    // Wheel event for zooming
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(5, currentScale * zoomFactor));
      
      // Zoom towards mouse position
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      currentX = mouseX - (mouseX - currentX) * (newScale / currentScale);
      currentY = mouseY - (mouseY - currentY) * (newScale / currentScale);
      
      currentScale = newScale;
      this.updateImageTransform(image, currentScale, currentX, currentY);
    });

    // Touch events for mobile support
    let initialDistance = 0;
    let initialScale = 1;

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        // Pinch to zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialScale = currentScale;
      } else if (e.touches.length === 1) {
        // Single touch drag
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTransformX = currentX;
        startTransformY = currentY;
        isDragging = true;
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
        
        const scale = Math.max(0.1, Math.min(5, initialScale * (currentDistance / initialDistance)));
        currentScale = scale;
        this.updateImageTransform(image, currentScale, currentX, currentY);
      } else if (e.touches.length === 1 && isDragging) {
        // Single touch drag
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        currentX = startTransformX + deltaX;
        currentY = startTransformY + deltaY;
        
        this.updateImageTransform(image, currentScale, currentX, currentY);
      }
    });

    container.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Store transform state on modal for easy access
    modal._transformState = {
      get scale() { return currentScale; },
      set scale(value) { currentScale = value; },
      get x() { return currentX; },
      set x(value) { currentX = value; },
      get y() { return currentY; },
      set y(value) { currentY = value; }
    };
  }

  updateImageTransform(image, scale, x, y) {
    image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    image.style.cursor = scale > 1 ? 'grab' : 'default';
  }

  zoomImageModal(factor) {
    const modal = document.getElementById('image-modal');
    if (!modal || !modal._transformState) return;
    
    const image = modal.querySelector('.modal-image');
    const state = modal._transformState;
    
    const newScale = Math.max(0.1, Math.min(5, state.scale * factor));
    state.scale = newScale;
    
    this.updateImageTransform(image, state.scale, state.x, state.y);
  }

  resetImageModalTransform() {
    const modal = document.getElementById('image-modal');
    if (!modal || !modal._transformState) return;
    
    const image = modal.querySelector('.modal-image');
    const state = modal._transformState;
    
    state.scale = 1;
    state.x = 0;
    state.y = 0;
    
    this.updateImageTransform(image, 1, 0, 0);
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
}

// Make app globally available for onclick handlers
window.app = null;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new StyleAgent();
  console.log('✅ StyleAgent app initialized:', !!window.app);
});

// Add global test function for debugging
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