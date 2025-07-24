// Test script to verify mock products work correctly
const { generateAllMockStores } = require('./src/utils/mockDataGenerators');

console.log('Testing mock data generation...');

// Generate all mock stores
const mockStores = generateAllMockStores();

console.log(`\nGenerated ${mockStores.length} mock stores:`);

mockStores.forEach((store, index) => {
  console.log(`\n${index + 1}. Store: ${store.name} (ID: ${store.id})`);
  console.log(`   Country: ${store.id.split('-')[0]}`);
  console.log(`   Products: ${store.products ? store.products.length : 0}`);
  
  if (store.products && store.products.length > 0) {
    console.log(`   Sample products:`);
    store.products.slice(0, 3).forEach((product, i) => {
      console.log(`     - ${product.name} ($${product.price})`);
    });
  } else {
    console.log(`   ⚠️  NO PRODUCTS FOUND`);
  }
});

// Test specific store IDs that should have products
const testStoreIds = ['colombian-store-1', 'brazilian-store-1', 'venezuelan-store-1', 'mexican-store-1'];

console.log('\n\nTesting specific store IDs:');
testStoreIds.forEach(storeId => {
  const store = mockStores.find(s => s.id === storeId);
  if (store) {
    console.log(`✅ ${storeId}: Found with ${store.products ? store.products.length : 0} products`);
  } else {
    console.log(`❌ ${storeId}: Not found`);
  }
});