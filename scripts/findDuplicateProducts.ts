/**
 * Script to find and report duplicate products in Firestore
 * Run with: npx tsx scripts/findDuplicateProducts.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase config - you may need to adjust these based on your .env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface ProductDoc {
  docId: string; // Firestore document ID
  productId: string; // Product ID field in the document
  name: string;
  storeId: string;
  [key: string]: any;
}

async function findDuplicateProducts() {
  console.log('🔍 Scanning for duplicate products...\n');

  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);

  console.log(`📦 Total documents in 'products' collection: ${snapshot.docs.length}\n`);

  const products: ProductDoc[] = snapshot.docs.map(doc => ({
    docId: doc.id,
    productId: doc.id, // Document ID should be the product ID
    name: doc.data().name || 'Unnamed',
    storeId: doc.data().storeId || 'Unknown',
    ...doc.data()
  }));

  // Group by storeId to check for duplicates per store
  const byStore = new Map<string, ProductDoc[]>();
  products.forEach(product => {
    const storeProducts = byStore.get(product.storeId) || [];
    storeProducts.push(product);
    byStore.set(product.storeId, storeProducts);
  });

  let totalDuplicates = 0;

  byStore.forEach((storeProducts, storeId) => {
    // Check for documents with same data but different document IDs
    const nameGroups = new Map<string, ProductDoc[]>();

    storeProducts.forEach(product => {
      const key = `${product.name}_${product.price}_${product.category}`;
      const group = nameGroups.get(key) || [];
      group.push(product);
      nameGroups.set(key, group);
    });

    nameGroups.forEach((group, key) => {
      if (group.length > 1) {
        console.log(`\n❌ DUPLICATE FOUND in Store: ${storeId}`);
        console.log(`   Product: ${group[0].name}`);
        console.log(`   ${group.length} identical documents found:\n`);

        group.forEach((product, index) => {
          console.log(`   Document #${index + 1}:`);
          console.log(`     - Firestore Doc ID: ${product.docId}`);
          console.log(`     - Product Name: ${product.name}`);
          console.log(`     - Price: $${product.price}`);
          console.log(`     - Category: ${product.category}`);
          console.log(`     - Created: ${product.createdAt ? new Date(product.createdAt.seconds * 1000).toISOString() : 'Unknown'}`);
          console.log();
        });

        console.log(`   ⚠️  TO DELETE: Keep the first one, delete these document IDs:`);
        group.slice(1).forEach(product => {
          console.log(`     - ${product.docId}`);
        });
        console.log();

        totalDuplicates += group.length - 1;
      }
    });
  });

  if (totalDuplicates === 0) {
    console.log('\n✅ No duplicates found! Your database is clean.\n');
  } else {
    console.log(`\n❌ Found ${totalDuplicates} duplicate documents that should be deleted.\n`);
    console.log('To delete them, you can:');
    console.log('1. Go to Firebase Console > Firestore Database');
    console.log('2. Search for the document IDs listed above');
    console.log('3. Delete the duplicate documents manually\n');
    console.log('Or run the cleanup script: npx tsx scripts/cleanupDuplicateProducts.ts\n');
  }
}

findDuplicateProducts()
  .then(() => {
    console.log('✨ Scan complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error scanning products:', error);
    process.exit(1);
  });
