/**
 * MessagesSection Component
 *
 * Two-way messaging interface for stores to communicate with customers
 * Features:
 * - Real-time chat interface
 * - Order context awareness
 * - Quick replies for common responses
 * - Message status indicators
 * - Responsive design
 */

import type * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { MessageCircle, Search, X, ArrowLeft, Package, MapPin } from 'lucide-react';
import { Chat, Message, MessageGroup } from '../../../../types/message';
import { ChatListItem } from './components/ChatListItem';
import { MessageBubble, SystemMessage, TypingIndicator } from './components/MessageBubble';
import { MessageInput } from './components/MessageInput';
import { useLanguage } from '../../../../context/LanguageContext';
import styles from './MessagesSection.module.css';

// Mock data for UI demonstration
const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    orderId: 'order-001',
    orderNumber: '1234',
    customerId: 'customer-1',
    customerName: 'María González',
    customerEmail: 'maria@example.com',
    storeId: 'store-1',
    storeName: 'My Store',
    status: 'active',
    lastMessage: {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'customer-1',
      senderName: 'María González',
      senderType: 'customer',
      content: '¿A qué hora estará listo mi pedido?',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false
    },
    unreadCount: 2,
    createdAt: new Date(Date.now() - 30 * 60000),
    updatedAt: new Date(Date.now() - 5 * 60000),
    orderStatus: 'preparing',
    deliveryAddress: '123 Main St, Vancouver, BC',
    orderTotal: 45.50
  },
  {
    id: 'chat-2',
    orderId: 'order-002',
    orderNumber: '1235',
    customerId: 'customer-2',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    storeId: 'store-1',
    storeName: 'My Store',
    status: 'active',
    lastMessage: {
      id: 'msg-2',
      chatId: 'chat-2',
      senderId: 'store-1',
      senderName: 'Store',
      senderType: 'store',
      content: 'Your order is ready for pickup!',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: true
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 60 * 60000),
    updatedAt: new Date(Date.now() - 15 * 60000),
    orderStatus: 'ready',
    deliveryAddress: '456 Oak Ave, Vancouver, BC',
    orderTotal: 32.00
  },
  {
    id: 'chat-3',
    orderId: 'order-003',
    orderNumber: '1236',
    customerId: 'customer-3',
    customerName: 'Sophie Chen',
    customerEmail: 'sophie@example.com',
    storeId: 'store-1',
    storeName: 'My Store',
    status: 'active',
    lastMessage: {
      id: 'msg-3',
      chatId: 'chat-3',
      senderId: 'customer-3',
      senderName: 'Sophie Chen',
      senderType: 'customer',
      content: 'Thank you!',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 3 * 60 * 60000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60000),
    orderStatus: 'out_for_delivery',
    deliveryAddress: '789 Pine St, Vancouver, BC',
    orderTotal: 68.75
  }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1-1',
      chatId: 'chat-1',
      senderId: 'customer-1',
      senderName: 'María González',
      senderType: 'customer',
      content: 'Hola! Acabo de hacer mi pedido',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: true
    },
    {
      id: 'msg-1-2',
      chatId: 'chat-1',
      senderId: 'store-1',
      senderName: 'Store',
      senderType: 'store',
      content: '¡Hola María! Gracias por tu pedido. Lo estamos preparando ahora mismo.',
      timestamp: new Date(Date.now() - 28 * 60000),
      read: true
    },
    {
      id: 'msg-1-3',
      chatId: 'chat-1',
      senderId: 'customer-1',
      senderName: 'María González',
      senderType: 'customer',
      content: '¿A qué hora estará listo mi pedido?',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false
    },
    {
      id: 'msg-1-4',
      chatId: 'chat-1',
      senderId: 'customer-1',
      senderName: 'María González',
      senderType: 'customer',
      content: 'Es que necesito recogerlo antes de las 6pm',
      timestamp: new Date(Date.now() - 4 * 60000),
      read: false
    }
  ],
  'chat-2': [
    {
      id: 'msg-2-1',
      chatId: 'chat-2',
      senderId: 'customer-2',
      senderName: 'John Smith',
      senderType: 'customer',
      content: 'Hi, I placed an order for pickup',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: true
    },
    {
      id: 'msg-2-2',
      chatId: 'chat-2',
      senderId: 'store-1',
      senderName: 'Store',
      senderType: 'store',
      content: 'Hello John! We got your order and it will be ready in about 30 minutes.',
      timestamp: new Date(Date.now() - 58 * 60000),
      read: true
    },
    {
      id: 'msg-2-3',
      chatId: 'chat-2',
      senderId: 'store-1',
      senderName: 'Store',
      senderType: 'store',
      content: 'Your order is ready for pickup!',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: true
    }
  ],
  'chat-3': [
    {
      id: 'msg-3-1',
      chatId: 'chat-3',
      senderId: 'customer-3',
      senderName: 'Sophie Chen',
      senderType: 'customer',
      content: 'Can I add extra sauce to my order?',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      read: true
    },
    {
      id: 'msg-3-2',
      chatId: 'chat-3',
      senderId: 'store-1',
      senderName: 'Store',
      senderType: 'store',
      content: 'Of course! I\'ve added extra sauce to your order at no charge.',
      timestamp: new Date(Date.now() - 2.5 * 60 * 60000),
      read: true
    },
    {
      id: 'msg-3-3',
      chatId: 'chat-3',
      senderId: 'customer-3',
      senderName: 'Sophie Chen',
      senderType: 'customer',
      content: 'Thank you!',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true
    }
  ]
};

