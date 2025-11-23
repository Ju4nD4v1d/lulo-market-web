/**
 * Message Types
 *
 * Types for the two-way messaging system between stores and customers
 */

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'store';
  content: string;
  timestamp: Date;
  read: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'document';
}

export interface Chat {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  storeId: string;
  storeName: string;
  status: 'active' | 'completed' | 'archived';
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Order context
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  orderTotal: number;
}

export interface ChatFilter {
  status?: 'active' | 'completed' | 'archived';
  hasUnread?: boolean;
  searchQuery?: string;
}

export interface MessageGroup {
  date: string;
  messages: Message[];
}
