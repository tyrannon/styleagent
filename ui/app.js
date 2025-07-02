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
    return await ipcRenderer.invoke('wardrobe:getStatistics');
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
        await this.refreshOutfits();
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
    console.log('🔘 Select images button found:', !!selectImagesBtn);
    
    // Bind the handler properly with arrow function to preserve 'this' context
    selectImagesBtn.addEventListener('click', (e) => {
      console.log('🖱️ Select images button clicked');
      console.log('🎯 App context available:', !!this);
      e.preventDefault();
      e.stopPropagation();
      this.handleMultiImageUpload(modal);
    });
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
    const generateOutfitBtn = document.getElementById('generateOutfitBtn');
    const saveOutfitBtn = document.getElementById('saveOutfitBtn');

    generateOutfitBtn.addEventListener('click', () => this.generateAIOutfit());
    saveOutfitBtn.addEventListener('click', () => this.saveCurrentOutfit());

    // Add click listeners to outfit slots for manual selection
    const outfitSlots = document.querySelectorAll('.outfit-slot');
    outfitSlots.forEach(slot => {
      slot.addEventListener('click', (e) => {
        const category = this.getSlotCategory(slot);
        this.startItemSelection(category);
      });
    });
  }

  refreshBuilder() {
    this.updateBuilderSlots();
  }

  getSlotCategory(slot) {
    if (slot.classList.contains('outfit-top')) return 'tops';
    if (slot.classList.contains('outfit-bottom')) return 'bottoms';
    if (slot.classList.contains('outfit-shoes')) return 'shoes';
    return 'accessories';
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
    
    if (category === 'accessories') {
      this.builderState.selectedItems[category].push(item);
    } else {
      this.builderState.selectedItems[category] = item;
    }
    
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
    
    this.showNotification(`✅ ${item.name} added to outfit!`, 'success');
  }

  updateBuilderSlots() {
    const topSlot = document.querySelector('.outfit-top');
    const bottomSlot = document.querySelector('.outfit-bottom');
    const shoesSlot = document.querySelector('.outfit-shoes');
    
    // Update top slot
    if (this.builderState.selectedItems.tops) {
      const item = this.builderState.selectedItems.tops;
      topSlot.innerHTML = this.renderBuilderItem(item, 'tops');
    } else {
      topSlot.innerHTML = `
        <div class="slot-placeholder">
          <span>👕</span>
          <p>Select a top</p>
        </div>
      `;
    }
    
    // Update bottom slot
    if (this.builderState.selectedItems.bottoms) {
      const item = this.builderState.selectedItems.bottoms;
      bottomSlot.innerHTML = this.renderBuilderItem(item, 'bottoms');
    } else {
      bottomSlot.innerHTML = `
        <div class="slot-placeholder">
          <span>👖</span>
          <p>Select bottoms</p>
        </div>
      `;
    }
    
    // Update shoes slot
    if (this.builderState.selectedItems.shoes) {
      const item = this.builderState.selectedItems.shoes;
      shoesSlot.innerHTML = this.renderBuilderItem(item, 'shoes');
    } else {
      shoesSlot.innerHTML = `
        <div class="slot-placeholder">
          <span>👟</span>
          <p>Select shoes</p>
        </div>
      `;
    }
    
    // Update save button state
    this.updateSaveButtonState();
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
      this.showLoading('🎨 Generating AI outfit...');
      
      const result = await OutfitsAPI.generateFromAI({
        occasion: 'casual',
        weather: 'mild',
        mood: 'comfortable'
      });
      
      if (result.success) {
        this.showNotification('✨ AI outfit generated and saved!', 'success');
        
        // Update builder with AI selected items
        const selectedItems = result.data.selectedItems;
        selectedItems.forEach(item => {
          this.builderState.selectedItems[item.category] = item;
        });
        this.updateBuilderSlots();
        
        // Show outfit details
        this.displayGeneratedOutfit(result.data);
        
        // Refresh outfits tab
        await this.refreshOutfits();
      } else {
        this.showNotification(`❌ Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
      this.showNotification('❌ Failed to generate outfit', 'error');
    }
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
    const selectedItems = Object.values(this.builderState.selectedItems)
      .filter(item => item !== null)
      .concat(this.builderState.selectedItems.accessories);
    
    if (selectedItems.length === 0) {
      this.showNotification('❌ Please select some items first!', 'error');
      return;
    }

    try {
      // Generate visualization
      const visualResult = await OutfitsAPI.generateVisualization(selectedItems);
      
      if (!visualResult.success) {
        this.showNotification('❌ Failed to generate outfit preview', 'error');
        return;
      }

      // Create outfit data
      const outfitData = {
        name: `My Outfit - ${new Date().toLocaleDateString()}`,
        description: 'Manually created outfit',
        items: selectedItems.map(item => item.id),
        itemDetails: selectedItems,
        occasion: 'casual',
        weather: 'mild',
        image: visualResult.data.dataURL,
        aiGenerated: false
      };

      const result = await OutfitsAPI.createOutfit(outfitData);
      
      if (result.success) {
        // Give user feedback about visualization type
        const visualizationType = visualResult.data.type || 'unknown';
        if (visualizationType === 'photo-realistic') {
          this.showNotification('🎨 Outfit saved with photo-realistic image!', 'success');
        } else if (visualizationType === 'svg') {
          if (visualResult.data.fallback) {
            this.showNotification('💾 Outfit saved (using SVG - Stable Diffusion not available)', 'info');
          } else {
            this.showNotification('💾 Outfit saved with SVG visualization!', 'success');
          }
        } else {
          this.showNotification('💾 Outfit saved successfully!', 'success');
        }
        
        // Clear builder
        this.builderState.selectedItems = {
          tops: null,
          bottoms: null,
          shoes: null,
          outerwear: null,
          accessories: []
        };
        this.updateBuilderSlots();
        
        // Refresh outfits tab
        await this.refreshOutfits();
      } else {
        this.showNotification(`❌ Failed to save outfit: ${result.error}`, 'error');
      }
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
  }

  async refreshProfile() {
    await this.updateAnalytics();
    await this.loadStyleDNA();
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