export const MessagesSection: React.FC = () => {
  const { t } = useLanguage();
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unread'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      const chatMessages = MOCK_MESSAGES[selectedChat.id] || [];
      setMessages(chatMessages);

      // Mark messages as read
      if (selectedChat.unreadCount > 0) {
        setChats(prev => prev.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, unreadCount: 0 }
            : chat
        ));
      }
    }
  }, [selectedChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter chats
  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = chat.customerName.toLowerCase().includes(query);
        const matchesOrder = chat.orderNumber.includes(query);
        const matchesMessage = chat.lastMessage?.content.toLowerCase().includes(query);
        if (!matchesName && !matchesOrder && !matchesMessage) return false;
      }

      // Status filter
      if (filterStatus === 'active') {
        return chat.status === 'active';
      }
      if (filterStatus === 'unread') {
        return chat.unreadCount > 0;
      }

      return true;
    });
  }, [chats, searchQuery, filterStatus]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: MessageGroup[] = [];
    let currentDate = '';
    let currentMessages: Message[] = [];

    messages.forEach(message => {
      const messageDate = message.timestamp.toLocaleDateString();

      if (messageDate !== currentDate) {
        if (currentMessages.length > 0) {
          groups.push({ date: currentDate, messages: currentMessages });
        }
        currentDate = messageDate;
        currentMessages = [message];
      } else {
        currentMessages.push(message);
      }
    });

    if (currentMessages.length > 0) {
      groups.push({ date: currentDate, messages: currentMessages });
    }

    return groups;
  }, [messages]);

  const handleSendMessage = (content: string, attachment?: File) => {
    if (!selectedChat) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: 'store-1',
      senderName: 'Store',
      senderType: 'store',
      content,
      timestamp: new Date(),
      read: false,
      attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
      attachmentType: attachment?.type.startsWith('image/') ? 'image' : 'document'
    };

    setMessages(prev => [...prev, newMessage]);

    // Update chat's last message
    setChats(prev => prev.map(chat =>
      chat.id === selectedChat.id
        ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
        : chat
    ));

    // Simulate customer typing after 2 seconds (for demo)
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }, 2000);
  };

  const getQuickReplies = (): string[] => {
    if (!selectedChat) return [];

    const orderStatus = selectedChat.orderStatus;

    if (orderStatus === 'pending' || orderStatus === 'confirmed') {
      return [
        t('messages.quickReply.preparing'),
        t('messages.quickReply.readyIn30'),
        t('messages.quickReply.readyIn45')
      ];
    }

    if (orderStatus === 'preparing') {
      return [
        t('messages.quickReply.almostReady'),
        t('messages.quickReply.readyIn15'),
        t('messages.quickReply.delayApology')
      ];
    }

    if (orderStatus === 'ready') {
      return [
        t('messages.quickReply.readyForPickup'),
        t('messages.quickReply.onTheWay')
      ];
    }

    return [
      t('messages.quickReply.thankYou'),
      t('messages.quickReply.enjoyMeal')
    ];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('messages.today');
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t('messages.yesterday');
    }
    return date.toLocaleDateString();
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className={styles.messagesContainer}>
      {/* Chat List Sidebar */}
      <div className={styles.chatListSidebar}>
        <div className={styles.chatListHeader}>
          <div className={styles.headerTop}>
            <h2 className={styles.headerTitle}>
              <MessageCircle size={24} />
              {t('messages.title')}
              {totalUnread > 0 && (
                <span className={styles.unreadBadge}>{totalUnread}</span>
              )}
            </h2>
          </div>

          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t('messages.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filterStatus === 'all' ? styles.active : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            {t('messages.all')}
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === 'active' ? styles.active : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            {t('messages.active')}
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === 'unread' ? styles.active : ''}`}
            onClick={() => setFilterStatus('unread')}
          >
            {t('messages.unread')}
          </button>
        </div>

        <div className={styles.chatList}>
          {filteredChats.length > 0 ? (
            filteredChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={selectedChat?.id === chat.id}
                onClick={setSelectedChat}
                t={t}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <div className={styles.emptyText}>{t('messages.noChats')}</div>
              <div className={styles.emptySubtext}>{t('messages.noChatsDescription')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Area */}
      <div className={styles.conversationArea}>
        {selectedChat ? (
          <>
            <div className={styles.conversationHeader}>
              <div className={styles.customerInfo}>
                <div className={styles.customerAvatar}>
                  {selectedChat.customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className={styles.customerDetails}>
                  <div className={styles.customerName}>{selectedChat.customerName}</div>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderBadge}>
                      <Package size={12} />
                      {t('messages.order')} #{selectedChat.orderNumber}
                    </span>
                    <span className={`${styles.orderBadge} ${styles[selectedChat.orderStatus]}`}>
                      {t(`order.status.${selectedChat.orderStatus}`)}
                    </span>
                    <span className={styles.orderBadge}>
                      <MapPin size={12} />
                      ${selectedChat.orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.messagesView}>
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className={styles.messageGroup}>
                  <div className={styles.dateHeader}>
                    <span className={styles.dateLabel}>{formatDate(group.date)}</span>
                  </div>
                  {group.messages.map(message => (
                    <MessageBubble key={message.id} message={message} t={t} />
                  ))}
                </div>
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={selectedChat.orderStatus === 'delivered' || selectedChat.orderStatus === 'cancelled'}
              disabledMessage={
                selectedChat.orderStatus === 'delivered'
                  ? t('messages.orderDelivered')
                  : selectedChat.orderStatus === 'cancelled'
                  ? t('messages.orderCancelled')
                  : undefined
              }
              quickReplies={getQuickReplies()}
              t={t}
            />
          </>
        ) : (
          <div className={styles.noConversation}>
            <div className={styles.noConversationIcon}>💬</div>
            <div className={styles.noConversationText}>{t('messages.selectChat')}</div>
          </div>
        )}
      </div>
    </div>
  );
};
