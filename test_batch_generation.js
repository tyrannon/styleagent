// Test script to verify batch generation button functionality
// This script can be run in the browser console to test the batch generation

console.log('🧪 Testing Batch Generation Button Functionality...');

// Function to test if the batch generation button exists and is clickable
function testBatchGenerationButton() {
  console.log('1. 🔍 Checking if batch generation button exists...');
  
  const batchButton = document.getElementById('batchGenerateBtn');
  if (!batchButton) {
    console.error('❌ Batch generation button not found!');
    return false;
  }
  
  console.log('✅ Batch generation button found:', batchButton);
  
  // Check if button is visible and clickable
  const buttonStyle = window.getComputedStyle(batchButton);
  const isVisible = buttonStyle.display !== 'none' && buttonStyle.visibility !== 'hidden';
  
  if (!isVisible) {
    console.error('❌ Batch generation button is not visible!');
    return false;
  }
  
  console.log('✅ Batch generation button is visible');
  
  // Test clicking the button
  console.log('2. 🖱️ Testing button click...');
  batchButton.click();
  
  return true;
}

// Function to test if the app is properly initialized
function testAppInitialization() {
  console.log('3. 🚀 Testing app initialization...');
  
  if (!window.app) {
    console.error('❌ StyleAgent app not initialized!');
    return false;
  }
  
  console.log('✅ StyleAgent app initialized');
  
  // Check if wardrobe items are loaded
  console.log('4. 👗 Checking wardrobe items...');
  console.log('Current items count:', window.app.currentItems ? window.app.currentItems.length : 'undefined');
  
  if (!window.app.currentItems || window.app.currentItems.length === 0) {
    console.warn('⚠️ No wardrobe items loaded. This might affect batch generation.');
  }
  
  return true;
}

// Function to test PhotoAPI availability
async function testPhotoAPIAvailability() {
  console.log('5. 📸 Testing PhotoAPI availability...');
  
  try {
    // Test PhotoAPI directly from the global scope
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('photo:isAvailable');
    console.log('PhotoAPI availability result:', result);
    
    if (!result || !result.available) {
      console.error('❌ PhotoAPI is not available!');
      return false;
    }
    
    console.log('✅ PhotoAPI is available');
    return true;
  } catch (error) {
    console.error('❌ Error testing PhotoAPI:', error);
    return false;
  }
}

// Main test function
async function runBatchGenerationTests() {
  console.log('🧪 Starting Batch Generation Tests...');
  
  let allTestsPassed = true;
  
  // Test 1: App initialization
  if (!testAppInitialization()) {
    allTestsPassed = false;
  }
  
  // Test 2: PhotoAPI availability
  if (!await testPhotoAPIAvailability()) {
    allTestsPassed = false;
  }
  
  // Test 3: Batch generation button
  if (!testBatchGenerationButton()) {
    allTestsPassed = false;
  }
  
  console.log('🏁 Test Results:', allTestsPassed ? '✅ All tests passed' : '❌ Some tests failed');
  
  return allTestsPassed;
}

// Function to test actual batch generation call
async function testBatchGenerationCall() {
  console.log('6. 🎯 Testing actual batch generation call...');
  
  if (!window.app || !window.app.currentItems || window.app.currentItems.length === 0) {
    console.error('❌ No items available for batch generation test');
    return false;
  }
  
  try {
    // Get first 2 items for testing
    const testItems = window.app.currentItems.slice(0, 2);
    console.log('Testing with items:', testItems.map(item => item.name));
    
    // Call PhotoAPI.batchGenerate directly
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('photo:batchGenerate', testItems, {
      quality: 'preview',
      generateThumbnails: true
    });
    
    console.log('Batch generation result:', result);
    
    if (result.success) {
      console.log('✅ Batch generation call successful');
      return true;
    } else {
      console.error('❌ Batch generation call failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing batch generation call:', error);
    return false;
  }
}

// Export functions for manual testing
window.testBatchGeneration = runBatchGenerationTests;
window.testBatchButton = testBatchGenerationButton;
window.testAppInit = testAppInitialization;
window.testPhotoAPI = testPhotoAPIAvailability;
window.testBatchGenerationCall = testBatchGenerationCall;

console.log('🎯 Test functions available:');
console.log('- window.testBatchGeneration() - Run all tests');
console.log('- window.testBatchButton() - Test button only');
console.log('- window.testAppInit() - Test app initialization');
console.log('- window.testPhotoAPI() - Test PhotoAPI availability');
console.log('- window.testBatchGenerationCall() - Test actual batch generation call');
console.log('');
console.log('💡 To run tests, execute: window.testBatchGeneration()');

// Quick manual test function
window.quickBatchTest = function() {
  console.log('🚀 Quick batch test starting...');
  
  // Step 1: Test app initialization
  if (!window.app) {
    console.error('❌ App not initialized');
    return;
  }
  
  console.log('✅ App found, current items:', window.app.currentItems?.length || 'none');
  
  // Step 2: Try to open batch modal
  console.log('📸 Trying to open batch modal...');
  window.app.openBatchGenerationModal();
  
  // Step 3: Wait a bit, then check if modal is open
  setTimeout(() => {
    const modal = document.getElementById('batchGenerationModal');
    if (modal && modal.style.display !== 'none') {
      console.log('✅ Batch modal opened successfully');
      
      // Step 4: Try to start batch generation
      console.log('🎯 Testing batch generation start...');
      const startBtn = document.getElementById('startBatchBtn');
      if (startBtn) {
        startBtn.click();
        console.log('✅ Start button clicked');
      } else {
        console.error('❌ Start button not found');
      }
    } else {
      console.error('❌ Batch modal failed to open');
    }
  }, 1000);
};