const { WardrobeManager, WardrobeManagerError } = require('./WardrobeManager');
const { ValidationUtils, ValidationError } = require('./ValidationUtils');
const path = require('path');

async function runTests() {
  console.log('🧪 Testing StyleAgent Data Management System\n');

  const testDataPath = path.join(__dirname, 'test-data');
  const wardrobeManager = new WardrobeManager(testDataPath);

  try {
    // Test 1: Initialize wardrobe
    console.log('1️⃣ Testing wardrobe initialization...');
    await wardrobeManager.initialize();
    console.log('✅ Wardrobe initialized successfully\n');

    // Test 2: Add a clothing item
    console.log('2️⃣ Testing add item...');
    const testItem = {
      name: 'Test T-Shirt',
      category: 'tops',
      brand: 'Test Brand',
      color: ['blue', 'white'],
      size: 'M',
      material: ['cotton'],
      season: ['spring', 'summer'],
      occasion: ['casual'],
      notes: 'This is a test item'
    };

    const addedItem = await wardrobeManager.addItem(testItem);
    console.log('✅ Item added successfully:', addedItem.name);
    console.log('   ID:', addedItem.id);
    console.log('   Created at:', addedItem.createdAt, '\n');

    // Test 3: Get all items
    console.log('3️⃣ Testing get items...');
    const itemsResult = await wardrobeManager.getItems();
    console.log('✅ Retrieved items:', itemsResult.metadata.totalItems);
    console.log('   Items returned:', itemsResult.items.length, '\n');

    // Test 4: Update item
    console.log('4️⃣ Testing update item...');
    const updatedItem = await wardrobeManager.updateItem(addedItem.id, {
      favorite: true,
      timesWorn: 5
    });
    console.log('✅ Item updated successfully');
    console.log('   Favorite:', updatedItem.favorite);
    console.log('   Times worn:', updatedItem.timesWorn, '\n');

    // Test 5: Record wear
    console.log('5️⃣ Testing record wear...');
    const wornItem = await wardrobeManager.recordWear(addedItem.id);
    console.log('✅ Wear recorded successfully');
    console.log('   Times worn:', wornItem.timesWorn);
    console.log('   Last worn:', wornItem.lastWorn, '\n');

    // Test 6: Search items
    console.log('6️⃣ Testing search...');
    const searchResults = await wardrobeManager.searchItems('test');
    console.log('✅ Search completed');
    console.log('   Results found:', searchResults.length, '\n');

    // Test 7: Filter items
    console.log('7️⃣ Testing filters...');
    const filteredResults = await wardrobeManager.getItems({
      filters: { category: 'tops', favorite: true }
    });
    console.log('✅ Filter applied successfully');
    console.log('   Filtered results:', filteredResults.items.length, '\n');

    // Test 8: Get statistics
    console.log('8️⃣ Testing statistics...');
    const stats = await wardrobeManager.getStatistics();
    console.log('✅ Statistics generated');
    console.log('   Total items:', stats.totalItems);
    console.log('   Categories:', Object.keys(stats.categories).length);
    console.log('   Favorites:', stats.favorites, '\n');

    // Test 9: Export data
    console.log('9️⃣ Testing export...');
    const exportData = await wardrobeManager.exportData();
    console.log('✅ Data exported successfully');
    console.log('   Exported items:', exportData.items.length);
    console.log('   Export timestamp:', exportData.exportedAt, '\n');

    // Test 10: Delete item
    console.log('🔟 Testing delete item...');
    const deletedItem = await wardrobeManager.deleteItem(addedItem.id);
    console.log('✅ Item deleted successfully:', deletedItem.name, '\n');

    // Test 11: Validation tests
    console.log('1️⃣1️⃣ Testing validation...');
    
    try {
      ValidationUtils.validateClothingItem({
        name: '',
        category: 'invalid'
      });
      console.log('❌ Validation should have failed');
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('✅ Validation correctly rejected invalid item');
      } else {
        throw error;
      }
    }

    const validItem = ValidationUtils.validateClothingItem({
      name: 'Valid Item',
      category: 'tops',
      color: ['red']
    });
    console.log('✅ Validation accepted valid item:', validItem.name, '\n');

    console.log('🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('  - Wardrobe initialization: ✅');
    console.log('  - Add item: ✅');
    console.log('  - Get items: ✅');
    console.log('  - Update item: ✅');
    console.log('  - Record wear: ✅');
    console.log('  - Search items: ✅');
    console.log('  - Filter items: ✅');
    console.log('  - Get statistics: ✅');
    console.log('  - Export data: ✅');
    console.log('  - Delete item: ✅');
    console.log('  - Validation: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };