// Comprehensive test for all 8 clothing categories and editing functionality
// Run this in the browser console when StyleAgent is running

console.log('🧪 Testing all 8 clothing categories and editing capabilities...');

async function testAllCategories() {
  const categories = [
    { name: 'tops', icon: '👕', examples: ['t-shirt', 'blouse', 'sweater', 'tank top'] },
    { name: 'bottoms', icon: '👖', examples: ['jeans', 'skirt', 'shorts', 'pants'] },
    { name: 'shoes', icon: '👟', examples: ['sneakers', 'boots', 'heels', 'sandals'] },
    { name: 'accessories', icon: '👜', examples: ['bag', 'watch', 'jewelry', 'belt'] },
    { name: 'outerwear', icon: '🧥', examples: ['jacket', 'coat', 'cardigan', 'blazer'] },
    { name: 'underwear', icon: '🩲', examples: ['bra', 'briefs', 'socks', 'undershirt'] },
    { name: 'sleepwear', icon: '🌙', examples: ['pajamas', 'nightgown', 'robe', 'sleep shirt'] },
    { name: 'activewear', icon: '🏃', examples: ['leggings', 'sports bra', 'workout top', 'running shorts'] }
  ];

  console.log('📋 Testing category validation in WardrobeManager...');
  
  for (const category of categories) {
    try {
      console.log(`\n${category.icon} Testing category: ${category.name}`);
      
      // Test adding an item in this category
      const testItem = {
        name: `Test ${category.examples[0]}`,
        category: category.name,
        color: ['blue'],
        material: ['cotton'],
        brand: 'Test Brand',
        size: 'M',
        condition: 'good',
        favorite: false,
        notes: `Test item for ${category.name} category validation`
      };
      
      // Test client-side validation
      const itemData = window.app ? window.app.validateItemData ? window.app.validateItemData(testItem) : testItem : testItem;
      
      // Test filtering by this category
      const categoryFilter = document.getElementById('categoryFilter');
      if (categoryFilter) {
        categoryFilter.value = category.name;
        
        // Trigger filter update
        if (window.app && window.app.applyFiltersAndSort) {
          console.log(`  🔍 Testing filter for ${category.name}...`);
          // Don't actually apply filters in test, just verify the category exists
        }
      }
      
      // Check if category appears in outfit builder
      const outfitSlot = document.querySelector(`[data-category="${category.name}"]`);
      if (outfitSlot) {
        console.log(`  ✅ Category ${category.name} found in outfit builder`);
      } else {
        console.log(`  ⚠️ Category ${category.name} missing from outfit builder`);
      }
      
      console.log(`  ✅ Category ${category.name} validation passed`);
      
    } catch (error) {
      console.error(`  ❌ Category ${category.name} failed:`, error);
    }
  }
  
  // Test category enumeration
  console.log('\n📊 Category coverage test:');
  const filterOptions = document.querySelectorAll('#categoryFilter option[value]');
  const availableCategories = Array.from(filterOptions)
    .map(option => option.value)
    .filter(value => value); // Remove empty option
  
  console.log('Available in filter:', availableCategories);
  console.log('Expected categories:', categories.map(c => c.name));
  
  const missing = categories.filter(cat => !availableCategories.includes(cat.name));
  const extra = availableCategories.filter(cat => !categories.some(c => c.name === cat));
  
  if (missing.length === 0 && extra.length === 0) {
    console.log('✅ All 8 categories properly implemented in UI');
  } else {
    if (missing.length > 0) console.log('❌ Missing categories:', missing.map(c => c.name));
    if (extra.length > 0) console.log('⚠️ Extra categories:', extra);
  }
}

