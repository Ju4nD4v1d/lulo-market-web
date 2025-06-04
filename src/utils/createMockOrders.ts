import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const mockStores = [
  { id: 'store1', name: 'Latin Delights', address: '123 Main St, Vancouver, BC' },
  { id: 'store2', name: 'Sabor Latino', address: '456 Oak Ave, Vancouver, BC' },
  { id: 'store3', name: 'Casa Latina', address: '789 Pine St, Vancouver, BC' }
];

const mockUsers = [
  { id: 'user1', name: 'John Smith', phone: '+1 (604) 555-0101' },
  { id: 'user2', name: 'Maria Garcia', phone: '+1 (604) 555-0102' },
  { id: 'user3', name: 'David Chen', phone: '+1 (604) 555-0103' },
  { id: 'user4', name: 'Ana Rodriguez', phone: '+1 (604) 555-0104' },
  { id: 'user5', name: 'Michael Wong', phone: '+1 (604) 555-0105' }
];

const mockProducts = [
  { id: 'prod1', name: 'Empanadas', price: 12.99 },
  { id: 'prod2', name: 'Tamales', price: 15.99 },
  { id: 'prod3', name: 'Arepas', price: 9.99 },
  { id: 'prod4', name: 'Pupusas', price: 11.99 },
  { id: 'prod5', name: 'Tacos', price: 13.99 }
];

const getRandomStatus = () => {
  const statuses = ['created', 'headingToStore', 'headingToDestination', 'orderDelivered'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const createMockOrders = async () => {
  try {
    for (let i = 0; i < 15; i++) {
      const store = mockStores[Math.floor(Math.random() * mockStores.length)];
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const status = getRandomStatus();
      
      // Create base timestamp (within last 7 days)
      const baseTime = Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
      const createdDate = new Date(baseTime);
      
      // Calculate other timestamps based on status
      let headingToStoreTime, pickupCompletedTime, headingToDestinationTime, orderDeliveredTime;
      
      if (status !== 'created') {
        headingToStoreTime = new Date(baseTime + 15 * 60 * 1000);
      }
      if (status === 'headingToDestination' || status === 'orderDelivered') {
        pickupCompletedTime = new Date(baseTime + 45 * 60 * 1000);
        headingToDestinationTime = new Date(baseTime + 50 * 60 * 1000);
      }
      if (status === 'orderDelivered') {
        orderDeliveredTime = new Date(baseTime + 80 * 60 * 1000);
      }

      // Calculate order items and totals
      const numItems = Math.floor(Math.random() * 2) + 2; // 2-3 items
      const orderItems = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemSubtotal = product.price * quantity;
        const gstTax = itemSubtotal * 0.05;
        const pstTax = itemSubtotal * 0.07;
        
        subtotal += itemSubtotal;
        
        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          gstTax,
          pstTax,
          subtotal: itemSubtotal
        });
      }

      const taxes = subtotal * 0.12; // 5% GST + 7% PST
      const platformFee = subtotal * 0.05;
      const totalOrderPrice = subtotal + taxes + platformFee;

      // Create order document
      const orderDoc = await addDoc(collection(db, 'orders'), {
        orderId: `ORD${String(i + 1).padStart(4, '0')}`,
        createdDate: Timestamp.fromDate(createdDate),
        delivery: Math.random() > 0.5 ? 1 : 0,
        deliveryAddress: `${Math.floor(Math.random() * 1000) + 1} ${['Maple', 'Oak', 'Cedar', 'Pine'][Math.floor(Math.random() * 4)]} St, Vancouver, BC`,
        deliverySchedule: `${Math.floor(Math.random() * 12 + 1)}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        platformFee,
        status,
        storeId: store.id,
        storeName: store.name,
        storeAddress: store.address,
        userId: user.id,
        userName: user.name,
        userPhoneNumber: user.phone,
        taxes,
        totalOrderPrice,
        subtotal,
        ...(headingToStoreTime && { headingToStoreTime: Timestamp.fromDate(headingToStoreTime) }),
        ...(pickupCompletedTime && { pickupCompletedTime: Timestamp.fromDate(pickupCompletedTime) }),
        ...(headingToDestinationTime && { headingToDestinationTime: Timestamp.fromDate(headingToDestinationTime) }),
        ...(orderDeliveredTime && { orderDeliveredTime: Timestamp.fromDate(orderDeliveredTime) })
      });

      // Create order items in subcollection
      for (const item of orderItems) {
        await addDoc(collection(db, 'orders', orderDoc.id, 'orderDetails'), item);
      }
    }

    console.log('Successfully created 15 mock orders with order details');
  } catch (error) {
    console.error('Error creating mock orders:', error);
  }
};

export default createMockOrders;