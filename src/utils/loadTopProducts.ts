import {
  collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function loadTopProducts(storeId: string) {
  const q = query(
    collection(db, 'products'),
    where('storeId', '==', storeId),
    orderBy('totalSold', 'desc'),
    limit(5)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    label: d.data().name as string,
    value: d.data().totalSold as number || 0
  }));
}