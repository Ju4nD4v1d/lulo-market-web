/**
 * Paste this into your browser console while on the dashboard products page
 * to find and help identify duplicate products
 */

console.log('🔍 Analyzing products for duplicates...\n');

// This assumes you're on the products page with products loaded
const storeId = 'ayrSD801wGqal4oMbkas'; // Replace with your store ID

async function analyzeDuplicates() {
  // Get all products from the current page
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('../src/config/firebase');

  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('storeId', '==', storeId));
  const snapshot = await getDocs(q);

  console.log(`Total documents fetched: ${snapshot.docs.length}\n`);

  const products = snapshot.docs.map(doc => ({
    firestoreDocId: doc.id,
    ...doc.data()
  }));

  // Find products with the same characteristics
  const duplicateMap = new Map();

  products.forEach(product => {
    const key = `${product.name}_${product.price}_${product.category}`;
    if (!duplicateMap.has(key)) {
      duplicateMap.set(key, []);
    }
    duplicateMap.get(key).push(product);
  });

  let foundDuplicates = false;

  duplicateMap.forEach((group, key) => {
    if (group.length > 1) {
      foundDuplicates = true;
      console.log(`\n❌ DUPLICATE: ${group[0].name}`);
      console.log(`   Found ${group.length} identical products:\n`);

      group.forEach((product, index) => {
        console.log(`   ${index + 1}. Firestore Doc ID: ${product.firestoreDocId}`);
        console.log(`      Created: ${new Date(product.createdAt?.seconds * 1000).toISOString()}`);
      });

      console.log(`\n   To delete in Firebase Console:`);
      group.slice(1).forEach(product => {
        console.log(`   - Delete document: ${product.firestoreDocId}`);
      });
    }
  });

  if (!foundDuplicates) {
    console.log('✅ No duplicates found!');
  }
}

analyzeDuplicates().catch(console.error);