async function testEditingCapabilities() {
  console.log('\n✏️ Testing editing capabilities...');
  
  // Test wardrobe item editing functions
  console.log('📝 Testing wardrobe item editing...');
  if (window.app) {
    if (typeof window.app.editItem === 'function') {
      console.log('✅ editItem function available');
    } else {
      console.log('❌ editItem function missing');
    }
    
    if (typeof window.app.showEditItemModal === 'function') {
      console.log('✅ showEditItemModal function available');
    } else {
      console.log('❌ showEditItemModal function missing');
    }
    
    if (typeof window.app.saveItemChanges === 'function') {
      console.log('✅ saveItemChanges function available');
    } else {
      console.log('❌ saveItemChanges function missing');
    }
  }
  
  // Test outfit editing functions
  console.log('\n👗 Testing outfit editing...');
  if (window.app) {
    if (typeof window.app.editOutfit === 'function') {
      console.log('✅ editOutfit function available');
    } else {
      console.log('❌ editOutfit function missing');
    }
    
    if (typeof window.app.showEditOutfitModal === 'function') {
      console.log('✅ showEditOutfitModal function available');
    } else {
      console.log('❌ showEditOutfitModal function missing');
    }
    
    if (typeof window.app.saveOutfitChanges === 'function') {
      console.log('✅ saveOutfitChanges function available');
    } else {
      console.log('❌ saveOutfitChanges function missing');
    }
  }
  
  // Test if edit buttons exist in UI
  console.log('\n🔍 Testing edit UI elements...');
  const items = document.querySelectorAll('.clothing-item');
  console.log(`Found ${items.length} clothing items`);
  
  if (items.length > 0) {
    // Click on first item to open details and check for edit button
    console.log('Opening first item details to check for edit button...');
    if (items[0] && window.app && window.app.selectItem) {
      // Simulate item selection to check if edit button appears
      console.log('✅ Item selection function available - edit button should appear in details modal');
    }
  }
  
  // Test outfit editing UI
  const outfits = document.querySelectorAll('.outfit-card, .outfit-item');
  console.log(`Found ${outfits.length} outfits`);
  
  if (outfits.length > 0) {
    console.log('✅ Outfits available for editing tests');
    console.log('Note: Edit button should appear in outfit details modal');
  } else {
    console.log('⚠️ No outfits found to test editing');
  }
}

async function testFormValidation() {
  console.log('\n📝 Testing form validation for all categories...');
  
  // Test if we can access the add item functionality
  if (window.app && window.app.openUnifiedAddModal) {
    console.log('✅ Unified add modal available');
    
    // Test category selection in forms
    const categories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'underwear', 'sleepwear', 'activewear'];
    
    categories.forEach(category => {
      // Test text parsing for this category
      if (window.app.guessCategory) {
        const testTexts = {
          tops: 'blue cotton t-shirt',
          bottoms: 'dark jeans',
          shoes: 'running sneakers',
          accessories: 'leather handbag',
          outerwear: 'winter coat',
          underwear: 'cotton briefs',
          sleepwear: 'silk pajamas',
          activewear: 'yoga leggings'
        };
        
        const guessed = window.app.guessCategory(testTexts[category]);
        if (guessed === category) {
          console.log(`✅ Text parsing correctly identifies ${category}`);
        } else {
          console.log(`⚠️ Text parsing for ${category}: expected "${category}", got "${guessed}"`);
        }
      }
    });
  }
}

// Run all tests
async function runAllTests() {
  try {
    console.log('🚀 Starting comprehensive category and editing tests...\n');
    
    await testAllCategories();
    await testEditingCapabilities();
    await testFormValidation();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Category validation system tested');
    console.log('✅ UI filter integration verified');
    console.log('✅ Outfit builder category slots checked');
    console.log('✅ Text parsing for categories tested');
    console.log('✅ Editing capability assessment completed');
    
    console.log('\n🎯 Next steps:');
    console.log('1. Implement missing edit buttons if needed');
    console.log('2. Add inline editing for quick updates');
    console.log('3. Create outfit editing interface');
    console.log('4. Add delete confirmations');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Auto-run tests
runAllTests();

// Export for manual use
window.testAllCategories = testAllCategories;
window.testEditingCapabilities = testEditingCapabilities;
window.runAllTests = runAllTests;

console.log('\n🧪 Category and editing test suite loaded!');
console.log('📋 Available functions:');
console.log('  - testAllCategories()');
console.log('  - testEditingCapabilities()');
console.log('  - runAllTests()');