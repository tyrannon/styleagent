# STYLEAGENT_WORKFLOW.CLAUDE.MD

## Purpose
Manage StyleAgent's Electron IPC communication patterns and unified modal logic for seamless data flow between frontend UI and backend services. Handles wardrobe management, AI integration, and cross-component state synchronization.

## Trigger Examples
- `//workflow` - Debug IPC communication issues
- `//workflow modal conflict` - Fix modal overlay problems
- `//workflow sync wardrobe` - Sync frontend with backend data
- `//workflow --debug ipc` - Detailed IPC debugging
- `use styleagent_workflow.claude.md to fix data not updating in UI`

## Claude Strategy

### Step 1: Diagnose IPC Flow
- Identify which IPC channel is failing (`wardrobe:*`, `ai:*`, `styleDNA:*`, etc.)
- Check frontend API call in ui/app.js (WardrobeAPI, AIAPI, etc.)
- Verify backend handler in main.js IPC routes
- Test data serialization between renderer and main process

### Step 2: Modal State Management
- Check if multiple modals are open simultaneously
- Verify proper modal cleanup and backdrop handling
- Ensure z-index conflicts are resolved
- Test modal state persistence across navigation

### Step 3: Data Synchronization
- Validate wardrobe.json file integrity
- Check if UI state matches backend data
- Verify real-time updates after CRUD operations
- Test filter/sort state consistency

### Step 4: Cross-Component Communication
- Check event listeners between components
- Verify proper cleanup on component unmount
- Test state updates cascading to dependent UI elements
- Validate loading states and error handling

### Step 5: Performance & Memory
- Check for memory leaks in IPC handlers
- Verify proper cleanup of async operations
- Test large dataset handling (many wardrobe items)
- Monitor Electron process resource usage

## Dev Tips (Electron/JS Specific)

### IPC Communication Patterns
```javascript
// Frontend API call pattern
class WardrobeAPI {
  static async addItem(itemData) {
    try {
      return await ipcRenderer.invoke('wardrobe:addItem', itemData);
    } catch (error) {
      console.error('IPC Error:', error);
      throw error;
    }
  }
}

// Backend handler pattern  
ipcMain.handle('wardrobe:addItem', async (event, itemData) => {
  try {
    const result = await wardrobeManager.addItem(itemData);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### Modal Management
```javascript
// Unified modal state
class ModalManager {
  static currentModal = null;
  
  static open(modalId) {
    if (this.currentModal) this.close(this.currentModal);
    this.currentModal = modalId;
    document.getElementById(modalId).style.display = 'flex';
  }
  
  static close(modalId) {
    document.getElementById(modalId).style.display = 'none';
    this.currentModal = null;
  }
}
```

### Data Sync Patterns
```javascript
// Reactive UI updates
async function refreshWardrobe() {
  const items = await WardrobeAPI.getItems();
  app.currentItems = items;
  app.renderItems();
  app.updateStats();
}

// After data modification
await WardrobeAPI.addItem(newItem);
await refreshWardrobe(); // Sync UI
```

### Error Handling
```javascript
// IPC error boundary
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled IPC rejection:', event.reason);
  app.showNotification('❌ Communication error', 'error');
});
```

## Output Formatting

### IPC Debug Output
```
🔗 **IPC Communication Analysis**

**Channel:** wardrobe:addItem
**Status:** ❌ Failed
**Frontend Call:** ui/app.js:1245
**Backend Handler:** main.js:89
**Error:** Invalid item data structure

**Data Flow:**
1. UI form submission ✅
2. Data validation ❌ (missing category field)
3. IPC serialization ❌
4. Backend processing ❌

**Fix:** Add category validation before IPC call
```

### Modal Conflict Debug
```
🪟 **Modal State Analysis**

**Active Modals:**
• itemDetailModal (z-index: 1000) ✅
• unifiedAddModal (z-index: 1001) ❌ CONFLICT

**Issue:** Multiple modals open simultaneously
**Root Cause:** Missing modal cleanup in navigation

**Solution:**
```javascript
// Add to navigation handler
app.closeAllModals();
app.showTab(targetTab);
```

### Data Sync Debug  
```
🔄 **Data Synchronization Check**

**Backend State:** 45 items in wardrobe.json
**Frontend State:** 43 items in app.currentItems
**Discrepancy:** 2 items missing from UI

**Missing Items:**
• ID: abc123 (Blue Jeans)
• ID: def456 (White Sneakers)

**Sync Action:** Calling refreshWardrobe()
**Result:** ✅ UI now shows 45 items
```

### Performance Analysis
```
⚡ **StyleAgent Performance Report**

**IPC Response Times:**
• wardrobe:getItems: 45ms
• ai:suggestOutfit: 2.3s
• clothing:analyzeImage: 8.7s

**Memory Usage:**
• Main Process: 156MB
• Renderer Process: 89MB
• Total: 245MB

**Recommendations:**
• Cache wardrobe data in renderer
• Implement lazy loading for images
• Add request debouncing for filters
```