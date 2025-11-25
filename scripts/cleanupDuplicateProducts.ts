/**
 * Script to clean up duplicate products in Firestore
 * This will keep the oldest document and delete newer duplicates
 * Run with: npx tsx scripts/cleanupDuplicateProducts.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase config
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
  docId: string;
  name: string;
  storeId: string;
  price: number;
  category: string;
  createdAt: any;
  [key: string]: any;
}

async function cleanupDuplicates(dryRun = true) {
  console.log('🧹 Starting duplicate cleanup...');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes will be made)' : '⚠️  LIVE MODE (will delete duplicates)'}\n`);

  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);

  console.log(`📦 Total documents: ${snapshot.docs.length}\n`);

  const products: ProductDoc[] = snapshot.docs.map(doc => ({
    docId: doc.id,
    name: doc.data().name || 'Unnamed',
    storeId: doc.data().storeId || 'Unknown',
    price: doc.data().price || 0,
    category: doc.data().category || 'Unknown',
    createdAt: doc.data().createdAt,
    ...doc.data()
  }));

  // Group by storeId
  const byStore = new Map<string, ProductDoc[]>();
  products.forEach(product => {
    const storeProducts = byStore.get(product.storeId) || [];
    storeProducts.push(product);
    byStore.set(product.storeId, storeProducts);
  });

  let totalDeleted = 0;
  const toDelete: string[] = [];

  byStore.forEach((storeProducts, storeId) => {
    const nameGroups = new Map<string, ProductDoc[]>();

    storeProducts.forEach(product => {
      // Create a unique key based on product characteristics
      const key = `${product.name}_${product.price}_${product.category}`.toLowerCase();
      const group = nameGroups.get(key) || [];
      group.push(product);
      nameGroups.set(key, group);
    });

    nameGroups.forEach((group, key) => {
      if (group.length > 1) {
        console.log(`\n📍 Found duplicate: ${group[0].name}`);
        console.log(`   Store ID: ${storeId}`);
        console.log(`   ${group.length} copies found`);

        // Sort by creation date (keep oldest)
        group.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return a.createdAt.seconds - b.createdAt.seconds;
        });

        console.log(`\n   ✅ KEEPING (oldest):`);
        console.log(`      ID: ${group[0].docId}`);
        console.log(`      Created: ${group[0].createdAt ? new Date(group[0].createdAt.seconds * 1000).toISOString() : 'Unknown'}`);

        console.log(`\n   ❌ DELETING (duplicates):`);
        group.slice(1).forEach(product => {
          console.log(`      ID: ${product.docId}`);
          console.log(`      Created: ${product.createdAt ? new Date(product.createdAt.seconds * 1000).toISOString() : 'Unknown'}`);
          toDelete.push(product.docId);
        });

        totalDeleted += group.length - 1;
      }
    });
  });

  if (toDelete.length === 0) {
    console.log('\n✅ No duplicates found!\n');
    return;
  }

  console.log(`\n📊 Summary: ${toDelete.length} duplicate(s) to delete\n`);

  if (!dryRun) {
    console.log('🗑️  Deleting duplicates...\n');

    for (const docId of toDelete) {
      try {
        await deleteDoc(doc(db, 'products', docId));
        console.log(`   ✅ Deleted: ${docId}`);
      } catch (error) {
        console.error(`   ❌ Failed to delete ${docId}:`, error);
      }
    }

    console.log('\n✨ Cleanup complete!\n');
  } else {
    console.log('💡 This was a DRY RUN. To actually delete duplicates, run:');
    console.log('   npx tsx scripts/cleanupDuplicateProducts.ts --live\n');
  }
}

// Check for --live flag
const isLiveMode = process.argv.includes('--live');

cleanupDuplicates(!isLiveMode)
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
